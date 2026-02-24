# Especificação do Painel de Progresso

## Visão Geral
Este documento descreve a implementação de um novo módulo de acompanhamento de progresso do aluno no Boxe Pass, dividido em duas perspectivas principais:
1.  **Minhas Aulas** (Foco Operacional - Curto Prazo): Visão imediata das atividades, frequência mensal e próximos treinos.
2.  **Meu Progresso** (Foco Evolução - Longo Prazo): Visão histórica, recordes e tendências de longo prazo.

## Requisitos de UI/UX

### 1. Minhas Aulas (Operacional)
*   **Localização**: `/dashboard` (Página Principal)
*   **Estilo**: Minimalista, fundo claro, cores vibrantes (Azul/Verde).
*   **Componentes**:
    *   **Cards de Métricas**: "Aulas no Mês" (Contador), "Sequência Atual" (Badge Fogo), "Taxa de Presença" (Gauge Circular).
    *   **Próximos Treinos**: Lista vertical cronológica com horários e tipos de aula.
    *   **Botão de Ação**: "Marcar Próxima Aula" em destaque.
*   **Hierarquia**: 40% superior para métricas críticas, 60% inferior para lista operacional.

### 2. Meu Progresso (Evolução)
*   **Localização**: `/dashboard/progresso`
*   **Estilo**: Dashboard sofisticado, fundo escuro/gradiente sutil, tipografia serifada para dados históricos.
*   **Componentes**:
    *   **Gráfico Histórico**: Linha/Barra empilhada (Aulas por Mês - 6 a 12 meses).
    *   **Recorde Pessoal**: Card destacado "Maior Sequência" com ícone de troféu e data.
    *   **Métricas Gerais**: "Média Geral de Presença" (Progresso Linear) e "Total Histórico" (Contador com % de crescimento).
*   **Interatividade**: Tooltips nos gráficos, animação de confetes ao bater recorde.

## Arquitetura Técnica

### 1. Estrutura de Pastas Sugerida
```
src/
  app/
    dashboard/
      page.tsx (Minhas Aulas - Atualizado)
      progresso/
        page.tsx (Meu Progresso - Novo)
  components/
    dashboard/
      ActivityGauge.tsx (Novo - Recharts/SVG)
      NextClassesList.tsx (Refatorado de Dashboard)
      StatsCards.tsx (Atualizado)
    progress/
      HistoryChart.tsx (Novo - Recharts)
      RecordCard.tsx (Novo)
      OverallStats.tsx (Novo)
  actions/
    dashboard/
      get-dashboard-metrics.ts (Estender atual)
      get-progress-history.ts (Novo)
```

### 2. Gerenciamento de Dados (Server Actions)
*   **`getDashboardMetrics`**: Retorna dados do mês atual, sequência atual, taxa de presença mensal e próximas 3 aulas agendadas.
*   **`getProgressHistory`**: Retorna array de objetos `{ month: string, classes: number, attendance: number }` dos últimos 12 meses, além de `longestStreak` e `totalClasses`.
*   **Cache**: Utilizar `unstable_cache` do Next.js para cachear resultados pesados de agregação por usuário.

### 3. Bibliotecas
*   **Gráficos**: `recharts` (Leve, composable, React-native).
*   **Animações**: `framer-motion` (Transições) e `canvas-confetti` (Celebração).
*   **Ícones**: `lucide-react` (Já instalado).
*   **Datas**: `date-fns` (Já instalado).

## Modelo de Dados (Prisma)
Não há alterações necessárias no Schema. As métricas serão calculadas via queries de agregação no `Booking`:
*   **Sequência**: Query recursiva ou loop reverso verificando dias consecutivos com `status: 'ATTENDED'`.
*   **Histórico**: `groupBy` por mês na data `startTime`.

## Considerações de Acessibilidade
*   Cores com contraste adequado (WCAG AA).
*   Gráficos com descrições textuais alternativas ou tabelas de dados acessíveis via screen reader.
*   Foco navegável por teclado.
