"use client";

import { useState } from "react";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths, 
  isToday
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BigCalendarProps {
  selectedDate: Date | undefined;
  onSelectDate: (date: Date) => void;
  disabledDays?: (date: Date) => boolean;
  classesData?: { date: string; count: number; hasSpecial: boolean }[]; // Novos dados
  onMonthChange?: (date: Date) => void; // Callback para buscar novos dados
}

export function BigCalendar({ selectedDate, onSelectDate, disabledDays, classesData = [], onMonthChange }: BigCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const firstDayOfMonth = startOfMonth(currentMonth);
  const lastDayOfMonth = endOfMonth(currentMonth);
  const startDate = startOfWeek(firstDayOfMonth, { locale: ptBR });
  const endDate = endOfWeek(lastDayOfMonth, { locale: ptBR });

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const changeMonth = (newDate: Date) => {
    setCurrentMonth(newDate);
    if (onMonthChange) onMonthChange(newDate);
  };

  const nextMonth = () => changeMonth(addMonths(currentMonth, 1));
  const prevMonth = () => changeMonth(subMonths(currentMonth, 1));
  
  const goToToday = () => {
    const today = new Date();
    changeMonth(today);
    onSelectDate(today);
  };

  return (
    <div className="flex flex-col h-full bg-[#0F1117] rounded-xl shadow-2xl border border-white/[0.08] overflow-hidden text-slate-200 font-sans">
      {/* Header do Calendário */}
      <div className="flex items-center justify-between p-5 border-b border-white/[0.08] bg-[#0F1117]">
        <div className="flex items-center gap-6">
          <h2 className="text-lg font-medium tracking-tight text-white capitalize flex items-center gap-3">
            <CalendarIcon className="h-4 w-4 text-white/40" />
            {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
          </h2>
          <div className="flex items-center rounded-lg border border-white/[0.08] bg-white/[0.02] shadow-sm overflow-hidden">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={prevMonth}
              className="h-7 w-8 rounded-none hover:bg-white/[0.06] text-slate-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="w-[1px] h-4 bg-white/[0.08]" />
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={nextMonth}
              className="h-7 w-8 rounded-none hover:bg-white/[0.06] text-slate-400 hover:text-white transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Button 
            variant="ghost" 
            size="sm" 
            onClick={goToToday} 
            className="hidden sm:flex text-xs font-medium text-slate-400 hover:text-white hover:bg-white/[0.06] h-7 border border-transparent hover:border-white/[0.08]"
        >
          Hoje
        </Button>
      </div>

      {/* Cabeçalho dos Dias da Semana */}
      <div className="grid grid-cols-7 border-b border-white/[0.08] bg-[#0F1117]">
        {weekDays.map((day) => (
          <div key={day} className="py-3 text-center text-[11px] font-medium text-slate-500 uppercase tracking-widest">
            {day}
          </div>
        ))}
      </div>

      {/* Grid de Dias */}
      <div className="grid grid-cols-7 auto-rows-fr flex-1 bg-white/[0.04] gap-[1px]">
        {days.map((day) => {
          const isDisabled = disabledDays ? disabledDays(day) : false;
          const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isDayToday = isToday(day);

          // Buscar dados do dia
          const dayData = classesData.find(d => d.date === format(day, "yyyy-MM-dd"));
          const hasClasses = dayData && dayData.count > 0;

          return (
            <button
              key={day.toString()}
              onClick={() => !isDisabled && onSelectDate(day)}
              disabled={isDisabled}
              className={cn(
                "relative flex flex-col items-start justify-start p-3 min-h-[100px] transition-all duration-200 outline-none",
                // Fundo base
                "bg-[#0F1117] hover:bg-white/[0.02]",
                
                // Fora do mês
                !isCurrentMonth && "bg-[#0F1117]/50 text-slate-700",
                
                // Desabilitado
                isDisabled && "bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.01)_10px,rgba(255,255,255,0.01)_20px)] opacity-60 cursor-not-allowed hover:bg-transparent",
                
                // Selecionado
                isSelected && "bg-white/[0.06] z-10",
                
                // Focus ring para acessibilidade
                "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/20"
              )}
            >
              <time
                dateTime={format(day, "yyyy-MM-dd")}
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-[6px] text-xs font-medium transition-all",
                  
                  // Dia selecionado (Prioridade máxima)
                  isSelected && isCurrentMonth && "bg-white text-black shadow-lg shadow-white/10 scale-110",
                  
                  // Hoje (se não selecionado)
                  !isSelected && isDayToday && "bg-red-500/10 text-red-500 ring-1 ring-inset ring-red-500/30",
                  
                  // Dia normal mês atual
                  !isSelected && !isDayToday && isCurrentMonth && "text-slate-400 group-hover:text-slate-200",
                  
                  // Dia fora do mês
                  !isSelected && !isDayToday && !isCurrentMonth && "text-slate-700",
                  
                  // Selecionado fora do mês (caso raro)
                  isSelected && !isCurrentMonth && "bg-white/10 text-slate-300"
                )}
              >
                {format(day, "d")}
              </time>

              {/* Indicadores de Eventos Reais */}
              {!isDisabled && isCurrentMonth && hasClasses && (
                <div className="mt-3 w-full space-y-1.5 opacity-90">
                   {/* Slots disponíveis */}
                   <div className={cn(
                       "hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-[4px] text-[10px] font-medium transition-colors w-full",
                       isSelected ? "bg-white/10 text-white" : "bg-white/[0.03] text-slate-400 hover:bg-white/[0.06] hover:text-slate-200"
                   )}>
                      <div className="h-1 w-1 rounded-full bg-emerald-500/80 shadow-[0_0_4px_rgba(16,185,129,0.4)]" />
                      <span className="truncate">{dayData.count} horários</span>
                   </div>

                   {/* Aulas Especiais (Flag) */}
                   {dayData.hasSpecial && (
                     <div className={cn(
                       "hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-[4px] text-[10px] font-medium transition-colors w-full",
                       isSelected ? "bg-white/10 text-white" : "bg-white/[0.03] text-slate-400 hover:bg-white/[0.06] hover:text-slate-200"
                   )}>
                        <div className="h-1 w-1 rounded-full bg-purple-500/80 shadow-[0_0_4px_rgba(168,85,247,0.4)]" />
                        <span className="truncate">Especial</span>
                     </div>
                   )}
                   
                   {/* Mobile dots */}
                   <div className="sm:hidden flex justify-center gap-1 mt-1">
                     <div className="h-1 w-1 rounded-full bg-emerald-500/60" />
                   </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
