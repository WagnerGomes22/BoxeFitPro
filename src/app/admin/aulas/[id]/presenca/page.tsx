import { AttendanceList } from "./_components/attendance-list";
import { getClassBookings } from "@/actions/instructor/get-class-bookings";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Clock, MapPin, User, CheckCircle2, AlertTriangle, Users } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AttendancePageProps {
  params: Promise<{ id: string }>;
}

export default async function AttendancePage({ params }: AttendancePageProps) {
  const { id } = await params;
  const result = await getClassBookings(id);

  if (result.error || !result.classData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <h1 className="text-2xl font-bold text-red-600">Erro</h1>
        <p className="text-zinc-500">{result.error || "Erro desconhecido."}</p>
        <Button asChild variant="outline">
          <Link href="/admin/aulas">Voltar</Link>
        </Button>
      </div>
    );
  }

  const { classData, bookings, stats } = result;

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 md:p-8">
      {/* Header e Navegação */}
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon" className="hover:bg-zinc-100">
          <Link href="/admin/aulas">
            <ArrowLeft className="h-5 w-5 text-zinc-600" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Lista de Presença</h1>
          <p className="text-zinc-500 text-sm">Gerencie a chamada desta aula.</p>
        </div>
      </div>

      {/* Card de Informações da Aula */}
      <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row justify-between gap-8">
          
          {/* Info Principal */}
          <div className="space-y-4 flex-1">
            <div>
              <h2 className="text-2xl font-bold text-zinc-900 leading-tight">{classData.name}</h2>
              <div className="flex flex-wrap gap-4 mt-3 text-sm text-zinc-600">
                <div className="flex items-center gap-2 bg-zinc-50 px-3 py-1.5 rounded-full border border-zinc-100">
                    <User className="h-4 w-4 text-zinc-400" />
                    <span className="font-medium">{classData.instructorName}</span>
                </div>
                <div className="flex items-center gap-2 bg-zinc-50 px-3 py-1.5 rounded-full border border-zinc-100">
                    <Calendar className="h-4 w-4 text-zinc-400" />
                    <span className="capitalize font-medium">{format(new Date(classData.startTime), "EEEE, dd 'de' MMMM", { locale: ptBR })}</span>
                </div>
                <div className="flex items-center gap-2 bg-zinc-50 px-3 py-1.5 rounded-full border border-zinc-100">
                    <Clock className="h-4 w-4 text-zinc-400" />
                    <span className="font-medium">{format(new Date(classData.startTime), "HH:mm")} - {format(new Date(classData.endTime), "HH:mm")}</span>
                </div>
              </div>
            </div>

            {classData.isAttendanceLocked && (
               <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-amber-50 text-amber-700 text-sm font-medium border border-amber-200">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Chamada encerrada (aula finalizada há +24h)</span>
               </div>
            )}
          </div>

          {/* Cards de Estatísticas */}
          <div className="flex gap-4 self-start lg:self-center w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
            <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100 min-w-[120px] text-center flex flex-col items-center justify-center">
                <Users className="h-5 w-5 text-zinc-400 mb-1" />
                <span className="block text-3xl font-bold text-zinc-900">{stats.total}</span>
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Inscritos</span>
            </div>
            <div className="bg-green-50 p-4 rounded-xl border border-green-100 min-w-[120px] text-center flex flex-col items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-600 mb-1" />
                <span className="block text-3xl font-bold text-green-700">{stats.present}</span>
                <span className="text-[10px] text-green-600 font-bold uppercase tracking-wider">Presentes</span>
            </div>
            <div className="bg-red-50 p-4 rounded-xl border border-red-100 min-w-[120px] text-center flex flex-col items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600 mb-1" />
                <span className="block text-3xl font-bold text-red-700">{stats.noShow}</span>
                <span className="text-[10px] text-red-600 font-bold uppercase tracking-wider">Faltas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Alunos */}
      <AttendanceList 
        initialBookings={bookings} 
        isLocked={classData.isAttendanceLocked} 
      />
    </div>
  );
}
