"use client";

import React from 'react';
import type { Session } from "next-auth";
import Image from 'next/image';
import { Check, Star, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { createCheckoutSession } from '@/actions/subscription/checkout';
import { toast } from 'sonner';

export interface Plano {
  id: string;
  nome: string;
  preco: number;
  periodo: string;
  priceId: string;
}

interface PlanosProps {
  user?: Session["user"] | null;
  activePlanName?: string | null;
}

const Planos = ({ user, activePlanName }: PlanosProps) => {
  const router = useRouter(); 
  const [loadingId, setLoadingId] = React.useState<string | null>(null);

  const isCurrentPlan = (nome: string) => {
    return activePlanName === nome;
  };

  const handleSelecionarPlano = async (plano: Plano) => {
    if (user) {
      try {
        setLoadingId(plano.id);
        const result = await createCheckoutSession(plano.priceId, plano.nome);
        
        if (result.success) {
            toast.success(result.message);

            setTimeout(() => {
                router.push('/dashboard/perfil');
            }, 1500);
            return;
        }

        if (result.url) {
          window.location.href = result.url;
        } else {
          toast.error(result.error || "Erro ao iniciar checkout");
        }
      } catch (error) {
        toast.error("Ocorreu um erro ao processar sua solicitação.");
        console.error(error);
      } finally {
        setLoadingId(null);
      }
      return;
    }

    // Fluxo para usuário não logado (Redireciona para inscrição)
    localStorage.setItem('planoSelecionado', JSON.stringify(plano));
    router.push('/inscricao');
  };

  return (
    <div className="flex flex-col items-center justify-center pt-10">
      <div className=" pl-4">
      <h1 className="text-4xl font-bold mb-4">Nossos Planos de Assinatura:</h1>
      <p className="text-left md:text-center text-gray-600 mb-8">
        Selecione o plano que melhor se adapta aos seus objetivos
      </p>
      </div>
      <div className="relative mt-10 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
        {/* Plano Básico */}
        <div
          className="relative bg-white h-96 w-80 rounded-xl shadow-lg p-6 border-2 border-[#F5F5F5] transition-transform duration-300 flex flex-col"
        >
          <h2 className="text-base font-bold text-center mb-2">
            Básico
          </h2>
          <p className="text-base font-light text-center mb-2">
            R$ <span className="font-bold text-3xl">69,90</span>
            <span className="text-xl">/mês</span>
          </p>
          <p className="text-sm text-center mb-4">Entrada acessível para começar com consistência.</p>
          <ul className="text-sm mb-6 space-y-2">
            <li className="flex items-center">
              <Check className="h-4 w-4 mr-2 text-white" />
              <span>Acesso 2x por semana</span>
            </li>
            <li className="flex items-center">
              <Check className="h-4 w-4 mr-2 text-green-500" />
              <span>Acompanhamento de instrutor</span>
            </li>
            <li className="flex items-center">
              <Check className="h-4 w-4 mr-2 text-green-500" />
              <span>Aulas em grupo</span>
            </li>
          </ul>
          <Button
            type="button"
            className={`block w-full mt-auto px-4 py-2 rounded-lg text-center ${
              isCurrentPlan('Básico') 
                ? "bg-emerald-600 hover:bg-emerald-600 cursor-default text-white" 
                : "bg-zinc-950 hover:bg-zinc-800 text-white"
            }`}
            onClick={(e) => {
              e.preventDefault();
              if (isCurrentPlan('Básico')) return;
              handleSelecionarPlano({
                id: 'basico',
                nome: 'Básico',
                preco: 69.90,
                periodo: 'mensal',
                priceId: 'price_1TADlNBb2zDLKzymk3tupTyW'
              });
            }}
            disabled={loadingId !== null || isCurrentPlan('Básico')}
          >
            {loadingId === 'basico' ? <Loader2 className="mr-2 h-4 w-4 animate-spin inline" /> : null}
            {isCurrentPlan('Básico') ? 'Plano Atual' : 'Escolher Básico'}
          </Button>
        </div>

        {/* Plano Premium */}
        <div
          className="relative bg-white h-96 w-80 rounded-xl shadow-lg p-6 border-2 border-red-600 transition-transform duration-300 z-10 flex flex-col"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 transform bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center z-20">
            <Star className="h-4 w-4 mr-1 fill-white stroke-none" />
            Recomendado
          </div>
          <h2 className="text-base font-bold text-center mb-2">
            Premium
          </h2>
          <p className="text-base font-light text-center mb-2">
            R$ <span className="font-bold text-3xl">109,90</span>
            <span className="text-xl">/mês</span>
          </p>
          <p className="text-sm text-center mb-4">Plano completo para evoluir mais rápido.</p>
          <ul className="text-sm mb-6 space-y-2">
            <li className="flex items-center">
              <Check className="h-4 w-4 mr-2 text-green-500" />
              <span>Acesso todos os dias</span>
            </li>
            <li className="flex items-center">
              <Check className="h-4 w-4 mr-2 text-green-500" />
              <span>Acompanhamento de instrutor</span>
            </li>
            <li className="flex items-center">
              <Check className="h-4 w-4 mr-2 text-green-500" />
              <span>Armário individual</span>
            </li>
            <li className="flex items-center">
              <Check className="h-4 w-4 mr-2 text-green-500" />
              <span>Aulas em grupo</span>
            </li>
          </ul>
          <Button
            type="button"
            className={`block w-full mt-auto px-4 py-2 rounded-lg text-center ${
              isCurrentPlan('Premium') 
                ? "bg-emerald-600 hover:bg-emerald-600 cursor-default text-white" 
                : "bg-zinc-950 hover:bg-zinc-800 text-white"
            }`}
            onClick={(e) => {
              e.preventDefault();
              if (isCurrentPlan('Premium')) return;
              handleSelecionarPlano({
                id: 'premium',
                nome: 'Premium',
                preco: 109.90,
                periodo: 'mensal',
                priceId: 'price_1TADk2Bb2zDLKzymvNweWZPm'
              });
            }}
            disabled={loadingId !== null || isCurrentPlan('Premium')}
          >
            {loadingId === 'premium' ? <Loader2 className="mr-2 h-4 w-4 animate-spin inline" /> : null}
            {isCurrentPlan('Premium') ? 'Plano Atual' : 'Escolher Premium'}
          </Button>
        </div>

        {/* Plano VIP */}
        <div
          className="relative text-white bg-[#3b3b40] h-96 w-80 rounded-xl shadow-lg p-6 border-2 border-[#FFD700] transition-transform duration-300 flex flex-col"
        >
          <h2 className="text-base text-[#FFD700] font-bold text-center mb-2">
            VIP
          </h2>
          <p className="text-base font-light text-center mb-2">
            R$ <span className="font-bold text-3xl">179,90</span>
            <span className="text-xl">/mês</span>
          </p>
          <p className="text-sm text-center mb-4">Experiência exclusiva com treino personalizado.</p>
          <ul className="text-sm mb-6 space-y-2">
            <li className="flex items-center">
              <Check className="h-4 w-4 mr-2 text-green-500" />
              <span>Acesso todos os dias</span>
            </li>
            <li className="flex items-center">
              <Check className="h-4 w-4 mr-2 text-green-500" />
              <span>Acompanhamento de instrutor</span>
            </li>
            <li className="flex items-center">
              <Check className="h-4 w-4 mr-2 text-green-500" />
              <span>Armário individual</span>
            </li>
            <li className="flex items-center">
              <Check className="h-4 w-4 mr-2 text-green-500" />
              <span>Aulas em grupo</span>
            </li>
            <li className="flex items-center">
              <Check className="h-4 w-4 mr-2 text-green-500" />
              <span>Personal trainer</span>
            </li>
          </ul>
          <Button
            type="button"
            className={`block w-full mt-auto px-4 py-2 rounded-lg text-center ${
              isCurrentPlan('VIP') 
                ? "bg-emerald-600 hover:bg-emerald-600 cursor-default text-white" 
                : "bg-zinc-950 hover:bg-zinc-800 text-white"
            }`}
            onClick={(e) => {
              e.preventDefault();
              if (isCurrentPlan('VIP')) return;
              handleSelecionarPlano({
                id: 'vip',
                nome: 'VIP',
                preco: 179.90,
                periodo: 'mensal',
                priceId: 'price_1TADkjBb2zDLKzymcJXh7Xng'
              });
            }}
            disabled={loadingId !== null || isCurrentPlan('VIP')}
          >
            {loadingId === 'vip' ? <Loader2 className="mr-2 h-4 w-4 animate-spin inline" /> : null}
            {isCurrentPlan('VIP') ? 'Plano Atual' : 'Escolher VIP'}
          </Button>
        </div>
      </div>

      <div className="mt-10 grid w-full max-w-5xl grid-cols-1 gap-8 text-center md:grid-cols-3">
        <div className="flex flex-col items-center rounded-lg bg-white p-6 shadow-md">
          <h3 className="mb-2 text-base font-semibold">Primeira Aula Grátis</h3>
          <p className="text-gray-600 text-sm">
            Agende uma aula experimental e conheça nossa estrutura sem
            compromisso.
          </p>
        </div>
        <div className="flex flex-col items-center rounded-lg bg-white p-6 shadow-md">
          <h3 className="mb-2 text-base font-semibold">Cancele quando quiser</h3>
          <p className="text-gray-600 text-sm">
            Seja cancelado a qualquer momento sem prejuízos.
          </p>
        </div>
        <div className="flex flex-col items-center rounded-lg bg-white p-6 shadow-md">
          <h3 className="mb-2 text-base font-semibold">Ambiente Amigável</h3>
          <p className="text-gray-600 text-sm">
            Faça parte de uma comunidade que te incentiva a ir além.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Planos;
