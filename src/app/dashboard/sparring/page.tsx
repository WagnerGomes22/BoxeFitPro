import Link from "next/link";
import { getSparringProfile, getMySparringMatches } from "@/actions/sparring";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserSearch, History, FileText, ShieldAlert, Swords } from "lucide-react";

export default async function SparringDashboard() {
  const profile = await getSparringProfile();
  
  if (!profile) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sparring</h1>
          <p className="text-muted-foreground">Gerencie seus treinos de combate.</p>
        </div>
        
        <Card className="border-l-4 border-l-red-600">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-6 w-6 text-red-600" />
              Perfil de Sparring Necessário
            </CardTitle>
            <CardDescription>
              Para participar de sessões de sparring, você precisa configurar seu perfil de atleta e aceitar o termo de responsabilidade.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/sparring/perfil">
              <Button size="lg" className="w-full sm:w-auto bg-red-600 hover:bg-red-700">
                Criar Perfil de Sparring
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const matches = await getMySparringMatches();
  const nextMatch = matches.find(m => m.status === "SCHEDULED" && new Date(m.date) > new Date());

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sparring</h1>
          <p className="text-muted-foreground">Bem-vindo à arena, {profile.user.name?.split(" ")[0]}.</p>
        </div>
        <div className="flex items-center gap-2">
           <Badge variant={profile.isReady ? "default" : "destructive"} className={profile.isReady ? "bg-green-600 hover:bg-green-700" : ""}>
             {profile.isReady ? "APTO PARA SPARRING" : "AGUARDANDO APROVAÇÃO"}
           </Badge>
           <Link href="/dashboard/sparring/perfil">
             <Button variant="outline" size="sm">Editar Perfil</Button>
           </Link>
        </div>
      </div>

      {/* Grid de Ações Rápidas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/dashboard/sparring/perfil">
          <Card className="hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Meu Perfil</CardTitle>
              <UserSearch className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Editar</div>
              <p className="text-xs text-muted-foreground">Mantenha seus dados atualizados</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/sparring/agendados">
          <Card className="hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Meus Sparrings</CardTitle>
              <Swords className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{matches.filter(m => m.status === "SCHEDULED").length}</div>
              <p className="text-xs text-muted-foreground">Sessões agendadas</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/sparring/historico">
          <Card className="hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Histórico</CardTitle>
              <History className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{matches.filter(m => m.status === "COMPLETED").length}</div>
              <p className="text-xs text-muted-foreground">Combates realizados</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Próximo Combate</CardTitle>
            <CardDescription>Seu sparring agendado mais próximo.</CardDescription>
          </CardHeader>
          <CardContent>
            {nextMatch ? (
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium text-lg">vs. {nextMatch.studentAId === profile.userId ? nextMatch.studentB.name : nextMatch.studentA.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(nextMatch.date).toLocaleDateString('pt-BR')} às {new Date(nextMatch.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <Badge variant="outline">Agendado</Badge>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum sparring agendado. Fale com seu instrutor.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Acesso Rápido</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
             <Link href="/dashboard/sparring/termo" className="flex items-center justify-between p-3 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-md transition-colors border">
                <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Termo de Responsabilidade</span>
                </div>
             </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
