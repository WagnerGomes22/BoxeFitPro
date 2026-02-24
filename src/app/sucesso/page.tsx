"use client";

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Loader2, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

// Componente interno que usa useSearchParams
const SucessoContent = () => {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');
    
    // Apenas para demonstração, em um caso real você poderia buscar detalhes da sessão
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

    useEffect(() => {
        if (sessionId) {
            // Aqui você poderia fazer uma chamada a uma API para verificar o status da sessão no backend
            // e garantir que o pagamento foi realmente efetuado antes de mostrar a mensagem de sucesso.
            // Por simplicidade, vamos apenas simular um sucesso.
            setStatus('success');
        } else {
            setStatus('error');
        }
    }, [sessionId]);

    return (
        <Card className="w-full max-w-md mx-auto shadow-lg">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">
                    {status === 'success' && 'Pagamento Aprovado!'}
                    {status === 'loading' && 'Verificando Pagamento...'}
                    {status === 'error' && 'Ocorreu um Problema'}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center text-center space-y-4">
                {status === 'loading' && (
                    <>
                        <Loader2 className="h-16 w-16 text-primary animate-spin" />
                        <p className="text-muted-foreground">Aguarde um momento enquanto confirmamos sua inscrição.</p>
                    </>
                )}
                {status === 'success' && (
                    <>
                        <CheckCircle2 className="h-16 w-16 text-green-500" />
                        <p className="text-muted-foreground">
                            Sua inscrição foi concluída com sucesso. Seja bem-vindo(a) ao Boxe Pass!
                            Você receberá um e-mail com os próximos passos.
                        </p>
                        <p className="text-xs text-gray-500 pt-4">
                            ID da Sessão: <span className="font-mono">{sessionId}</span>
                        </p>
                    </>
                )}
                {status === 'error' && (
                    <>
                        <AlertTriangle className="h-16 w-16 text-destructive" />
                        <p className="text-muted-foreground">
                            Não foi possível confirmar seu pagamento. Se o valor foi debitado, por favor, entre em contato com o suporte.
                        </p>
                    </>
                )}
                <Button asChild className="mt-6">
                    <Link href="/">Voltar para a Home</Link>
                </Button>
            </CardContent>
        </Card>
    );
};

// Componente da página principal que envolve com Suspense
export default function SucessoPage() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <Suspense fallback={<Loader2 className="h-10 w-10 animate-spin text-primary" />}>
                <SucessoContent />
            </Suspense>
        </div>
    );
}
