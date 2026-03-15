"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { createAdminSparringMatch } from "@/actions/admin-sparring";
import { toast } from "sonner";
import { SparringIntensity } from "@prisma/client";
import { ptBR } from "date-fns/locale";
import { Swords, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface SparringProfile {
  id: string;
  weight: number;
  isReady: boolean;
  user: {
    id: string;
    name: string | null;
  };
}

export function CreateMatchDialog({ profiles }: { profiles: SparringProfile[] }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [studentA, setStudentA] = useState("");
  const [studentB, setStudentB] = useState("");
  const [intensity, setIntensity] = useState<SparringIntensity>("MODERATE");

  // Apenas alunos aptos aparecem na lista
  const availableStudents = profiles.filter((p) => p.isReady);

  async function handleCreate() {
    if (!date || !studentA || !studentB) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }

    if (studentA === studentB) {
      toast.error("Selecione alunos diferentes.");
      return;
    }

    setLoading(true);
    try {
      await createAdminSparringMatch({
        date,
        studentAId: studentA,
        studentBId: studentB,
        intensity,
      });
      toast.success("Sparring agendado com sucesso!");
      setOpen(false);
      setStudentA("");
      setStudentB("");
    } catch (error) {
      toast.error("Erro ao agendar sparring.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
          <Swords className="h-4 w-4 mr-2" />
          Novo Sparring
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Agendar Sparring</DialogTitle>
          <DialogDescription>
            Selecione os atletas e a data do confronto.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Atleta A</Label>
              <Select onValueChange={setStudentA} value={studentA}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {availableStudents.map((p) => (
                    <SelectItem key={p.user.id} value={p.user.id}>
                      {p.user.name} ({p.weight}kg)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Atleta B</Label>
              <Select onValueChange={setStudentB} value={studentB}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {availableStudents
                    .filter((p) => p.user.id !== studentA) // Remove o atleta A da lista B
                    .map((p) => (
                    <SelectItem key={p.user.id} value={p.user.id}>
                      {p.user.name} ({p.weight}kg)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Intensidade</Label>
            <Select onValueChange={(val) => setIntensity(val as SparringIntensity)} value={intensity}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LIGHT">Leve (Técnico)</SelectItem>
                <SelectItem value="MODERATE">Moderada (Padrão)</SelectItem>
                <SelectItem value="HARD">Forte (Competição)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 flex flex-col">
            <Label className="mb-2">Data do Combate</Label>
            <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full pl-3 text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    {date ? (
                      format(date, "PPP", { locale: ptBR })
                    ) : (
                      <span>Selecione uma data</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(date) =>
                      date < new Date(new Date().setHours(0, 0, 0, 0))
                    }
                    initialFocus
                    captionLayout="dropdown"
                    fromYear={1900}
                    toYear={new Date().getFullYear() + 5}
                    className="rounded-lg border p-3"
                  />
                </PopoverContent>
            </Popover>

            {date && (
               <div className="flex gap-2 items-center mt-2 w-full">
                   <Label>Horário:</Label>
                   <Input 
                      type="time" 
                      className="flex-1"
                      onChange={(e) => {
                          const [hours, minutes] = e.target.value.split(':');
                          const newDate = new Date(date);
                          newDate.setHours(parseInt(hours), parseInt(minutes));
                          setDate(newDate);
                      }}
                   />
               </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleCreate} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
            {loading ? "Agendando..." : "Confirmar Agendamento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
