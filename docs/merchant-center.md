# Tramatto — Auditoria e Plano de Implementação: Google Merchant Center

**Data:** 2026-06-15
**Fontes:** [catalog-data.js](../catalog-data.js), [js/domain-model.js](../js/domain-model.js),
[js/adapters.js](../js/adapters.js), [index.html](../index.html),
[collection.html](../collection.html), [product.html](../product.html),
[sitemap.xml](../sitemap.xml), [docs/master-roadmap.md](master-roadmap.md)
**Objetivo:** avaliar a prontidão do catálogo/site da Tramatto para o Google
Merchant Center (e, por consequência, Google Shopping / Performance Max),
gerar um feed de produtos otimizado, identificar lacunas e propor um plano de
implementação priorizado.

---

## 1. Nota de maturidade Merchant Center: **44 / 100**

| Categoria | Peso | Pontuação | Observação |
|---|---|---|---|
| Dados básicos de produto (title, description, price, brand, condition, availability) | 20 | 16 | Presentes no `domain-model.js`, mas faltam GTIN/MPN e `description` é curta/genérica |
| Categorização (`google_product_category`, `product_type`) | 10 | 0 | Não existe em nenhuma camada do catálogo |
| Imagens (`image_link` + `additional_image_link`) | 15 | 6 | Cada produto tem apenas **1 imagem** (`gallery[0]`); sem imagens adicionais/lifestyle |
| Identificadores únicos (GTIN / MPN / `identifier_exists`) | 10 | 0 | Ausentes — produtos artesanais/sem marca registrada em GS1 |
| Product Schema (JSON-LD) | 10 | 5 | Existe (`injectProductSchema` em `script.js`), mas é **client-side**, sem `sku`, `brand`, `gtin`/`mpn` |
| Open Graph (`og:*`) | 10 | 3 | Completo apenas em `index.html`; ausente em `collection.html` e `product.html` |
| `canonical` correto por produto | 10 | 2 | `product.html` usa canonical **estático** (`https://tramatto.com/product.html`) igual para todos os slugs |
| URLs indexáveis/sitemap por produto | 10 | 2 | `sitemap.xml` não lista `product.html?slug=...` por produto |
| Políticas (frete, devolução, dados da empresa) | 10 | 6 | Frete/trocas documentados (`pages/shipping.html`); **falta CNPJ/razão social/endereço** (exigido na verificação da conta Merchant Center) |
| Tracking de ecommerce (GA4/GTM, para Shopping Ads / Performance Max) | 5 | 4 | `view_item`, `view_item_list`, `search` já implementados ([analytics-events.md](../analytics-events.md)); faltam `add_to_cart`/`purchase` |
| **Total** | **100** | **44** | Maturidade **inicial/baixa** — feed pode ser montado, mas a conta provavelmente terá itens **desaprovados** sem as correções da Seção 5 |

> Leitura: 44/100 significa que **os dados existem para montar um feed mínimo**
> (título, preço, disponibilidade, imagem, link), mas faltam praticamente
> todos os atributos de **categorização** e **identificação única**, além de
> metadados de SEO/Schema por página de produto — itens que o Google
> frequentemente sinaliza como "Item disapproved" ou "Atenção necessária".

---

## 2. Auditoria do catálogo atual

