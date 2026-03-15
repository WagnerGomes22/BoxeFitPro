'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateClass } from "@/actions/admin/update-class";
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

interface Instructor {
  id: string;
  name: string | null;
  email: string;
}

interface ClassData {
  id: string;
  name: string;
  description: string | null;
  instructorId: string;
  startTime: Date;
  endTime: Date;
  capacity: number;
}

export function EditClassForm({ 
  instructors, 
  classData 
}: { 
  instructors: Instructor[], 
  classData: ClassData 
}) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);

    const formData = new FormData(event.currentTarget);
    
    try {
      const result = await updateClass(classData.id, null, formData);

      if (result.success) {
        toast.success(result.message);
        router.push("/admin/aulas");
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Erro inesperado ao atualizar aula.");
    } finally {
      setIsPending(false);
    }
  }

  // Helper para formatar valores iniciais
  const defaultDate = format(new Date(classData.startTime), 'yyyy-MM-dd');
  const defaultStartTime = format(new Date(classData.startTime), 'HH:mm');
  const defaultEndTime = format(new Date(classData.endTime), 'HH:mm');

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg border border-zinc-200 shadow-sm w-full">
      <div className="space-y-2">
        <Label htmlFor="name">Modalidade</Label>
        <Select name="name" defaultValue={classData.name} required>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione a modalidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Escola de Boxe">Escola de Boxe</SelectItem>
            <SelectItem value="Sparring">Sparring</SelectItem>
            <SelectItem value="Funcional">Funcional</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="instructorId">Instrutor</Label>
        <Select name="instructorId" defaultValue={classData.instructorId} required>
          <SelectTrigger className="w-full">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        <div className="space-y-2">
          <Label htmlFor="date">Data</Label>
          <Input 
            id="date" 
            name="date" 
            type="date" 
            defaultValue={defaultDate}
            required 
            className="w-full"
          />
        </div>
        <div className="space-y-2">
            <Label htmlFor="capacity">Capacidade</Label>
            <Input 
                id="capacity" 
                name="capacity" 
                type="number" 
                min="1" 
                defaultValue={classData.capacity}
                required 
                className="w-full"
            />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full">
        <div className="space-y-2">
          <Label htmlFor="startTime">Início</Label>
          <Input 
            id="startTime" 
            name="startTime" 
            type="time" 
            defaultValue={defaultStartTime}
            required 
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endTime">Fim</Label>
          <Input 
            id="endTime" 
            name="endTime" 
            type="time" 
            defaultValue={defaultEndTime}
            required 
            className="w-full"
          />
        </div>
      </div>

      <div className="space-y-2 w-full">
        <Label htmlFor="description">Descrição (Opcional)</Label>
        <Textarea 
            id="description" 
            name="description" 
            defaultValue={classData.description || ""}
            placeholder="Detalhes sobre a aula, equipamentos necessários, etc."
            className="min-h-[100px] w-full"
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
            "Salvar Alterações"
          )}
        </Button>
      </div>
    </form>
  );
}
