"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Calendar as CalendarIcon, CreditCard, Loader2, ArrowLeft, ArrowRight, Eye, EyeOff } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { z } from "zod";

import { Calendar } from "@/components/ui/calendar";
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
import { cn, validaCPF, formatCPF } from "@/lib/utils";
import { toast } from "sonner";


const dataMinima18Anos = () => {
  const hoje = new Date();
  hoje.setFullYear(hoje.getFullYear() - 18);
  return hoje;
};

const formSchema = z.object({
  nomeCompleto: z.string().min(2, {
    message: "O nome deve ter pelo menos 2 caracteres.",
  }),
  cpf: z.string().refine((val) => validaCPF(val), {
    message: "CPF inválido.",
  }),
  email: z.string().email({
    message: "Por favor, insira um endereço de e-mail válido.",
  }),
  senha: z.string().min(6, { message: "A senha deve ter no mínimo 6 caracteres." }),
  confirmarSenha: z.string(),
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
  
  rua: z.string().min(1, { message: "A rua é obrigatória." }),
  numero: z.string().min(1, { message: "O número é obrigatório." }),
  complemento: z.string().optional(),
  bairro: z.string().min(1, { message: "O bairro é obrigatório." }),
  cidade: z.string().min(1, { message: "A cidade é obrigatória." }),
  estado: z.string().min(2, { message: "O estado é obrigatório." }),
  cep: z
    .string()
    .refine((value) => /^\d{5}-?\d{3}$/.test(value), {
      message: "CEP inválido. O formato deve ser 00000-000 ou 00000000.",
    }),
  contatoEmergenciaNome: z.string().optional(),
  contatoEmergenciaTelefone: z.string().optional(),
}).refine((data) => data.senha === data.confirmarSenha, {
  message: "As senhas não conferem",
  path: ["confirmarSenha"],
});

type FormData = z.infer<typeof formSchema>;

interface PlanoSelecionado {
  id: string;
  nome: string;
  preco: number;
  periodo: string;
  priceId: string;
}

