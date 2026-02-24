import Planos from '@/components/Planos';
import { auth } from "@/auth";
import { getProfile } from "@/actions/user/get-profile";
import { redirect } from "next/navigation";

export default async function PlanosPage() {
  const session = await auth();
  let activePlanName = null;

  if (session?.user) {
    try {
      const profile = await getProfile();
      
      // Bloquear acesso de Admin/Instructor
      if (profile?.role === 'ADMIN' || profile?.role === 'INSTRUCTOR') {
        redirect('/dashboard');
      }

      activePlanName = profile?.subscriptions[0]?.planName || null;
    } catch (error) {
      console.error("Erro ao carregar perfil nos planos:", error);
    }
  }

  return <Planos user={session?.user} activePlanName={activePlanName} />;
}
