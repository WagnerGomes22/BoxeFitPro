
import React from 'react';

const FormularioInscricao = () => {
  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-lg shadow-md">
      <form>
        <div className="mb-6">
          <label htmlFor="nome" className="block text-gray-700 text-sm font-bold mb-2">
            Nome Completo
          </label>
          <input
            type="text"
            id="nome"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Digite seu nome completo"
          />
        </div>
        <div className="mb-6">
          <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
            E-mail
          </label>
          <input
            type="email"
            id="email"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Digite seu e-mail"
          />
        </div>
        <div className="flex items-center justify-center">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Finalizar Inscrição
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormularioInscricao;