Fonte ativa em produção: `js/config.js` define `environment: 'development'`,
que usa `MockAdapter` lendo `catalog-data.js` (4 produtos, 2 coleções, 4 kits
— os **kits não aparecem na coleção** nem têm `slug`/página própria, ver
roadmap item #8).

| Campo (domain model) | Presente? | Exemplo (`linho-anatoliano`) | Observação para GMC |
|---|---|---|---|
| `title` | ✅ | "Linho Anatoliano" | OK, mas curto — Google recomenda incluir atributos-chave (material, tamanho) no título |
| `description` | ✅ | "Um tecido leve e sofisticado..." (1 frase) | Abaixo do recomendado (≥ 500 caracteres ideais); sem material/dimensões |
| `price` | ✅ (string `"R$ 120,00"`, convertido p/ número via `parsePrice()`) | 120.00 | OK após conversão — feed precisa formato `120.00 BRL` |
| `promotionalPrice` | ✅ (opcional) | `null` | Quando presente, mapear para `sale_price` |
| `availability` (`inStock`) | ✅ | `true` → in stock | `jacquard-ottomano` está `inStock: false` → `out of stock` |
| `image` / `gallery` | ⚠️ Parcial | 1 imagem (`produto-linho-anatoliano.jpg`) | **Apenas 1 imagem por produto** — sem `additional_image_link` |
| `brand` | ❌ | — | Não existe no domain model; precisa ser fixo `"Tramatto"` |
| `condition` | ❌ | — | Não existe; todos os produtos são `new` |
| `gtin` / `mpn` | ❌ | — | Não existem |
| `google_product_category` | ❌ | — | Não existe |
| `product_type` | ❌ | — | Não existe (poderia usar `collectionId` + `title`) |
| `slug` / `link` | ✅ | `linho-anatoliano` → `/product.html?slug=linho-anatoliano` | Funcional, mas **canonical não é dinâmico** (ver Seção 3) |
| `colors` / `sizes` (variantes) | ✅ | `['Branco natural','Areia','Linho']` / `['45×70cm','60×90cm']` | Podem alimentar `color`/`size` por variante (feed com `item_group_id`) |

**Resumo:** 4 produtos cadastrados, todos da marca Tramatto, condição "novo",
preços únicos (R$ 120,00 nos panos), sem promoções ativas. Estrutura de dados
é suficiente para um feed básico, mas **nenhum atributo de categorização ou
identificador único existe hoje**.

---

## 3. Verificação de readiness técnico

### 3.1 Product Schema (JSON-LD)

- **`product.html`:** `script.js` → `injectProductSchema()` injeta
  dinamicamente (após carregamento do catálogo) um `<script type="application/ld+json" data-schema="product">`
  com `@type: Product`, `name`, `description`, `image`, `offers.price`,
  `offers.availability`. **Faltam:** `brand`, `sku`, `gtin`/`mpn`,
  `aggregateRating`/`review` (se existirem).
- **Limitação importante:** a injeção é **client-side** (após `fetch` do
  catálogo). Ferramentas que não executam JS (alguns crawlers, validadores
  rápidos) **não verão o schema**. O Googlebot renderiza JS, mas o ideal para
  Merchant Center é o **feed** ser a fonte de verdade — o schema é
  complementar (ajuda em "Merchant listing experiences" e rich results).
- **`collection.html`:** possui `CollectionPage` JSON-LD estático (sem lista
  de produtos / `ItemList`).
- **`index.html`:** possui `Organization` e `WebSite` JSON-LD estáticos. OK.

**Status: ⚠️ Parcial** — existe, mas incompleto e client-side-only na PDP.

### 3.2 Open Graph (`og:*`)

- **`index.html`:** completo (`og:type`, `og:url`, `og:title`, `og:description`,
  `og:image` 1200×630, `og:locale`, `og:site_name`).
- **`collection.html`:** ❌ ausente.
- **`product.html`:** ❌ ausente — **cada produto deveria ter seu próprio
  `og:title`, `og:description` e `og:image`** (a imagem do produto), tanto
  para compartilhamento social quanto porque o Google às vezes usa OG como
  fallback de imagem/descrição.

**Status: ❌ Incompleto** — presente só na home.

### 3.3 `canonical`

- **`index.html`:** `https://tramatto.com/` ✅
- **`collection.html`:** `https://tramatto.com/collection.html` ✅
- **`product.html`:** `https://tramatto.com/product.html` — **estático**,
  igual para **todos** os produtos (`?slug=linho-anatoliano`,
  `?slug=borda-dourada`, etc. todos apontam para o mesmo canonical). Isso faz
  o Google tratar todas as PDPs como "duplicatas" da mesma URL canônica —
  problema crítico tanto para SEO quanto para a associação
  produto↔página-de-destino que o Merchant Center valida (`link` do feed deve
  corresponder a uma página indexável e única).

**Status: ❌ Crítico** — já identificado no roadmap (#15), mas agora também
bloqueia o Merchant Center.

### 3.4 JSON-LD (geral)

- Presente em `index.html` (Organization, WebSite), `collection.html`
  (CollectionPage) e `product.html` (WebPage estático + Product/Breadcrumb
  injetados via JS). Nenhum erro de sintaxe identificado nos schemas
  estáticos.

**Status: ✅ Existe**, mas com lacunas descritas em 3.1.

### 3.5 Readiness geral para Google Shopping

| Requisito Merchant Center | Status |
|---|---|
| Conta verificada (CNPJ, endereço, contato) | ❌ Sem CNPJ/endereço no site (roadmap #4) |
| Política de devolução/reembolso acessível | ✅ `pages/shipping.html` (30 dias) |
| Política de privacidade | ✅ `pages/privacy.html` |
| Páginas de produto acessíveis e indexáveis individualmente | ⚠️ Existem via `?slug=`, mas sem canonical dinâmico nem entrada no sitemap |
| Feed de produtos (XML/TSV) | ❌ Não existe — gerado nesta auditoria (Seção 5) como amostra |
| Preço/disponibilidade no feed = preço/disponibilidade na página | ✅ Dados consistentes (mesma fonte `catalog-data.js`) |
| Imagens com boa resolução, sem texto sobreposto excessivo | ⚠️ A verificar manualmente (arquivos em `assets/images/`) |
| Tracking de conversão (para Performance Max / Smart Shopping) | ⚠️ Parcial — `view_item`/`add_to_cart` (ver [analytics-events.md](../analytics-events.md) e [gtm-setup.md](gtm-setup.md)) |

---

## 4. Atributos obrigatórios ausentes (resumo para ação)

| Atributo GMC | Obrigatório? | Status atual | Ação recomendada |
|---|---|---|---|
| `id` | Obrigatório | ✅ (usar `slug`) | Nenhuma |
| `title` | Obrigatório | ✅ | Enriquecer com material/tamanho (ver Seção 5) |
| `description` | Obrigatório | ⚠️ Curta | Expandir para 500+ caracteres com material, dimensões, cuidados |
| `link` | Obrigatório | ⚠️ Funciona, mas canonical inconsistente | Corrigir canonical dinâmico (3.3) antes de submeter o feed |
| `image_link` | Obrigatório | ✅ (1 por produto) | OK, mas resolução mín. 800×800 recomendada — validar arquivos |
| `additional_image_link` | Opcional, mas recomendado | ❌ | Adicionar 2–3 imagens por produto (lifestyle, detalhe, embalagem) |
| `availability` | Obrigatório | ✅ (`inStock`) | Mapear `true→in stock`, `false→out of stock` |
| `price` | Obrigatório | ✅ (após `parsePrice`) | Formatar como `"120.00 BRL"` no feed |
| `brand` | Obrigatório (categorias de moda/casa geralmente exigem) | ❌ | Fixar `"Tramatto"` para todos os itens |
| `condition` | Obrigatório | ❌ | Fixar `"new"` |
| `google_product_category` | Obrigatório (ou `product_type`) | ❌ | Definir categoria do Google Taxonomy (Seção 5) |
| `product_type` | Recomendado | ❌ | Usar `collectionId` + `title` (Seção 5) |
| `gtin` | Condicional | ❌ | Se não houver GTIN real, declarar `identifier_exists: false` |
| `mpn` | Condicional | ❌ | Pode-se usar o próprio `slug` como MPN interno |
| `identifier_exists` | Condicional | ❌ | Definir `false` enquanto não houver GTIN |
| `shipping` / `shipping_weight` | Recomendado | ❌ | Configurar via **Configurações de envio da conta** (mais simples que no feed) |

---

## 5. Feed otimizado (amostra)

Arquivo gerado: [`docs/merchant-center-feed-sample.tsv`](merchant-center-feed-sample.tsv)
— formato TSV (separado por tabulação), compatível com upload manual/agendado
no Merchant Center (Content API ou Planilhas Google também aceitam este
layout de colunas).

> ⚠️ Esta é uma **amostra de referência**, gerada a partir dos dados atuais de
> `catalog-data.js`. Antes de usar em produção:
> 1. Corrigir o `canonical` dinâmico em `product.html` (Seção 3.3) — os links
>    abaixo assumem que isso foi corrigido.
> 2. Validar/ajustar `google_product_category` (categoria sugerida abaixo
>    precisa ser confirmada contra o arquivo oficial de taxonomia do Google:
>    `https://www.google.com/basepages/producttype/taxonomy-with-ids.en-US.txt`).
> 3. Adicionar imagens adicionais reais (`additional_image_link`).
> 4. Decidir sobre GTIN/MPN (produtos artesanais sem código de barras → manter
>    `identifier_exists = no`).

### 5.1 Mapeamento campo a campo

| Campo do feed | Origem no código | Transformação aplicada |
|---|---|---|
| `id` | `product.slug` | Usado como identificador único e estável |
| `title` | `product.title` + variante principal | `"{title} – {variants[0].color} {variants[0].size}"` para incluir atributo no título |
| `description` | `product.description` + `highlights[]` | Concatenado: descrição + lista de destaques, formando texto mais longo e rico |
| `link` | `https://tramatto.com/product.html?slug={slug}` | Requer canonical dinâmico correspondente (Seção 3.3) |
| `image_link` | `https://tramatto.com/{gallery[0]}` | URL absoluta da imagem principal |
| `additional_image_link` | — | **Vazio na amostra** — placeholder para imagens futuras (Seção 6) |
| `availability` | `product.inStock` | `true → in stock`, `false → out of stock` |
| `price` | `product.getPrimaryPrice()` | Formatado `"{valor}.00 BRL"` |
| `brand` | constante | `"Tramatto"` para todos os itens |
| `condition` | constante | `"new"` para todos os itens |
| `google_product_category` | constante (por linha de produto) | `"Home & Garden > Kitchen & Dining > Kitchen & Dining Linens > Dish Towels"` (validar ID na taxonomia) |
| `product_type` | `collectionId` + `title` | `"Panos de Prato > {Essentials\|Signature} > {title}"` |
| `identifier_exists` | constante | `"no"` (sem GTIN/MPN cadastrados) |

### 5.2 Tabela de visualização (4 produtos)

| id | title | price | availability | brand | condition | google_product_category | product_type |
|---|---|---|---|---|---|---|---|
| `linho-anatoliano` | Linho Anatoliano – Branco natural 45×70cm | 120.00 BRL | in stock | Tramatto | new | Home & Garden > Kitchen & Dining > Kitchen & Dining Linens > Dish Towels | Panos de Prato > Essentials > Linho Anatoliano |
| `borda-dourada` | Borda Dourada – Areia 45×70cm | 120.00 BRL | in stock | Tramatto | new | Home & Garden > Kitchen & Dining > Kitchen & Dining Linens > Dish Towels | Panos de Prato > Signature > Borda Dourada |
| `listrado-classico` | Listrado Clássico – Branco 45×70cm | 120.00 BRL | in stock | Tramatto | new | Home & Garden > Kitchen & Dining > Kitchen & Dining Linens > Dish Towels | Panos de Prato > Essentials > Listrado Clássico |
| `jacquard-ottomano` | Jacquard Ottomano – Creme 45×70cm | 120.00 BRL | **out of stock** | Tramatto | new | Home & Garden > Kitchen & Dining > Kitchen & Dining Linens > Dish Towels | Panos de Prato > Signature > Jacquard Ottomano |

(arquivo TSV completo com todas as colunas em
[`merchant-center-feed-sample.tsv`](merchant-center-feed-sample.tsv))

---

## 6. Plano de implementação

### Fase 1 — Pré-requisitos de conta (bloqueantes, fazer primeiro)

1. **Adicionar CNPJ, razão social e endereço** no rodapé/política (já é o
   item #4 do [master-roadmap](master-roadmap.md)) — exigido na verificação
   de identidade da conta Merchant Center.
2. **Verificar e reivindicar o domínio `tramatto.com`** no Merchant Center
   (via Search Console, já que `<link rel="canonical">` e meta tags indicam
   site configurado para SEO).
3. **Confirmar política de devolução/reembolso** (`pages/shipping.html`) está
   acessível e linkável a partir de todas as páginas (rodapé).

### Fase 2 — Correções estruturais no site (bloqueiam aprovação de itens)

4. **Canonical dinâmico por produto** em `product.html` — atualizar
   `<link rel="canonical">` via JS (mesmo padrão de `injectProductSchema`)
   para `https://tramatto.com/product.html?slug={slug}`.
5. **Open Graph dinâmico por produto** — `og:title`, `og:description`,
   `og:image`, `og:url` gerados junto com `injectProductSchema()`.
6. **Open Graph em `collection.html`** — tags estáticas básicas (`og:title`,
   `og:description`, `og:image` genérico da coleção).
7. **Adicionar URLs de produto ao `sitemap.xml`** (uma entrada por `slug`) —
   gerar dinamicamente ou manter lista manual sincronizada com
   `catalog-data.js`.

### Fase 3 — Enriquecimento de dados do catálogo

8. **Adicionar campos ao `catalog-data.js`** (e `domain-model.js`):
   - `brand: "Tramatto"` (pode ser constante global em vez de por produto)
   - `condition: "new"` (idem)
   - `googleProductCategory` (string da taxonomia)
   - `productType` (derivado de `collectionId` + `title`, ou campo próprio)
   - `mpn` (usar o próprio `slug` em maiúsculas, ex.: `LINHO-ANATOLIANO`)
9. **Expandir `description`** de cada produto (material, dimensões, modo de
   uso/cuidado) — beneficia tanto SEO quanto qualidade do anúncio.
10. **Adicionar 2–3 imagens por produto** em `gallery[]` (`additional_image_link`)
    — fotos de detalhe, lifestyle, embalagem.

### Fase 4 — Geração e publicação do feed

11. **Gerar feed real** (script Node simples) a partir de `catalog-data.js` +
    novos campos da Fase 3, no formato TSV/XML, publicando em uma URL
    acessível (ex.: `https://tramatto.com/feeds/products.tsv`) para
    **busca agendada** no Merchant Center, ou usar **Content API for
    Shopping** futuramente quando houver backend.
12. **Configurar frete na conta Merchant Center** (Configurações → Envio) em
    vez de no feed — mais simples para catálogo pequeno e homogêneo.

### Fase 5 — Tracking e otimização (Performance Max / Smart Shopping)

13. Implementar `add_to_cart` e `begin_checkout` (ver
    [gtm-setup.md, Seção 7](gtm-setup.md#7-eventos-adicionais-recomendados-funil-de-ecommerce-ga4))
    — necessários para campanhas Performance Max baseadas em conversões.
14. Vincular conta GA4 ↔ Google Ads ↔ Merchant Center para remarketing
    dinâmico usando os dados de `view_item`/`view_item_list` já implementados.

---

## 7. Checklist técnico

### Conta / Negócio
- [ ] CNPJ, razão social e endereço publicados no site
- [ ] Domínio `tramatto.com` verificado e reivindicado no Merchant Center
- [ ] Política de devolução/reembolso linkada no rodapé de todas as páginas
- [ ] Política de privacidade linkada no rodapé de todas as páginas
- [ ] Configuração de frete definida na conta (Configurações → Envio)

### Site / SEO
- [ ] `canonical` dinâmico por produto em `product.html`
- [ ] Open Graph completo em `product.html` (por produto) e `collection.html`
- [ ] `sitemap.xml` inclui uma URL por `slug` de produto
- [ ] Product Schema (`JSON-LD`) inclui `brand`, `sku`, `mpn`/`gtin` (ou
      `identifier_exists: false`)

### Catálogo / Dados
- [ ] Todos os produtos têm `brand = "Tramatto"`
- [ ] Todos os produtos têm `condition = "new"`
- [ ] Todos os produtos têm `google_product_category` válido (verificado
      contra a taxonomia oficial)
- [ ] Todos os produtos têm `product_type` definido
- [ ] Todos os produtos têm `identifier_exists` definido (provavelmente `no`)
- [ ] Cada produto tem ao menos 1 `image_link` válido (≥ 800×800px) e,
      idealmente, 1–3 `additional_image_link`
- [ ] `description` de cada produto tem 300+ caracteres com detalhes
      (material, dimensões, cuidados)
- [ ] Produto `jacquard-ottomano` (sem estoque) está corretamente marcado
      `out of stock` no feed

### Feed
- [ ] Feed gerado em formato aceito (TSV ou XML) — amostra em
      [`merchant-center-feed-sample.tsv`](merchant-center-feed-sample.tsv)
- [ ] Feed publicado em URL acessível para busca agendada, **ou** plano para
      Content API
- [ ] `price`/`availability` do feed conferem com os exibidos em `product.html`
      no momento da submissão

### Tracking
- [ ] Eventos `view_item` e `view_item_list` validados (já implementados —
      ver [analytics-events.md](../analytics-events.md))
- [ ] Evento `add_to_cart` implementado (ver
      [gtm-setup.md §7.2](gtm-setup.md#72-add_to_cart--prioridade-1-baixo-esforço))
- [ ] Conta Google Ads vinculada ao Merchant Center e ao GA4

---

## 8. Próximos passos sugeridos (ordem de execução)

1. Fase 1 (itens 1–3) — pré-requisitos de conta, podem ser feitos em paralelo
   com o restante.
2. Fase 2, item 4 (canonical dinâmico) — **maior bloqueador técnico**, baixo
   esforço, alto impacto (também corrige SEO, já listado no roadmap #15).
3. Fase 3, itens 8–9 — enriquecer `catalog-data.js` com `brand`, `condition`,
   `google_product_category`, `product_type`, `description` mais longa.
4. Fase 4, item 11 — gerar o feed real e submeter no Merchant Center
   (modo "rascunho"/teste antes de publicar a conta).
5. Fases 2 (itens 5–7) e 5 — refinamentos de SEO/Schema e tracking, em
   paralelo com a revisão dos primeiros itens pelo Google.
