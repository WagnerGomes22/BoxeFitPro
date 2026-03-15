import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Clock, Users, CalendarCheck, ShieldAlert, CheckCircle2, Info, Edit2 } from "lucide-react";
import Link from "next/link";

interface OperationalListProps {
  nextClasses: {
    id: string;
    time: string;
    name: string;
    instructor: string;
    bookings: number;
    capacity: number;
    occupancy: number;
    status: string;
  }[];
  alerts: {
    type: string; // 'warning' | 'danger' | 'info' | 'success'
    message: string;
  }[];
}

export function OperationalList({ nextClasses, alerts }: OperationalListProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
      {/* Próximas Aulas (4 colunas) */}
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-zinc-500" />
            Aulas de Hoje
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Horário</TableHead>
                <TableHead>Modalidade</TableHead>
                <TableHead className="text-center">Inscritos</TableHead>
                <TableHead className="text-right">Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {nextClasses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    Sem mais aulas hoje.
                  </TableCell>
                </TableRow>
              ) : (
                nextClasses.map((aula) => (
                  <TableRow key={aula.id}>
                    <TableCell className="font-medium">{aula.time}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{aula.name}</span>
                        <span className="text-xs text-muted-foreground">{aula.instructor}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={aula.occupancy >= 80 ? "text-red-600 font-bold" : ""}>
                        {aula.bookings}
                      </span>
                      <span className="text-muted-foreground text-xs">/{aula.capacity}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      {aula.status === "COMPLETED" ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200 font-normal">
                          Concluída
                        </Badge>
                      ) : aula.status === "ONGOING" ? (
                        <Badge className="bg-green-600 animate-pulse hover:bg-green-700 border-none text-white">
                          Em Andamento
                        </Badge>
                      ) : aula.occupancy >= 100 ? (
                        <Badge variant="destructive">LOTADO</Badge>
                      ) : aula.occupancy >= 80 ? (
                        <Badge className="bg-amber-500 hover:bg-amber-600 border-none text-white">Quase Cheia</Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200">
                          Agendada
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-blue-600 hover:bg-blue-50">
                        <Link href={`/admin/aulas/${aula.id}`}>
                          <Edit2 className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Alertas Administrativos (3 colunas) */}
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-amber-500" />
            Alertas Operacionais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
          {alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-8">
              <CalendarCheck className="h-12 w-12 mb-2 text-green-500 opacity-50" />
              <p>Tudo em ordem!</p>
            </div>
          ) : (
            alerts.map((alert, index) => {
              const isDanger = alert.type === 'danger';
              const isWarning = alert.type === 'warning';
              const isInfo = alert.type === 'info';
              const isSuccess = alert.type === 'success';

              return (
                <div 
                  key={index} 
                  className={`
                    flex items-start gap-3 p-4 rounded-lg border text-sm
                    ${isDanger ? 'bg-red-50 border-red-200 text-red-900' : ''}
                    ${isWarning ? 'bg-amber-50 border-amber-200 text-amber-900' : ''}
                    ${isInfo ? 'bg-blue-50 border-blue-200 text-blue-900' : ''}
                    ${isSuccess ? 'bg-green-50 border-green-200 text-green-900' : ''}
                  `}
                >
                  {isDanger && <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />}
                  {isWarning && <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />}
                  {isInfo && <Info className="h-5 w-5 text-blue-600 shrink-0" />}
                  {isSuccess && <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />}
                  
                  <div>
                    <h5 className="font-semibold mb-1 leading-none">
                        {isDanger ? 'Atenção Crítica' : isWarning ? 'Aviso' : isInfo ? 'Informativo' : 'Sucesso'}
                    </h5>
                    <p className="opacity-90 leading-relaxed">
                      {alert.message}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
