import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function SparringTermPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/sparring/perfil">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Termo de Responsabilidade</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Regulamento e Isenção de Responsabilidade para Prática de Sparring</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[60vh] rounded-md border p-4 text-sm leading-relaxed">
            <p className="mb-4">
              <strong>1. CONSENTIMENTO LIVRE E ESCLARECIDO:</strong> Ao participar das atividades de sparring, o aluno declara estar ciente de que se trata de uma prática de combate com contato físico, envolvendo riscos inerentes à modalidade, tais como contusões, hematomas, fraturas e outras lesões.
            </p>
            <p className="mb-4">
              <strong>2. EQUIPAMENTO OBRIGATÓRIO:</strong> É estritamente proibida a prática de sparring sem o uso completo dos equipamentos de proteção:
              <ul className="list-disc pl-6 mt-2">
                <li>Protetor bucal;</li>
                <li>Capacete de proteção (headgear);</li>
                <li>Luvas de tamanho adequado (mínimo 14oz ou 16oz conforme peso);</li>
                <li>Bandagens;</li>
                <li>Coquilha (protetor genital) para homens.</li>
              </ul>
            </p>
            <p className="mb-4">
              <strong>3. CONDUTA E INTENSIDADE:</strong> O sparring deve ser realizado com controle técnico e respeito ao parceiro. A intensidade deve ser acordada previamente e respeitada. Qualquer conduta antidesportiva ou agressão excessiva resultará na suspensão imediata da atividade e possíveis sanções disciplinares.
            </p>
            <p className="mb-4">
              <strong>4. APTIDÃO FÍSICA:</strong> O aluno declara estar em plenas condições de saúde física e mental para a prática de atividades de alto impacto. É responsabilidade do aluno informar ao instrutor qualquer condição médica preexistente ou mal-estar antes do início do treino.
            </p>
            <p className="mb-4">
              <strong>5. SUPERVISÃO:</strong> A atividade de sparring só poderá ocorrer na presença e sob supervisão direta de um instrutor autorizado.
            </p>
            <p className="mb-4">
              <strong>6. ISENÇÃO DE RESPONSABILIDADE:</strong> O aluno isenta a academia, seus proprietários, instrutores e funcionários de qualquer responsabilidade civil ou criminal por lesões ou danos decorrentes da prática de sparring, exceto em casos de dolo comprovado.
            </p>
            <p className="mt-8 text-center font-bold text-muted-foreground">
              Ao marcar a opção &quot;Aceito o Termo&quot; no seu perfil, você confirma ter lido, compreendido e concordado com todos os itens acima.
            </p>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
