"use client";

import * as React from "react";
import { DayPicker, useDayPicker, useNavigation } from "react-day-picker";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      locale={ptBR}
      className={cn(
        "p-3 rounded-xl bg-[#0B1220] text-gray-200 border border-gray-700",
        className
      )}
      classNames={{
        months:
          "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium hidden",
        nav: "space-x-1 flex items-center",
        nav_button:
          "h-7 w-7 bg-transparent pl-0 hover:!bg-transparent hover:!text-gray-400",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-gray-400 rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell:
          "h-9 w-9 text-center text-sm p-0 relative " +
          "focus-within:relative focus-within:z-20",
        day:
          "h-9 w-9 p-0 font-normal text-gray-200 hover:text-black hover:bg-gray-600 rounded-md",
        day_selected:
          "bg-red-600 text-red-50 hover:bg-red-700 focus:bg-red-700",
        day_today: "bg-gray-700 text-gray-100",
        day_outside: "text-gray-500 opacity-50",
        day_disabled: "text-gray-500 opacity-50",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        Caption: OptimizedCaption,
      }}
      {...props}
    />
  );
}

Calendar.displayName = "Calendar";

/* ------------------------------------------------------------------ */
/* Caption otimizado SEM perder o shadcn Select                        */
/* ------------------------------------------------------------------ */

const OptimizedCaption = React.memo(function OptimizedCaption() {
  const { goToMonth, currentMonth } = useNavigation();
  const { fromYear, toYear } = useDayPicker();

  const years = React.useMemo(() => {
    const start = fromYear ?? 1970;
    const end = toYear ?? new Date().getFullYear();

    return Array.from(
      { length: end - start + 1 },
      (_, i) => start + i
    ).reverse();
  }, [fromYear, toYear]);

  const monthLabels = React.useMemo(() => {
    return Array.from({ length: 12 }, (_, month) =>
      format(new Date(2024, month, 1), "MMMM", { locale: ptBR })
    );
  }, []);

  const handleYearChange = (value: string) => {
    const newDate = new Date(currentMonth);
    newDate.setFullYear(Number(value));
    goToMonth(newDate);
  };

  const handleMonthChange = (value: string) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(Number(value));
    goToMonth(newDate);
  };

  return (
    <div className="flex justify-center items-center space-x-2 mb-4">
      <Select
        value={currentMonth.getFullYear().toString()}
        onValueChange={handleYearChange}
      >
        <SelectTrigger className="w-[100px]">
          <SelectValue placeholder="Ano" />
        </SelectTrigger>
        <SelectContent>
          {years.map((year) => (
            <SelectItem key={year} value={year.toString()}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={currentMonth.getMonth().toString()}
        onValueChange={handleMonthChange}
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Mês" />
        </SelectTrigger>
        <SelectContent>
          {monthLabels.map((label, index) => (
            <SelectItem key={index} value={index.toString()}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
});

export { Calendar };
