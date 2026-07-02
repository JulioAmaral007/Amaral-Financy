# Performance Rules — Next.js + Supabase

## Objetivo

Garantir aplicações rápidas, escaláveis e eficientes desde o início do desenvolvimento.

A IA deve sempre priorizar:

- performance percebida
- redução de consultas
- redução de re-renderizações
- otimização de carregamento
- uso eficiente do banco
- escalabilidade

---

# 1️⃣ Server Components Primeiro

## Regra obrigatória

Utilizar Server Components como padrão.

---

## Preferir

Server Components para:

- páginas
- layouts
- listagens
- dashboards
- consultas

---

## Utilizar Client Components apenas quando necessário.

---

## Necessário para

- useState
- useEffect
- eventos
- browser APIs

---

# 2️⃣ Menos JavaScript no Cliente

## Regra obrigatória

Enviar a menor quantidade possível de JavaScript para o navegador.

---

## Evitar

transformar páginas inteiras em:

    'use client'

---

## Preferir

isolar apenas partes interativas.

---

# 3️⃣ Data Fetching

## Regra obrigatória

Buscar dados no servidor sempre que possível.

---

## Preferir

- Server Components
- Server Actions

---

## Evitar

buscar dados no cliente sem necessidade.

---

# 4️⃣ Queries

## Regra obrigatória

Buscar apenas dados necessários.

---

## Evitar

    select *

---

## Preferir

seleção explícita de colunas.

---

# 5️⃣ Número de Queries

## Regra obrigatória

Minimizar quantidade de consultas.

---

## Evitar

N+1 Queries.

---

## Preferir

consultas agregadas.

---

## Exemplo

Evitar:

    buscar projeto
    buscar usuário
    buscar organização

em consultas separadas quando possível.

---

# 6️⃣ Paginação

## Regra obrigatória

Toda listagem deve considerar paginação.

---

## Nunca assumir

retorno ilimitado.

---

## Sempre utilizar

- limit
- range
- cursor pagination

quando apropriado.

---

# 7️⃣ Cache

## Regra obrigatória

Toda consulta deve avaliar possibilidade de cache.

---

## Utilizar

- cache do Next.js
- revalidate
- tags

quando aplicável.

---

## Evitar

refetch desnecessário.

---

# 8️⃣ Revalidação

## Regra obrigatória

Após mutações utilizar:

- revalidatePath
- revalidateTag

quando necessário.

---

## Nunca forçar reload completo
sem necessidade.

---

# 9️⃣ Suspense

## Regra obrigatória

Utilizar Suspense para carregamentos independentes.

---

## Priorizar

renderização progressiva.

---

# 🔟 Loading States

## Regra obrigatória

Toda operação assíncrona deve possuir loading state.

---

## Objetivo

melhorar performance percebida.

---

# 1️⃣1️⃣ Componentes

## Regra obrigatória

Componentes devem ser pequenos.

---

## Evitar

componentes gigantes.

---

## Extrair

- subcomponentes
- hooks
- utilidades

quando necessário.

---

# 1️⃣2️⃣ Re-renderizações

## Regra obrigatória

Evitar re-renderizações desnecessárias.

---

## Não criar

objetos e funções dentro do JSX
sem necessidade.

---

## Evitar

    onClick={() => ...}

em listas grandes quando possível.

---

# 1️⃣3️⃣ Estado

## Regra obrigatória

Manter o menor estado possível.

---

## Evitar

duplicação de estado.

---

## Preferir

dados derivados.

---

# 1️⃣4️⃣ useEffect

## Regra obrigatória

Utilizar useEffect apenas quando necessário.

---

## Evitar

usar useEffect para:

- cálculos simples
- transformações
- sincronizações desnecessárias

---

## Preferir

cálculo direto.

---

# 1️⃣5️⃣ Computações

## Regra obrigatória

Computações pesadas não devem ocorrer durante renderização.

---

## Extrair

para:

- servidor
- utilitários
- processamento isolado

---

# 1️⃣6️⃣ Imagens

## Regra obrigatória

Utilizar sempre:

    next/image

---

## Nunca utilizar

    img

sem necessidade específica.

---

## Sempre considerar

- lazy loading
- tamanhos corretos
- otimização automática

---

# 1️⃣7️⃣ Navegação

## Regra obrigatória

Utilizar:

    Link

do Next.js.

---

## Evitar

    window.location

---

# 1️⃣8️⃣ Bundle Size

## Regra obrigatória

Minimizar tamanho do bundle.

---

## Evitar

bibliotecas pesadas para tarefas simples.

---

## Sempre avaliar

custo da dependência.

---

# 1️⃣9️⃣ Imports

## Regra obrigatória

Importar apenas o necessário.

---

## Evitar

imports globais excessivos.

---

# 2️⃣0️⃣ Lazy Loading

## Regra obrigatória

Carregar componentes pesados sob demanda.

---

## Considerar

- gráficos
- editores
- modais complexos
- dashboards avançados

---

# 2️⃣1️⃣ Supabase

## Regra obrigatória

Executar consultas no servidor sempre que possível.

---

## Evitar

consultas desnecessárias no cliente.

---

## Priorizar

Server Components.

---

# 2️⃣2️⃣ Storage

## Regra obrigatória

Não carregar arquivos sem necessidade.

---

## Sempre considerar

- compressão
- tamanhos adequados
- lazy loading

---

# 2️⃣3️⃣ Busca

## Regra obrigatória

Campos de busca devem utilizar:

- debounce
- paginação

quando necessário.

---

## Evitar

requisições a cada tecla digitada.

---

# 2️⃣4️⃣ Listas

## Regra obrigatória

Listas grandes devem considerar:

- paginação
- virtualização

quando apropriado.

---

## Nunca renderizar milhares de itens simultaneamente.

---

# 2️⃣5️⃣ Dados Repetidos

## Regra obrigatória

Evitar buscar o mesmo dado várias vezes.

---

## Centralizar consultas.

---

## Reutilizar resultados quando possível.

---

# 2️⃣6️⃣ Logs

## Regra obrigatória

Não deixar logs desnecessários em produção.

---

## Remover

- console.log
- debug temporário

antes da entrega final.

---

# 2️⃣7️⃣ Middleware

## Regra obrigatória

Middleware deve ser leve.

---

## Nunca executar

- consultas pesadas
- processamento complexo

no middleware.

---

# 2️⃣8️⃣ Arquitetura

## Regra obrigatória

Separar claramente:

- UI
- negócio
- acesso a dados

---

## Benefícios

- manutenção
- escalabilidade
- performance previsível

---

# 2️⃣9️⃣ Performance Percebida

## Regra obrigatória

Priorizar experiência do usuário.

---

## Utilizar

- loading states
- suspense
- skeletons
- renderização progressiva

---

## Não focar apenas em benchmarks.

---

# 3️⃣0️⃣ Comportamento da IA

Ao gerar código:

- Priorizar Server Components.
- Priorizar renderização no servidor.
- Minimizar JavaScript enviado ao cliente.
- Minimizar consultas ao banco.
- Evitar N+1 queries.
- Utilizar paginação.
- Utilizar cache quando apropriado.
- Utilizar lazy loading quando apropriado.
- Reduzir re-renderizações.
- Reduzir bundle size.
- Priorizar performance percebida.

Sempre escolher a solução mais simples que entregue boa performance.

Nunca otimizar prematuramente.

Nunca sacrificar legibilidade por micro-otimizações.