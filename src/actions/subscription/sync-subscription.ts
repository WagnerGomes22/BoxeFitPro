"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { revalidatePath } from "next/cache";

export async function syncSubscriptionStatus() {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: "Não autorizado" };
  }

  try {
    // 1. Buscar TODAS as assinaturas PENDING recentes (limite de 5 para segurança)
    const pendingSubscriptions = await prisma.subscription.findMany({
      where: {
        userId: session.user.id,
        status: "PENDING",
        stripeCheckoutSessionId: { not: null }
      },
      orderBy: { createdAt: "desc" },
      take: 5
    });

    if (pendingSubscriptions.length === 0) {
      return { success: false, message: "Nenhuma assinatura pendente encontrada." };
    }

    // 2. Verificar qual delas foi paga no Stripe
    let paidSubscription = null;
    let checkoutSession = null;

    for (const sub of pendingSubscriptions) {
        if (!sub.stripeCheckoutSessionId) continue;
        
        try {
            const session = await stripe.checkout.sessions.retrieve(sub.stripeCheckoutSessionId);
            console.log(`Verificando sessão ${session.id}: Status=${session.status}, Payment=${session.payment_status}`);
            
            if (session.status === "complete" || session.payment_status === "paid") {
                paidSubscription = sub;
                checkoutSession = session;
                break; // Achou a paga, para de procurar
            }
        } catch (err) {
            console.error(`Erro ao consultar sessão ${sub.stripeCheckoutSessionId}:`, err);
        }
    }

    if (!paidSubscription || !checkoutSession) {
         return { success: false, message: "Nenhum pagamento confirmado encontrado nas tentativas recentes." };
    }

    // 3. Atualizar a assinatura PAGA para ACTIVE
    await prisma.subscription.update({
        where: { id: paidSubscription.id },
        data: {
          status: "ACTIVE",
          stripeCustomerId: checkoutSession.customer as string,
          stripeSubscriptionId: checkoutSession.subscription as string,
        }
    });

    // 4. Limpar assinaturas PENDENTES obsoletas (ex: tentativas falhas posteriores ou anteriores)
    await prisma.subscription.updateMany({
        where: {
            userId: session.user.id,
            status: "PENDING",
            id: { not: paidSubscription.id }
        },
        data: {
            status: "CANCELED"
        }
    });
    
    // 5. Cancelar outras assinaturas ATIVAS antigas (Upgrade/Troca)
      const oldSubscriptions = await prisma.subscription.findMany({
        where: {
          userId: session.user.id,
          status: "ACTIVE",
          id: { not: paidSubscription.id }
        }
      });


      for (const oldSub of oldSubscriptions) {
        if (oldSub.stripeSubscriptionId) {
            try {
                // Tenta cancelar no Stripe
                await stripe.subscriptions.cancel(oldSub.stripeSubscriptionId, { prorate: true });
            } catch (e) {
                console.error("Erro ao cancelar sub antiga no Stripe:", e);
            }
        }
        // Marca como cancelado no banco
        await prisma.subscription.update({
            where: { id: oldSub.id },
            data: { status: "CANCELED" }
        });
      }

      revalidatePath("/dashboard/perfil");
      revalidatePath("/dashboard", "layout");
      return { success: true, message: "Assinatura sincronizada e ativada com sucesso!" };

  } catch (error: any) {
    console.error("Erro ao sincronizar assinatura:", error);
    return { success: false, message: "Erro ao verificar status da assinatura." };
  }
}
