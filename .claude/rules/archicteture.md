# Architecture & Clean Code Rules — Next.js + Supabase

## Objetivo

Gerar código consistente, escalável, testável e de fácil manutenção.

A IA deve priorizar:

- simplicidade
- legibilidade
- separação de responsabilidades
- baixo acoplamento
- alta coesão
- reutilização
- tipagem forte
- arquitetura previsível

---

# 1️⃣ Arquitetura Base

## Estrutura padrão

    src/
      app/
      components/
      features/
      actions/
      services/
      repositories/
      lib/
      hooks/
      types/
      schemas/
      constants/
      utils/

---

## Responsabilidades

### app

Responsável apenas por:

- páginas
- layouts
- loading
- error
- routing

Não colocar:

- regras de negócio
- queries complexas
- validações extensas

---

### components

Responsável por:

- componentes reutilizáveis
- UI pura

Não colocar:

- acesso ao banco
- chamadas ao Supabase
- regras de negócio

---

### features

Agrupamento por domínio.

Exemplo:

    features/
      auth/
      profile/
      projects/
      invoices/

Cada feature deve conter seus próprios:

- componentes
- actions
- hooks
- schemas
- types

---

### services

Responsável por:

- regras de negócio
- orquestração

Exemplo:

    createProject()
    updateProfile()
    inviteMember()

---

### repositories

Responsável por:

- acesso ao banco
- Supabase
- queries

Nunca colocar regra de negócio.

---

# 2️⃣ Server Components por padrão

## Regra obrigatória

Sempre utilizar Server Components primeiro.

---

## Só utilizar

    'use client'

quando necessário para:

- estado local
- eventos
- hooks do navegador
- interatividade

---

## Nunca marcar páginas inteiras

como client sem necessidade.

---

# 3️⃣ Server Actions

## Regra obrigatória

Toda mutação deve ocorrer em Server Actions.

Exemplos:

- create
- update
- delete
- approve
- invite

---

## Nunca

Executar mutações diretamente em Client Components.

---

# 4️⃣ Componentes

## Regra obrigatória

Cada componente deve ter responsabilidade única.

---

## Evitar

Componentes gigantes.

---

## Preferir

    UserCard

ao invés de

    UserDashboardCardWithActionsAndStats

---

# 5️⃣ Tamanho de Arquivos

## Limites recomendados

Componentes:

    até 200 linhas

Actions:

    até 100 linhas

Services:

    até 150 linhas

---

## Quando ultrapassar

Extrair responsabilidades.

---

# 6️⃣ Funções

## Regra obrigatória

Funções devem fazer apenas uma coisa.

---

## Evitar

    createUserAndSendEmailAndLogAndNotify()

---

## Preferir

    createUser()

    sendEmail()

    createAuditLog()

---

# 7️⃣ Nomes

## Regra obrigatória

Nomes devem ser explícitos.

---

## Evitar

    data
    item
    obj
    value

---

## Preferir

    project
    invoice
    profile
    subscription

---

# 8️⃣ Tipagem

## Regra obrigatória

Nunca utilizar:

    any

---

## Preferir

- interfaces
- types
- inferência do Zod

---

# 9️⃣ Validação

## Regra obrigatória

Toda entrada deve possuir schema.

---

## Utilizar

    zod

como padrão.

---

## Estrutura

    schemas/
      project.schema.ts
      user.schema.ts

---

# 🔟 Supabase

## Regra obrigatória

Nunca espalhar queries pelo projeto.

---

## Sempre utilizar

Repository Layer.

---

## Exemplo

    repositories/project.repository.ts

---

## Nunca

Executar:

    supabase.from(...)

em componentes.

---

# 1️⃣1️⃣ Queries

## Regra obrigatória

Toda query deve ficar centralizada.

---

## Evitar

Queries duplicadas.

---

## Preferir

    getProjectById()

ao invés de repetir select em vários locais.

---

# 1️⃣2️⃣ Tratamento de Erros

## Regra obrigatória

Nunca ignorar erros.

---

## Sempre tratar

- SupabaseError
- validação
- autenticação
- autorização

---

## Nunca

    catch {}

---

# 1️⃣3️⃣ Constantes

## Regra obrigatória

Valores mágicos são proibidos.

---

## Evitar

    if(status === 7)

---

## Preferir

    if(status === PROJECT_STATUS.APPROVED)

---

# 1️⃣4️⃣ Hooks

## Regra obrigatória

Hooks devem conter apenas lógica de frontend.

---

## Nunca

Colocar:

- acesso ao banco
- Service Role
- regras críticas

---

# 1️⃣5️⃣ Estados

## Regra obrigatória

Utilizar o menor estado possível.

---

## Evitar

Duplicação de estado.

---

## Preferir

Derivar dados quando possível.

---

# 1️⃣6️⃣ Reutilização

## Regra obrigatória

Se código for repetido mais de duas vezes:

Extrair.

---

## Extrair para

- hook
- util
- component
- service

---

# 1️⃣7️⃣ Separação de Responsabilidades

## Component

Responsável por exibir.

---

## Action

Responsável por executar.

---

## Service

Responsável por decidir.

---

## Repository

Responsável por buscar/salvar.

---

# 1️⃣8️⃣ Imports

## Ordem obrigatória

1. React
2. Next
3. Bibliotecas externas
4. Components
5. Hooks
6. Services
7. Types
8. Utils

---

# 1️⃣9️⃣ Organização de Features

## Estrutura recomendada

    features/projects/
      actions/
      components/
      hooks/
      repositories/
      schemas/
      services/
      types/

---

## Toda feature deve ser isolada.

---

# 2️⃣0️⃣ Clean Code

## Sempre

- código simples
- funções pequenas
- componentes pequenos
- nomes claros
- responsabilidades únicas
- baixo acoplamento
- alta coesão

---

## Nunca

- arquivos gigantes
- lógica espalhada
- duplicação
- comentários desnecessários
- abstrações prematuras
- otimizações sem necessidade

---

# 2️⃣1️⃣ Comportamento da IA

Ao gerar código:

- Preferir Server Components.
- Preferir Server Actions.
- Utilizar Zod.
- Utilizar TypeScript estrito.
- Centralizar queries.
- Separar UI de negócio.
- Separar negócio de banco.
- Criar código escalável.
- Criar código legível.
- Criar código fácil de manter.

Sempre priorizar clareza sobre complexidade.
Sempre priorizar simplicidade sobre abstração.
Sempre priorizar consistência sobre criatividade.