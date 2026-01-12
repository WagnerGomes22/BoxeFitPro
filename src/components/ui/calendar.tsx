"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";
import { ptBR } from "date-fns/locale";

import { cn } from "@/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

export function Calendar({ className, classNames, ...props }: CalendarProps) {
  return (
    <DayPicker
      locale={ptBR}
      showOutsideDays
      className={cn(
        "p-3 rounded-xl bg-[#0B1220] text-gray-200 border border-gray-700",
        className
      )}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-around pt-1 relative items-center",
        caption_label: "text-sm font-medium text-gray-200",
        nav: "space-x-1 flex items-center",
        nav_button: "h-7 w-7 bg-transparent pl-0 hover:!bg-transparent hover:!text-gray-400",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "text-gray-400 rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell:
          "h-9 w-9 text-center text-sm p-0 relative " +
          "[&:has([aria-selected])]:bg-red-600/20 " +
          "first:[&:has([aria-selected])]:rounded-l-md " +
          "last:[&:has([aria-selected])]:rounded-r-md " +
          "focus-within:relative focus-within:z-20",
        day: "h-9 w-9 p-0 font-normal text-gray-200 hover:text-black hover:bg-gray-600 rounded-md",
        day_selected:
          "bg-red-600 text-red-50 hover:bg-red-700 focus:bg-red-700",
        day_today: "bg-gray-700 text-gray-100",
        day_outside: "text-gray-500 opacity-50",
        day_disabled: "text-gray-500 opacity-50",
        day_hidden: "invisible",
        ...classNames,
      }}
      {...props}
    />
  );
}
