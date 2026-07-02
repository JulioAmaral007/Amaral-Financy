# UI & Component Rules — Next.js + Supabase

## Objetivo

Garantir uma interface consistente, reutilizável, escalável e fácil de manter.

A IA deve sempre priorizar:

- consistência visual
- reutilização
- acessibilidade
- simplicidade
- previsibilidade
- componentização adequada

---

# 1️⃣ Responsabilidade dos Componentes

## Regra obrigatória

Cada componente deve possuir apenas uma responsabilidade.

---

## Evitar

    UserDashboardCardWithStatisticsAndActions

---

## Preferir

    UserCard
    UserStats
    UserActions

---

# 2️⃣ Componentes Pequenos

## Regra obrigatória

Componentes devem ser pequenos e focados.

---

## Limite recomendado

- até 200 linhas

---

## Quando crescer

Extrair:

- subcomponentes
- hooks
- utilitários

---

# 3️⃣ Separação entre UI e Negócio

## Regra obrigatória

Componentes devem apenas renderizar.

---

## Nunca colocar

- queries Supabase
- regras de negócio
- validações complexas
- lógica de autorização

---

## Componentes recebem dados prontos.

---

# 4️⃣ Estrutura de Componentes

## Estrutura recomendada

    components/
      ui/
      forms/
      layout/
      feedback/

---

## ui

Componentes genéricos.

Exemplo:

    Button
    Input
    Card
    Modal

---

## forms

Componentes de formulário.

---

## layout

Estrutura visual.

---

## feedback

Mensagens e estados.

---

# 5️⃣ Componentes de UI

## Regra obrigatória

Componentes de UI devem ser agnósticos ao domínio.

---

## Evitar

    UserButton

---

## Preferir

    Button

---

# 6️⃣ Props

## Regra obrigatória

Props devem ser explícitas.

---

## Evitar

    data
    item
    value

---

## Preferir

    user
    project
    invoice

---

# 7️⃣ Tipagem

## Regra obrigatória

Toda prop deve possuir tipo.

---

## Nunca utilizar

    any

---

## Utilizar

    interface

para props.

---

# 8️⃣ React.FC

## Regra obrigatória

Não utilizar React.FC.

---

## Proibido

    const Button: React.FC

---

## Preferir

    export function Button(){

    }

---

# 9️⃣ Componentes Client

## Regra obrigatória

Utilizar:

    'use client'

apenas quando necessário.

---

## Necessário para

- useState
- useEffect
- eventos
- browser APIs

---

## Nunca marcar páginas inteiras sem necessidade.

---

# 🔟 Server Components

## Regra obrigatória

Server Components são o padrão.

---

## Sempre preferir

Server Components antes de Client Components.

---

# 1️⃣1️⃣ Estado

## Regra obrigatória

Manter o menor estado possível.

---

## Evitar

Duplicação de estado.

---

## Preferir

Valores derivados.

---

# 1️⃣2️⃣ Formulários

## Regra obrigatória

Formulários devem utilizar:

- Server Actions
- React Hook Form
- Zod

---

## Nunca validar apenas no frontend.

---

# 1️⃣3️⃣ Loading States

## Regra obrigatória

Toda ação assíncrona deve possuir estado de carregamento.

---

## Exemplo

- loading
- submitting
- fetching

---

## Nunca deixar ações sem feedback visual.

---

# 1️⃣4️⃣ Error States

## Regra obrigatória

Toda operação deve tratar erro.

---

## Sempre exibir

- mensagem amigável
- feedback visual

---

## Nunca exibir

- stack trace
- erro SQL
- erro interno

---

# 1️⃣5️⃣ Empty States

## Regra obrigatória

Listas devem tratar vazio.

---

## Exemplo

    Nenhum resultado encontrado.

---

## Nunca renderizar área vazia.

---

# 1️⃣6️⃣ Lists

## Regra obrigatória

Listas devem utilizar chave estável.

---

## Nunca utilizar

    index

como key.

---

## Preferir

    id

---

# 1️⃣7️⃣ Modais

## Regra obrigatória

Modais devem ser reutilizáveis.

---

## Nunca criar modal específico
quando um componente genérico resolve.

---

# 1️⃣8️⃣ Botões

## Regra obrigatória

Todo botão deve indicar claramente sua ação.

---

## Evitar

    Salvar

quando existirem múltiplos contextos.

---

## Preferir

    Salvar Projeto

    Aprovar Solicitação

---

# 1️⃣9️⃣ Inputs

## Regra obrigatória

Todo input deve possuir:

- label
- validação
- mensagem de erro

---

## Nunca depender apenas de placeholder.

---

# 2️⃣0️⃣ Acessibilidade

## Regra obrigatória

Todo componente deve considerar acessibilidade.

---

## Sempre utilizar

- aria-label
- aria-describedby
- htmlFor
- roles corretos

quando necessário.

---

# 2️⃣1️⃣ Navegação

## Regra obrigatória

Utilizar componentes nativos do Next.js.

---

## Preferir

    Link

---

## Evitar

    window.location

---

# 2️⃣2️⃣ Layout

## Regra obrigatória

Layout deve ser previsível.

---

## Evitar

Estruturas profundamente aninhadas.

---

## Preferir

hierarquia simples.

---

# 2️⃣3️⃣ Responsividade

## Regra obrigatória

Todo componente deve funcionar em:

- mobile
- tablet
- desktop

---

## Nunca assumir apenas desktop.

---

# 2️⃣4️⃣ Reutilização

## Regra obrigatória

Se um padrão visual aparecer mais de duas vezes:

Extrair componente.

---

## Evitar

duplicação de JSX.

---

# 2️⃣5️⃣ Organização por Feature

## Estrutura recomendada

    features/
      projects/
        components/
        forms/
        hooks/

---

## Componentes específicos da feature
devem permanecer dentro da própria feature.

---

# 2️⃣6️⃣ Componentes Compartilhados

## Regra obrigatória

Componentes genéricos ficam em:

    components/ui

---

## Exemplos

    Button
    Dialog
    Card
    Badge
    Input

---

# 2️⃣7️⃣ Feedback Visual

## Regra obrigatória

Toda ação do usuário deve gerar feedback.

---

## Exemplos

- loading
- sucesso
- erro
- vazio

---

## Nunca deixar ações silenciosas.

---

# 2️⃣8️⃣ Código JSX

## Regra obrigatória

JSX deve permanecer legível.

---

## Evitar

condições extremamente complexas dentro do return.

---

## Preferir

variáveis intermediárias.

---

# 2️⃣9️⃣ Clean UI

## Sempre

- componentes pequenos
- responsabilidades únicas
- props claras
- estrutura previsível
- estados explícitos
- acessibilidade
- responsividade

---

## Nunca

- componentes gigantes
- lógica de negócio na UI
- queries na interface
- JSX duplicado
- estados desnecessários
- props genéricas

---

# 3️⃣0️⃣ Comportamento da IA

Ao gerar componentes:

- Priorizar Server Components.
- Utilizar Client Components apenas quando necessário.
- Manter componentes pequenos.
- Separar UI de negócio.
- Separar UI de acesso ao banco.
- Utilizar tipagem forte.
- Garantir acessibilidade.
- Garantir responsividade.
- Garantir reutilização.

Sempre priorizar simplicidade, consistência e manutenção de longo prazo.