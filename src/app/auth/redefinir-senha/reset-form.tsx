'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { resetPassword } from '@/actions/auth/reset-password';
import Link from 'next/link';
import { ArrowLeft, Loader2, Lock } from 'lucide-react';

const formSchema = z
  .object({
    password: z.string().min(6, {
      message: 'A senha deve ter pelo menos 6 caracteres.',
    }),
    confirmPassword: z.string().min(6, {
      message: 'A confirmação de senha deve ter pelo menos 6 caracteres.',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não conferem.',
    path: ['confirmPassword'],
  });

export function ResetForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();

  const [error, setError] = useState<string | undefined>('');
  const [success, setSuccess] = useState<string | undefined>('');
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setError('');
    setSuccess('');

    if (!token) {
      setError('Token ausente!');
      return;
    }

    startTransition(() => {
      resetPassword(token, values.password)
        .then((data) => {
          if (data?.error) {
            setError(data.error);
            toast.error(data.error);
          }
          if (data?.success) {
            setSuccess(data.success);
            toast.success('Senha redefinida com sucesso!');
            setTimeout(() => {
              router.push('/login');
            }, 3000);
          }
        })
        .catch(() => {
          setError('Algo deu errado!');
          toast.error('Erro ao redefinir senha.');
        });
    });
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-neutral-950 text-white">
        <div className="w-full max-w-sm space-y-8">
          <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-sm shadow-2xl">
            <div className="text-center space-y-4">
              <h2 className="text-xl font-bold text-red-500">Erro de Validação</h2>
              <p className="text-neutral-400 text-sm">Token de redefinição ausente ou inválido.</p>
              <Link href="/auth/esqueci-senha" className="block text-white hover:underline font-bold text-sm">
                Solicitar novo link
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-neutral-950 text-white">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-black italic tracking-tighter mb-2">
            BoxeFit<span className="text-red-600"> Pro</span>
          </h1>
          <p className="text-neutral-400 text-sm">Defina sua nova senha.</p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-sm shadow-2xl">
          <div className="mb-6 text-center">
            <h2 className="text-xl font-bold mb-2 flex items-center justify-center gap-2">
              <Lock className="w-5 h-5 text-red-600" /> Nova Senha
            </h2>
            <p className="text-neutral-400 text-xs">
              Crie uma senha forte para proteger sua conta.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase tracking-widest text-neutral-500 font-bold">Nova Senha</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={isPending}
                          placeholder="••••••••"
                          type="password"
                          className="bg-neutral-950 border-neutral-800 text-white focus:border-red-600 focus:ring-red-600/20 rounded-sm"
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase tracking-widest text-neutral-500 font-bold">Confirmar Senha</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={isPending}
                          placeholder="••••••••"
                          type="password"
                          className="bg-neutral-950 border-neutral-800 text-white focus:border-red-600 focus:ring-red-600/20 rounded-sm"
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-xs" />
                    </FormItem>
                  )}
                />
              </div>
              
              {error && (
                <div className="bg-red-900/20 border border-red-900/50 p-3 rounded-sm flex items-center gap-x-2 text-xs text-red-400">
                  <p>{error}</p>
                </div>
              )}
              
              {success && (
                <div className="bg-green-900/20 border border-green-900/50 p-3 rounded-sm flex items-center gap-x-2 text-xs text-green-400">
                  <p>{success}</p>
                </div>
              )}

              <Button 
                disabled={isPending} 
                type="submit" 
                className="w-full bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest rounded-sm h-11"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Redefinindo...
                  </>
                ) : (
                  'Redefinir Senha'
                )}
              </Button>
            </form>
          </Form>
        </div>

        <div className="text-center">
            <Link
              href="/login"
              className="inline-flex items-center text-xs text-neutral-500 hover:text-white transition-colors uppercase tracking-wider font-bold"
            >
              <ArrowLeft className="mr-2 h-3 w-3" /> Cancelar
            </Link>
          </div>
      </div>
    </div>
  );
}
