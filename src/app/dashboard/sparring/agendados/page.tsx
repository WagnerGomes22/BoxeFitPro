import { getMySparringMatches } from "@/actions/sparring";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { User, Calendar } from "lucide-react";
import { auth } from "@/auth";

export default async function ScheduledSparringsPage() {
  const session = await auth();
  const matches = await getMySparringMatches();
  const scheduled = matches.filter(m => m.status === "SCHEDULED");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Sparrings Agendados</h1>
        <p className="text-muted-foreground">Prepare-se para seus próximos combates.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {scheduled.length === 0 ? (
          <div className="col-span-full text-center py-12 border border-dashed rounded-lg">
            <Calendar className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <h3 className="text-lg font-medium">Nenhum sparring agendado</h3>
            <p className="text-muted-foreground">Utilize a aba &quot;Encontrar Parceiro&quot; para marcar um treino.</p>
          </div>
        ) : (
          scheduled.map((match) => {
            const opponent = match.studentAId === session?.user?.id ? match.studentB : match.studentA;
            return (
              <Card key={match.id} className="border-l-4 border-l-red-600 hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-6">
                    <Badge variant="secondary" className="font-mono text-sm">
                      {format(new Date(match.date), "dd/MM/yyyy", { locale: ptBR })}
                    </Badge>
                    <Badge variant="outline" className="border-red-200 text-red-700 bg-red-50">
                      AGENDADO
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="bg-neutral-100 dark:bg-neutral-800 p-3 rounded-full">
                       <User className="h-6 w-6 text-neutral-600 dark:text-neutral-400" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Adversário</p>
                      <h3 className="font-bold text-xl leading-none mt-1">{opponent.name}</h3>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  );
}
