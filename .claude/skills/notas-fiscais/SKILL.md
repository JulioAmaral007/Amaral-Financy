---
name: notas-fiscais
description: Implementa o módulo de notas fiscais do Rumo (financy) — escanear o QR code da NFC-e, buscar os itens via proxy da SEFAZ-SC, revisar e salvar a compra, e acompanhar gastos/produtos ao longo do tempo. Skill de implementação direta (sem onp-spec): contém a spec, o design técnico e um checklist de tarefas que a própria skill mantém atualizado a cada rodada. Use quando o usuário pedir para "implementar notas fiscais", "continuar notas fiscais", ou quando `/loop` for apontado para esta skill.
---

# Notas fiscais — implementação

Esta skill substitui o experimento anterior com onp-spec para esta feature.
Sem motor mecânico, sem `.spec/`, sem faixas paralelas em worktrees — é uma
spec e um design comuns, seguidos com o fluxo normal do projeto (ver
`CLAUDE.md`: `actions/ → services/ → repositories/ → types/ → schemas/`).

**Como rodar em loop:** a cada iteração, pegue a primeira tarefa não marcada
em "Checklist de implementação", implemente-a por completo (código + teste
quando fizer sentido), rode `npm run lint`, marque `[x]` nesta seção do
arquivo e pare a iteração. Se uma tarefa exigir uma decisão de produto que não
está resolvida abaixo (ver "Perguntas em aberto"), pare e pergunte ao usuário
em vez de assumir. Não implemente tarefas fora de ordem sem necessidade — a
ordem abaixo reflete dependências reais entre arquivos.

## Contexto

Uma pessoa quer entender quanto gasta no mercado e com o quê, sem digitar cada
compra manualmente: ela escaneia o QR code da nota fiscal (NFC-e) assim que
sai do mercado, revisa os itens extraídos e o app guarda o histórico
localmente (IndexedDB) para mostrar totais, categorias e evolução de preço ao
longo do tempo. É um **novo módulo dentro do app Rumo** (`financy`), ao lado
do dashboard de divisão de contas já existente, reaproveitando o mesmo design
system.

Decisões de arquitetura já confirmadas com o dono do produto:

- A busca dos dados da nota usa um **proxy no próprio servidor Next.js**
  (Route Handler) — o app deixa de ser 100% client-side só para este módulo,
  porque o portal da SEFAZ não libera CORS para chamada direta do navegador.
  É a única rota de servidor do projeto; documentar essa exceção no
  `CLAUDE.md` ao final da implementação.
- Nesta primeira versão o proxy só sabe interpretar notas emitidas em
  **Santa Catarina (SC)**. Outros estados ficam fora de escopo.
- Quando a busca falha (UF não suportada, portal fora do ar, HTML mudou), a
  tela mostra erro e **não** oferece entrada manual dos itens nesta versão —
  a nota simplesmente não é importada.

## Fora de escopo

- Funcionamento totalmente offline (cache de rede via service worker).
- Sincronização entre dispositivos ou contas de usuário.
- Suporte a estados além de SC nesta versão.
- Entrada manual dos itens quando a busca na SEFAZ falha.
- Autenticação ou multi-usuário.
- Notas em formato diferente de NFC-e com QR code (ex.: NF-e modelo 55, cupom
  fiscal sem QR).
- Criação de categorias novas pelo usuário (taxonomia é fixa nesta versão).

## Histórias e critérios de aceite

### US-001 — Ver resumo de gastos do mês no Dashboard de notas fiscais

- **AC-001**: com compras salvas em ≥2 meses, o Dashboard mostra o total do
  mês atual e a variação (percentual e absoluta) vs. o mês anterior.
- **AC-002**: com compras em até 6 meses distintos, o Dashboard mostra o
  número de compras do mês atual e um gráfico dos últimos 6 meses (mês sem
  compra aparece como zero, nunca ausente do eixo).
- **AC-003**: com itens categorizados no mês atual, o Dashboard mostra as
  categorias com maior gasto, da maior para a menor.
- **AC-004**: sem nenhuma compra salva, mostra o estado vazio (US-007) no
  lugar do resumo, com a ação de escanear a primeira nota em destaque.

### US-002 — Escanear o QR code da nota fiscal

