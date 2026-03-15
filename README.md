# Boxe Pass

Plataforma de gestão de treinos e assinaturas para academia de boxe, com área de aluno, instrutor e admin.

## Requisitos
- Node.js 18+
- PostgreSQL
- Conta Stripe (para pagamentos e portal)

## Configuração local
1. Instale dependências:

```bash
npm install
```

2. Configure variáveis de ambiente:
- Crie um arquivo `.env` usando o `.env.example` como base.

3. Execute as migrações:

```bash
npx prisma migrate dev
```

4. Rode o projeto:

```bash
npm run dev
```

## Scripts principais
- `npm run dev` inicia o ambiente local
- `npm run build` gera o build de produção
- `npm run start` inicia o servidor de produção
- `npm run lint` executa lint
- `npm run db:seed` popula o banco com dados iniciais (apenas dev)
- `npm run db:clean` limpa dados do banco (apenas dev)

## Seed (boa prática)
- Execute apenas em ambiente de desenvolvimento.
- Nunca rode seed em produção (ele cria usuários e dados de teste).
- Defina a variável `SEED_DEFAULT_PASSWORD` no `.env`.
- Fluxo recomendado:

```bash
npx prisma migrate dev
npm run db:seed
```

## Pagamentos em modo teste (Stripe)
- Use as chaves de teste do Stripe no `.env`.
- Cartão de teste padrão: `4242 4242 4242 4242` (data futura e CVC qualquer).
- Não use chaves reais enquanto estiver em ambiente local.

## Deploy na Vercel
1. Configure as variáveis de ambiente no projeto da Vercel usando o `.env.example`.
2. Configure o banco Postgres e rode as migrações com `npx prisma migrate deploy`.
3. Configure o webhook do Stripe apontando para:
   - `https://SEU_DOMINIO/api/webhooks/stripe`
4. Faça o deploy.

## Observações de ambiente
- `NEXT_PUBLIC_URL` deve apontar para o domínio público (ex.: https://seudominio.com).
- Em produção, configure também `AUTH_SECRET` e `AUTH_URL` para sessões do Auth.js.
