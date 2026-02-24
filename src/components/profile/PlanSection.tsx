
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Edit2, XCircle, AlertTriangle, CheckCircle2, Loader2, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { syncSubscriptionStatus } from "@/actions/subscription/sync-subscription";
import { cancelSubscription } from "@/actions/subscription/cancel-subscription";

interface PlanSectionProps {
  subscription: any; // Tipar melhor se possível com Prisma types
}

export function PlanSection({ subscription }: PlanSectionProps) {
  const router = useRouter();
  const [isCancelling, setIsCancelling] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const handleCancelSubscription = async () => {
    setIsCancelling(true);
    setShowCancelDialog(false);

    try {
      const result = await cancelSubscription();
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Ocorreu um erro inesperado.");
    } finally {
      setIsCancelling(false);
    }
  };

  const handleSyncStatus = async () => {
    setIsSyncing(true);
    try {
        const result = await syncSubscriptionStatus();
        if (result.success) {
            toast.success(result.message);
            router.refresh();
        } else {
            toast.warning(result.message);
        }
    } catch (error) {
        toast.error("Erro ao sincronizar status.");
    } finally {
        setIsSyncing(false);
    }
  };

  const calculateRenewalDate = () => {
    if (subscription.currentPeriodEnd) {
      return format(new Date(subscription.currentPeriodEnd), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    }
    
    // Fallback: Se não tiver data de renovação, calcula 1 mês após a criação da assinatura
    if (subscription.createdAt) {
      const createdDate = new Date(subscription.createdAt);
      const nextMonth = new Date(createdDate.setMonth(createdDate.getMonth() + 1));
      return format(nextMonth, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    }

    return "Data a confirmar";
  };

  const handleChangePlan = () => {
    router.push("/planos");
  };

  const handleChangeCard = async () => {
    try {
        const response = await fetch('/api/create-portal-session', { method: 'POST' });
        const data = await response.json();
        
        if (!response.ok) {
            // Se o usuário não tem Stripe ID, não dá pra abrir o portal.
            // Solução: Mandar ele assinar um plano novo, que é onde ele cadastra o cartão.
            if (response.status === 404) {
                toast.error("Nenhum histórico de pagamento encontrado. Por favor, assine um plano.");
                router.push("/planos");
                return;
            }
            throw new Error(data.error || "Erro desconhecido");
        }

        if (data.url) {
            window.location.href = data.url;
        } else {
            toast.error("Erro ao abrir portal de pagamento");
        }
    } catch (error) {
        toast.error("Erro ao conectar com Stripe");
        console.error(error);
    }
  };


  return (
    <>
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" /> Cancelar Assinatura
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja cancelar sua assinatura? <br /><br />
              Você continuará com acesso até o final do período atual ({subscription?.currentPeriodEnd ? format(new Date(subscription.currentPeriodEnd), "dd/MM/yyyy") : "data de renovação"}). Após essa data, sua conta voltará para o plano gratuito e você perderá acesso às aulas exclusivas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Manter Assinatura</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelSubscription}
              className="bg-red-600 hover:bg-red-700 text-white border-red-600"
            >
              {isCancelling ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmar Cancelamento"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card className="border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CreditCard className="h-5 w-5 text-red-600" />
            Meu Plano
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {subscription ? (
            <>
              {/* Novo Design do Cartão de Plano - Mais Profissional e Clean */}
              <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-sm">
                <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                        {subscription.planName}
                      </h3>
                      {subscription.status === "PENDING" ? (
                         <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white border-none px-2.5 py-0.5 animate-pulse">
                            PROCESSANDO
                         </Badge>
                      ) : (
                         <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white border-none px-2.5 py-0.5">
                            ATIVO
                         </Badge>
                      )}
                    </div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      {subscription.status === "PENDING" 
                        ? "Aguardando confirmação do pagamento" 
                        : <>Próxima renovação em <span className="font-medium text-neutral-900 dark:text-neutral-200">{calculateRenewalDate()}</span></>
                      }
                    </p>
                  </div>

                  <div className="text-left md:text-right">
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Valor Mensal</p>
                    <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                      R$ {subscription.planName?.includes("VIP") ? "79,90" : subscription.planName?.includes("Premium") ? "49,90" : "29,90"} <span className="text-sm font-normal text-neutral-500">/mês</span>
                    </p>
                  </div>
                </div>

                <div className="bg-neutral-50 dark:bg-neutral-800/50 px-6 py-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                   {subscription.status === "PENDING" ? (
                       <>
                         <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />
                         <span>Verificando status do pagamento...</span>
                       </>
                   ) : (
                       <>
                         <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                         <span>Pagamento em dia via Cartão de Crédito</span>
                       </>
                   )}
                </div>
              </div>

              {/* Ações do Plano */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {subscription.status === "PENDING" ? (
                    <Button 
                      className="h-11 w-full sm:col-span-2 bg-yellow-500 hover:bg-yellow-600 text-white"
                      onClick={handleSyncStatus}
                      disabled={isSyncing}
                    >
                      {isSyncing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                      Atualizar Status do Pagamento
                    </Button>
                ) : (
                    <>
                        <Button 
                          variant="outline" 
                          className="h-11 border-neutral-200 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
                          onClick={handleChangePlan}
                        >
                          <Edit2 className="w-4 h-4 mr-2" />
                          Alterar Plano
                        </Button>
                        <Button 
                          variant="outline" 
                          className="h-11 border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900/30 dark:hover:bg-red-900/20"
                          onClick={() => setShowCancelDialog(true)}
                          disabled={isCancelling}
                        >
                          {isCancelling ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <XCircle className="w-4 h-4 mr-2" />
                          )}
                          Cancelar Assinatura
                        </Button>
                    </>
                )}
              </div>

              <Separator />

              {/* Método de Pagamento */}
              <div>
                <div className="flex items-center justify-between mb-4">
                   <h4 className="font-bold text-sm">Forma de Pagamento</h4>
                   <Button 
                     variant="link" 
                     className="text-blue-600 hover:text-blue-700 p-0 h-auto font-medium text-xs"
                     onClick={handleChangeCard}
                   >
                     Gerenciar Cartões
                   </Button>
                </div>
                
                <div className="flex items-center p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
                  <div className="h-10 w-14 bg-neutral-100 dark:bg-neutral-800 rounded border border-neutral-200 dark:border-neutral-700 flex items-center justify-center mr-4">
                    {/* Ícone Minimalista de Cartão */}
                    <CreditCard className="h-5 w-5 text-neutral-500" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-neutral-900 dark:text-neutral-100">Mastercard •••• 8842</p>
                    <p className="text-xs text-neutral-500">Expira em 12/28</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center p-12 bg-neutral-50 dark:bg-neutral-900/30 rounded-xl border border-dashed border-neutral-200 dark:border-neutral-800">
              <div className="mx-auto h-12 w-12 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-4">
                 <CreditCard className="h-6 w-6 text-neutral-400" />
              </div>
              <h3 className="font-bold text-lg mb-1">Nenhum plano ativo</h3>
              <p className="text-muted-foreground mb-6 max-w-xs mx-auto text-sm">
                Assine um plano agora para ter acesso a todas as aulas e benefícios exclusivos.
              </p>
              <Button 
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-8"
                onClick={handleChangePlan}
              >
                Ver Planos Disponíveis
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
