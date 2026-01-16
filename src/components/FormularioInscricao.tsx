"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { z } from "zod";

import { Calendar } from "@/components/ui/calendar"


import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const dataMinima18Anos = () => {
  const hoje = new Date();
  hoje.setFullYear(hoje.getFullYear() - 18);
  return hoje;
};

const formSchema = z.object({
  nomeCompleto: z.string().min(2, {
    message: "O nome deve ter pelo menos 2 caracteres.",
  }),

  email: z.string().email({
    message: "Por favor, insira um endereço de e-mail válido.",
  }),

  telefone: z.string().min(10, { message: "O telefone é obrigatório." }),

   dataNascimento: z
    .date({
      message: "A data de nascimento é obrigatória",
    })
    .refine((data) => {
      return data <= dataMinima18Anos();
    }, {
      message: "Você deve ter pelo menos 18 anos."
    }),
  
  rua: z.string().optional(),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
    cep: z
    .string()
    .optional()
    .refine((value) => !value || /^\d{5}-?\d{3}$/.test(value), {
      message: "CEP inválido. O formato deve ser 00000-000 ou 00000000.",
    }),
  contatoEmergenciaNome: z.string().optional(),
  contatoEmergenciaTelefone: z.string().optional(),
});

const FormularioInscricao = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nomeCompleto: "",
      email: "",
      telefone: "",
      rua: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      estado: "",
      cep: "",
      contatoEmergenciaNome: "",
      contatoEmergenciaTelefone: "",
    },
  });

  const handleCepBlur = async (cep: string) => {
    const { setValue, setError } = form;
    const cepLimpo = cep.replace(/\D/g, "");

    if (cepLimpo.length !== 8) {
      return;
    }

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();

      if (data.erro) {
        setError("cep", {
          type: "manual",
          message: "CEP não encontrado.",
        });
        return;
      }

      setValue("rua", data.logradouro);
      setValue("bairro", data.bairro);
      setValue("cidade", data.localidade);
      setValue("estado", data.uf);
    } catch (error) {
      setError("cep", {
        type: "manual",
        message: "Erro ao buscar o CEP. Tente novamente.",
      });
    }
  };

  const handleSubmit = async (dados: any) => {
  try {
    // 1. Chama nossa API
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: dados.email,
        nome: dados.nome,
        plano: "Mensal", // Exemplo
        priceId: "price_EXEMPLO_DO_STRIPE", // IMPORTANTE: Substitua pelo ID real do seu preço no Stripe
      }),
    });

    const data = await response.json();

    if (data.url) {
      // 2. Redireciona para o Stripe
      window.location.href = data.url;
    } else {
      console.error("Erro:", data.error);
      alert("Erro ao iniciar pagamento.");
    }
  } catch (error) {
    console.error("Erro na requisição:", error);
  }
};

  return (
    <Card className="w-full max-w-3xl mx-auto my-8">
      <CardHeader>
        <CardTitle>Formulário de Inscrição</CardTitle>
        <CardDescription>
          Preencha seus dados com atenção. Campos com * são obrigatórios.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
            {/* Seção de Informações Pessoais */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">
                Informações Pessoais
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="nomeCompleto"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Digite seu nome completo"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail *</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="seu@email.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="telefone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone *</FormLabel>
                      <FormControl>
                        <Input placeholder="(99) 99999-9999" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dataNascimento"
                  render={({ field }) => (
                    <FormItem className="flex-col">
                      <FormLabel htmlFor="dataNascimento">
                        Data de Nascimento
                      </FormLabel>

                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              id="dataNascimento"
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value
                                ? format(field.value, "PPP", { locale: ptBR })
                                : "Selecione uma data"}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>

                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            locale={ptBR}
                            fromYear={1970}
                            toYear={new Date().getFullYear()}
                          />
                        </PopoverContent>
                      </Popover>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator className="my-8" />

            {/* Seção de Endereço */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Endereço</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <FormField
                  control={form.control}
                  name="cep"
                  render={({ field }) => (
                    <FormItem className="">
                      <FormLabel>CEP</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="00000-000"
                          {...field}
                          onBlur={() => handleCepBlur(field.value ?? "")}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />  

                <FormField
                  control={form.control}
                  name="rua"
                  render={({ field }) => (
                    <FormItem className="">
                      <FormLabel>Rua</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome da sua rua" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="numero"
                  render={({ field }) => (
                    <FormItem className="">
                      <FormLabel>Número</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: 123" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="complemento"
                  render={({ field }) => (
                    <FormItem className="">
                      <FormLabel>Complemento</FormLabel>
                      <FormControl>
                        <Input placeholder="Apto, bloco, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bairro"
                  render={({ field }) => (
                    <FormItem className="">
                      <FormLabel>Bairro</FormLabel>
                      <FormControl>
                        <Input placeholder="Seu bairro" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cidade"
                  render={({ field }) => (
                    <FormItem className="">
                      <FormLabel>Cidade</FormLabel>
                      <FormControl>
                        <Input placeholder="Sua cidade" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="estado"
                  render={({ field }) => (
                    <FormItem className="">
                      <FormLabel>Estado</FormLabel>
                      <FormControl>
                        <Input placeholder="UF" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
               
              </div>
            </div>

            <Separator className="my-8" />

            {/* Seção de Contato de Emergência */}
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Contato de Emergência
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="contatoEmergenciaNome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Contato</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do contato" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contatoEmergenciaTelefone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone do Contato</FormLabel>
                      <FormControl>
                        <Input placeholder="(99) 99999-9999" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <CardFooter className="flex justify-between flex-col-reverse  sm:flex-row gap-4">
              <Button className="cursor-pointer" variant="outline">
                Voltar
              </Button>
              <Button className="cursor-pointer" type="submit">
                Próximo
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default FormularioInscricao;
