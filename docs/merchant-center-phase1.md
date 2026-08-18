# Tramatto — Fase 1: Implementação Merchant Center

**Data:** 2026-06-15
**Base:** [docs/merchant-center.md](merchant-center.md) (auditoria e plano)
**Objetivo:** corrigir os bloqueadores técnicos mais críticos identificados na
auditoria — canonical dinâmico, Product Schema completo, Open Graph por
produto e atributos de categorização/identidade de marca no catálogo.

---

## 1. O que foi implementado

### 1.1 Canonical dinâmico em `product.html`

- `product.html`: o `<link rel="canonical">` recebeu `id="canonicalLink"` e
  passou a ser **atualizado via JS** a cada renderização de produto.
- `script.js` → nova função `updateCanonicalUrl(slug)`, chamada por
  `renderProductDetail()`, define:
  ```
  https://tramatto.com/product.html?slug={slug}
  ```
- **Resultado:** cada produto (`linho-anatoliano`, `borda-dourada`,
  `listrado-classico`, `jacquard-ottomano`) agora tem uma URL canônica
  **única e correspondente ao seu próprio `link`** — resolve a duplicidade
  identificada na auditoria (Seção 3.3) e desbloqueia o requisito de
  "link do feed = página canônica única" do Merchant Center.

### 1.2 Product Schema (JSON-LD) completo em todas as PDPs

`script.js` → `injectProductSchema(product, variant)` foi expandido. Antes
incluía apenas `name`, `description`, `image` e `offers` básicos. Agora
inclui:

| Campo novo | Origem | Por quê |
|---|---|---|
| `sku` | `product.slug` | Identificador interno do produto |
| `mpn` | `product.slug.toUpperCase()` | Part number interno (Merchant Center aceita MPN+brand como identificador) |
| `brand.name` | `product.brand` (novo campo, catalog-data.js) | Obrigatório para a maioria das categorias no GMC e ajuda em rich results |
| `category` | `product.googleProductCategory` ou `product.productType` (novos campos) | Contextualiza o produto para o Google |
| `itemCondition` (produto e oferta) | `product.condition` mapeado via `SCHEMA_CONDITION_MAP` | `new` → `https://schema.org/NewCondition` |
| `offers.url` | URL canônica do produto (`?slug=...`) | Liga a oferta à página correta |
| `image` | Todas as imagens de `product.gallery`, convertidas para **URL absoluta** (`https://tramatto.com/...`) | Antes usava caminhos relativos, inválidos em JSON-LD/feeds |

A função `toAbsoluteUrl()` (nova, no topo de `script.js`) converte qualquer
caminho relativo (`assets/images/...`) em URL absoluta
(`https://tramatto.com/assets/images/...`), e é reaproveitada também pelo
Open Graph (1.3).

### 1.3 Open Graph dinâmico em `product.html`

- Adicionado ao `<head>` de `product.html` um conjunto completo de meta tags
  Open Graph + Twitter Card com **valores padrão estáticos** (fallback antes
  do JS rodar) e `id` para atualização posterior:
  - `og:type` (`product`), `og:url`, `og:title`, `og:description`,
    `og:image` (+ `og:image:type/width/height`), `og:locale`, `og:site_name`
  - `product:brand`, `product:availability`, `product:condition`,
    `product:price:amount`, `product:price:currency`
  - `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`
- `script.js` → nova função `updateProductOpenGraph(product, variant)`,
  chamada por `renderProductDetail()`, atualiza via `setMetaContent()`:
  - `og:title` / `twitter:title` → `"{título do produto} | Tramatto"`
  - `og:description` / `twitter:description` → descrição do produto
  - `og:image` / `twitter:image` → primeira imagem da galeria (URL absoluta)
  - `og:url` → URL canônica do produto
  - `product:brand`, `product:availability` (`in stock`/`out of stock`),
    `product:condition`, `product:price:amount`

**Resultado:** compartilhar o link de um produto específico (WhatsApp,
Instagram, etc.) agora mostra título, imagem e descrição **daquele produto**,
em vez dos valores genéricos de `product.html`.

