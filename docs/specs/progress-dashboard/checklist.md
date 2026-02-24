# Checklist de Validação: Módulo de Progresso

## Requisitos Técnicos
- [ ] Todas as novas dependências (`recharts`, `framer-motion`) estão instaladas e importadas corretamente.
- [ ] As Server Actions (`getDashboardData`, `getProgressData`) utilizam `unstable_cache` ou são otimizadas.
- [ ] O código segue o padrão ESLint/Prettier do projeto.

## UI/UX - Minhas Aulas
- [ ] Cards horizontais renderizam corretamente com cores vibrantes (azul/verde).
- [ ] Badge de "Sequência Atual" exibe ícone de fogo/medalha.
- [ ] Gauge de "Taxa de Presença" é visualmente claro (circular).
- [ ] Lista de "Próximos Treinos" exibe horários corretos e ordenados.
- [ ] Botão "Marcar Próxima Aula" redireciona para `/dashboard/agendar`.

## UI/UX - Meu Progresso
- [ ] Gráfico de Histórico (6-12 meses) carrega dados reais e exibe tooltip ao hover.
- [ ] Card "Maior Sequência" destaca recorde com ícone de troféu.
- [ ] (Opcional) Animação visual (CSS/Framer) ao bater recorde, sem usar bibliotecas de confete.
- [ ] Layout escuro/gradiente é aplicado corretamente nesta página específica.
- [ ] Responsividade: Todos os cards e gráficos se adaptam a telas mobile (layout vertical).

## Dados e Lógica
- [ ] Sequência atual é calculada corretamente (dias consecutivos com `ATTENDED`).
- [ ] Taxa de presença considera `ATTENDED` / `CONFIRMED` vs Total.
- [ ] Histórico mensal agrupa corretamente por mês/ano.
- [ ] Média geral reflete todo o histórico do aluno.
