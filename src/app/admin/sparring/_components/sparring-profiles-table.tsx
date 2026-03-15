"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { updateSparringStatus } from "@/actions/admin-sparring";
import { toast } from "sonner";
import { Search } from "lucide-react";
import { SparringIntensity } from "@prisma/client";

interface SparringProfile {
  id: string;
  weight: number;
  height: number;
  age: number;
  objective: string;
  intensity: SparringIntensity;
  isReady: boolean;
  user: {
    name: string | null;
    image: string | null;
    email: string | null;
  };
}

export function SparringProfilesTable({ profiles }: { profiles: SparringProfile[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filteredProfiles = profiles.filter((profile) =>
    profile.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  async function handleStatusToggle(id: string, currentStatus: boolean) {
    setLoadingId(id);
    try {
      await updateSparringStatus(id, !currentStatus);
      toast.success(`Status de ${!currentStatus ? "aprovado" : "removido"} com sucesso!`);
    } catch (error) {
      toast.error("Erro ao atualizar status.");
      console.error(error);
    } finally {
      setLoadingId(null);
    }
  }

  const intensityLabel = {
    LIGHT: "Leve",
    MODERATE: "Moderado",
    HARD: "Forte",
  };

  const intensityColor = {
    LIGHT: "bg-blue-100 text-blue-800",
    MODERATE: "bg-yellow-100 text-yellow-800",
    HARD: "bg-red-100 text-red-800",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar atleta..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border bg-white dark:bg-neutral-950">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Atleta</TableHead>
              <TableHead>Dados Físicos</TableHead>
              <TableHead>Intensidade</TableHead>
              <TableHead>Objetivo</TableHead>
              <TableHead>Status (Apto)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProfiles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Nenhum atleta encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filteredProfiles.map((profile) => (
                <TableRow key={profile.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={profile.user.image || ""} />
                        <AvatarFallback>{profile.user.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{profile.user.name}</p>
                        <p className="text-xs text-muted-foreground">{profile.user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <span className="font-semibold">{profile.weight}kg</span> • {profile.height}m • {profile.age} anos
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={intensityColor[profile.intensity]}>
                      {intensityLabel[profile.intensity]}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate" title={profile.objective}>
                    {profile.objective}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={profile.isReady}
                        onCheckedChange={() => handleStatusToggle(profile.id, profile.isReady)}
                        disabled={loadingId === profile.id}
                      />
                      <span className="text-sm text-muted-foreground">
                        {profile.isReady ? "Sim" : "Não"}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
