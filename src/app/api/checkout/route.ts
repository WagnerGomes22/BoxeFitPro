import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Validação para garantir que a chave secreta do Stripe está definida
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("A variável de ambiente STRIPE_SECRET_KEY não está definida.");
}

// Inicializa o Stripe com a chave secreta
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {

});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, nome, priceId, dadosCompletos } = body;

    // Validações de entrada
    if (!email || !nome || !priceId) {
      return NextResponse.json(
        { error: "Campos obrigatórios (email, nome, priceId) não foram fornecidos." },
        { status: 400 }
      );
    }

    // Verificar se já existe usuário com este CPF
    let user = null;
    if (dadosCompletos.cpf) {
      user = await prisma.user.findUnique({
        where: {
          cpf: dadosCompletos.cpf,
        }
      });

      // Se usuário existe, verifica se tem assinatura ativa
      /*
      if (user) {
        const activeSubscription = await prisma.subscription.findFirst({
            where: {
                userId: user.id,
                status: "ACTIVE"
            }
        });

        if (activeSubscription) {
            return NextResponse.json(
                { error: "Já existe uma assinatura ativa para este CPF." },
                { status: 400 }
              );
        }
      }
      */
    }

    // Se o usuário não existe, criar
    if (!user) {
        // Formatar data de nascimento
        const birthDate = new Date(dadosCompletos.dataNascimento);
        
        // Hash da senha se fornecida
        let hashedPassword = null;
        if (dadosCompletos.senha) {
            hashedPassword = await bcrypt.hash(dadosCompletos.senha, 10);
        }

        user = await prisma.user.create({
            data: {
                name: dadosCompletos.nomeCompleto,
                email: email,
                password: hashedPassword, // Salva a senha hasheada
                cpf: dadosCompletos.cpf,
                phone: dadosCompletos.telefone,
                birthDate: birthDate,
                // Criar endereço inicial
                addresses: {
                    create: {
                        street: dadosCompletos.rua,
                        number: dadosCompletos.numero,
                        complement: dadosCompletos.complemento,
                        district: dadosCompletos.bairro,
                        city: dadosCompletos.cidade,
                        state: dadosCompletos.estado,
                        cep: dadosCompletos.cep,
                        active: true
                    }
                },
                // Criar contato de emergência se fornecido
                emergencyContacts: dadosCompletos.contatoEmergenciaNome ? {
                    create: {
                        name: dadosCompletos.contatoEmergenciaNome,
                        phone: dadosCompletos.contatoEmergenciaTelefone || ""
                    }
                } : undefined
            }
        });
    }

    // Criar a intenção de assinatura (Subscription PENDING)
    const subscription = await prisma.subscription.create({
        data: {
            userId: user.id,
            planName: dadosCompletos.plano?.nome || "Plano Boxe",
            stripePriceId: priceId,
            status: "PENDING"
        }
    });


    const successUrl = `${process.env.NEXT_PUBLIC_URL}/sucesso?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${process.env.NEXT_PUBLIC_URL}/inscricao`;

    // Cria a sessão de Checkout no Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer_email: email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        subscriptionId: subscription.id,
        userId: user.id,
        // Removendo dadosUsuario para evitar estouro do limite de 500 chars do metadata
        // dadosUsuario: JSON.stringify(dadosCompletos),
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    // 2. Atualizar a assinatura com o ID da sessão do Stripe
    if (session.id) {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { stripeCheckoutSessionId: session.id },
      });
    }

    // Retorna a URL da sessão para redirecionamento no frontend
    if (!session.url) {
        return NextResponse.json(
            { error: "Não foi possível criar a sessão de checkout. URL não encontrada." },
            { status: 500 }
        );
    }

    return NextResponse.json({ url: session.url });

  } catch (error: any) {
    console.error("Erro ao criar sessão de checkout no Stripe:", error);
    return NextResponse.json(
      { error: `Erro interno do servidor: ${error.message}` },
      { status: 500 }
    );
  }
}
