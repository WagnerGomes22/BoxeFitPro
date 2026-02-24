import { getDashboardData } from "@/actions/dashboard/get-dashboard";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { UpcomingClassesList, UpcomingClass } from "@/components/dashboard/UpcomingClassesList";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Trophy, Target, TrendingUp, Calendar } from "lucide-react";

export default async function DashboardPage() {
  const data = await getDashboardData();

  // Cast para garantir compatibilidade de tipos, já que o retorno da server action
  // pode não ter a tipagem exata do componente devido à serialização
  const upcomingClasses = data.upcomingClasses as unknown as UpcomingClass[];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/40 pb-6">
        <div>
          <h2 className="text-3xl font-black italic tracking-tighter text-foreground uppercase">
            Painel do <span className="text-red-600">Atleta</span>
          </h2>
          <p className="text-muted-foreground font-medium mt-1">
            Bem-vindo de volta, Campeão. Prepare-se para o próximo round.
          </p>
        </div>
        <Link href="/dashboard/agendar">
          <Button className="bg-red-600 hover:bg-red-700 text-white font-bold tracking-wide uppercase shadow-lg shadow-red-900/20" size="lg">
            <Plus className="mr-2 h-5 w-5" /> Agendar Treino
          </Button>
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Aulas no Mês"
          value={data.metrics.classesThisMonth}
          description="Foco total"
          icon={<Target className="h-5 w-5" />}
          className="bg-neutral-50/50 dark:bg-neutral-900/50 hover:border-red-600/30"
        />
        <MetricCard
          title="Próximos Treinos"
          value={data.metrics.upcomingClasses}
          description="Agendados"
          icon={<Calendar className="h-5 w-5" />}
          className="bg-neutral-50/50 dark:bg-neutral-900/50 hover:border-blue-600/30"
        />
        <MetricCard
          title="Presença"
          value={data.metrics.attendanceRate}
          description="Taxa de frequência"
          variant="attendance"
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <MetricCard
          title="Sequência"
          value={data.metrics.streak}
          description="Dias seguidos"
          variant="streak"
          icon={<Trophy className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Upcoming Classes Section - Takes 3 columns now */}
        <div className="lg:col-span-3">
          <UpcomingClassesList classes={upcomingClasses} />
        </div>
      </div>
    </div>
  );
}
