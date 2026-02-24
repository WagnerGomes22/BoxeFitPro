
import Link from "next/link";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CancelableClassCard } from "@/components/dashboard/CancelableClassCard";

export type UpcomingClass = {
  id: string;
  formattedDate: string;
  class: {
    name: string;
    level: "Iniciante" | "Intermediário" | "Avançado" | "Todos";
    instructor: string;
    time: string;
    capacity: number;
    _count: {
      bookings: number;
    };
  };
};

interface UpcomingClassesListProps {
  classes: UpcomingClass[];
}

export function UpcomingClassesList({ classes }: UpcomingClassesListProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black italic tracking-wider text-foreground uppercase flex items-center gap-2">
          <span className="w-2 h-8 bg-red-600 rounded-sm inline-block"></span>
          Próximos Combates
        </h3>
        <Link
          href="/dashboard/agendar"
          className="text-xs font-bold uppercase tracking-widest text-red-600 hover:text-red-700 hover:underline"
        >
          Ver Agenda Completa
        </Link>
      </div>

      <div className="space-y-3">
        {classes.length > 0 ? (
          classes.map((booking) => (
            <CancelableClassCard
              key={booking.id}
              bookingId={booking.id}
              title={booking.class.name}
              level={booking.class.level}
              instructor={booking.class.instructor}
              date={booking.formattedDate}
              time={booking.class.time}
              attendees={`${booking.class._count.bookings}/${booking.class.capacity}`}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-lg bg-neutral-50/50 dark:bg-neutral-900/50">
            <div className="h-12 w-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4 text-neutral-400">
              <Clock className="h-6 w-6" />
            </div>
            <p className="text-neutral-500 font-medium text-center mb-4">
              Nenhum treino agendado. O ringue está esperando.
            </p>
            <Link href="/dashboard/agendar">
              <Button
                variant="outline"
                className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 uppercase font-bold text-xs tracking-widest"
              >
                Agendar Agora
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