- **AC-005**: leitura bem-sucedida de um QR válido dá feedback visual e avança
  automaticamente para a busca (US-003), sem toque adicional.
- **AC-006**: conteúdo lido que não é URL de NFC-e mostra "este QR code não é
  de uma nota fiscal" e permite tentar de novo sem sair da tela.
- **AC-007**: escanear de novo uma nota já salva (mesma chave de acesso)
  mostra "nota já cadastrada" com a data da compra existente, sem duplicata.

### US-003 — Buscar os dados da nota na SEFAZ (SC)

- **AC-008**: URL de NFC-e válida de SC → proxy retorna mercado, data e itens
  (nome, quantidade, valor unitário, valor total); usuário vai para Revisão
  (US-004) já preenchida.
- **AC-009**: URL de nota fora de SC → "estado não suportado ainda", nota não
  é salva.
- **AC-010**: timeout, portal fora do ar ou HTML mudou → "não foi possível
  buscar os dados agora, tente novamente", nota não é salva.
- **AC-011**: durante a busca, mostra indicador de carregamento até a
  resposta (sucesso ou erro).

### US-004 — Revisar e editar os itens antes de salvar

- **AC-012**: cada item extraído mostra nome, quantidade, valor unitário e
  total; usuário pode editar nome e escolher categoria por item antes de
  salvar.
- **AC-013**: nome do mercado e data são editáveis; o valor editado (não o
  extraído) é o que é persistido.
- **AC-014**: "Salvar compra" grava mercado, data, total e itens com
  categoria no IndexedDB; a compra passa a aparecer no Histórico (US-005) e
  nos totais do Dashboard (US-001).

### US-005 — Consultar histórico de compras

- **AC-015**: filtro por mercado e/ou período no Histórico mostra só as
  compras que atendem aos dois filtros, mais recente primeiro.
- **AC-016**: tocar numa compra do Histórico mostra mercado, data, total e a
  lista completa de itens no detalhe.

### US-006 — Acompanhar produtos e evolução de preço

- **AC-017**: tela de Produtos mostra cada produto único (mesmo nome
  normalizado) uma única vez, com preço médio e quantidade total comprada.
- **AC-018**: detalhe de um produto comprado em datas diferentes mostra um
  gráfico do valor unitário pago em cada compra, em ordem cronológica.

### US-007 — Ver o fluxo explicado no primeiro uso

- **AC-019**: sem nenhuma compra salva, o estado vazio explica os três passos
  ("escaneie a nota, revise os itens, acompanhe seus gastos") com botão de
  ação para o primeiro escaneamento.

## Suposições assumidas (revisitar se um caso real contradizer)

- A chave de acesso da NFC-e (44 dígitos, da URL do QR) é o identificador
  único usado para detectar duplicata (AC-007).
- O proxy roda como Route Handler dentro do próprio projeto Next.js, chamado
  só pelo client deste módulo — não é um serviço externo separado.
- Taxonomia de categorias é fixa e pequena (ex.: Alimentos, Bebidas, Limpeza,
  Higiene, Padaria, Hortifruti, Outros), sem criação de categorias novas pelo
  usuário.
- "Produto único" após normalização é o nome exato confirmado pelo usuário na
  Revisão (comparação case-insensitive, espaços extras ignorados), sem
  matching fuzzy/IA.
- O IndexedDB é usado só por este módulo (compras/itens/produtos); não
  substitui o localStorage já usado pelo dashboard de divisão de contas.
- Exclusão de uma compra salva é possível (soft delete, `deletedAt`) a partir
  do Histórico.

## Perguntas em aberto (decidir na hora da tarefa correspondente, não antes)

- Qual biblioteca de leitura de QR via câmera usar no client (ex.:
  `qr-scanner` ou `jsQR` — leves, sem backend)? Decidir na T-009.
- O HTML do portal da SEFAZ-SC muda com frequência? Por ora o erro genérico
  de AC-010 basta; revisitar só se acontecer na prática.
- Existe limite de retenção de dados no IndexedDB, ou o histórico cresce até
  o usuário excluir manualmente? Assumir sem limite até virar problema real.

## Design técnico

Segue o mesmo padrão em camadas do resto do projeto:

