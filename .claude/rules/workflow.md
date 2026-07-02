# Claude Code Workflow Rules — Next.js + Supabase

## Objetivo

Definir o fluxo obrigatório que a IA deve seguir antes de criar, alterar ou refatorar qualquer funcionalidade.

O objetivo é garantir:

- consistência arquitetural
- previsibilidade
- qualidade de código
- segurança
- escalabilidade
- manutenção de longo prazo

---

# 1️⃣ Entender Antes de Codar

## Regra obrigatória

Antes de escrever código a IA deve analisar:

- contexto da feature
- arquitetura existente
- padrões já utilizados
- estrutura de pastas
- dependências envolvidas

---

## Nunca

Criar código assumindo estruturas inexistentes.

---

## Sempre

Reutilizar padrões existentes do projeto.

---

# 2️⃣ Alterar Antes de Criar

## Regra obrigatória

Antes de criar novos arquivos verificar:

- se já existe componente semelhante
- se já existe service semelhante
- se já existe repository semelhante
- se já existe hook semelhante

---

## Prioridade

1. Reutilizar
2. Estender
3. Criar novo

---

## Evitar

duplicação de código.

---

# 3️⃣ Planejamento Obrigatório

## Antes de implementar

Identificar:

### Dados

- origem
- destino
- validações
- permissões

### UI

- componentes envolvidos
- estados necessários
- feedback visual

### Backend

- repositories
- services
- actions

---

# 4️⃣ Fluxo Obrigatório de Desenvolvimento

## Leitura

    Page
      ↓
    Server Component
      ↓
    Service
      ↓
    Repository
      ↓
    Supabase

---

## Escrita

    Form
      ↓
    Server Action
      ↓
    Service
      ↓
    Repository
      ↓
    Supabase

---

## Nunca quebrar este fluxo.

---

# 5️⃣ Ordem de Implementação

## Sempre implementar nesta ordem

### 1

Tipos

    types/

---

### 2

Schemas

    schemas/

---

### 3

Repository

    repositories/

---

### 4

Service

    services/

---

### 5

Server Action

    actions/

---

### 6

UI

    components/

---

### 7

Página

    app/

---

# 6️⃣ Tipagem Primeiro

## Regra obrigatória

Antes de criar qualquer lógica:

definir tipos.

---

## Criar

- interfaces
- types
- schemas

antes da implementação.

---

# 7️⃣ Schema Primeiro

## Regra obrigatória

Toda entrada deve possuir schema.

---

## Utilizar

Zod como padrão.

---

## Nunca

validar diretamente no componente.

---

# 8️⃣ Segurança Primeiro

## Antes de qualquer mutação

Validar:

- autenticação
- autorização
- tenant
- ownership

---

## Nunca

assumir permissões.

---

# 9️⃣ Repository Primeiro

## Regra obrigatória

Toda interação com banco deve passar por repository.

---

## Nunca

executar consultas diretamente em:

- componentes
- páginas
- hooks

---

# 🔟 Service Primeiro

## Regra obrigatória

Toda regra de negócio deve ficar em service.

---

## Nunca

misturar negócio com acesso a dados.

---

# 1️⃣1️⃣ Componentes

## Regra obrigatória

Componentes devem receber dados prontos.

---

## Evitar

consultas dentro da UI.

---

# 1️⃣2️⃣ Server Components

## Regra obrigatória

Sempre avaliar Server Components primeiro.

---

## Utilizar Client Components
apenas quando necessário.

---

# 1️⃣3️⃣ Server Actions

## Regra obrigatória

Toda mutação deve utilizar Server Actions.

---

## Exemplos

- create
- update
- delete
- archive
- approve

---

# 1️⃣4️⃣ Performance

## Antes de finalizar

Verificar:

- N+1 queries
- consultas duplicadas
- carregamento excessivo
- paginação

---

## Sempre buscar apenas os campos necessários.

---

# 1️⃣5️⃣ Reutilização

## Regra obrigatória

Se código semelhante existir:

reutilizar.

---

## Evitar

duplicação.

---

# 1️⃣6️⃣ Estrutura por Feature

## Regra obrigatória

Novas funcionalidades devem seguir:

    features/
      projects/
      users/
      invoices/

---

## Não espalhar arquivos.

---

# 1️⃣7️⃣ Estado

## Regra obrigatória

Utilizar o menor estado possível.

---

## Evitar

duplicação de estado.

---

# 1️⃣8️⃣ Tratamento de Erros

## Regra obrigatória

Toda operação deve tratar:

- erro
- loading
- vazio

---

## Nunca ignorar falhas.

---

# 1️⃣9️⃣ Feedback Visual

## Regra obrigatória

Toda ação do usuário deve gerar feedback.

---

## Exemplos

- loading
- sucesso
- erro

---

# 2️⃣0️⃣ Banco de Dados

## Antes de criar tabelas

Verificar:

- relacionamentos
- índices
- RLS
- tenant
- auditoria

---

## Nunca criar estrutura mínima apenas para funcionar.

---

# 2️⃣1️⃣ Refatoração

## Regra obrigatória

Ao refatorar:

preservar comportamento existente.

---

## Não alterar

- regras de negócio
- contratos
- fluxos

sem necessidade explícita.

---

# 2️⃣2️⃣ Arquivos Novos

## Regra obrigatória

Criar novos arquivos apenas quando houver ganho real.

---

## Evitar

fragmentação excessiva.

---

# 2️⃣3️⃣ Consistência

## Regra obrigatória

Seguir sempre os padrões já existentes.

---

## Prioridade

Consistência > Preferência pessoal.

---

# 2️⃣4️⃣ Antes de Finalizar

## Checklist obrigatório

Verificar:

- Tipagem correta
- Schema criado
- Repository criado
- Service criado
- Action criada
- Segurança validada
- RLS considerado
- Multi-tenant considerado
- Loading tratado
- Erro tratado
- Empty state tratado
- Responsividade considerada
- Acessibilidade considerada

---

# 2️⃣5️⃣ Comportamento da IA

Antes de gerar código:

1. Entender contexto.
2. Procurar padrões existentes.
3. Reutilizar o que já existe.
4. Planejar implementação.
5. Criar tipos.
6. Criar schemas.
7. Criar repositories.
8. Criar services.
9. Criar actions.
10. Criar UI.
11. Validar segurança.
12. Validar performance.
13. Validar consistência.

---

# 2️⃣6️⃣ Princípios Obrigatórios

Sempre priorizar:

- simplicidade
- legibilidade
- consistência
- segurança
- performance
- manutenção
- escalabilidade

---

## Nunca priorizar

- criatividade arquitetural
- abstrações prematuras
- otimizações prematuras
- excesso de arquivos
- complexidade desnecessária

---

# 2️⃣7️⃣ Regra Final

Ao receber uma solicitação:

Primeiro entender.

Depois planejar.

Depois reutilizar.

Depois implementar.

Nunca gerar código imediatamente sem avaliar o contexto completo da feature.