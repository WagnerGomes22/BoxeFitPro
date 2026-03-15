
import { getProfile } from "@/actions/user/get-profile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Phone, Calendar, MapPin, ShieldAlert } from "lucide-react";
import { format } from "date-fns";
import { PlanSection } from "@/components/profile/PlanSection";
import { ImageUpload } from "@/components/profile/ImageUpload";

export default async function ProfilePage() {
  const user = await getProfile();

  if (!user) {
    return <div>Usuário não encontrado.</div>;
  }

  const address = user.addresses[0];
  let subscription = user.subscriptions[0];
  const emergencyContact = user.emergencyContacts[0];

  // Tenta sincronizar automaticamente se o status for PENDING
  if (subscription?.status === "PENDING" && subscription?.stripeCheckoutSessionId) {
    try {
        const { syncSubscriptionStatus } = await import("@/actions/subscription/sync-subscription");
        await syncSubscriptionStatus();
        // Recarrega os dados após a sincronização
        const updatedUser = await getProfile();
        if (updatedUser && updatedUser.subscriptions.length > 0) {
            subscription = updatedUser.subscriptions[0];
        }
    } catch (e) {
        console.error("Auto-sync failed:", e);
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <div className="border-b border-border/40 pb-6">
        <h2 className="text-3xl font-black italic tracking-tighter text-foreground uppercase">
          Meu <span className="text-red-600">Perfil</span>
        </h2>
        <p className="text-muted-foreground font-medium mt-1">
          Gerencie suas informações e assinatura.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Coluna Esquerda: Cartão Principal */}
        <div className="md:col-span-1 space-y-6">
          <Card className="border-border/60 shadow-sm">
            <CardContent className="pt-6 flex flex-col items-center text-center">
              <ImageUpload currentImage={user.image} name={user.name} />
              
              <h3 className="text-xl font-bold mt-4">{user.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{user.email}</p>
              
              <Badge 
                variant={!subscription ? "destructive" : subscription.status === "PENDING" ? "secondary" : "default"} 
                className="mb-6"
              >
                {!subscription ? "Sem Assinatura Ativa" : subscription.status === "PENDING" ? "Processando Assinatura" : "Membro Ativo"}
              </Badge>

              <div className="w-full space-y-4 text-left">
                <Separator />
                <div className="flex items-center gap-3 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">CPF:</span>
                  <span className="ml-auto text-muted-foreground">{user.cpf || "-"}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Nascimento:</span>
                  <span className="ml-auto text-muted-foreground">
                    {user.birthDate ? format(new Date(user.birthDate), "dd/MM/yyyy") : "-"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Telefone:</span>
                  <span className="ml-auto text-muted-foreground">{user.phone || "-"}</span>
                </div>
                
                <Separator />
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground  font-medium">
                    <MapPin className="h-4 w-4" />
                    Endereço
                  </div>
                  {address ? (
                    <p className="text-right text-muted-foreground leading-relaxed">
                      {address.street}, {address.number}
                      <br />
                      {address.district}, {address.city}
                      <br />
                      CEP: {address.cep}
                    </p>
                  ) : (
                     <p className="text-right text-muted-foreground">Não cadastrado</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coluna Direita: Detalhes */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Assinatura e Pagamento (Componente Interativo) */}
          <PlanSection subscription={subscription} />


          {/* Contato de Emergência */}
           <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShieldAlert className="h-5 w-5 text-red-600" />
                Contato de Emergência
              </CardTitle>
            </CardHeader>
            <CardContent>
               {emergencyContact ? (
                 <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted-foreground uppercase">Nome</label>
                      <p className="text-sm font-medium">{emergencyContact.name}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted-foreground uppercase">Telefone</label>
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Phone className="h-4 w-4 text-neutral-400" />
                        {emergencyContact.phone}
                      </div>
                    </div>
                 </div>
               ) : (
                 <p className="text-sm text-muted-foreground">Nenhum contato de emergência cadastrado.</p>
               )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