```
Component ("use client")
  → actions/*.actions.ts        plain async function, zod-parse, chama service
  → services/*.service.ts       regra de negócio, parsing, agregação
  → repositories/*.repository.ts  IndexedDB (não localStorage) + soft delete
  → lib/indexed-db/db.ts        wrapper fino sobre IndexedDB (idb-keyval ou idb)
```

Módulo novo, montado na mesma rota-raiz do app como uma segunda seção
(`/notas` ou aba dentro de `app/page.tsx` — decidir na tarefa de navegação,
sem introduzir um segundo app).

### Reaproveitamento do design system (não inventar nada novo)

- **Cores/tokens**: CSS vars já expostas em `app/globals.css`
  (`--color-paper`, `--color-ink`, `--color-ink-soft`, `--color-ink-faint`,
  `--color-rule`, `--color-red/-soft`, `--color-blue/-soft`,
  `--color-green/-soft`). Categorias de produto mapeiam para esses tons (ex.:
  Alimentos → verde, Limpeza → azul, Outros → neutro) — nunca cor nova fora
  da paleta.
- **Tipografia**: `--font-display` (Special Elite) para números grandes de
  destaque (total do mês), `--font-sans`/`--font-mono` (Courier Prime) para o
  resto.
- **Cantos retos**: `--radius: 0` já é global; badges usam `rounded-[4px]`
  como única exceção já aceita.
- **Componentes**: reusar `Card`, `Button` (`variant="primary"|"outline"|
  "ghost"|"danger"`), `Badge` (`tone`), `Pagination`, `Skeleton`, `Input`,
  `Select`, `ToggleCheck`, `Receipt`/`ReceiptTitle`/`StarDivider` — não criar
  primitivas novas em `components/ui`. Se algo não couber em nenhum
  existente, estender o primitivo (nova `variant`/`tone`), não criar um
  paralelo.
- **Gráficos**: seguir o padrão de `services/bill-split-chart.service.ts` +
  `app/_dashboard/history-chart.tsx` — SVG artesanal (`viewBox` fixo,
  polyline/circle/text, cores via CSS var), sem lib de charting nova.
- **Padrão section/view**: cada tela segue `*-section.tsx` (client,
  `useEffect` + `useState<Data|null>` + `reloadKey`) → `*-view.tsx`
  (presentational, dentro de `<Card>`), igual a
  `fixed-bills-section.tsx`/`fixed-bills-view.tsx`. Sincronização
  cross-component via novo pub/sub `lib/notas-fiscais-events.ts`, espelhando
  `lib/history-events.ts`.

### Dados (`types/notas-fiscais.ts`)

- `StoredPurchase`: `id`, `chaveAcesso` (44 dígitos, único), `mercado`,
  `data`, `total`, `items: StoredPurchaseItem[]`, `createdAt`,
  `deletedAt: string | null`.
- `StoredPurchaseItem`: `nome` (editado/normalizado), `nomeOriginal` (como
  veio da nota), `categoria`, `quantidade`, `valorUnitario`, `valorTotal`.
- `ProductCategory` — union fixa `as const` (não `enum`, regra do lint).

### Proxy SEFAZ-SC (Route Handler)

- Entrada: URL completa lida do QR (chave de acesso na query string, padrão
  SC).
- Saída (contrato interno, validado com zod no client): `{ mercado, data,
  chaveAcesso, items: [...] } | { error: "UF_NAO_SUPORTADA" |
  "PORTAL_INDISPONIVEL" | "FORMATO_INESPERADO" }`.
- Detecta a UF pela própria URL (domínio do portal é por estado); se não for
  o domínio de SC, retorna `UF_NAO_SUPORTADA` sem tentar fazer fetch
  (AC-009).
- Timeout curto (ex.: 8s) no fetch ao portal; timeout/erro de rede vira
  `PORTAL_INDISPONIVEL` (AC-010). HTML que impede o parse também vira
  `FORMATO_INESPERADO`, tratado como o mesmo erro genérico na UI.
- Sem segredos — scraping de página pública, sem chave de API.

### Leitura de QR (client)

- Câmera via `getUserMedia`, decodificação via biblioteca de QR de terceiro
  (decidir na T-009; ex.: `qr-scanner` ou `jsQR`).
- Validar que o conteúdo lido bate com o formato de URL de consulta de NFC-e
  antes de disparar a busca (AC-006).

### PWA

