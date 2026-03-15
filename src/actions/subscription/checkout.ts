"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { revalidatePath } from "next/cache";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Erro desconhecido";
}

function isStripeResourceMissing(error: unknown) {
  const code = (error as { code?: string }).code;
  return code === "resource_missing";
}

export async function createCheckoutSession(priceId: string, planName: string) {
  const session = await auth();
  const user = session?.user;

  if (!user || !user.email) {
    return { error: "Usuário não autenticado" };
  }

  try {
    // 1. Buscar usuário no banco para garantir dados atualizados
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email },
      include: { subscriptions: true }
    });

    if (!dbUser) {
        return { error: "Usuário não encontrado no banco de dados." };
    }

    // 0. Verificar Role (Bloqueio de Admin/Instructor)
    if (dbUser.role === 'ADMIN' || dbUser.role === 'INSTRUCTOR') {
        return { error: "Administradores e Instrutores não podem realizar assinaturas." };
    }

    // 2. Verificar se já existe uma assinatura ATIVA para fazer Upgrade/Downgrade direto
    const activeSubscription = dbUser.subscriptions.find(sub => sub.status === "ACTIVE" && sub.stripeSubscriptionId);

    if (activeSubscription && activeSubscription.stripeSubscriptionId) {
        try {
            console.log("Iniciando Upgrade/Downgrade para:", activeSubscription.stripeSubscriptionId);
            
            // Verificar se a assinatura ainda existe no Stripe
            let stripeSub;
            try {
                stripeSub = await stripe.subscriptions.retrieve(activeSubscription.stripeSubscriptionId);
            } catch (e: unknown) {
                // Se der erro 404 (assinatura não existe mais no Stripe), consideramos cancelada
                if (isStripeResourceMissing(e)) {
                    console.warn("Assinatura não encontrada no Stripe. Marcando como CANCELED no banco.");
                    await prisma.subscription.update({
                        where: { id: activeSubscription.id },
                        data: { status: "CANCELED" }
                    });
                    // Força cair no fluxo de nova assinatura abaixo
                    throw new Error("Assinatura expirada ou removida no Stripe. Criando nova...");
                }
            throw e;
            }

            if (stripeSub.status !== 'active' && stripeSub.status !== 'trialing') {
                 // Se não estiver ativa no Stripe, atualiza no banco e força nova assinatura
                 await prisma.subscription.update({
                    where: { id: activeSubscription.id },
                    data: { status: "CANCELED" }
                });
                throw new Error("Assinatura não está ativa no Stripe.");
            }

            const itemId = stripeSub.items.data[0].id;

            // Atualizar a assinatura no Stripe (Isso cobra a diferença imediatamente se for upgrade)
            const updatedStripeSub = await stripe.subscriptions.update(activeSubscription.stripeSubscriptionId, {
                items: [{
                    id: itemId,
                    price: priceId,
                }],
                proration_behavior: 'always_invoice', // Garante que cobre a diferença agora ou gere crédito
            });

            // Atualizar nosso banco de dados
            await prisma.subscription.update({
                where: { id: activeSubscription.id },
                data: {
                    planName: planName,
                    stripePriceId: priceId,
                    // Mantém status ACTIVE
                }
            });

            revalidatePath("/dashboard", "layout");
            return { success: true, message: "Plano alterado com sucesso!" };

        } catch (error: unknown) {
            console.error("Erro ao fazer upgrade/downgrade:", error);
            const errorMessage = getErrorMessage(error);
            // Se o erro for de assinatura inválida/cancelada, deixamos prosseguir para criar uma NOVA
            if (errorMessage.includes("Assinatura expirada") || errorMessage.includes("Assinatura não está ativa") || errorMessage.includes("No such subscription")) {
                console.log("Caindo para fluxo de nova assinatura...");
            } else {
                // Se for outro erro (ex: cartão), retorna o erro
                return { error: `Não foi possível alterar o plano: ${errorMessage}` };
            }
        }
    }

    // 3. Se não tiver assinatura ativa, cria registro de Subscription PENDING
    const existingCustomer = dbUser.subscriptions.find(sub => sub.stripeCustomerId)?.stripeCustomerId;

    const subscription = await prisma.subscription.create({
      data: {
        userId: dbUser.id,
        planName: planName,
        stripePriceId: priceId,
        status: "PENDING",
      },
    });

    // 3. Criar Sessão de Checkout
    const successUrl = `${process.env.NEXT_PUBLIC_URL}/dashboard/perfil?success=true`;
    const cancelUrl = `${process.env.NEXT_PUBLIC_URL}/planos?canceled=true`;

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      ...(existingCustomer ? { customer: existingCustomer } : { customer_email: dbUser.email }),
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        subscriptionId: subscription.id,
        userId: dbUser.id,
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
    });

    // 4. Atualizar Subscription com Session ID
    await prisma.subscription.update({
        where: { id: subscription.id },
        data: { stripeCheckoutSessionId: checkoutSession.id }
    });

    return { url: checkoutSession.url };

  } catch (error: unknown) {
    console.error("Erro ao criar checkout:", error);
    return { error: getErrorMessage(error) };
  }
}
