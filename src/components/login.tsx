'use client';

import { signIn, getSession } from 'next-auth/react';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, LogIn } from "lucide-react";
import Link from 'next/link';
import { toast } from "sonner";
// import { getUserRole } from '@/actions/user/get-role'; // REMOVIDO PARA EVITAR ERROS DE HIDRATAÇÃO/NETWORK

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const res = await signIn('credentials', { 
        redirect: false, 
        email, 
        password 
      });

      if (res?.error) {
        toast.error("Credenciais inválidas. Verifique seu e-mail e senha.");
        setLoading(false);
        return;
      } 
      
      // Se chegou aqui, o login foi bem sucedido
      toast.success("Login realizado com sucesso!");

      try {
        // Tenta buscar a role diretamente da sessão (cookie), sem chamar server action extra
        console.log(`[CLIENT] Tentando obter sessão para: "${email}"`);

        const session = await getSession();
        const role = session?.user?.role;
        
        console.log(`[CLIENT] Role na sessão:`, role);

        if (role === 'ADMIN' || role === 'INSTRUCTOR') {
            window.location.href = '/admin';
        } else {
            window.location.href = '/dashboard';
        }
      } catch (roleError) {
        console.error("Erro ao redirecionar por role:", roleError);
        window.location.href = '/dashboard';
      }

    } catch (error) {
      console.error("Erro crítico no login:", error);
      toast.error("Ocorreu um erro ao tentar entrar.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-neutral-950 text-white">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-black italic tracking-tighter mb-2">
            BoxeFit<span className="text-red-600"> Pro</span>
          </h1>
          <p className="text-neutral-400 text-sm">Entre no ringue.</p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-sm shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs uppercase tracking-widest text-neutral-500 font-bold">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-neutral-950 border-neutral-800 text-white focus:border-red-600 focus:ring-red-600/20 rounded-sm"
                placeholder="lutador@exemplo.com"
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs uppercase tracking-widest text-neutral-500 font-bold">Senha</Label>
                <Link href="/auth/esqueci-senha" className="text-[10px] text-red-500 hover:text-red-400 font-bold uppercase tracking-wider">Esqueceu?</Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-neutral-950 border-neutral-800 text-white focus:border-red-600 focus:ring-red-600/20 rounded-sm"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
            
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest rounded-sm h-11"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Entrando...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" /> Entrar
                </>
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-neutral-500">
          Ainda não tem conta? <a href="/planos" className="text-white hover:underline font-bold">Inscreva-se</a>
        </p>
      </div>
    </div>
  );
}
