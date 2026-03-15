import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { errorResponse } from "@/lib/api-errors";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
        throw new Error("STRIPE_WEBHOOK_SECRET não configurado");
    }
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error("Erro na assinatura do Webhook:", error);
    return errorResponse("Webhook inválido.", 400);
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (event.type === "checkout.session.completed") {
    // Recuperar a assinatura pelo ID salvo no metadata
    const subscriptionId = session.metadata?.subscriptionId;

    if (subscriptionId) {
      console.log(`Pagamento confirmado para assinatura: ${subscriptionId}`);
      
      try {
        // 1. Ativar a nova assinatura
        await prisma.subscription.update({
          where: {
            id: subscriptionId,
          },
          data: {
            status: "ACTIVE",
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
            // Poderíamos calcular o fim do período aqui ou deixar para outro webhook
          },
        });

        // 2. Cancelar assinaturas antigas ATIVAS deste usuário (Upgrade/Downgrade/Troca)
        const userId = session.metadata?.["userId"];
        if (userId) {
            const oldSubscriptions = await prisma.subscription.findMany({
                where: {
                    userId: userId,
                    status: "ACTIVE",
                    id: { not: subscriptionId } // Exclui a atual
                }
            });

            for (const oldSub of oldSubscriptions) {
                if (oldSub.stripeSubscriptionId) {
                    try {
                        console.log(`Cancelando assinatura antiga: ${oldSub.id} (${oldSub.stripeSubscriptionId})`);
                        // Cancela no Stripe (prorate=true gera crédito para o cliente)
                        await stripe.subscriptions.cancel(oldSub.stripeSubscriptionId, {
                            prorate: true,
                        });
                        
                        // Atualiza status no banco
                        await prisma.subscription.update({
                            where: { id: oldSub.id },
                            data: { status: "CANCELED" }
                        });
                    } catch (err) {
                        console.error(`Erro ao cancelar assinatura antiga ${oldSub.id}:`, err);
                    }
                }
            }
        }

      } catch (error) {
        console.error("Erro ao atualizar assinatura no banco:", error);
        return errorResponse("Erro ao atualizar banco de dados.", 500);
      }
    } else {
        // Fallback: Tentar buscar pelo stripeCheckoutSessionId se o metadata falhar
        console.warn("SubscriptionID não encontrado no metadata, tentando busca por Session ID");
        try {
            const subscription = await prisma.subscription.findFirst({
                where: {
                    stripeCheckoutSessionId: session.id
                }
            });

            if (subscription) {
                await prisma.subscription.update({
                    where: { id: subscription.id },
                    data: {
                        status: "ACTIVE",
                        stripeCustomerId: session.customer as string,
                        stripeSubscriptionId: session.subscription as string,
                    }
                });
            } else {
                console.error("Assinatura não encontrada para Session ID:", session.id);
            }
        } catch (error) {
            console.error("Erro ao atualizar assinatura via Session ID:", error);
        }
    }
  }

  return new NextResponse(null, { status: 200 });
}
