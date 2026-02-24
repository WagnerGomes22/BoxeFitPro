"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClass } from "@/actions/admin/create-class";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface Instructor {
  id: string;
  name: string | null;
  email: string;
}

export function CreateClassForm({ instructors }: { instructors: Instructor[] }) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);

    const formData = new FormData(event.currentTarget);
    
    try {
      const result = await createClass(null, formData);

      if (result.success) {
        toast.success(result.message);
        router.push("/admin/aulas");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Erro inesperado ao criar aula.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg border border-zinc-200 shadow-sm">
      <div className="space-y-2">
        <Label htmlFor="name">Nome da Aula</Label>
        <Input 
          id="name" 
          name="name" 
          placeholder="Ex: Boxe Iniciante" 
          required 
          className="max-w-md"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="instructorId">Instrutor</Label>
        <Select name="instructorId" required>
          <SelectTrigger className="max-w-md">
            <SelectValue placeholder="Selecione um instrutor" />
          </SelectTrigger>
          <SelectContent>
            {instructors.map((instructor) => (
              <SelectItem key={instructor.id} value={instructor.id}>
                {instructor.name || instructor.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md">
        <div className="space-y-2">
          <Label htmlFor="date">Data</Label>
          <Input 
            id="date" 
            name="date" 
            type="date" 
            required 
          />
        </div>
        <div className="space-y-2">
            <Label htmlFor="capacity">Capacidade</Label>
            <Input 
                id="capacity" 
                name="capacity" 
                type="number" 
                min="1" 
                defaultValue="20"
                required 
            />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 max-w-md">
        <div className="space-y-2">
          <Label htmlFor="startTime">Início</Label>
          <Input 
            id="startTime" 
            name="startTime" 
            type="time" 
            required 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endTime">Fim</Label>
          <Input 
            id="endTime" 
            name="endTime" 
            type="time" 
            required 
          />
        </div>
      </div>

      <div className="space-y-2 max-w-md">
        <Label htmlFor="description">Descrição (Opcional)</Label>
        <Textarea 
            id="description" 
            name="description" 
            placeholder="Detalhes sobre a aula, equipamentos necessários, etc."
            className="min-h-[100px]"
        />
      </div>

      <div className="pt-4 flex items-center gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isPending}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]">
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            "Criar Aula"
          )}
        </Button>
      </div>
    </form>
  );
}
