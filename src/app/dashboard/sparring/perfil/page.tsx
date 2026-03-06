import { getSparringProfile } from "@/actions/sparring";
import { SparringProfileForm } from "./_components/sparring-profile-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function SparringProfilePage() {
  const profile = await getSparringProfile();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Perfil de Sparring</h1>
        <p className="text-muted-foreground">Mantenha seus dados atualizados para encontrar os melhores parceiros.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados do Atleta</CardTitle>
          <CardDescription>
            Essas informações serão visíveis para instrutores e parceiros compatíveis.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SparringProfileForm 
            initialData={profile ? {
              weight: profile.weight,
              height: profile.height,
              age: profile.age,
              objective: profile.objective,
              intensity: profile.intensity,
              acceptedTerms: profile.acceptedTerms
            } : null} 
          />
        </CardContent>
      </Card>
    </div>
  );
}
