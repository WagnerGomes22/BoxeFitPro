import { getAllSparringProfiles, getAdminSparringMatches } from "@/actions/admin-sparring";
import { SparringProfilesTable } from "./_components/sparring-profiles-table";
import { CreateMatchDialog } from "./_components/create-match-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default async function AdminSparringPage() {
  const profiles = await getAllSparringProfiles();
  const matches = await getAdminSparringMatches();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Sparring</h1>
          <p className="text-muted-foreground">Aprove atletas e case lutas.</p>
        </div>
        <CreateMatchDialog profiles={profiles} />
      </div>

      <Tabs defaultValue="athletes" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="athletes">Atletas ({profiles.length})</TabsTrigger>
          <TabsTrigger value="matches">Agendamentos ({matches.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="athletes">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Atletas</CardTitle>
              <CardDescription>
                Gerencie quem está apto para participar de sparrings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SparringProfilesTable profiles={profiles} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="matches">
          <Card>
            <CardHeader>
              <CardTitle>Agenda de Combates</CardTitle>
              <CardDescription>
                Histórico e próximos sparrings agendados.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {matches.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Nenhum sparring agendado.</p>
                ) : (
                  matches.map((match) => (
                    <div key={match.id} className="flex items-center justify-between p-4 border rounded-lg bg-white dark:bg-neutral-900">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-center">
                          <span className="font-bold text-lg">{format(new Date(match.date), "dd", { locale: ptBR })}</span>
                          <span className="text-xs uppercase text-muted-foreground">{format(new Date(match.date), "MMM", { locale: ptBR })}</span>
                        </div>
                        <div className="h-8 w-px bg-border mx-2" />
                        <div>
                          <p className="font-semibold text-lg flex items-center gap-2">
                            {match.studentA.name} <span className="text-muted-foreground text-sm">vs</span> {match.studentB.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Instrutor: {match.instructor?.name || "N/A"}
                          </p>
                        </div>
                      </div>
                      <Badge variant={match.status === "COMPLETED" ? "secondary" : "default"}>
                        {match.status === "SCHEDULED" ? "AGENDADO" : match.status}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
