import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { errorResponse } from "@/lib/api-errors";

function mapStripeStatus(status: Stripe.Subscription.Status) {
  switch (status) {
    case "active":
    case "trialing":
      return "ACTIVE";
    case "past_due":
    case "paused":
      return "PAST_DUE";
    case "unpaid":
      return "UNPAID";
    case "incomplete":
      return "PENDING";
    case "incomplete_expired":
    case "canceled":
    default:
      return "CANCELED";
  }
}

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

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const subscriptionId = session.metadata?.subscriptionId;

        if (subscriptionId) {
          console.log(`Pagamento confirmado para assinatura: ${subscriptionId}`);

          await prisma.subscription.update({
            where: {
              id: subscriptionId,
            },
            data: {
              status: "ACTIVE",
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: session.subscription as string,
            },
          });

          const userId = session.metadata?.["userId"];
          if (userId) {
            const oldSubscriptions = await prisma.subscription.findMany({
              where: {
                userId: userId,
                status: "ACTIVE",
                id: { not: subscriptionId }
              }
            });

            for (const oldSub of oldSubscriptions) {
              if (oldSub.stripeSubscriptionId) {
                try {
                  console.log(`Cancelando assinatura antiga: ${oldSub.id} (${oldSub.stripeSubscriptionId})`);
                  await stripe.subscriptions.cancel(oldSub.stripeSubscriptionId, {
                    prorate: true,
                  });

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
        } else {
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
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const mappedStatus = mapStripeStatus(subscription.status);
        const currentPeriodEnd = subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000)
          : null;

        await prisma.subscription.updateMany({
          where: {
            stripeSubscriptionId: subscription.id
          },
          data: {
            status: mappedStatus,
            currentPeriodEnd
          }
        });
        break;
      }
      default:
        break;
    }
  } catch (error) {
    console.error("Erro ao processar webhook:", error);
    return errorResponse("Erro ao processar webhook.", 500);
  }

  return new NextResponse(null, { status: 200 });
}
