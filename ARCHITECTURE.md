# Boxe Pass - Arquitetura e Boas Práticas

Este documento descreve a arquitetura, as decisões de design e as práticas de segurança implementadas no projeto **Boxe Pass**.

## 🏗️ Arquitetura do Sistema

O projeto utiliza o **Next.js 15+ (App Router)** como framework principal, seguindo um modelo de arquitetura modular e focada em performance.

### 1. Camadas de Responsabilidade
- **App Router (`src/app`)**: Gerencia rotas, layouts e páginas. Utiliza *Server Components* por padrão para reduzir o bundle enviado ao cliente.
- **Server Actions (`src/actions`)**: Centraliza toda a lógica de negócio e mutações de dados. Substitui a necessidade de APIs REST internas, oferecendo tipagem end-to-end e segurança nativa.
- **API Routes (`src/app/api`)**: Reservada para integrações externas que exigem endpoints HTTP padrão, como **Webhooks do Stripe** e autenticação.
- **Componentes (`src/components`)**: 
  - **UI**: Componentes genéricos e reutilizáveis (Shadcn/UI).
  - **Domain**: Componentes especializados (Booking, Profile, Dashboard).
- **Lib (`src/lib`)**: Instâncias compartilhadas de clientes (Prisma, Stripe) para evitar múltiplas conexões desnecessárias.

### 2. Banco de Dados (Prisma)
- Utiliza **PostgreSQL** com o Prisma ORM.
- **Relacionamentos**: Estrutura robusta vinculando Usuários, Assinaturas, Aulas e Agendamentos.
- **Migrations**: Controle de versão do schema para garantir paridade entre ambientes de dev e prod.

---

## 🔒 Segurança

A segurança é tratada como prioridade em todas as camadas da aplicação.

### 1. Autenticação e Autorização
- **NextAuth.js (Auth.js v5)**: Implementação de autenticação via Credentials (Email/Senha).
- **Middleware**: Proteção de rotas `/dashboard/*` em nível de borda (Edge), garantindo que usuários não autenticados nunca acessem áreas sensíveis.
- **Server-Side Validation**: Todas as *Server Actions* verificam a sessão do usuário antes de executar qualquer operação no banco de dados.

### 2. Integração com Stripe
- **Assinaturas Nativa**: Uso de `stripe.subscriptions.update` para upgrade/downgrade, evitando criação de múltiplos perfis de cobrança.
- **Webhook Validation**: O endpoint de Webhook valida a assinatura do Stripe (`Stripe-Signature`) para impedir ataques de replay ou requisições falsas.
- **Proration**: Lógica de cálculo proporcional automática para garantir cobranças justas durante trocas de plano.

### 3. Proteção de Dados
- **Variáveis de Ambiente**: Segredos (API Keys, DB URLs) são estritamente mantidos no `.env` e nunca expostos no código frontend.
- **Password Hashing**: Uso de `bcryptjs` para criptografia de senhas antes do armazenamento.

---

## 🚀 Boas Práticas Implementadas

### 1. Experiência do Usuário (UX)
- **Auto-Sync**: Sincronização automática de status de pagamento ao carregar o perfil, eliminando a dependência exclusiva de webhooks em ambiente local.
- **Feedback Visual**: Estados de *loading* individuais em botões e *skeletons* para evitar saltos de layout.
- **Toasts**: Notificações em tempo real via `sonner` para sucessos e erros.

### 2. Manutenibilidade
- **TypeScript**: Tipagem rigorosa em todo o projeto para reduzir bugs em tempo de execução.
- **Módulos Compactos**: Divisão de funções longas em blocos menores e reutilizáveis.
- **Clean Code**: Nomes de variáveis semânticos e funções com responsabilidade única.

---

## 🛠️ Guia de Desenvolvimento

### Requisitos
- Node.js 18+
- PostgreSQL
- Stripe CLI (para testes de Webhook)

### Comandos Úteis
```bash
# Instalar dependências
npm install

# Sincronizar banco de dados
npx prisma migrate dev

# Popular banco com dados iniciais
npx prisma db seed

# Iniciar ambiente de desenvolvimento
npm run dev
```

---

## 📈 Sugestões de Melhorias Futuras
1. **Testes Automatizados**: Implementação de testes unitários com Vitest e E2E com Playwright.
2. **Logging**: Integração com ferramentas como Sentry ou Axiom para monitoramento de erros em produção.
3. **Cache**: Implementação de `revalidateTag` mais granular para otimizar ainda mais as consultas ao banco.

---
*Este documento é mantido pela equipe de arquitetura do projeto Boxe Pass.*
