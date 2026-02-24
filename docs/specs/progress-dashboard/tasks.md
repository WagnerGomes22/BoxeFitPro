# Lista de Tarefas: Implementação de Painel de Progresso

## 1. Configuração e Dependências
- [ ] Instalar `recharts` e `framer-motion`.
- [ ] Criar estrutura de pastas em `src/components/dashboard` e `src/components/progress`.

## 2. Server Actions (Backend)
- [ ] Atualizar `src/actions/dashboard/get-dashboard.ts`:
    - [ ] Adicionar cálculo de `streak` (sequência atual).
    - [ ] Adicionar cálculo de `attendanceRate` (taxa de presença mensal).
    - [ ] Adicionar lista de `upcomingClasses` (próximas 3 aulas).
- [ ] Criar `src/actions/dashboard/get-progress.ts`:
    - [ ] Implementar busca de `monthlyHistory` (últimos 12 meses: `{ month: string, classes: number }`).
    - [ ] Implementar cálculo de `longestStreak` (maior sequência histórica).
    - [ ] Implementar `overallStats` (média geral de presença, total histórico).

## 3. Componentes UI (Frontend)

### Minhas Aulas (Operacional)
- [ ] Criar `MetricCard.tsx` aprimorado (com badge de fogo e gauge circular).
- [ ] Criar `NextClassesList.tsx` (lista vertical cronológica com horários).
- [ ] Atualizar layout de `src/app/dashboard/page.tsx` para o estilo minimalista (cards horizontais).

### Meu Progresso (Evolução)
- [ ] Criar `HistoryChart.tsx` usando `Recharts` (BarChart/LineChart empilhado).
- [ ] Criar `RecordCard.tsx` com ícone de troféu e animação de confetes (removido a pedido).
- [ ] Criar `OverallStats.tsx` (progresso linear de média geral).
- [ ] Criar `src/app/dashboard/progresso/page.tsx` com layout dashboard escuro/gradiente.

## 4. Integração e Validação
- [ ] Integrar `getDashboardData` na página principal.
- [ ] Integrar `getProgressData` na página de progresso.
- [ ] Verificar responsividade em mobile (colapso vertical).
- [ ] Testar estados vazios (sem aulas, sem histórico).
- [ ] Validar acessibilidade (contraste, foco).
