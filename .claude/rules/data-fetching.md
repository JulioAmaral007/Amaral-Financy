# Data Fetching Rules — Next.js + Supabase

## Objetivo

Garantir uma estratégia consistente, performática, segura e escalável para obtenção e atualização de dados.

A IA deve sempre priorizar:

- Server Components
- Server Actions
- cache inteligente
- redução de consultas
- segurança
- previsibilidade

---

# 1️⃣ Server Components Primeiro

## Regra obrigatória

Toda leitura de dados deve começar avaliando Server Components.

---

## Priorizar

- páginas
- layouts
- dashboards
- listagens
- detalhes

---

## Evitar

buscar dados no cliente sem necessidade real.

---

# 2️⃣ Fluxo Padrão

## Leitura

    Server Component
      ↓
    Service
      ↓
    Repository
      ↓
    Supabase

---

## Escrita

    Client Component
      ↓
    Server Action
      ↓
    Service
      ↓
    Repository
      ↓
    Supabase

---

# 3️⃣ Repository Layer

## Regra obrigatória

Toda consulta deve passar por repositories.

---

## Nunca executar

    supabase.from()

diretamente em:

- páginas
- layouts
- componentes
- hooks

---

## Estrutura

    repositories/
      user.repository.ts
      project.repository.ts
      invoice.repository.ts

---

# 4️⃣ Service Layer

## Regra obrigatória

Regras de negócio devem ficar em services.

---

## Repository

Responsável apenas por dados.

---

## Service

Responsável por:

- validações
- autorização
- regras de negócio
- orquestração

---

# 5️⃣ Server Actions

## Regra obrigatória

Toda mutação deve utilizar Server Actions.

---

## Exemplos

- create
- update
- delete
- approve
- archive

---

## Nunca executar mutações
diretamente em componentes.

---

# 6️⃣ Client Fetching

## Regra obrigatória

Utilizar fetch no cliente apenas quando necessário.

---

## Casos válidos

- polling
- realtime
- filtros dinâmicos
- autocomplete
- busca instantânea

---

## Fora desses casos

preferir servidor.

---

# 7️⃣ Cache

## Regra obrigatória

Toda leitura deve avaliar cache.

---

## Utilizar quando apropriado

- cache do Next.js
- revalidate
- tags

---

## Evitar

consultas repetidas sem necessidade.

---

# 8️⃣ Revalidação

## Regra obrigatória

Após mutações avaliar:

    revalidatePath()

ou

    revalidateTag()

---

## Nunca forçar refresh completo
sem necessidade.

---

# 9️⃣ Seleção de Dados

## Regra obrigatória

Buscar apenas os campos necessários.

---

## Evitar

    select *

---

## Preferir

seleções explícitas.

---

# 🔟 Paginação

## Regra obrigatória

Listagens devem possuir paginação.

---

## Utilizar

- range
- limit
- cursor

quando necessário.

---

## Nunca retornar grandes volumes
sem controle.

---

# 1️⃣1️⃣ N+1 Queries

## Regra obrigatória

Evitar múltiplas consultas dependentes.

---

## Sempre avaliar

joins
ou
consultas consolidadas.

---

# 1️⃣2️⃣ Supabase Types

## Regra obrigatória

Toda consulta deve utilizar tipos gerados pelo Supabase.

---

## Utilizar

    Database

como fonte principal de tipagem.

---

# 1️⃣3️⃣ Erros

## Regra obrigatória

Toda consulta deve tratar erros.

---

## Nunca ignorar

    error

retornado pelo Supabase.

---

## Sempre retornar

respostas previsíveis.

---

# 1️⃣4️⃣ Loading States

## Regra obrigatória

Toda operação assíncrona deve possuir estado de carregamento.

---

## Considerar

- loading.tsx
- Suspense
- skeletons

---

# 1️⃣5️⃣ Empty States

## Regra obrigatória

Toda consulta deve tratar ausência de dados.

---

## Nunca assumir

que registros existirão.

---

# 1️⃣6️⃣ Autorização

## Regra obrigatória

Toda consulta deve assumir:

- ambiente multiusuário
- RLS habilitado
- autorização necessária

---

## Nunca confiar apenas no frontend.

---

# 1️⃣7️⃣ Multi-Tenant

## Regra obrigatória

Toda consulta deve considerar:

- organization_id
- company_id
- workspace_id

ou equivalente.

---

## Nunca gerar consultas globais.

---

# 1️⃣8️⃣ Realtime

## Regra obrigatória

Utilizar Realtime apenas quando houver necessidade real.

---

## Exemplos

- chat
- notificações
- colaboração
- dashboards em tempo real

---

## Evitar realtime por padrão.

---

# 1️⃣9️⃣ Search

## Regra obrigatória

Buscas devem possuir:

- debounce
- paginação

quando necessário.

---

## Evitar requisições por tecla
sem controle.

---

# 2️⃣0️⃣ Hooks

## Regra obrigatória

Hooks não devem conter lógica complexa de banco.

---

## Preferir

hooks focados em estado da interface.

---

## Evitar

consultas espalhadas em múltiplos hooks.

---

# 2️⃣1️⃣ Transformação de Dados

## Regra obrigatória

Transformações pesadas devem ocorrer no servidor.

---

## Evitar

processamento grande no navegador.

---

# 2️⃣2️⃣ Queries Compartilhadas

## Regra obrigatória

Centralizar consultas reutilizadas.

---

## Evitar

duplicação de queries.

---

## Criar

repositories reutilizáveis.

---

# 2️⃣3️⃣ Paralelismo

## Regra obrigatória

Consultas independentes devem ser executadas em paralelo.

---

## Preferir

    Promise.all()

quando apropriado.

---

## Evitar

sequência desnecessária.

---

# 2️⃣4️⃣ Fetching em Client Components

## Regra obrigatória

Se dados puderem ser carregados no servidor:

não utilizar fetch no cliente.

---

## Server-first sempre.

---

# 2️⃣5️⃣ Consistência

## Regra obrigatória

Todas as features devem seguir o mesmo fluxo.

---

## Leitura

    Component
      ↓
    Service
      ↓
    Repository
      ↓
    Supabase

---

## Escrita

    Action
      ↓
    Service
      ↓
    Repository
      ↓
    Supabase

---

# 2️⃣6️⃣ Comportamento da IA

Ao gerar código:

- Priorizar Server Components.
- Priorizar Server Actions.
- Utilizar repositories.
- Utilizar services.
- Centralizar consultas.
- Evitar N+1.
- Utilizar paginação.
- Utilizar cache quando apropriado.
- Utilizar revalidação quando apropriado.
- Buscar apenas os campos necessários.
- Tratar loading, erro e vazio.
- Assumir RLS habilitado.
- Assumir ambiente multi-tenant.

Sempre priorizar simplicidade, previsibilidade e escalabilidade.

Nunca buscar dados no cliente quando o servidor resolver melhor.