### 1.4 Novos campos no catálogo (`catalog-data.js`)

Cada um dos 4 produtos recebeu:

| Produto | `brand` | `condition` | `productType` | `googleProductCategory` |
|---|---|---|---|---|
| `linho-anatoliano` | Tramatto | new | Panos de Prato > Essentials > Linho Anatoliano | Home & Garden > Kitchen & Dining > Kitchen & Dining Linens > Dish Towels |
| `borda-dourada` | Tramatto | new | Panos de Prato > Signature > Borda Dourada | Home & Garden > Kitchen & Dining > Kitchen & Dining Linens > Dish Towels |
| `listrado-classico` | Tramatto | new | Panos de Prato > Essentials > Listrado Clássico | Home & Garden > Kitchen & Dining > Kitchen & Dining Linens > Dish Towels |
| `jacquard-ottomano` | Tramatto | new | Panos de Prato > Signature > Jacquard Ottomano | Home & Garden > Kitchen & Dining > Kitchen & Dining Linens > Dish Towels |

> ⚠️ `google_product_category` usa o **nome textual** da categoria do Google
> Product Taxonomy. Antes de gerar o feed final, validar o texto/ID exato
> contra
> `https://www.google.com/basepages/producttype/taxonomy-with-ids.en-US.txt`
> (apontado na auditoria original).

### 1.5 `domain-model.js` — suporte aos novos campos

`class Product` (em `js/domain-model.js`) agora define, com defaults seguros:

```js
this.brand = data.brand || 'Tramatto';
this.condition = data.condition || 'new';
this.productType = data.productType || '';
this.googleProductCategory = data.googleProductCategory || '';
```

- **Retrocompatível:** produtos sem esses campos (ex.: dados vindos futuramente
  do `mapper.js`/Nuvemshop antes de serem atualizados) recebem `brand:
  "Tramatto"` e `condition: "new"` automaticamente, evitando regressões.
- `MockAdapter` (`js/adapters.js`) já espalha (`...item`) todos os campos de
  `catalog-data.js` ao construir `new Domain.Product()`, então os 4 novos
  campos chegam ao domínio sem nenhuma alteração no adapter.

---

## 2. Diff completo

### `catalog-data.js`
```diff
       slug: 'linho-anatoliano',
       description: 'Um tecido leve e sofisticado, pensado para quem valoriza textura, durabilidade e presença em cada detalhe da cozinha.',
       highlights: ['Algodão egípcio de fibra longa', 'Acabamento à mão', 'Ideal para uso diário'],
+      brand: 'Tramatto',
+      condition: 'new',
+      productType: 'Panos de Prato > Essentials > Linho Anatoliano',
+      googleProductCategory: 'Home & Garden > Kitchen & Dining > Kitchen & Dining Linens > Dish Towels',
       inStock: true,
@@
       slug: 'borda-dourada',
       description: 'Uma peça de caráter, com acabamento discreto e personalidade marcante para mesas mais elegantes.',
       highlights: ['Padrão delicado', 'Tonalidade neutra', 'Excelente para presentear'],
+      brand: 'Tramatto',
+      condition: 'new',
+      productType: 'Panos de Prato > Signature > Borda Dourada',
+      googleProductCategory: 'Home & Garden > Kitchen & Dining > Kitchen & Dining Linens > Dish Towels',
       inStock: true,
@@
       slug: 'listrado-classico',
       description: 'A combinação perfeita entre tradição e modernidade, com linhas que trazem movimento à decoração.',
       highlights: ['Estampa clássica', 'Boa absorção', 'Versátil para diferentes estilos'],
+      brand: 'Tramatto',
+      condition: 'new',
+      productType: 'Panos de Prato > Essentials > Listrado Clássico',
+      googleProductCategory: 'Home & Garden > Kitchen & Dining > Kitchen & Dining Linens > Dish Towels',
       inStock: true,
@@
       slug: 'jacquard-ottomano',
       description: 'Uma peça de coleção, criada para quem quer textura e presença sem perder a delicadeza do cotidiano.',
       highlights: ['Tecido jacquard', 'Design geométrico', 'Alta percepção de luxo'],
+      brand: 'Tramatto',
+      condition: 'new',
+      productType: 'Panos de Prato > Signature > Jacquard Ottomano',
+      googleProductCategory: 'Home & Garden > Kitchen & Dining > Kitchen & Dining Linens > Dish Towels',
       inStock: false,
```