const FormularioInscricao = () => {
  const router = useRouter();
  // Estado para controlar o passo atual do Wizard (1: Inscrição, 2: Pagamento)
  const [step, setStep] = useState<1 | 2>(1);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [planoSelecionado, setPlanoSelecionado] = useState<PlanoSelecionado | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  

  useEffect(() => {
    const planoSalvo = localStorage.getItem('planoSelecionado');
    if (planoSalvo) {
      setPlanoSelecionado(JSON.parse(planoSalvo));
    } 
  }, [router]);


  // Inicializa o formulário
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nomeCompleto: "",
      cpf: "",
      email: "",
      senha: "",
      confirmarSenha: "",
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
    mode: "onChange",
  });

  // Função para buscar CEP
  const handleCepBlur = async (cep: string) => {
    const { setValue, setError } = form;
    const cepLimpo = cep.replace(/\D/g, "");

    if (cepLimpo.length !== 8) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();

      if (data.erro) {
        setError("cep", { type: "manual", message: "CEP não encontrado." });
        return;
      }

      setValue("rua", data.logradouro);
      setValue("bairro", data.bairro);
      setValue("cidade", data.localidade);
      setValue("estado", data.uf);
    } catch {
      setError("cep", { type: "manual", message: "Erro ao buscar o CEP." });
    }
  };

  // Função chamada ao clicar em "Próximo" no Passo 1
  const onNextStep = async () => {
    // Valida todos os campos antes de prosseguir
    const isValid = await form.trigger();
    if (isValid) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Função para processar o pagamento (Passo 2)
  const handlePayment = async (metodo: "cartao" | "pix") => {
    if (metodo === "pix") {
      toast.warning("Pagamento via PIX será implementado em breve!");
      return;
    }

    if (!planoSelecionado) {
      toast.error("Nenhum plano selecionado. Volte e selecione um plano.");
      return;
    }

    setLoadingPayment(true);
    const dados = form.getValues();

    try {
      // 1. Chama nossa API
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: dados.email,
          nome: dados.nomeCompleto,
          priceId: planoSelecionado.priceId,
          dadosCompletos: {
              ...dados,
              plano: planoSelecionado
          }
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro desconhecido na API");
      }

      if (data.url) {
        // 2. Redireciona para o Stripe
        window.location.href = data.url;
      } else {
        console.error("Erro: URL de redirecionamento não encontrada", data);
        toast.error("Erro ao iniciar pagamento. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
      const message = error instanceof Error ? error.message : "Erro ao processar pagamento.";
      toast.error(message);
    } finally {
      setLoadingPayment(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto my-8 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          <CardTitle className="text-2xl font-bold text-primary">
            {step === 1 ? "Inscrição - Passo 1/2" : "Pagamento - Passo 2/2"}
          </CardTitle>
          {/* Indicador visual de passos */}
          <div className="flex items-center space-x-2">
            <div className={cn("h-3 w-3 rounded-full transition-colors", step === 1 ? "bg-primary" : "bg-primary/30")} />
            <div className={cn("h-3 w-3 rounded-full transition-colors", step === 2 ? "bg-primary" : "bg-gray-200")} />
          </div>
        </div>
        <CardDescription>
          {step === 1 
            ? "Preencha seus dados pessoais para iniciar a matrícula." 
            : "Escolha a forma de pagamento para finalizar sua inscrição."}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form className="space-y-8">
            
            {/* --- PASSO 1: DADOS PESSOAIS --- */}
            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                
                {/* Seção de Informações Pessoais */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4 border-b pb-2">Informações Pessoais</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="nomeCompleto"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Completo *</FormLabel>
                          <FormControl>
                            <Input placeholder="Digite seu nome completo" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="cpf"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CPF *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="000.000.000-00" 
                              {...field} 
                              onChange={(e) => {
                                field.onChange(formatCPF(e.target.value));
                              }}
                              maxLength={14}
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
                            <Input type="email" placeholder="seu@email.com" {...field} />
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
                      name="senha"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Senha *</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                type={showPassword ? "text" : "password"} 
                                placeholder="Crie sua senha" 
                                {...field} 
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowPassword((prev) => !prev)}
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <Eye className="h-4 w-4 text-muted-foreground" />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="confirmarSenha"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirmar Senha *</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                type={showConfirmPassword ? "text" : "password"} 
                                placeholder="Confirme sua senha" 
                                className="pr-10"
                                {...field} 
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowConfirmPassword((prev) => !prev)}
                                tabIndex={-1}
                              >
                                {showConfirmPassword ? (
                                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <Eye className="h-4 w-4 text-muted-foreground" />
                                )}
                              </Button>
                            </div>
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
                          <FormLabel>Data de Nascimento *</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP", { locale: ptBR })
                                  ) : (
                                    <span>Selecione uma data</span>
                                  )}
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
                                fromYear={new Date().getFullYear() - 100}
                                toYear={new Date().getFullYear() - 18}
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Seção de Endereço */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4 border-b pb-2">Endereço</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="cep"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CEP *</FormLabel>
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
                        <FormItem>
                          <FormLabel>Rua *</FormLabel>
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
                        <FormItem>
                          <FormLabel>Número *</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: 123" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="bairro"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bairro *</FormLabel>
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
                        <FormItem>
                          <FormLabel>Cidade *</FormLabel>
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
                        <FormItem>
                          <FormLabel>Estado *</FormLabel>
                          <FormControl>
                            <Input placeholder="UF" {...field} maxLength={2} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Contato de Emergência */}
                <div className="mb-4">
                   <h3 className="text-lg font-semibold mb-4 border-b pb-2">Contato de Emergência</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="contatoEmergenciaNome"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome</FormLabel>
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
                            <FormLabel>Telefone</FormLabel>
                            <FormControl>
                              <Input placeholder="(99) 99999-9999" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                   </div>
                </div>
              </div>
            )}

            {/* --- PASSO 2: PAGAMENTO --- */}
            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4 border-b pb-2">Resumo da Inscrição</h3>
                  <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                    <p><strong>Nome:</strong> {form.getValues("nomeCompleto")}</p>
                    <p><strong>E-mail:</strong> {form.getValues("email")}</p>
                    <p><strong>Plano Selecionado:</strong> {planoSelecionado ? `${planoSelecionado.nome} - R$ ${planoSelecionado.preco.toFixed(2).replace('.', ',')}/${planoSelecionado.periodo}` : "Nenhum plano selecionado"}</p>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4">Escolha a Forma de Pagamento</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Opção Cartão de Crédito */}
                    <div 
                      className="border-2 border-primary/20 hover:border-primary rounded-xl p-6 cursor-pointer transition-all hover:bg-accent/5 flex flex-col items-center justify-center text-center gap-4 group"
                      onClick={() => handlePayment("cartao")}
                    >
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20">
                        <CreditCard className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg">Cartão de Crédito</h4>
                        <p className="text-sm text-muted-foreground">Pague com segurança via Stripe</p>
                      </div>
                      {loadingPayment && <Loader2 className="h-6 w-6 animate-spin text-primary" />}
                    </div>

                    {/* Opção PIX (Placeholder) */}
                    <div 
                      className="border-2 border-dashed border-muted-foreground/30 rounded-xl p-6 cursor-not-allowed opacity-60 flex flex-col items-center justify-center text-center gap-4 grayscale"
                      title="Em breve"
                    >
                      <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                        <span className="font-bold text-gray-500 text-xs">PIX</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-lg">PIX (Em breve)</h4>
                        <p className="text-sm text-muted-foreground">Pagamento instantâneo</p>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            )}
          </form>
        </Form>
      </CardContent>

      <CardFooter className="flex justify-between">
        {step === 1 ? (
          <>
            {/* Botão invisível para manter layout ou botão de voltar para home se desejar */}
            <div /> 
            <Button onClick={onNextStep} className="w-full sm:w-auto">
              Próximo Passo <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" onClick={() => setStep(1)} disabled={loadingPayment}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar e Editar
            </Button>
            {/* O botão de avançar no passo 2 é acionado pelas opções de pagamento */}
          </>
        )}
      </CardFooter>
    </Card>
  );
};

export default FormularioInscricao;
