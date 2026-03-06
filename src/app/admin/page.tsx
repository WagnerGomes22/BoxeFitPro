import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, DollarSign, Activity } from "lucide-react";
import { getAdminDashboardData } from "@/actions/admin/get-dashboard-data";
import { RevenueChart, BookingsChart, ModalitiesChart } from "./_components/admin-charts";
import { OperationalList } from "./_components/operational-list";

export default async function AdminPage() {
  const data = await getAdminDashboardData();

  if (!data) {
    return <div className="p-8 text-red-500">Erro ao carregar dashboard.</div>;
  }

  const { metrics, charts, operational } = data;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Dashboard Administrativo</h1>
        <p className="text-zinc-500 mt-1">Visão geral estratégica e operacional.</p>
      </div>

      {/* SEÇÃO 1: MÉTRICAS PRINCIPAIS */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aulas Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.classesToday}</div>
            <p className="text-xs text-muted-foreground">Agendadas para hoje</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alunos Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeStudents}</div>
            <p className="text-xs text-muted-foreground">Com plano vigente</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metrics.monthlyRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">Recorrência estimada (MRR)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ocupação Média</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.occupancyRate}%</div>
            <p className="text-xs text-muted-foreground">Últimos 7 dias</p>
          </CardContent>
        </Card>
      </div>

      {/* SEÇÃO 2: GRÁFICOS ESTRATÉGICOS */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <RevenueChart data={charts.revenueHistory} />
        <BookingsChart data={charts.bookingsByDay} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
         <ModalitiesChart data={charts.modalities} />
      </div>

      {/* SEÇÃO 3: OPERACIONAL DO DIA */}
      <OperationalList 
        nextClasses={operational.nextClasses}
        alerts={operational.alerts}
      />
    </div>
  );
}
