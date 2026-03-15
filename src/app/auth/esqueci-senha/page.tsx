'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
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
import { sendPasswordResetEmail } from '@/actions/auth/reset-password';
import { ArrowLeft, Loader2 } from 'lucide-react';

const formSchema = z.object({
  email: z.string().email({
    message: 'Por favor, insira um e-mail válido.',
  }),
});

export default function EsqueciSenhaPage() {
  const [isPending, startTransition] = useTransition();
  const [successMessage, setSuccessMessage] = useState<string | undefined>('');
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setSuccessMessage('');
    
    startTransition(() => {
      sendPasswordResetEmail(values.email)
        .then((data) => {
          if (data?.error) {
            toast.error(data.error);
          }
          if (data?.success) {
            setSuccessMessage(data.success);
            toast.success('E-mail enviado!');
          }
        })
        .catch(() => {
          toast.error('Algo deu errado. Tente novamente.');
        });
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-neutral-950 text-white">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-black italic tracking-tighter mb-2">
            BoxeFit<span className="text-red-600"> Pro</span>
          </h1>
          <p className="text-neutral-400 text-sm">Recupere seu acesso ao ringue.</p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-sm shadow-2xl">
          {successMessage ? (
            <div className="space-y-6">
              <div className="bg-green-900/20 border border-green-900 p-4 rounded-sm text-sm text-green-400">
                <p className="font-bold mb-1">E-mail enviado!</p>
                <p>{successMessage}</p>
              </div>
              <Link
                href="/login"
                className="block w-full text-center bg-neutral-800 hover:bg-neutral-700 text-white font-black uppercase tracking-widest rounded-sm h-11 content-center transition-colors"
              >
                Voltar para o Login
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6 text-center">
                <h2 className="text-xl font-bold mb-2">Esqueceu a senha?</h2>
                <p className="text-neutral-400 text-xs">
                  Digite seu e-mail e enviaremos um link para você redefinir sua senha.
                </p>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs uppercase tracking-widest text-neutral-500 font-bold">Email</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="lutador@exemplo.com"
                            type="email"
                            disabled={isPending}
                            className="bg-neutral-950 border-neutral-800 text-white focus:border-red-600 focus:ring-red-600/20 rounded-sm"
                          />
                        </FormControl>
                        <FormMessage className="text-red-500 text-xs" />
                      </FormItem>
                    )}
                  />
                  <Button 
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest rounded-sm h-11" 
                    type="submit" 
                    disabled={isPending}
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...
                      </>
                    ) : (
                      'Enviar link de recuperação'
                    )}
                  </Button>
                </form>
              </Form>
            </>
          )}
        </div>

        {!successMessage && (
          <div className="text-center">
            <Link
              href="/login"
              className="inline-flex items-center text-xs text-neutral-500 hover:text-white transition-colors uppercase tracking-wider font-bold"
            >
              <ArrowLeft className="mr-2 h-3 w-3" /> Voltar para o Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