- Instalar como PWA "leve" (`public/manifest.json` + ícones + `<link
  rel="manifest">` no layout) para "adicionar à tela inicial" — sem cache
  offline de dados (fora de escopo).

### Navegação

- Novo item de navegação no `<Header />` (ou onde a navegação do dashboard já
  vive) apontando para a rota do módulo. Não altera rotas/seções existentes
  do bill-splitting.

### Riscos conhecidos

- O parser do HTML do portal da SEFAZ-SC é a peça mais frágil (HTML de
  terceiro, sem contrato estável) — isolar 100% da lógica de parsing numa
  função pura testável (`parseSefazScHtml(html): ParsedNota`), testada com
  fixtures de HTML salvas, sem depender de rede nos testes.

## Checklist de implementação

Ordem pensada por dependência real entre arquivos — não pule etapas sem
necessidade. Marque `[x]` ao concluir cada uma nesta mesma seção do arquivo.

- [x] **1. Test runner** (vitest + testing-library) — projeto hoje não tem
  nenhum. Infra para todo teste desta feature.
  Arquivos: `package.json`, `vitest.config.ts`, `vitest.setup.ts`.
- [x] **2. Types e schemas** — `types/notas-fiscais.ts`,
  `schemas/notas-fiscais.schema.ts` (AC-012, AC-014).
- [x] **3. Repository IndexedDB** — `lib/indexed-db/db.ts`,
  `repositories/purchase.repository.ts` (AC-007, AC-014, AC-015, AC-016).
  Depende de 2.
- [x] **4. Serviço de agregação do Dashboard** —
  `services/purchase-summary.service.ts`,
  `services/purchase-chart.service.ts` (AC-001–AC-004). Depende de 2.
- [x] **5. Serviço de produtos** (normalização, preço médio, evolução) —
  `services/product.service.ts` (AC-017, AC-018). Depende de 2.
- [ ] **6. Parser do HTML da SEFAZ-SC** — `lib/sefaz-sc/parse-sefaz-sc.ts` +
  fixtures de HTML (AC-008–AC-010). Função pura, testada sem rede.
- [ ] **7. Route Handler de consulta (proxy SEFAZ-SC)** —
  `app/api/notas-fiscais/consulta/route.ts` (AC-008–AC-011). Depende de 6.
- [ ] **8. Ação de importar nota + detecção de duplicata** —
  `actions/purchase.actions.ts` (AC-007, AC-008, AC-014). Depende de 3 e 7.
- [ ] **9. Tela de escaneamento** (câmera + QR) —
  `app/_notas-fiscais/scan-section.tsx`, `scan-view.tsx` (AC-005, AC-006,
  AC-011). Depende de 8. Decidir a lib de QR aqui.
- [ ] **10. Tela de revisão da nota importada** —
  `app/_notas-fiscais/review-section.tsx`, `review-view.tsx` (AC-012–AC-014).
  Depende de 8.
- [ ] **11. Dashboard do módulo** —
  `app/_notas-fiscais/dashboard-section.tsx`, `dashboard-view.tsx`,
  `purchase-chart.tsx` (AC-001–AC-004). Depende de 4.
- [ ] **12. Histórico de compras** —
  `app/_notas-fiscais/history-section.tsx`, `history-view.tsx`,
  `history-entry-row.tsx`, `purchase-detail.tsx` (AC-015, AC-016). Depende
  de 3.
- [ ] **13. Produtos e evolução de preço** —
  `app/_notas-fiscais/products-section.tsx`, `products-view.tsx`,
  `product-detail.tsx` (AC-017, AC-018). Depende de 5.
- [ ] **14. Estado vazio** — `app/_notas-fiscais/empty-state.tsx` (AC-004,
  AC-019).
- [ ] **15. Rota, navegação e sincronização entre seções** —
  `app/notas/page.tsx`, `lib/notas-fiscais-events.ts` (US-001, US-002,
  US-005). Depende de 9–14. Integra as seções e liga o pub/sub
  (`emitPurchaseUpdated`/`onPurchaseUpdated`).
- [ ] **16. Manifest PWA** — `public/manifest.json`, `app/layout.tsx`
  (US-002).
- [ ] **17. Documentar a exceção de arquitetura no `CLAUDE.md`** (o Route
  Handler do proxy é a única rota de servidor do projeto).
