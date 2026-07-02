# Database Rules — Next.js + Supabase

## Objetivo

Garantir uma camada de dados consistente, segura, performática e escalável.

A IA deve sempre priorizar:

- integridade dos dados
- segurança
- performance
- manutenibilidade
- consistência
- escalabilidade

---

# 1️⃣ Fonte da Verdade

## Regra obrigatória

O banco de dados é a única fonte da verdade.

---

## Nunca

Confiar em dados vindos do frontend.

---

## Sempre validar

- autenticação
- autorização
- ownership
- integridade

antes de persistir.

---

# 2️⃣ Supabase como Camada de Dados

## Regra obrigatória

Todo acesso ao banco deve passar pela camada de Repository.

---

## Nunca utilizar

    supabase.from()

diretamente em:

- componentes
- páginas
- hooks
- layouts

---

## Utilizar

    repositories/

como camada de acesso.

---

# 3️⃣ Estrutura de Repositories

## Estrutura recomendada

    repositories/
      user.repository.ts
      project.repository.ts
      invoice.repository.ts

---

## Responsabilidade

Somente:

- select
- insert
- update
- delete

---

## Nunca colocar

- regras de negócio
- validações complexas
- autorização

---

# 4️⃣ Row Level Security (RLS)

## Regra obrigatória

Toda tabela deve assumir RLS habilitado.

---

## Nunca gerar

Policies abertas.

---

## Proibido

    USING (true)

---

## Preferir

    auth.uid() = user_id

---

# 5️⃣ Multi-Tenant

## Regra obrigatória

Toda query deve respeitar o tenant.

---

## Sempre filtrar

- organization_id
- company_id
- workspace_id

ou equivalente.

---

## Nunca gerar

consultas globais sem escopo.

---

# 6️⃣ Nomenclatura de Tabelas

## Regra obrigatória

Utilizar nomes no plural.

---

## Exemplo

    users
    projects
    invoices
    organizations

---

## Evitar

    user
    project
    invoice

---

# 7️⃣ Nomenclatura de Colunas

## Regra obrigatória

Utilizar snake_case.

---

## Exemplo

    created_at
    updated_at
    user_id
    organization_id

---

## Nunca utilizar

    createdAt
    userId

---

# 8️⃣ Chaves Primárias

## Regra obrigatória

Toda tabela deve possuir:

    id

como chave primária.

---

## Preferir

UUID.

---

## Exemplo

    id uuid primary key

---

# 9️⃣ Foreign Keys

## Regra obrigatória

Toda relação deve possuir foreign key.

---

## Nunca criar

relacionamentos implícitos.

---

## Sempre declarar

constraints.

---

# 🔟 Auditoria

## Regra obrigatória

Toda tabela deve possuir:

    created_at
    updated_at

---

## Quando aplicável

    created_by
    updated_by

---

# 1️⃣1️⃣ Soft Delete

## Regra obrigatória

Preferir soft delete.

---

## Utilizar

    deleted_at

---

ou

    is_deleted

---

## Evitar

DELETE físico sem necessidade.

---

# 1️⃣2️⃣ Índices

## Regra obrigatória

Campos frequentemente utilizados em:

- filtros
- joins
- ordenação

devem possuir índice.

---

## Exemplos

    user_id
    organization_id
    created_at

---

# 1️⃣3️⃣ Queries

## Regra obrigatória

Selecionar apenas colunas necessárias.

---

## Evitar

    select *

---

## Preferir

    select id, name

---

# 1️⃣4️⃣ Paginação

## Regra obrigatória

Listagens devem possuir paginação.

---

## Nunca assumir

retorno ilimitado.

---

## Sempre considerar

- limit
- paginação
- cursor

---

# 1️⃣5️⃣ Relacionamentos

## Regra obrigatória

Utilizar relacionamentos explícitos.

---

## Exemplo

    projects.user_id

→

    users.id

---

## Evitar

duplicação desnecessária de dados.

---

# 1️⃣6️⃣ Tipagem

## Regra obrigatória

Utilizar tipos gerados pelo Supabase.

---

## Preferir

    Database

gerado automaticamente.

---

## Nunca duplicar tipos
quando já existirem tipos gerados.

---

# 1️⃣7️⃣ Transações

## Regra obrigatória

Operações dependentes devem ser atômicas.

---

## Sempre considerar

transações quando:

- múltiplos inserts
- múltiplos updates
- consistência crítica

---

# 1️⃣8️⃣ Integridade

## Regra obrigatória

O banco deve proteger os dados.

---

## Não depender apenas da aplicação.

---

## Utilizar

- constraints
- foreign keys
- unique
- check constraints

---

# 1️⃣9️⃣ Unicidade

## Regra obrigatória

Campos únicos devem possuir constraint.

---

## Exemplos

    email
    slug
    external_id

---

# 2️⃣0️⃣ Datas

## Regra obrigatória

Sempre armazenar datas em UTC.

---

## Nunca salvar

datas locais do navegador.

---

# 2️⃣1️⃣ JSON

## Regra obrigatória

Utilizar JSON apenas quando necessário.

---

## Evitar

transformar tabelas relacionais em JSON.

---

## Preferir

modelagem relacional.

---

# 2️⃣2️⃣ Arquivos

## Regra obrigatória

Arquivos devem ser armazenados no Storage.

---

## Nunca armazenar

arquivos binários em tabelas.

---

## Banco deve armazenar apenas:

- path
- metadata
- url controlada

---

# 2️⃣3️⃣ Performance

## Regra obrigatória

Sempre considerar:

- índices
- volume de dados
- crescimento futuro

---

## Evitar

queries N+1.

---

## Preferir

joins controlados.

---

# 2️⃣4️⃣ Migrations

## Regra obrigatória

Toda alteração estrutural deve ocorrer via migration.

---

## Nunca assumir

alterações manuais no banco.

---

# 2️⃣5️⃣ Seeds

## Regra obrigatória

Dados de desenvolvimento devem utilizar seed.

---

## Nunca misturar

dados de produção com seed.

---

# 2️⃣6️⃣ Segurança

## Regra obrigatória

Nunca expor:

- tabelas internas
- dados sensíveis
- chaves privadas

---

## Sempre assumir

ambiente multiusuário.

---

# 2️⃣7️⃣ Histórico

## Regra obrigatória

Entidades críticas devem permitir auditoria.

---

## Considerar

- histórico
- logs
- rastreabilidade

---

# 2️⃣8️⃣ Consistência

## Regra obrigatória

Padrões devem ser mantidos em todas as tabelas.

---

## Exemplo

Se existe:

    created_at

em uma tabela,

deve existir nas demais entidades principais.

---

# 2️⃣9️⃣ Comportamento da IA

Ao criar ou alterar banco:

- Assumir RLS habilitado.
- Assumir multi-tenant.
- Assumir ambiente de produção.
- Assumir necessidade de auditoria.
- Assumir crescimento futuro.
- Assumir alta concorrência.

---

# 3️⃣0️⃣ Princípios Obrigatórios

Sempre priorizar:

- integridade
- segurança
- consistência
- performance
- escalabilidade
- manutenção

Nunca sacrificar modelagem correta por conveniência.

Nunca sacrificar segurança por simplicidade.

Nunca sacrificar integridade por velocidade de implementação.