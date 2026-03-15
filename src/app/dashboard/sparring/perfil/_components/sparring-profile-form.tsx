"use client";

import { useForm, type ControllerRenderProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { upsertSparringProfile } from "@/actions/sparring";
import { SparringIntensity } from "@prisma/client";
import { useState, useTransition } from "react";
import Link from "next/link";

const formSchema = z.object({
  weight: z.coerce.number()
    .min(30, "Peso mínimo: 30kg")
    .max(200, "Peso máximo: 200kg")
    .refine(val => /^\d+(\.\d{1,2})?$/.test(val.toString()), "Use até 2 casas decimais"),
    
  height: z.coerce.number()
    .min(1.0, "Altura mínima: 1.00m")
    .max(2.5, "Altura máxima: 2.50m")
    .refine(val => /^\d+(\.\d{1,2})?$/.test(val.toString()), "Use até 2 casas decimais (ex: 1.75)"),
    
  age: z.coerce.number()
    .int("A idade deve ser um número inteiro")
    .min(10, "Idade mínima: 10 anos")
    .max(100, "Idade máxima: 100 anos"),
    
  objective: z.string()
    .min(3, "Objetivo deve ter pelo menos 3 caracteres")
    .max(100, "Objetivo muito longo (máx 100 caracteres)"),
    
  intensity: z.nativeEnum(SparringIntensity),
  acceptedTerms: z.boolean().refine((val) => val === true, {
    message: "Você deve aceitar o termo de responsabilidade.",
  }),
});

type SparringFormValues = z.input<typeof formSchema>;

interface SparringProfileFormProps {
  initialData?: {
    weight: number;
    height: number;
    age: number;
    objective: string;
    intensity: SparringIntensity;
    acceptedTerms: boolean;
  } | null;
}

/* Estilos globais para remover setas de input number */
/* Chrome, Safari, Edge, Opera */
const noSpinners = `
  input[type=number]::-webkit-inner-spin-button, 
  input[type=number]::-webkit-outer-spin-button { 
    -webkit-appearance: none; 
    margin: 0; 
  }
  /* Firefox */
  input[type=number] {
    -moz-appearance: textfield;
  }
`;

export function SparringProfileForm({ initialData }: SparringProfileFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [weightValue, setWeightValue] = useState(initialData?.weight ? initialData.weight.toString() : "");
  const [heightValue, setHeightValue] = useState(initialData?.height ? initialData.height.toString() : "");

  const form = useForm<SparringFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      weight: initialData?.weight || undefined,
      height: initialData?.height || undefined,
      age: initialData?.age || undefined,
      objective: initialData?.objective || "",
      intensity: initialData?.intensity || "MODERATE",
      acceptedTerms: initialData?.acceptedTerms || false,
    },
  });

  type InputSetter = (val: string) => void;
  type HeightField = ControllerRenderProps<SparringFormValues, "height">;
  type WeightField = ControllerRenderProps<SparringFormValues, "weight">;

  const handleHeightInput = (value: string, setter: InputSetter, formField: HeightField) => {
    // Apenas números
    let nums = value.replace(/\D/g, "");
    
    // Limita a 3 dígitos numéricos (ex: 175)
    if (nums.length > 3) nums = nums.slice(0, 3);
    
    let formatted = nums;
    // Se tiver mais de 1 dígito, insere o ponto após o primeiro (ex: 17 -> 1.7)
    if (nums.length >= 2) {
      formatted = nums.slice(0, 1) + "." + nums.slice(1);
    }
    
    setter(formatted);
    formField.onChange(formatted);
  };

  const handleWeightInput = (
    value: string, 
    setter: InputSetter, 
    formField: WeightField
  ) => {
    // Mantém a lógica "financeira" para o peso que funciona bem (ex: 855 -> 85.5)
    let clean = value.replace(/\D/g, "");
    
    if (clean.length > 4) clean = clean.slice(0, 4); // Máx 4 dígitos (200.0)
    
    if (clean.length >= 2) { 
       const formatted = (parseInt(clean) / 10).toFixed(1);
       setter(formatted);
       formField.onChange(formatted);
       return;
    }
    
    setter(clean);
    formField.onChange(clean);
  };

  function onSubmit(values: z.input<typeof formSchema>) {
    startTransition(async () => {
      try {
        const parsedValues = formSchema.parse(values);
        await upsertSparringProfile(parsedValues);
        toast.success("Perfil de sparring atualizado com sucesso!");
        router.push("/dashboard/sparring");
        router.refresh();
      } catch (error) {
        toast.error("Erro ao atualizar perfil. Tente novamente.");
        console.error(error);
      }
    });
  }

  return (
    <Form {...form}>
      <style>{noSpinners}</style>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="weight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Peso (kg)</FormLabel>
                <FormControl>
                  <Input 
                    type="text" 
                    inputMode="decimal"
                    placeholder="Ex: 75.5" 
                    value={weightValue}
                    onFocus={() => { if (weightValue === "0") setWeightValue("") }}
                    onChange={(e) => handleWeightInput(e.target.value, setWeightValue, field)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="height"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Altura (m)</FormLabel>
                <FormControl>
                  <Input 
                    type="text" 
                    inputMode="decimal"
                    placeholder="Ex: 1.75" 
                    value={heightValue}
                    onFocus={() => { if (heightValue === "0") setHeightValue("") }}
                    onChange={(e) => handleHeightInput(e.target.value, setHeightValue, field)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="age"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Idade</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Ex: 25"
                    name={field.name}
                    ref={field.ref}
                    onBlur={field.onBlur}
                    value={
                      typeof field.value === "number" || typeof field.value === "string"
                        ? field.value
                        : ""
                    }
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.length <= 2) {
                          field.onChange(e);
                      }
                    }}
                    onInput={(e) => {
                        const target = e.target as HTMLInputElement;
                        if (target.value.length > 2) {
                            target.value = target.value.slice(0, 2);
                            field.onChange(target.value);
                        }
                    }}
                    className="no-spinner"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="intensity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Intensidade Preferida</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a intensidade" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="LIGHT">Leve (Técnico)</SelectItem>
                    <SelectItem value="MODERATE">Moderada (Padrão)</SelectItem>
                    <SelectItem value="HARD">Forte (Competição)</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Isso ajuda a encontrar parceiros compatíveis.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="objective"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Objetivo no Sparring</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input 
                    placeholder="Ex: Melhorar defesa, preparação para luta..." 
                    {...field} 
                    maxLength={100}
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">
                    {field.value?.length || 0}/100
                  </span>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="acceptedTerms"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Li e aceito o <Link href="/dashboard/sparring/termo" className="text-red-600 underline" target="_blank">Termo de Responsabilidade</Link>
                </FormLabel>
                <FormDescription>
                  Reconheço os riscos da prática de sparring e confirmo estar apto fisicamente.
                </FormDescription>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending} className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white font-bold">
          {isPending ? "Salvando..." : "Salvar Perfil"}
        </Button>
      </form>
    </Form>
  );
}
