import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Ticket, MapPin } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface BookingSummaryProps {
  date: Date | undefined;
  isAlreadyBooked: boolean;
  timeSlot: string | null;
  onConfirm: () => void;
  isSubmitting?: boolean;
}

export function BookingSummary({
  date,
  timeSlot,
  onConfirm,
  isSubmitting = false,
  isAlreadyBooked = false,
}: BookingSummaryProps) {
  if (!date && !timeSlot) {
    return (
      <Card className="border-dashed border-2 border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 shadow-none">
        <CardContent className="p-8 flex flex-col items-center justify-center text-center text-neutral-400 gap-2">
          <Ticket className="h-8 w-8 opacity-20" />
          <p className="text-sm font-medium">Selecione data e horário para gerar seu ticket.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-xl overflow-hidden bg-neutral-900 text-white relative group">
      {/* Detalhe visual de rasgo de ticket (opcional, simulado com borda) */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-red-500 to-red-600" />

      <CardHeader className="pb-6 border-b border-white/10 pt-8">
        <CardTitle className="text-xl font-black italic tracking-tighter uppercase flex items-center gap-3">
          <span className="bg-red-600 text-white p-1 rounded-sm">
            <Ticket className="h-4 w-4" />
          </span>
          Ticket de Treino
        </CardTitle>
        <p className="text-xs text-neutral-400 font-mono tracking-widest uppercase mt-1">
            Confirmação de Presença
        </p>
      </CardHeader>
      
      <CardContent className="p-6 space-y-8">
        {date && (
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Data do Combate</p>
            <div className="flex items-center gap-3">
               <Calendar className="h-5 w-5 text-red-500" />
               <p className="font-mono text-lg font-bold text-white uppercase tracking-tight">
                {format(date, "EEEE, d MMM", { locale: ptBR })}
              </p>
            </div>
          </div>
        )}

        {timeSlot && (
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Início do Round</p>
            <div className="flex items-center gap-3">
               <Clock className="h-5 w-5 text-red-500" />
               <p className="font-mono text-3xl font-bold text-white tracking-tighter">
                {timeSlot}
              </p>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-dashed border-white/10">
            <div className="flex items-start gap-3 opacity-60">
                <MapPin className="h-4 w-4 text-neutral-400 mt-0.5" />
                <div>
                    <p className="text-xs font-bold text-white">BoxeFit Pro Arena</p>
                    <p className="text-[10px] text-neutral-400">Rua dos Campeões, 100 - Centro</p>
                </div>
            </div>
        </div>
      </CardContent>

      <CardFooter className="bg-black/20 p-6 border-t border-white/5">
        <Button
          className={cn(
            "w-full font-black uppercase tracking-widest h-12 text-sm shadow-lg transition-all duration-300",
            isAlreadyBooked 
              ? "bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700" 
              : "bg-red-600 hover:bg-red-500 text-white hover:shadow-red-900/20 hover:scale-[1.02]"
          )}
          disabled={!date || !timeSlot || isSubmitting || isAlreadyBooked}
          onClick={onConfirm}
        >
          {isSubmitting 
            ? "Processando..." 
            : isAlreadyBooked
              ? "Já Inscrito"
              : "Confirmar Presença"
          }
        </Button>
      </CardFooter>
    </Card>
  );
}
