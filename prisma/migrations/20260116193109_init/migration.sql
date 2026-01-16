-- CreateEnum
CREATE TYPE "StatusInscricao" AS ENUM ('PENDING', 'PAID', 'FAILED');

-- CreateEnum
CREATE TYPE "Plano" AS ENUM ('BASIC', 'PREMIUM', 'VIP');

-- CreateTable
CREATE TABLE "Inscricao" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "genero" TEXT NOT NULL,
    "dataNascimento" TIMESTAMP(3) NOT NULL,
    "plano" "Plano" NOT NULL,
    "stripePriceId" TEXT NOT NULL,
    "status" "StatusInscricao" NOT NULL DEFAULT 'PENDING',
    "cep" TEXT NOT NULL,
    "logradouro" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "complemento" TEXT,
    "bairro" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "stripeCheckoutSessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inscricao_pkey" PRIMARY KEY ("id")
);
