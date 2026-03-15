"use client";

import * as React from "react";
import {
  DayPicker,
  type MonthCaptionProps,
  type DayPickerLocale,
  useDayPicker,
} from "react-day-picker";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type CalendarCaptionVariant = "selects" | "label";
type CalendarVisualVariant = "brand" | "minimal";

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  captionVariant?: CalendarCaptionVariant;
  visualVariant?: CalendarVisualVariant;
  hideNavigationArrows?: boolean;
};

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionVariant = "selects",
  visualVariant = "brand",
  hideNavigationArrows,
  components,
  ...props
}: CalendarProps) {
  const shouldHideNavigation = hideNavigationArrows ?? captionVariant === "selects";
  const isBrand = visualVariant === "brand";

  return (
    <DayPicker
      locale={ptBR as unknown as Partial<DayPickerLocale>}
      showOutsideDays={showOutsideDays}
      hideNavigation={shouldHideNavigation}
      className={cn(
        isBrand
          ? "p-4 rounded-xl bg-[#0B1220] text-gray-200 border border-gray-700"
          : "p-3 rounded-lg bg-background text-foreground border border-border",
        className
      )}
      classNames={{
        months:
          "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: cn(
          "text-sm font-medium capitalize",
          isBrand ? "text-gray-200" : "text-foreground"
        ),
        nav: "flex items-center gap-1",
        month_grid: "w-full border-separate border-spacing-y-1.5",
        weekdays: "flex w-full px-1",
        weekday: cn(
          "w-9 h-8 flex items-center justify-center text-[0.72rem] uppercase tracking-[0.08em] font-semibold",
          isBrand ? "text-gray-400" : "text-muted-foreground"
        ),
        weeks: "space-y-1.5",
        week: "flex w-full gap-1",
        day: "w-9 h-9 p-0 relative",
        day_button: cn(
          "w-9 h-9 rounded-lg border border-transparent text-sm font-medium transition-all focus-visible:ring-2 focus-visible:outline-none",
          isBrand
            ? "bg-[#111827] text-gray-200 hover:bg-[#1F2937] hover:border-gray-600 hover:text-white focus-visible:ring-red-500/70"
            : "bg-background text-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring"
        ),
        selected: cn(
          isBrand
            ? "[&>button]:bg-red-600 [&>button]:text-white [&>button]:border-red-500 [&>button:hover]:bg-red-600 [&>button:hover]:text-white [&>button:hover]:border-red-500"
            : "[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:border-primary [&>button:hover]:bg-primary [&>button:hover]:text-primary-foreground [&>button:hover]:border-primary"
        ),
        today: cn(
          isBrand
            ? "[&>button]:bg-[#7F1D1D] [&>button]:text-red-100 [&>button]:border-red-700 [&>button:hover]:bg-[#991B1B] [&>button:hover]:border-red-600"
            : "[&>button]:bg-accent [&>button]:text-accent-foreground [&>button]:border-border"
        ),
        outside: cn(
          isBrand
            ? "[&>button]:text-gray-500/80 [&>button]:bg-transparent [&>button]:border-transparent [&>button]:opacity-45"
            : "[&>button]:text-muted-foreground [&>button]:bg-transparent [&>button]:border-transparent [&>button]:opacity-45"
        ),
        disabled: cn(
          isBrand
            ? "[&>button]:text-gray-500/70 [&>button]:bg-[#0F172A] [&>button]:border-transparent [&>button]:opacity-50 [&>button]:cursor-not-allowed"
            : "[&>button]:text-muted-foreground [&>button]:bg-muted/40 [&>button]:border-transparent [&>button]:opacity-50 [&>button]:cursor-not-allowed"
        ),
        hidden: "invisible",
        ...classNames,
      }}
      components={
        captionVariant === "selects"
          ? { ...components, MonthCaption: CustomMonthCaption }
          : components
      }
      {...props}
    />
  );
}

Calendar.displayName = "Calendar";

function CustomMonthCaption({
  calendarMonth,
}: MonthCaptionProps) {
  const { goToMonth, dayPickerProps } = useDayPicker();
  const currentDate = calendarMonth.date;

  const years = React.useMemo(() => {
    const start = dayPickerProps.startMonth?.getFullYear() ?? 2000;
    const end = dayPickerProps.endMonth?.getFullYear() ?? new Date().getFullYear();

    return Array.from({ length: end - start + 1 }, (_, i) => start + i).reverse();
  }, [dayPickerProps.endMonth, dayPickerProps.startMonth]);

  const monthLabels = React.useMemo(() => {
    return Array.from({ length: 12 }, (_, month) => ({
      label: format(new Date(2024, month, 1), "MMMM", { locale: ptBR }),
      value: month.toString(),
    }));
  }, []);

  const handleYearChange = (value: string) => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(Number(value));
    goToMonth(newDate);
  };

  const handleMonthChange = (value: string) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(Number(value));
    goToMonth(newDate);
  };

  return (
    <div className="flex justify-center items-center gap-3 mb-4">
      <Select value={currentDate.getMonth().toString()} onValueChange={handleMonthChange}>
        <SelectTrigger className="w-[160px] bg-[#111827] border border-gray-700 text-white">
          <SelectValue placeholder="Mês" />
        </SelectTrigger>
        <SelectContent className="bg-[#111827] border border-gray-700 text-white">
          {monthLabels.map((month) => (
            <SelectItem
              key={month.value}
              value={month.value}
              className="capitalize focus:bg-red-600 focus:text-white"
            >
              {month.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={currentDate.getFullYear().toString()} onValueChange={handleYearChange}>
        <SelectTrigger className="w-[110px] bg-[#111827] border border-gray-700 text-white">
          <SelectValue placeholder="Ano" />
        </SelectTrigger>
        <SelectContent className="bg-[#111827] border border-gray-700 text-white">
          {years.map((year) => (
            <SelectItem
              key={year}
              value={year.toString()}
              className="focus:bg-red-600 focus:text-white"
            >
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export { Calendar };
