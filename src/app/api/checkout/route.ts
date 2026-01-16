import { NextResponse } from "next/server";
import Stripe from "stripe";

// Inicializa o Stripe com a chave secreta
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
});

export async function POST(req: Request) {
  try {
    // Recebe os dados do formulário
    const body = await req.json();
    const { email, nome, plano, priceId } = body;

    if (!priceId) {
      return NextResponse.json(
        { error: "ID do preço (priceId) é obrigatório." },
        { status: 400 }
      );
    }

    // Cria a sessão de Checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription", // Ou 'payment' se for pagamento único
      customer_email: email, // Preenche o email automaticamente no checkout
      line_items: [
        {
          price: priceId, // ID do preço criado no Dashboard do Stripe (ex: price_123...)
          quantity: 1,
        },
      ],
      metadata: {
        nome_cliente: nome,
        plano_escolhido: plano,
        // Aqui você pode passar o ID do usuário se ele já estiver logado
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/inscricao`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Erro no Stripe:", error);
    return NextResponse.json(
      { error: "Erro ao criar sessão de checkout." },
      { status: 500 }
    );
  }
}