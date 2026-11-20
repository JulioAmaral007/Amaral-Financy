# Setup manual do Supabase

O projeto Supabase já existe (URL e chave publicável em `.env.local`):

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

Estes são os passos manuais para a autenticação e os dados funcionarem de ponta a ponta.

## 1. Rodar a migration no SQL Editor

Vá em **Project → SQL Editor → New query**, cole o conteúdo de
`supabase/migrations/20261120000000_create_rumo_data.sql` e rode. É idempotente (pode rodar de novo).

Cria `workspaces`, `workspace_salaries`, `fixed_bills`, `spendings`, `history_entries` e `month_settings`, todas com
RLS (cada pessoa só enxerga as próprias linhas), e a função `replace_all_data`, usada pelo "Importar backup".

> Se este projeto já tinha as tabelas da versão antiga (`profiles`, `pj_*`, `investment_*`, `goals`), elas não são
> usadas pelo app atual e podem ficar como estão (ou ser apagadas).

## 2. Configurar URL Configuration

**Authentication → URL Configuration**

- **Site URL**: `http://localhost:3000` (trocar para o domínio de produção no deploy)
- **Redirect URLs**: adicionar `http://localhost:3000/auth/callback` (e a versão de produção depois)

É para essa URL que `signUp`, `resetPasswordForEmail` e o callback (`app/auth/callback/route.ts`) redirecionam.

## 3. Confirmar que o provider de Email está habilitado

**Authentication → Providers → Email** deve estar ativo — é o único provider usado (login via `signInWithPassword`).

## 4. Decidir sobre confirmação de e-mail

**Authentication → Providers → Email → "Confirm email"**

- Ligado (padrão): após `signUp`, a pessoa só entra depois de clicar no link recebido por e-mail. A tela de cadastro
  já trata esse caso (`needsEmailConfirmation`).
- Desligado: a sessão é criada na hora do cadastro — útil só para testes locais.

## 5. Customizar os templates de e-mail (opcional, recomendado)

**Authentication → Email Templates** — pelo menos "Confirm signup" e "Reset password", já que o app é em pt-BR e os
templates padrão vêm em inglês.

## 6. Testar o fluxo

1. Crie uma conta em `/login` → **Criar conta** (e confirme o e-mail, se a confirmação estiver ligada).
2. Entre: o dashboard abre com o perfil "Casa", criado automaticamente na primeira leitura.
3. Lance uma conta ou um gasto e confira no **Table Editor** (`fixed_bills`, `spendings`) que a linha tem o seu
   `user_id`.

## Levar os dados que estavam só no navegador

A versão antiga guardava tudo no `localStorage`. Antes de trocar, no app antigo use **Baixar backup**; depois, logado
na conta nova, use **Importar** com esse arquivo (aceita backups v1 e v2).
