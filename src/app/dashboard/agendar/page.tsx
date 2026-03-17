"use client";

import { BigCalendar } from "@/components/booking/BigCalendar";
import { TimeSlotPicker } from "@/components/booking/TimeSlotPicker";
import { BookingSummary } from "@/components/booking/BookingSummary";
import { isBefore, startOfToday, isWeekend, startOfMonth, endOfMonth, format } from "date-fns";
import { getClassesByDateRange, getClassesForDay } from "@/actions/booking/get-classes";
import { bookClass } from "@/actions/booking/book-class";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner"; 
import { AlertCircle } from "lucide-react";

export default function AgendarPage() {
  const router = useRouter();
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  
  type CalendarDayStat = { date: string; count: number; hasSpecial: boolean };
  type CalendarClass = { startTime: Date; name: string };
  type DayClass = {
    id: string;
    startTime: Date;
    bookingsCount: number;
    capacity: number;
    name: string;
    instructorName: string;
    userBooked: boolean;
  };
  type DaySlot = {
    id: string;
    time: string;
    available: boolean;
    name: string;
    instructor: string;
    isBooked: boolean;
    isPast?: boolean;
  };

  const [calendarClasses, setCalendarClasses] = useState<{ date: string; count: number; hasSpecial: boolean }[]>([]);
  const [daySlots, setDaySlots] = useState<DaySlot[]>([]);

  // 1. Carregar dados do calendário (mês inicial)
  useEffect(() => {
    const today = new Date();
    loadMonthData(today);
  }, []);

  const loadMonthData = async (baseDate: Date) => {
    const start = startOfMonth(baseDate);
    const end = endOfMonth(baseDate);
    
    try {
      const classes = (await getClassesByDateRange(start, end)) as CalendarClass[];
      
      const statsByDay = classes.reduce<Record<string, CalendarDayStat>>((acc, cls) => {
        const dayStr = format(cls.startTime, "yyyy-MM-dd");
        if (!acc[dayStr]) {
            acc[dayStr] = { date: dayStr, count: 0, hasSpecial: false };
        }
        acc[dayStr].count += 1;
        if (cls.name.includes("Sparring")) acc[dayStr].hasSpecial = true;
        return acc;
      }, {});

      setCalendarClasses(Object.values(statsByDay));
    } catch (error) {
      console.error("Erro ao carregar aulas do mês:", error);
    }
  };

  const handleDateSelect = async (newDate: Date) => {
    setDate(newDate);
    setSelectedSlot(null);
    setIsLoadingSlots(true);

    try {
      const classes = (await getClassesForDay(newDate)) as DayClass[];
      
      const slots = classes.map(c => {
        const isPast = isBefore(c.startTime, new Date());
        return {
          id: c.id,
          time: format(c.startTime, "HH:mm"),
          available: c.bookingsCount < c.capacity && !isPast,
          name: c.name,
          instructor: c.instructorName,
          isBooked: c.userBooked,
          isPast: isPast
        };
      });
      
      setDaySlots(slots);
    } catch (error) {
      console.error("Erro ao carregar horários do dia:", error);
      setDaySlots([]);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const handleConfirm = async () => {
    if (!date || !selectedSlot) return;

    setIsSubmitting(true);
    
    try {
      const result = await bookClass(selectedSlot);

      if (result.success) {
        toast.success(result.message);
        router.push("/dashboard");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Erro inesperado ao realizar operação.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Bloquear datas passadas e fins de semana (ajustar conforme regra de negócio)
  const disabledDays = (date: Date) => {
    return isBefore(date, startOfToday()) || isWeekend(date);
  };

  const selectedSlotData = daySlots.find(s => s.id === selectedSlot);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-neutral-200 dark:border-neutral-800 pb-6">
        <h1 className="text-3xl font-black italic tracking-tighter text-foreground uppercase">
          Marcar <span className="text-red-600">Combate</span>
        </h1>
        <p className="text-neutral-500 font-medium max-w-2xl">
          Selecione uma data no calendário para ver os horários de treino disponíveis.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Coluna Esquerda: Calendário (8 colunas) */}
        <div className="xl:col-span-8 space-y-8">
          
          {/* Card do Calendário Grande */}
          <div className="min-h-[600px] shadow-none rounded-sm overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
             <BigCalendar 
                selectedDate={date}
                onSelectDate={handleDateSelect}
                disabledDays={disabledDays}
                classesData={calendarClasses}
                onMonthChange={loadMonthData}
             />
          </div>

          {/* Seção de Horários (Só aparece se data selecionada) */}
          {date && (
            <div className="bg-white dark:bg-neutral-900 rounded-sm border border-neutral-200 dark:border-neutral-800 p-8 animate-in slide-in-from-top-4 duration-300">
              <div className="flex items-center justify-between mb-6">
                 <h2 className="text-lg font-black italic tracking-wider uppercase text-foreground">
                    Horários para {date.toLocaleDateString()}
                 </h2>
                 <span className="text-xs font-bold uppercase tracking-widest text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-3 py-1 rounded-full">
                    {daySlots.length} Opções
                 </span>
              </div>
              
              <TimeSlotPicker
                slots={daySlots}
                selectedSlot={selectedSlot}
                onSelectSlot={setSelectedSlot}
                isLoading={isLoadingSlots}
              />
            </div>
          )}
        </div>

        {/* Coluna Direita: Resumo (4 colunas) */}
        <div className="xl:col-span-4 sticky top-6 space-y-6">
          <BookingSummary
            date={date}
            timeSlot={selectedSlotData?.time ?? null}
            onConfirm={handleConfirm}
            isSubmitting={isSubmitting}
            isAlreadyBooked={!!selectedSlotData?.isBooked}
          />
          
          {/* Informações Auxiliares */}
          <div className="p-5 bg-neutral-50 dark:bg-neutral-900 rounded-sm border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-500">
            <div className="flex items-center gap-2 mb-2 text-neutral-900 dark:text-neutral-200 font-bold uppercase tracking-wider">
                <AlertCircle className="h-4 w-4" />
                Regras do Ringue
            </div>
            <p className="leading-relaxed">
                O cancelamento deve ser feito com pelo menos <span className="font-bold text-red-600">2 horas de antecedência</span>. 
                Faltas sem aviso prévio (W.O.) podem resultar em suspensão temporária de agendamentos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
