# Setup manual do Supabase

O projeto Supabase já existe (URL e chave publicável em `.env.local`). Estes são os passos manuais que faltam para a autenticação funcionar de ponta a ponta.

## 1. Rodar as migrations no SQL Editor

Vá em **Project → SQL Editor → New query** e rode, **nesta ordem**, o conteúdo de:

1. `supabase/migrations/20260706000000_create_profiles.sql`
2. `supabase/migrations/20260707000000_create_goals_and_pj.sql`

Isso cria `profiles`, `goals`, `pj_cycles`, `pj_cycle_days` com RLS habilitado, os triggers de `updated_at` e o trigger que cria automaticamente uma `profile` quando um usuário se cadastra.

## 2. Configurar URL Configuration

**Authentication → URL Configuration**

- **Site URL**: `http://localhost:3000` (trocar para o domínio de produção no deploy)
- **Redirect URLs**: adicionar `http://localhost:3000/auth/callback` (e a versão de produção depois)

É para essa URL que `signUp`, `resetPasswordForEmail` e o callback (`app/auth/callback/route.ts`) redirecionam.

## 3. Confirmar que o provider de Email está habilitado

**Authentication → Providers → Email** deve estar ativo — é o único provider usado (login via `signInWithPassword`).

## 4. Decidir sobre confirmação de e-mail

**Authentication → Providers → Email → "Confirm email"**

- Ligado (padrão): após `signUp`, o usuário só loga depois de clicar no link recebido por e-mail. O fluxo `needsEmailConfirmation` em `services/auth.service.ts` já trata esse caso.
- Desligado: sessão é criada na hora do cadastro, sem confirmação — útil só para testes locais.

## 5. Customizar os templates de e-mail (opcional, recomendado)

**Authentication → Email Templates** — pelo menos "Confirm signup" e "Reset password", já que o app é em pt-BR e os templates padrão vêm em inglês.

## 6. Testar o fluxo

Depois de rodar as migrations, crie uma conta pela tela de signup em `/login` e confira no **Table Editor** que uma linha apareceu automaticamente em `public.profiles`.
