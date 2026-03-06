import { getMySparringMatches } from "@/actions/sparring";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { User, History } from "lucide-react";
import { auth } from "@/auth";

export default async function SparringHistoryPage() {
  const session = await auth();
  const matches = await getMySparringMatches();
  const history = matches.filter(m => m.status !== "SCHEDULED");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Histórico de Sparrings</h1>
        <p className="text-muted-foreground">Registro de todos os seus combates realizados.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-1">
        {history.length === 0 ? (
          <div className="col-span-full text-center py-12 border border-dashed rounded-lg">
            <History className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <h3 className="text-lg font-medium">Nenhum histórico encontrado</h3>
            <p className="text-muted-foreground">Seus combates realizados aparecerão aqui.</p>
          </div>
        ) : (
          history.map((match) => {
            const opponent = match.studentAId === session?.user?.id ? match.studentB : match.studentA;
            const statusColor = match.status === "COMPLETED" ? "bg-green-100 text-green-800 border-green-200" : "bg-neutral-100 text-neutral-800 border-neutral-200";
            
            return (
              <Card key={match.id} className="hover:bg-neutral-50 transition-colors">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-neutral-100 dark:bg-neutral-800 p-3 rounded-full">
                       <User className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg">{opponent.name}</h3>
                        <Badge variant="outline" className={statusColor}>
                          {match.status === "COMPLETED" ? "REALIZADO" : "CANCELADO"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(match.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        {match.result && <span className="ml-2 font-medium text-foreground">• {match.result}</span>}
                      </p>
                    </div>
                  </div>
                  
                  {match.instructor && (
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Instrutor</p>
                      <p className="font-medium text-sm">{match.instructor.name}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  );
}
