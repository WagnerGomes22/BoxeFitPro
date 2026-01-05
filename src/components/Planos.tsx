import React from 'react';
import Image from 'next/image';
import { Check, Star } from 'lucide-react';

type Plano = {
  id: number;
  nome: string;
  descricao: string;
  preco: string;
  beneficios: string[];
  borderColor: string;
};

const planosData: Plano[] = [
  {
    id: 1,
    nome: 'Básico',
    descricao: 'Ideal para quem está começando.',
    preco: 'R$ 29,90/mês',
    beneficios: [
      'Acesso 2x por semana',
      'Acompanhamento de instrutor',
      'Armário individual',
    ],
    borderColor: 'border-[#F5F5F5]',
  },
  {
    id: 2,
    nome: 'Premium',
    descricao: 'Acesso completo e mais flexibilidade.',
    preco: 'R$ 49,90/mês',
    beneficios: [
      'Acesso todos os dias',
      'Acompanhamento de instrutor',
      'Armário individual',
      'Aulas em grupo',
    ],
    borderColor: 'border-red-600',
  },
  {
    id: 3,
    nome: 'VIP',
    descricao: 'Treinamento personalizado',
    preco: 'R$ 79,90/mês',
    beneficios: [
      'Acesso todos os dias',
      'Acompanhamento de instrutor',
      'Armário individual',
      'Aulas em grupo',
      'Personal trainer',
    ],
    borderColor: 'border-yellow-500',
  },
];

const Planos = () => {
  return (
    <div className="flex flex-col items-center justify-center p-4">
        <Image
            src="/logo-boxefit.svg"
            alt="BoxFit Pro"
            width={50}
            height={50}
            className="h-30 w-30"
            priority
            />
      <h1 className="text-4xl font-bold mb-4">Nossos Planos de Assinatura:</h1>
      <p className="text-center text-gray-600 mb-8">
        Selecione o plano que melhor se adapta aos seus objetivos
      </p>
      <div className="relative mt-10 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
        {planosData.map((plano) => {
          const isFeatured = plano.id === 2;
          return (
            <div
              key={plano.id}
              className={`relative bg-white h-96 w-80 rounded-xl shadow-lg p-6 border-2 ${
                plano.borderColor
              } transition-transform duration-300 ${
                isFeatured ? 'transform scale-105 shadow-xl z-10' : ''
              }`}
            >
              {isFeatured && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 transform bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center z-20">
                  <Star className="h-4 w-4 mr-1 fill-white stroke-none" />
                  Recomendado
                </div>
              )}
              <h2 className="text-base font-light text-center mb-2">
                {plano.nome}
              </h2>
            <p className="text-base font-light text-center mb-2">
              R$ <span className="font-medium text-3xl">{plano.preco.slice(3).trim().split('/')[0]}</span>
              <span className="text-xl">/mês</span>
            </p>
            <p className="text-sm text-center mb-4">{plano.descricao}</p>
            <ul className="text-sm mb-6 space-y-2">
              {plano.beneficios.map((beneficio) => (
                <li key={beneficio} className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-green-500" />
                  <span>{beneficio}</span>
                </li>
              ))}
            </ul>
            <button className="bg-zinc-950 hover:bg-zinc-800 text-white px-4 py-2 cursor-pointer rounded-lg w-full">{`Escolher ${plano.nome}`}</button>
            </div>
          );
        })}
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
