"use client";

import React from "react";
import { 
  eachDayOfInterval, 
  subDays, 
  format, 
  isSameDay, 
  getDay
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

type BookingStatus = "ATTENDED" | "NO_SHOW" | "CONFIRMED" | "CANCELED";

interface BookingData {
  fullDate: string | Date;
  status: BookingStatus;
  class: {
    name: string;
  };
}

interface ContributionGridProps {
  data: BookingData[];
}

export function ContributionGrid({ data }: ContributionGridProps) {
  // Generate last 365 days (approx 1 year like GitHub)
  const today = new Date();
  const startDate = subDays(today, 364); 
  
  // Create array of days
  const days = eachDayOfInterval({
    start: startDate,
    end: today,
  });


  const startDayOfWeek = getDay(startDate);
  const emptyDays = Array(startDayOfWeek).fill(null);

  // Combine empty cells and real days
  const allCells = [...emptyDays, ...days];

  // Helper to find booking for a day
  const getBookingForDay = (date: Date) => {
    const bookingsForDay = data.filter((booking) => 
      isSameDay(new Date(booking.fullDate), date)
    );
    
    if (bookingsForDay.length === 0) return null;
    

    return bookingsForDay.sort((a, b) => {
      const score = (status: string) => {
        if (status === "ATTENDED") return 3;
        if (status === "NO_SHOW") return 2; // Falta tem prioridade sobre agendado
        if (status === "CONFIRMED") return 1;
        if (status === "CANCELED") return 0;
        return -1;
      };
      return score(b.status) - score(a.status);
    })[0];
  };

  const getStatusColor = (booking: BookingData | null) => {
    if (!booking) return "bg-neutral-100 dark:bg-neutral-900"; 
    
    switch (booking.status) {
      case "ATTENDED":
        return "bg-emerald-500 dark:bg-emerald-500"; 
      case "CONFIRMED":
       
        if (new Date(booking.fullDate) < new Date()) {
             return "bg-neutral-300 dark:bg-neutral-700"; 
        }
        return "bg-neutral-300 dark:bg-neutral-700"; 
      case "NO_SHOW":
        return "bg-red-500 dark:bg-red-500"; 
      case "CANCELED":
        return "bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"; 
      default:
        return "bg-neutral-100 dark:bg-neutral-900";
    }
  };
  
  const getTooltipText = (date: Date, booking: BookingData | null) => {
    const dateStr = format(date, "dd MMM", { locale: ptBR });
    if (!booking) return `${dateStr} — Sem aula`;
    
    const className = booking.class.name;
    let statusText = "";
    
    switch (booking.status) {
      case "ATTENDED":
        statusText = "Presente";
        break;
      case "CONFIRMED":
         if (new Date(booking.fullDate) < new Date()) {
            statusText = "Aguardando Confirmação";
         } else {
            statusText = "Agendado";
         }
        break;
      case "NO_SHOW":
        statusText = "Faltou";
        break;
      case "CANCELED":
        statusText = "Cancelada";
        break;
      default:
        statusText = booking.status;
    }
    
    return `${dateStr} — ${className} — ${statusText}`;
  };

  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="min-w-[800px] flex flex-col gap-4">
         {/* 
            Grid layout:
            Use CSS Grid with 7 rows.
            Auto-flow column to fill vertically first.
         */}
         <div 
            className="grid grid-rows-7 grid-flow-col gap-1 w-fit"
            style={{ 
                // Ensure rows are fixed height to align perfectly
                gridTemplateRows: 'repeat(7, 12px)' 
            }}
         >
            {allCells.map((item, index) => {
                // If item is null (padding), render transparent empty cell
                if (item === null) {
                    return <div key={`empty-${index}`} className="w-3 h-3" />;
                }

                const day = item as Date;
                const booking = getBookingForDay(day);
                const colorClass = getStatusColor(booking);
                const tooltipText = getTooltipText(day, booking);
                
                // Override for special borders/styles not handled by colorClass alone if needed
                const finalColorClass = colorClass;
                
                return (
                    <div 
                        key={day.toISOString()} 
                        className="group relative w-3 h-3"
                    >
                        <div 
                            className={cn(
                                "w-full h-full rounded-sm transition-colors",
                                finalColorClass,
                                !booking && "bg-neutral-100/50 dark:bg-neutral-800/50"
                            )}
                        />
                        {/* Custom Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50 whitespace-nowrap pointer-events-none">
                            <div className="bg-black text-white text-xs px-2 py-1 rounded shadow-lg border border-neutral-800">
                                {tooltipText}
                            </div>
                            {/* Arrow */}
                            <div className="w-2 h-2 bg-black rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2 border-r border-b border-neutral-800"></div>
                        </div>
                    </div>
                );
            })}
         </div>
         
         {/* Legend */}
         <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-sm bg-emerald-500"></div>
                <span>Presente</span>
            </div>
            <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-sm bg-red-500"></div>
                <span>Faltou</span>
            </div>
            <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-sm bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"></div>
                <span>Cancelada</span>
            </div>
            <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-sm bg-neutral-300 dark:bg-neutral-700"></div>
                <span>Agendado/Aguardando</span>
            </div>
         </div>
      </div>
    </div>
  );
}