### `js/domain-model.js`
```diff
       this.badge = data.badge || '';
       this.label = data.label || 'Peça premium';
       this.small = data.small || 'Disponível em catalogo';
       this.metadata = data.metadata || {};
+
+      // Atributos para Google Merchant Center / GA4 ecommerce (ver docs/merchant-center.md)
+      this.brand = data.brand || 'Tramatto';
+      this.condition = data.condition || 'new';
+      this.productType = data.productType || '';
+      this.googleProductCategory = data.googleProductCategory || '';
     }
```

### `product.html` (`<head>`)
```diff
   <meta name="robots" content="index, follow" />
-  <link rel="canonical" href="https://tramatto.com/product.html" />
-  <script type="application/ld+json">
-  {
-    "@context": "https://schema.org",
-    "@type": "WebPage",
-    "name": "Produto Tramatto",
-    "url": "https://tramatto.com/product.html"
-  }
-  </script>
+  <link rel="canonical" href="https://tramatto.com/product.html" id="canonicalLink" />
+
+  <!-- Open Graph / WhatsApp / Facebook / LinkedIn (valores padrão; atualizados por produto via script.js) -->
+  <meta property="og:type" content="product" id="ogType">
+  <meta property="og:url" content="https://tramatto.com/product.html" id="ogUrl">
+  <meta property="og:title" content="Tramatto — Produto" id="ogTitle">
+  <meta property="og:description" content="Conheça os panos de prato premium da Tramatto, com acabamento artesanal e materiais selecionados." id="ogDescription">
+  <meta property="og:image" content="https://tramatto.com/tramatto_og.jpg" id="ogImage">
+  <meta property="og:image:type" content="image/jpeg">
+  <meta property="og:image:width" content="1200">
+  <meta property="og:image:height" content="630">
+  <meta property="og:locale" content="pt_BR">
+  <meta property="og:site_name" content="Tramatto">
+  <meta property="product:brand" content="Tramatto" id="ogBrand">
+  <meta property="product:availability" content="in stock" id="ogAvailability">
+  <meta property="product:condition" content="new" id="ogCondition">
+  <meta property="product:price:amount" content="0.00" id="ogPriceAmount">
+  <meta property="product:price:currency" content="BRL">
+
+  <!-- Twitter / X -->
+  <meta name="twitter:card" content="summary_large_image">
+  <meta name="twitter:title" content="Tramatto — Produto" id="twitterTitle">
+  <meta name="twitter:description" content="Conheça os panos de prato premium da Tramatto, com acabamento artesanal e materiais selecionados." id="twitterDescription">
+  <meta name="twitter:image" content="https://tramatto.com/tramatto_og.jpg" id="twitterImage">
+
+  <script type="application/ld+json">
+  {
+    "@context": "https://schema.org",
+    "@type": "WebPage",
+    "name": "Produto Tramatto",
+    "url": "https://tramatto.com/product.html"
+  }
+  </script>
```

### `script.js`
```diff
 let appState = null;
 let currentProductSelection = null;
+
+const SITE_URL = 'https://tramatto.com';
+const DEFAULT_OG_IMAGE = `${SITE_URL}/tramatto_og.jpg`;
+
+// Converte um caminho relativo (ex.: "assets/images/foo.jpg") em URL absoluta do site.
+function toAbsoluteUrl(path) {
+  if (!path) return null;
+  if (/^(https?:)?\/\//i.test(path) || path.startsWith('data:')) return path;
+  return `${SITE_URL}/${path.replace(/^\//, '')}`;
+}
@@
-  injectProductSchema(product);
+  updateCanonicalUrl(product.slug);
+  updateProductOpenGraph(product, selectedVariant);
+  injectProductSchema(product, selectedVariant);
   dispatchViewProduct(product, selectedVariant);
 }
