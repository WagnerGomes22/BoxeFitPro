import { getWeeklySchedule } from "@/actions/booking/get-weekly-schedule";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User, Users } from "lucide-react";
import Link from "next/link";
import { addWeeks, subWeeks, format, isSameDay, startOfToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface SchedulePageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function SchedulePage({ searchParams }: SchedulePageProps) {
  const params = await searchParams;
  const dateParam = params.date ? new Date(params.date) : new Date();
  
  // Garantir data válida
  const currentDate = isNaN(dateParam.getTime()) ? new Date() : dateParam;

  const { schedule, startDate, endDate, error } = await getWeeklySchedule(currentDate);

  const prevWeek = subWeeks(currentDate, 1);
  const nextWeek = addWeeks(currentDate, 1);
  const today = startOfToday();

  return (
    <div className="space-y-8 pb-10 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-6">
        <div>
          <h1 className="text-3xl font-black italic tracking-tighter text-foreground uppercase">
            Grade de <span className="text-red-600">Horários</span>
          </h1>
          <p className="text-neutral-500 font-medium max-w-2xl mt-1">
            Visualize a programação semanal das aulas e planeje seus treinos.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white dark:bg-neutral-900 p-1 rounded-lg border border-neutral-200 dark:border-neutral-800 shadow-sm">
          <Button asChild variant="ghost" size="icon" className="h-8 w-8 hover:bg-neutral-100">
            <Link href={`/dashboard/grade?date=${prevWeek.toISOString()}`}>
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          
          <div className="flex items-center gap-2 px-2 min-w-[200px] justify-center font-mono text-sm font-medium">
            <CalendarIcon className="h-4 w-4 text-neutral-400" />
            <span className="capitalize">
              {startDate && format(startDate, "dd MMM", { locale: ptBR })} - {endDate && format(endDate, "dd MMM", { locale: ptBR })}
            </span>
          </div>

          <Button asChild variant="ghost" size="icon" className="h-8 w-8 hover:bg-neutral-100">
            <Link href={`/dashboard/grade?date=${nextWeek.toISOString()}`}>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {error ? (
        <div className="p-8 text-center text-red-500 bg-red-50 rounded-lg border border-red-100">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
          {schedule?.map((day) => {
            const isToday = isSameDay(day.date, today);
            const isPast = day.date < today;

            return (
              <div 
                key={day.date.toISOString()} 
                className={cn(
                  "flex flex-col h-full rounded-xl border transition-colors",
                  isToday 
                    ? "bg-red-50/50 border-red-200 dark:bg-red-900/10 dark:border-red-900/50" 
                    : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
                )}
              >
                {/* Cabeçalho do Dia */}
                <div className={cn(
                  "p-3 text-center border-b",
                  isToday 
                    ? "border-red-200 dark:border-red-900/50 bg-red-100/50 dark:bg-red-900/20" 
                    : "border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900"
                )}>
                  <span className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">
                    {day.dayName}
                  </span>
                  <span className={cn(
                    "block text-2xl font-black tracking-tight",
                    isToday ? "text-red-600" : "text-neutral-900 dark:text-white"
                  )}>
                    {day.dayNumber}
                  </span>
                </div>

                {/* Lista de Aulas */}
                <div className="p-2 flex-1 flex flex-col gap-2 min-h-[150px]">
                  {day.classes.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-neutral-400 text-xs font-medium italic">
                      Sem aulas
                    </div>
                  ) : (
                    day.classes.map((aula) => (
                      <div 
                        key={aula.id}
                        className={cn(
                          "group relative p-3 rounded-lg border bg-white dark:bg-neutral-800 transition-all hover:shadow-md",
                          aula.isFull 
                            ? "border-red-100 bg-red-50/30" 
                            : "border-neutral-200 hover:border-neutral-300 dark:border-neutral-700"
                        )}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-bold font-mono text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded">
                            {format(aula.startTime, "HH:mm")}
                          </span>
                          {aula.isFull && (
                            <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">LOTADO</Badge>
                          )}
                        </div>
                        
                        <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100 leading-tight mb-1">
                          {aula.name}
                        </h3>
                        
                        <div className="flex items-center gap-1.5 text-xs text-neutral-500 mb-2">
                          <User className="h-3 w-3" />
                          <span className="truncate max-w-[100px]">{aula.instructorName}</span>
                        </div>

                        {/* Barra de Capacidade */}
                        <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={cn("h-full rounded-full transition-all", aula.isFull ? "bg-red-500" : "bg-neutral-400")}
                            style={{ width: `${(aula.bookingsCount / aula.capacity) * 100}%` }}
                          />
                        </div>
                        <div className="flex justify-between mt-1">
                            <span className="text-[10px] text-neutral-400 font-medium">Vagas</span>
                            <span className={cn("text-[10px] font-bold", aula.isFull ? "text-red-600" : "text-neutral-600")}>
                                {aula.bookingsCount}/{aula.capacity}
                            </span>
                        </div>

                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
