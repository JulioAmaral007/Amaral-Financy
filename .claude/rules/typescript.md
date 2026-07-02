# TypeScript Rules — Next.js + Supabase

## Objetivo

Garantir código TypeScript consistente, seguro, previsível e com tipagem forte.

A IA deve sempre priorizar:

- type safety
- inferência de tipos
- legibilidade
- manutenção
- consistência
- previsibilidade

---

# 1️⃣ Modo Strict

## Regra obrigatória

Todo projeto deve assumir:

    "strict": true

A IA deve gerar código compatível com strict mode.

---

## Nunca assumir

- valores nulos
- valores undefined
- propriedades opcionais existentes

---

# 2️⃣ Proibição de any

## Regra obrigatória

Nunca utilizar:

    any

---

## Proibido

    const data: any

    function test(value: any)

---

## Preferir

    unknown

quando necessário.

---

## Exemplo

    function parseData(value: unknown){

    }

---

# 3️⃣ Interfaces vs Types

## Regra obrigatória

Utilizar:

### interface

Para objetos de domínio.

    interface User {
      id: string;
      name: string;
    }

---

### type

Para:

- unions
- intersections
- utility types
- aliases

    type Status =
      | "pending"
      | "approved"
      | "rejected";

---

# 4️⃣ Inferência

## Regra obrigatória

Permitir inferência quando o tipo for óbvio.

---

## Preferir

    const active = true;

---

## Evitar

    const active: boolean = true;

---

# 5️⃣ Retorno de Funções

## Regra obrigatória

Funções públicas devem possuir retorno explícito.

---

## Obrigatório

    async function getUser(): Promise<User>{

    }

---

## Evitar

    async function getUser(){

    }

---

# 6️⃣ Null e Undefined

## Regra obrigatória

Sempre tratar:

- null
- undefined

---

## Nunca assumir

    user.name

---

## Preferir

    user?.name

ou

    if(!user){
      return;
    }

---

# 7️⃣ Enums

## Regra obrigatória

Não utilizar enums.

---

## Proibido

    enum Status

---

## Preferir

    const STATUS = {
      PENDING: "pending",
      APPROVED: "approved"
    } as const;

---

    type Status =
      typeof STATUS[keyof typeof STATUS];

---

# 8️⃣ Type Assertions

## Regra obrigatória

Evitar casts.

---

## Proibido

    value as User

---

## Utilizar apenas quando necessário.

---

# 9️⃣ Non Null Assertion

## Regra obrigatória

Nunca utilizar:

    value!

---

## Proibido

    user!.id

---

## Preferir validação explícita.

---

# 🔟 Tipos Compartilhados

## Regra obrigatória

Tipos compartilhados devem ficar em:

    src/types

---

## Exemplo

    types/user.ts
    types/project.ts
    types/invoice.ts

---

# 1️⃣1️⃣ Tipagem do Supabase

## Regra obrigatória

Sempre utilizar tipos gerados do banco.

---

## Preferir

    Database

gerado pelo Supabase.

---

## Exemplo

    Database["public"]["Tables"]["projects"]["Row"]

---

## Nunca criar tipos manuais
quando já existirem tipos gerados.

---

# 1️⃣2️⃣ Tipagem de Responses

## Regra obrigatória

Toda função de acesso a dados deve retornar tipos explícitos.

---

## Exemplo

    Promise<Project>

    Promise<Project[]>

---

## Nunca retornar

    Promise<any>

---

# 1️⃣3️⃣ Zod

## Regra obrigatória

Schemas devem ser a fonte principal da tipagem.

---

## Exemplo

    const schema = z.object({
      name: z.string()
    });

---

    type FormData =
      z.infer<typeof schema>;

---

## Evitar duplicação

entre schema e type.

---

# 1️⃣4️⃣ Generics

## Regra obrigatória

Utilizar generics apenas quando agregarem valor.

---

## Evitar

Generics excessivamente complexos.

---

## Priorizar

clareza.

---

# 1️⃣5️⃣ Props

## Regra obrigatória

Toda prop deve possuir tipo explícito.

---

## Exemplo

    interface UserCardProps {
      user: User;
    }

---

    export function UserCard({
      user
    }: UserCardProps){

    }

---

# 1️⃣6️⃣ Componentes React

## Regra obrigatória

Não utilizar:

    React.FC

---

## Proibido

    const UserCard: React.FC

---

## Preferir

    export function UserCard(){

    }

---

# 1️⃣7️⃣ Async

## Regra obrigatória

Toda função async deve retornar Promise tipada.

---

## Exemplo

    Promise<void>

    Promise<User>

    Promise<Project[]>

---

# 1️⃣8️⃣ Utilitários

## Regra obrigatória

Priorizar utility types nativos.

---

## Utilizar

    Pick
    Omit
    Partial
    Required
    Record

---

## Evitar

recriar utility types existentes.

---

# 1️⃣9️⃣ Union Types

## Regra obrigatória

Preferir unions a strings livres.

---

## Evitar

    status: string

---

## Preferir

    status: Status

---

# 2️⃣0️⃣ Constantes

## Regra obrigatória

Constantes compartilhadas devem utilizar:

    as const

---

## Exemplo

    export const ROLE = {
      ADMIN: "admin",
      USER: "user"
    } as const;

---

# 2️⃣1️⃣ Erros

## Regra obrigatória

Errors devem possuir tipagem.

---

## Nunca assumir

    catch(error)

---

## Preferir

    catch(error: unknown)

---

e validar antes de acessar propriedades.

---

# 2️⃣2️⃣ Imports

## Regra obrigatória

Importar tipos utilizando:

    import type

sempre que possível.

---

## Exemplo

    import type { User } from "@/types/user";

---

# 2️⃣3️⃣ Organização

## Estrutura recomendada

    src/
      types/
      schemas/
      features/
      services/
      repositories/
      components/

---

## Evitar

tipos espalhados pelo projeto.

---

# 2️⃣4️⃣ Server Actions

## Regra obrigatória

Toda Server Action deve possuir:

- parâmetros tipados
- retorno tipado

---

## Exemplo

    export async function createProject(
      input: CreateProjectInput
    ): Promise<ActionResponse<Project>>{

    }

---

# 2️⃣5️⃣ Comportamento da IA

Ao gerar TypeScript:

- Nunca usar any.
- Nunca usar React.FC.
- Nunca usar enum.
- Nunca usar non-null assertion.
- Nunca ignorar null ou undefined.
- Utilizar strict mode.
- Utilizar tipos do Supabase.
- Utilizar Zod como fonte da tipagem.
- Utilizar interfaces para entidades.
- Utilizar types para unions e aliases.
- Declarar retornos explícitos.
- Priorizar legibilidade sobre complexidade.

Se houver dúvida entre simplicidade e abstração avançada, priorizar simplicidade.