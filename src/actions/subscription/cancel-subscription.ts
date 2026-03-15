
"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { revalidatePath } from "next/cache";

export async function cancelSubscription() {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, message: "Não autorizado" };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        subscriptions: {
          where: { status: "ACTIVE" },
          take: 1,
        },
      },
    });

    const subscription = user?.subscriptions[0];

    if (!subscription || !subscription.stripeSubscriptionId) {
      return { success: false, message: "Nenhuma assinatura ativa encontrada para cancelar." };
    }

    // Cancelar no Stripe (ao final do período)
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    // Atualizar no banco (podemos manter como ACTIVE até o webhook confirmar o cancelamento final,
    // ou marcar um status "CANCELLING" se tivermos, mas por enquanto vamos confiar no Stripe e 
    // talvez adicionar um campo 'cancelAtPeriodEnd' no futuro. 
    // Para simplificar agora e dar feedback imediato, vamos assumir que o usuário quer ver que cancelou.)
    
    // Nota: O ideal é esperar o webhook 'customer.subscription.updated' para confirmar o `cancel_at_period_end`.
    // Mas para UX imediata, podemos retornar sucesso.

    revalidatePath("/dashboard/perfil");
    return { success: true, message: "Assinatura cancelada. Seu acesso continua até o fim do período." };

  } catch (error: unknown) {
    console.error("Erro ao cancelar assinatura:", error);
    const message = error instanceof Error ? error.message : "Erro ao cancelar assinatura. Tente novamente.";
    return { success: false, message };
  }
}