+
+// Corrige o <link rel="canonical"> para apontar para a PDP do produto exibido
+// (cada slug passa a ter sua própria URL canônica, em vez de product.html genérico).
+function updateCanonicalUrl(slug) {
+  const canonical = document.getElementById('canonicalLink');
+  if (canonical) {
+    canonical.href = `${SITE_URL}/product.html?slug=${slug}`;
+  }
+}
+
+// Atualiza as meta tags Open Graph / Twitter Card com os dados do produto exibido.
+function setMetaContent(id, value) {
+  const el = document.getElementById(id);
+  if (el && value !== undefined && value !== null) {
+    el.setAttribute('content', String(value));
+  }
+}
+
+function updateProductOpenGraph(product, variant) {
+  const price = Number(variant?.getPrimaryPrice?.() || variant?.price || product.getPrimaryPrice?.() || product.price || 0);
+  const image = toAbsoluteUrl(product.gallery?.[0]) || DEFAULT_OG_IMAGE;
+  const url = `${SITE_URL}/product.html?slug=${product.slug}`;
+  const title = `${product.title} | Tramatto`;
+
+  setMetaContent('ogUrl', url);
+  setMetaContent('ogTitle', title);
+  setMetaContent('ogDescription', product.description);
+  setMetaContent('ogImage', image);
+  setMetaContent('ogBrand', product.brand);
+  setMetaContent('ogAvailability', product.inStock ? 'in stock' : 'out of stock');
+  setMetaContent('ogCondition', product.condition);
+  setMetaContent('ogPriceAmount', price.toFixed(2));
+  setMetaContent('twitterTitle', title);
+  setMetaContent('twitterDescription', product.description);
+  setMetaContent('twitterImage', image);
+}
@@
-function injectProductSchema(product) {
+// Mapeia o "condition" do feed (Merchant Center) para o vocabulário schema.org
+const SCHEMA_CONDITION_MAP = {
+  new: 'https://schema.org/NewCondition',
+  refurbished: 'https://schema.org/RefurbishedCondition',
+  used: 'https://schema.org/UsedCondition'
+};
+
+function injectProductSchema(product, variant) {
   const existingSchema = document.querySelector('script[data-schema="product"]');
   if (existingSchema) {
     existingSchema.remove();
   }

-  const productSchema = {
+  const price = Number(variant?.getPrimaryPrice?.() || variant?.price || product.getPrimaryPrice?.() || product.price || 0);
+  const images = (product.gallery?.length ? product.gallery : [product.image]).map(toAbsoluteUrl).filter(Boolean);
+  const itemCondition = SCHEMA_CONDITION_MAP[product.condition] || SCHEMA_CONDITION_MAP.new;
+
+  const productSchema = {
     '@context': 'https://schema.org',
     '@type': 'Product',
     name: product.title,
     description: product.description,
-    image: product.gallery || [product.image],
+    image: images.length ? images : [DEFAULT_OG_IMAGE],
+    sku: product.slug,
+    mpn: product.slug.toUpperCase(),
+    brand: { '@type': 'Brand', name: product.brand },
+    category: product.googleProductCategory || product.productType || undefined,
+    itemCondition,
     offers: {
       '@type': 'Offer',
-      priceCurrency: 'BRL',
-      price: product.getPrimaryPrice?.() || product.price || 0,
+      url: `${SITE_URL}/product.html?slug=${product.slug}`,
+      priceCurrency: product.currency || 'BRL',
+      price,
+      itemCondition,
       availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
     }
   };
```

---

## 3. Validação de sintaxe

```
$ node --check script.js          → OK
$ node --check js/domain-model.js → OK
$ node --check catalog-data.js    → OK
```

HTML do `<head>` de `product.html` revisado manualmente — todas as meta tags
e o `<script type="application/ld+json">` permanecem bem formados, com `id`
únicos para cada elemento atualizável via JS.

> Validação adicional recomendada (manual, fora deste ambiente):
> - Rich Results Test do Google para `product.html?slug=linho-anatoliano`
>   (e demais slugs), após publicação.
> - Sharing Debugger (Facebook) / Card Validator (Twitter) para confirmar o
>   Open Graph dinâmico por produto.

---

## 4. Impacto estimado na nota Merchant Center

Recalculando a tabela de pontuação de [merchant-center.md](merchant-center.md#1-nota-de-maturidade-merchant-center-44--100):

| Categoria | Peso | Antes | Depois | Justificativa da mudança |
|---|---|---|---|---|
| Dados básicos de produto (title, description, price, brand, condition, availability) | 20 | 16 | 20 | `brand` e `condition` agora existem em todos os produtos |
| Categorização (`google_product_category`, `product_type`) | 10 | 0 | 9 | Ambos preenchidos para os 4 produtos; -1 por pendência de validação do texto da taxonomia oficial |
| Imagens (`image_link` + `additional_image_link`) | 15 | 6 | 6 | Sem alteração — ainda 1 imagem por produto (Fase 3) |
| Identificadores únicos (GTIN/MPN/`identifier_exists`) | 10 | 0 | 4 | `mpn` e `brand` agora presentes no schema (pode habilitar `identifier_exists: yes` futuramente); GTIN ainda ausente |
| Product Schema (JSON-LD) | 10 | 5 | 9 | Schema agora inclui `sku`, `mpn`, `brand`, `category`, `itemCondition`, `offers.url`, imagens absolutas; -1 por ainda ser client-side-only |
| Open Graph | 10 | 3 | 9 | `product.html` agora tem OG completo e dinâmico por produto; -1 porque `collection.html` ainda não tem OG |
| `canonical` correto por produto | 10 | 2 | 9 | Canonical dinâmico implementado; -1 porque depende de JS (sem SSR/snapshot) |
| URLs indexáveis/sitemap por produto | 10 | 2 | 2 | Sem alteração — `sitemap.xml` ainda não lista `?slug=...` (pendente) |
| Políticas (frete, devolução, dados da empresa) | 10 | 6 | 6 | Sem alteração — CNPJ/endereço ainda pendentes (Fase de pré-requisitos de conta) |
| Tracking de ecommerce (GA4/GTM) | 5 | 4 | 4 | Sem alteração nesta fase |
| **Total** | **100** | **44** | **78** | |

### Nova nota prevista: **≈ 78 / 100**

**Ganho: +34 pontos.**

Maiores avanços vieram de: `brand`/`condition` no catálogo (+4), categorização
completa (+9), Product Schema enriquecido (+4), Open Graph dinâmico (+6) e
canonical corrigido (+7). As maiores lacunas remanescentes — e os principais
candidatos para a Fase 2 — são:

1. **Imagens adicionais por produto** (`additional_image_link`) — maior peso
   ainda não endereçado (15 pts, 6/15).
2. **Sitemap por slug de produto** (10 pts, 2/10).
3. **GTIN ou confirmação formal de `identifier_exists`** (10 pts, 4/10).
4. **CNPJ/razão social/endereço** no site — pré-requisito de conta (10 pts, 6/10).
5. **Open Graph em `collection.html`** e remoção da dependência de JS para
   canonical/schema (SSR/snapshot, item #14 do roadmap) — ganhos marginais em
   "Open Graph" e "canonical".

---

## 5. Próximos passos (Fase 2 sugerida)

Conforme [merchant-center.md, Seção 6](merchant-center.md#6-plano-de-implementação):

- Fase 2, item 7: adicionar URLs `product.html?slug=...` ao `sitemap.xml`.
- Fase 3, item 10: adicionar 2–3 `additional_image_link` por produto em
  `gallery[]`.
- Fase 3, item 9: expandir `description` de cada produto (300+ caracteres,
  material/dimensões/cuidados).
- Fase 1 (pré-requisitos de conta): CNPJ/razão social/endereço no rodapé.
- Gerar o feed real (`docs/merchant-center-feed-sample.tsv` → feed de
  produção) já refletindo `brand`, `condition`, `product_type` e
  `google_product_category` adicionados nesta fase.
