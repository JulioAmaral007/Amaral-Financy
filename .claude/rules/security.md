# Security Rules — Next.js + Supabase

## Objetivo

Garantir que todo código gerado siga práticas seguras para aplicações Next.js e Supabase.

A IA deve priorizar:
- autenticação segura
- autorização correta
- proteção de dados
- prevenção de vazamento de informações
- validação de entrada
- uso correto do Supabase

---

# 1️⃣ Chaves e Variáveis de Ambiente

## Regras obrigatórias

- Nunca hardcodar:
  - API Keys
  - Tokens
  - JWT Secrets
  - URLs privadas
  - Senhas
  - Credenciais

- Sempre utilizar:

    process.env.VARIABLE_NAME

- Nunca expor:
  - SUPABASE_SERVICE_ROLE_KEY
  - DATABASE_URL
  - JWT_SECRET
  - API_SECRET

---

## Proibido

    const secret = "abc123";

    const supabase = createClient(
      "https://...",
      "service-role-key"
    );

---

# 2️⃣ Service Role

## Regras obrigatórias

- A chave Service Role deve existir apenas no servidor.
- Nunca utilizar Service Role:
  - Client Components
  - Hooks
  - Browser
  - Arquivos marcados com "use client"

- Service Role somente em:
  - Server Actions
  - Route Handlers
  - Cron Jobs
  - Webhooks

---

## Proibido

    'use client'

    const supabase = createClient(
      url,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

---

# 3️⃣ Row Level Security (RLS)

## Regra obrigatória

Toda tabela deve possuir RLS habilitado.

A IA nunca deve assumir permissões globais.

Sempre considerar:

- usuário autenticado
- owner do registro
- permissões explícitas

---

## Nunca gerar

    create policy "allow all"

    using (true)

---

## Preferir

    auth.uid() = user_id

---

# 4️⃣ Autorização

## Regra obrigatória

Autenticação não substitui autorização.

Sempre validar:

- quem é o usuário
- o que ele pode acessar
- o que ele pode alterar

---

## Exemplo obrigatório

Antes de atualizar:

    verificar se o registro pertence ao usuário

Antes de excluir:

    verificar se o usuário possui permissão

Antes de visualizar:

    verificar ownership

---

# 5️⃣ Server Actions

## Regras obrigatórias

Toda mutação deve validar:

- autenticação
- autorização
- dados recebidos

---

## Fluxo obrigatório

    validar sessão
    validar payload
    validar permissão
    executar ação

---

## Nunca

    inserir diretamente dados vindos do frontend

---

# 6️⃣ Route Handlers

## Regras obrigatórias

Toda rota deve validar:

- sessão
- origem
- autorização

Sempre retornar erros genéricos.

---

## Nunca retornar

- stack trace
- erro SQL
- erro interno
- query executada

---

# 7️⃣ Validação de Dados

## Regra obrigatória

Todo dado externo deve ser validado.

Fontes externas:

- form
- query params
- cookies
- headers
- URL params
- webhooks
- uploads

---

## Nunca confiar

    request.body
    searchParams
    formData

sem validação prévia.

---

## Preferir

- Zod
- Valibot
- validação explícita

---

# 8️⃣ SQL Injection

## Regras obrigatórias

Nunca concatenar SQL.

---

## Proibido

    SELECT * FROM users WHERE id = ${id}

---

## Obrigatório

Queries parametrizadas.

---

# 9️⃣ XSS

## Regras obrigatórias

Nunca renderizar HTML vindo do usuário.

---

## Proibido

    dangerouslySetInnerHTML

salvo quando explicitamente sanitizado.

---

## Sempre sanitizar

- comentários
- descrições
- rich text
- markdown

---

# 🔟 Uploads

## Regras obrigatórias

Validar:

- tamanho
- extensão
- mime type

---

## Nunca confiar

- nome do arquivo
- extensão enviada pelo navegador

---

## Sempre verificar

- tipo real do arquivo

---

# 1️⃣1️⃣ Logs

## Regras obrigatórias

Logs não devem conter:

- senhas
- tokens
- JWT
- cookies
- access_token
- refresh_token
- service role key

---

## Proibido

    console.log(session)

    console.log(token)

---

# 1️⃣2️⃣ Cookies

## Regras obrigatórias

Cookies sensíveis devem ser:

- HttpOnly
- Secure
- SameSite

---

## Nunca armazenar

- Service Role Key
- Senhas
- Tokens internos

---

# 1️⃣3️⃣ Sessão

## Regras obrigatórias

Sempre validar sessão no servidor.

Nunca confiar em:

    localStorage

para autorização.

---

# 1️⃣4️⃣ Middleware

## Regra obrigatória

Middleware serve apenas para:

- proteção inicial
- redirects
- checks simples

Nunca colocar lógica crítica apenas no middleware.

---

# 1️⃣5️⃣ Segurança do Supabase Storage

## Regras obrigatórias

Arquivos privados devem permanecer privados.

Sempre validar:

- proprietário
- organização
- permissões

---

## Nunca assumir

que conhecer a URL dá acesso ao arquivo.

---

# 1️⃣6️⃣ Multi-Tenant

## Regra obrigatória

Toda query deve considerar tenant.

---

## Sempre filtrar

    company_id

ou equivalente.

---

## Nunca gerar

consultas sem escopo de tenant.

---

# 1️⃣7️⃣ Erros

## Regras obrigatórias

Usuário final nunca deve receber:

- stack trace
- erro SQL
- erro do Supabase
- detalhes internos

---

## Preferir

    "Erro ao processar solicitação"

---

# 1️⃣8️⃣ Dados Sensíveis

## Regra obrigatória

Nunca retornar ao frontend:

- hashes
- tokens
- secrets
- chaves privadas
- dados internos

---

# 1️⃣9️⃣ Princípio de Menor Privilégio

## Regra obrigatória

Toda permissão deve ser a mínima necessária.

Nunca conceder acesso global por conveniência.

---

# 2️⃣0️⃣ Comportamento da IA

Ao gerar código:

- Assumir ambiente de produção.
- Assumir aplicação multiusuário.
- Assumir dados sensíveis.
- Assumir RLS habilitado.
- Assumir necessidade de validação.
- Assumir autenticação obrigatória.
- Assumir autorização obrigatória.

Nunca sacrificar segurança por simplicidade.

Se existir dúvida entre praticidade e segurança, priorizar segurança.