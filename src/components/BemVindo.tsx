import Link from 'next/link';
import Image from 'next/image';
import React from 'react';

const BemVindo = () => {
  return (
    <div className="flex min-h-screen w-full flex-col md:flex-row">
      <div className="relative flex w-full flex-col justify-between bg-zinc-900 p-8 md:w-1/2 md:p-12 lg:p-16">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-black" />

          <div className="absolute inset-0 bg-cover bg-[center_top_100%]">
            <Image
              src="/background-boxe.jpg"
              alt=""
              fill
              className="object-cover object-top"
              priority
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-black/0 to-zinc-900/90 mix-blend-multiply" />
        </div>

        <div className="relative z-10 flex h-full flex-col justify-center">
          <div className="mb-8 flex items-center gap-3 md:mb-12">
            <span className="text-2xl font-bold text-white tracking-[.25em]">
              BoxeFit Pro
            </span>
          </div>

          <div className="max-w-xl">
            <h1 className="mb-6 text-4xl font-extrabold tracking-wide text-white md:text-3xl lg:text-5xl">
              Transforme seu corpo e mente com o boxe
            </h1>
            <p className="text-lg text-red-100/90 md:text-xl">
              Junte-se a centenas de alunos que já transformaram suas vidas
              através do boxe.
            </p>
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col justify-center bg-white p-8 md:w-1/2 md:p-12 lg:p-24 relative">
        <div className="w-full max-w-lg mx-auto">
          <div className="flex items-center">
            <h2 className="mb-3 text-2xl font-medium text-gray-800 md:text-2xl">
              Bem-vindo ao BoxeFit Pro
            </h2>
            <Image
              src="/logo-boxefit.svg"
              alt="BoxFit Pro"
              width={50}
              height={50}
              className="h-15 w-25"
              priority
            />
          </div>
          <p className="text-gray-500 mb-4">
            Está pronto para começar sua jornada no mundo do boxe? Vamos te
            guiar por todo o processo de matrícula.
          </p>

          <div className="mb-10 flex flex-col gap-4">
            <div className="flex items-start gap-4 rounded-xl border border-gray-100 p-4 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-gray-900">Professores Certificados</h3>
                <p className="text-sm text-gray-500">
                  Equipe de instrutores experientes e qualificados
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-xl border border-gray-100 p-4 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-gray-900">Horários Flexíveis</h3>
                <p className="text-sm text-gray-500">
                  Aulas disponíveis de segunda a sábado
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-xl border border-gray-100 p-4 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-gray-900">Resultados Comprovados</h3>
                <p className="text-sm text-gray-500">
                  Acompanhamento personalizado da sua evolução
                </p>
              </div>
            </div>
          </div>

          <Link href="/planos" passHref>
            <button
              type="button"
              className="group cursor-pointer mb-6 flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-950 px-6 py-4 text-base font-semibold text-white transition-all hover:bg-zinc-800 hover:shadow-lg active:scale-[0.99]"
            >
              Começar Matrícula
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 transition-transform group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </button>
          </Link>

          <div className="text-center text-sm text-gray-500">
            Já é aluno?{" "}
            <a
              href="/login"
              className="font-semibold text-red-600 hover:text-red-700 hover:underline"
            >
              Faça login
            </a>
          </div>
        </div>

        <button
          className="absolute bottom-6 right-6 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-white shadow-lg transition-transform hover:scale-110 hover:bg-zinc-800"
          aria-label="Ajuda"
        >
          <span className="font-bold">?</span>
        </button>
      </div>
    </div>
  );
};

export default BemVindo;