import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { errorResponse } from "@/lib/api-errors";


export async function POST(req: Request) {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error("STRIPE_SECRET_KEY não definida no ambiente.");
    return NextResponse.json(
      { error: "Erro crítico: Chave do Stripe não encontrada no servidor." },
      { status: 500 }
    );
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-01-27.acacia' as Stripe.LatestApiVersion,
    typescript: true,
  });

  try {
    const body = await req.json();
    const { email, nome, priceId, dadosCompletos } = body;

    if (!email || !nome || !priceId) {
      return errorResponse(
        "Campos obrigatórios (email, nome, priceId) não foram fornecidos.",
        400
      );
    }

    const camposEndereco = ["rua", "numero", "bairro", "cidade", "cep"] as const;
    const enderecoIncompleto = camposEndereco.some((campo) => {
      const valor = dadosCompletos?.[campo];
      return !valor || String(valor).trim() === "";
    });

    if (enderecoIncompleto) {
      return errorResponse("Preencha todos os campos de endereço.", 400);
    }

    if (!/^\d{5}-?\d{3}$/.test(String(dadosCompletos?.cep))) {
      return errorResponse("CEP inválido.", 400);
    }

    const cpfOriginal = dadosCompletos?.cpf ?? null;
    const cpfLimpo = cpfOriginal ? cpfOriginal.replace(/\D/g, "") : null;

    const existingByEmail = await prisma.user.findUnique({
      where: {
        email,
      }
    });

    if (existingByEmail) {
      return errorResponse("Email já cadastrado.", 400);
    }

    // Verificar se já existe usuário com este CPF
    let user = null;
    const cpfCriterios = [cpfLimpo, cpfOriginal].filter(Boolean).map((cpf) => ({ cpf }));

    if (cpfCriterios.length > 0) {
      user = await prisma.user.findFirst({
        where: {
          OR: cpfCriterios,
        }
      });

      if (user && user.email !== email) {
        return errorResponse("CPF já cadastrado.", 400);
      }
    }

    
    if (!user) {
      
        const birthDate = new Date(dadosCompletos.dataNascimento);
        
      
        let hashedPassword = null;
        if (dadosCompletos.senha) {
            hashedPassword = await bcrypt.hash(dadosCompletos.senha, 10);
        }

        user = await prisma.user.create({
            data: {
                name: dadosCompletos.nomeCompleto,
                email: email,
                password: hashedPassword,
                cpf: cpfLimpo,
                phone: dadosCompletos.telefone,
                birthDate: birthDate,
            
                addresses: {
                    create: {
                        street: dadosCompletos.rua,
                        number: dadosCompletos.numero,
                        complement: dadosCompletos.complemento,
                        district: dadosCompletos.bairro,
                        city: dadosCompletos.cidade,
                        cep: dadosCompletos.cep,
                        active: true
                    }
                },
         
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
       
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

   
    if (session.id) {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { stripeCheckoutSessionId: session.id },
      });
    }

    // Retorna a URL da sessão para redirecionamento no frontend
    if (!session.url) {
        return errorResponse(
            "Não foi possível criar a sessão de checkout.",
            500
        );
    }

    return NextResponse.json({ url: session.url });

  } catch (error) {
    console.error("Erro ao criar sessão de checkout no Stripe:", error);
    return errorResponse("Erro interno do servidor.", 500);
  }
}