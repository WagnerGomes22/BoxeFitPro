import { Clock, Users, X, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ClassCardProps {
  title: string;
  level: "Iniciante" | "Intermediário" | "Avançado" | "Todos";
  instructor: string;
  date: string;
  time: string;
  attendees?: string;
  isHistory?: boolean;
  status?: "Agendada" | "Concluída" | "Cancelada" | "Faltou" | "Confirmado";
  onCancel?: () => void;
}

export function ClassCard({
  title,
  level,
  instructor,
  date,
  time,
  attendees,
  isHistory = false,
  status,
  onCancel,
}: ClassCardProps) {
  
  // Mapeamento de cores baseado no nível para uma borda lateral ou destaque sutil
  const levelBorderColor =
    level === "Iniciante" ? "border-l-green-500" :
    level === "Intermediário" ? "border-l-yellow-500" :
    level === "Avançado" ? "border-l-red-600" :
    "border-l-blue-500";

  // Mapeamento de cores para os badges de nível
  const levelBadgeStyles =
    level === "Iniciante" ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800" :
    level === "Intermediário" ? "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800" :
    level === "Avançado" ? "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800" :
    "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800";

  const statusColor = 
    status === "Cancelada" ? "text-red-500 border-red-200 bg-red-50" :
    status === "Faltou" ? "text-red-700 border-red-200 bg-red-100" :
    status === "Concluída" ? "text-emerald-600 border-emerald-200 bg-emerald-50" :
    "text-blue-600 border-blue-200 bg-blue-50";

  return (
    <Card className={cn(
        "group relative overflow-hidden border-border/60 shadow-none transition-all duration-300",
        !isHistory && "hover:border-neutral-300 dark:hover:border-neutral-700 bg-white dark:bg-neutral-900",
        isHistory && "bg-neutral-50/50 dark:bg-neutral-900/30 opacity-75 hover:opacity-100"
    )}>
      {/* Indicador de Nível Lateral */}
      <div className={cn("absolute left-0 top-0 bottom-0 w-1", levelBorderColor)} />

      <CardContent className="p-5 pl-7 flex flex-col sm:flex-row items-start sm:items-center gap-6">
        
        {/* Bloco de Horário (Monospace) */}
        <div className="flex flex-col items-center justify-center shrink-0 min-w-[4.5rem] py-2 px-3 bg-neutral-100 dark:bg-neutral-800 rounded border border-neutral-200 dark:border-neutral-700">
          <span className="text-lg font-mono font-bold tracking-tighter text-neutral-900 dark:text-neutral-100">
            {time}
          </span>
          <span className="text-[0.65rem] uppercase tracking-widest text-neutral-500 font-medium">
            Início
          </span>
        </div>

        {/* Informações Principais */}
        <div className="flex-1 min-w-0 w-full space-y-1">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-lg text-neutral-900 dark:text-neutral-100 truncate leading-none">
                {title}
            </h3>
            <Badge variant="outline" className={cn("font-mono text-[10px] uppercase tracking-wider h-5 px-1.5 border", levelBadgeStyles)}>
              {level}
            </Badge>
          </div>
          
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-neutral-500 dark:text-neutral-400 font-medium">
             <span className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300">
               <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
               Prof. {instructor}
            </span>
            <span className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
               {date}
            </span>
             {attendees && (
                <span className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
                    <Users className="h-3.5 w-3.5" /> 
                    <span className="font-mono">{attendees}</span>
                </span>
            )}
          </div>
        </div>

        {/* Ações / Status */}
        <div className="shrink-0 mt-2 sm:mt-0 self-end sm:self-center">
            {!isHistory ? (
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-neutral-400 hover:text-red-600 hover:bg-red-50/50 rounded-full h-9 w-9 p-0 transition-colors"
                    onClick={onCancel}
                    title="Cancelar Agendamento"
                >
                    <X className="h-5 w-5" />
                </Button>
            ) : (
                <div className={cn("text-xs font-mono uppercase tracking-wider px-2.5 py-1 rounded border", statusColor)}>
                    {status || "Concluída"}
                </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
