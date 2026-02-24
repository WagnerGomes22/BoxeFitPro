import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, User } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface NextClass {
  id: string;
  formattedDate: string;
  class: {
    name: string;
    level: string;
    instructor: string | null;
    time: string;
    capacity: number;
    _count: {
      bookings: number;
    };
  };
}

interface NextClassesListProps {
  classes: NextClass[];
}

export function NextClassesList({ classes }: NextClassesListProps) {
  return (
    <Card className="h-full border-border/50 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-lg font-bold">Próximos Treinos</CardTitle>
        <Link href="/dashboard/agendar">
          <Button variant="outline" size="sm" className="h-8">
            Ver grade completa
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="pt-4">
        {classes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[200px] text-center space-y-4">
            <div className="p-3 bg-muted rounded-full">
              <Calendar className="w-6 h-6 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="font-medium text-foreground">Sem treinos agendados</p>
              <p className="text-sm text-muted-foreground">
                Comece sua jornada de treinos agora.
              </p>
            </div>
            <Link href="/dashboard/agendar">
              <Button>Marcar Aula</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {classes.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center p-3 border rounded-lg bg-card hover:bg-accent/50 transition-colors group"
              >
                {/* Data e Hora */}
                <div className="flex flex-col items-center justify-center w-14 h-14 bg-primary/10 rounded-md mr-4 shrink-0 group-hover:bg-primary/20 transition-colors">
                  <span className="text-xs font-bold text-primary uppercase">
                    {booking.formattedDate.split(" ")[0]}
                  </span>
                  <span className="text-[10px] font-medium text-muted-foreground uppercase">
                    {booking.formattedDate.split(" ")[1]}
                  </span>
                </div>

                {/* Detalhes */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold truncate pr-2">
                      {booking.class.name}
                    </h4>
                    <Badge variant="secondary" className="text-[10px] h-5">
                      {booking.class.time}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center text-xs text-muted-foreground gap-3">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span className="truncate max-w-[80px]">
                        {booking.class.instructor || "Instrutor"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className={booking.class.level === "Iniciante" ? "text-green-500" : "text-blue-500"}>
                            {booking.class.level}
                        </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="pt-2">
                <Link href="/dashboard/agendar" className="w-full">
                    <Button variant="secondary" className="w-full text-xs">
                        Agendar mais aulas
                    </Button>
                </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
