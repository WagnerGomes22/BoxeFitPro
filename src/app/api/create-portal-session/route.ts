import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const user = session?.user;

    if (!user || !user.email) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email },
      include: { subscriptions: true },
    });

    const stripeCustomerId = dbUser?.subscriptions.find(sub => sub.stripeCustomerId)?.stripeCustomerId;

    if (!dbUser || !stripeCustomerId) {
      console.error("Erro Portal: Cliente não tem Stripe ID", dbUser?.email);
      return new NextResponse(JSON.stringify({ error: "Cliente não possui ID do Stripe vinculado." }), { status: 404 });
    }

    // Cria uma sessão do Portal do Cliente (para gerenciar cartões/assinaturas)
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_URL}/dashboard/perfil`,
    });

    return NextResponse.json({ url: portalSession.url });

  } catch (error: any) {
    console.error("Erro ao criar sessão do portal:", error);
    return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
