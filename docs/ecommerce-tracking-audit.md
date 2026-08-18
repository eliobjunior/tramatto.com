# Ecommerce Tracking — Auditoria Completa (Tramatto)

**Data:** 2026-06-16
**Escopo:** GA4 Ecommerce Funnel via GTM-W7NZMTL7 (G-13KSN16JDG)
**Metodologia:** leitura de analytics.js, script.js, domain-model.js, catalog-data.js, adapters.js, services.js, gtm-config.json, analytics-events.md

---

## 1. Resumo Executivo

**Última atualização:** 2026-06-16 — Fase A implementada.

| Evento GA4 | Status | Implementável sem Nuvemshop |
|---|---|---|
| `page_view` | ✅ Implementado (completo) | — |
| `view_item_list` | ✅ Implementado (completo) | — |
| `view_item` | ✅ Implementado (completo) | — |
| `select_item` | ✅ Implementado — **GTM pendente** (criar trigger + tag) | — |
| `add_to_cart` | ✅ Implementado — **GTM pendente** (criar trigger + tag) | — |
| `remove_from_cart` | 🔴 Ausente | Não (depende da UI de carrinho) |
| `view_cart` | 🔴 Ausente | Não (depende da UI de carrinho) |
| `begin_checkout` | 🔴 Ausente | Parcialmente (depende do bridge WhatsApp) |
| `purchase` | 🔴 Ausente | Não (depende de checkout real) |
| `search` | ✅ Implementado (completo) | — |
| `click_whatsapp` | ✅ Implementado (completo) | — |

**Funnel coberto após Fase A:** `view_item_list` → `select_item` → `view_item` → `add_to_cart` → ~~view_cart~~ → ~~purchase~~

**Funnel GA4 completo necessário:** `view_item_list` → `select_item` → `view_item` → `add_to_cart` → `view_cart` → `begin_checkout` → `purchase`

---

## 2. Descoberta Crítica — Preços São Numéricos

`catalog-data.js` armazena preços como strings (`"R$ 120,00"`), mas `adapters.js:MockAdapter` aplica `parsePrice()` antes de instanciar os objetos de domínio:

```js
// adapters.js:9-12
function parsePrice(value) {
  const normalized = String(value).replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.');
  return Number(normalized) || 0; // "R$ 120,00" → 120
}
```

`CartService.addToCart()` em `services.js:118` também faz `Number(...)` explícito. **Conclusão: todos os preços chegam como `number` ao analytics — sem risco de valor string no dataLayer.**

---

## 3. Auditoria Evento a Evento

---

### 3.1 `view_item_list` (mapeado de `view_collection`)

**Status:** 🟡 Parcial — implementado, mas com parâmetros GA4 faltando

**Fluxo:**
```
script.js:renderCollectionPage()
  → dispatchViewCollection(products)
      → CustomEvent 'tramatto:view_collection'
          → analytics.js:initViewCollectionTracking()
              → trackEcommerce('view_collection', {...})
                  → window.dataLayer.push(...)
```

**dataLayer enviado (atual):**
```js
{ ecommerce: null }
{
  event: 'view_collection',
  ecommerce: {
    item_list_name: 'Coleção Premium',
    items: [
      {
        item_id: 'linho-anatoliano',   // slug
        item_name: 'Linho Anatoliano',
        price: 120,                    // ✅ number
        index: 0
      },
      // ... demais produtos
    ]
  },
  page_location: 'https://tramatto.com/collection.html',
  page_path: '/collection.html',
  page_title: 'Coleção — Tramatto'
}
```

**GTM:**
- Trigger: `CE - view_collection` ✅ configurado
- Tag: `GA4 Event - view_item_list` ✅ configurada (sendEcommerceData: true)

**Lacunas:**

| Campo | Status | Disponibilidade |
|---|---|---|
| `ecommerce.item_list_id` | ❌ Ausente | `product.collectionId` disponível |
| `ecommerce.currency` | ❌ Ausente | Hardcoded `'BRL'` |
| `items[].item_brand` | ❌ Ausente | `product.brand = 'Tramatto'` disponível |
| `items[].item_category` | ❌ Ausente | `product.googleProductCategory` disponível |
| `items[].quantity` | ❌ Ausente | Default `1` |
| `item_list_name` na busca | ⚠️ Fixo | Não distingue "resultado de busca" vs. "listagem completa" |

**Comportamento correto:** Re-dispara após busca (`initCollectionSearch`) — lista filtrada atualiza o ecommerce corretamente.

---

### 3.2 `view_item` (mapeado de `view_product`)

**Status:** 🟡 Parcial — implementado, mas com parâmetros GA4 faltando

**Fluxo:**
```
script.js:renderProductDetail()
  → dispatchViewProduct(product, selectedVariant)
      → CustomEvent 'tramatto:view_product'
          → analytics.js:initViewProductTracking()
              → trackEcommerce('view_product', {...})
                  → window.dataLayer.push(...)
```

**dataLayer enviado (atual):**
```js
{ ecommerce: null }
{
  event: 'view_product',
  ecommerce: {
    currency: 'BRL',
    value: 120,              // ✅ number via parsePrice
    items: [
      {
        item_id: 'linho-anatoliano',
        item_name: 'Linho Anatoliano',
        item_variant: 'Branco natural',
        price: 120           // ✅ number
      }
    ]
  },
  page_location: 'https://tramatto.com/product.html?slug=linho-anatoliano',
  page_path: '/product.html',
  page_title: 'Linho Anatoliano | Panos de Prato Premium | Tramatto'
}
```

**GTM:**
- Trigger: `CE - view_product` ✅ configurado
- Tag: `GA4 Event - view_item` ✅ configurada (sendEcommerceData: true)

**Lacunas:**

| Campo | Status | Disponibilidade |
|---|---|---|
| `items[].item_brand` | ❌ Ausente | `product.brand = 'Tramatto'` disponível |
| `items[].item_category` | ❌ Ausente | `product.googleProductCategory` disponível |
| `items[].quantity` | ❌ Ausente | Default `1` |
| `items[].item_list_name` | ❌ Ausente | Relevante para funil cross-page |
| `items[].item_list_id` | ❌ Ausente | Idem |

**Comportamento especial:** Re-dispara ao trocar variante (correto — reflete PDP atualizada). Sem deduplicação, cada troca de variante gera um `view_item`.

---

### 3.3 `select_item`

**Status:** 🔴 Ausente — não existe nenhuma instrumentação

**Onde deveria disparar:** clique no card de produto (`<a class="product-card-link">`) em `collection.html` e na grade da home (`index.html`).

**Código atual (`script.js:108-128`):**
```js
container.innerHTML = items.map((product) => `
  <article class="product-card">
    <a href="product.html?slug=${product.slug}" class="product-card-link">
    <!-- ↑ Navegação sem analytics -->
```

Nenhum listener de clique no link. O botão "Adicionar" tem listener mas não emite analytics.

**dataLayer esperado:**
```js
{ ecommerce: null }
{
  event: 'select_item',
  ecommerce: {
    item_list_name: 'Coleção Premium',  // última list name ativa
    items: [{
      item_id: product.slug,
      item_name: product.title,
      item_brand: product.brand,
      price: product.getPrimaryPrice(),
      index: <posição no grid>
    }]
  },
  page_location, page_path, page_title
}
```

**GTM Trigger:** AUSENTE (listado em `plannedFutureEvents` no gtm-config.json)

**Dependências:** NENHUMA — implementável agora.

**Impacto da ausência:** impossível medir qual produto o usuário escolheu ver na PDP, quebrando o funil `view_item_list → select_item → view_item`.

---

### 3.4 `add_to_cart`

**Status:** 🔴 Ausente — função de negócio existe, analytics ausente

**Onde é chamado (`script.js`):**
1. Botão "Adicionar" nos cards da grade da coleção/home (linha 131-138)
2. Botão "Adicionar à sacola" nos Kits (linha 216-224)
3. Botão "Adicionar à sacola" na PDP/product.html (linha 302-308)

**Código atual (`script.js:98-103`):**
```js
async function addToCart(product, variant = null) {
  const app = getAppState();
  await app.services.cartService.addToCart(product, variant, 1);
  updateCartBadge();
  showToast(`${product.title} adicionado à sacola`);
  // ← zero analytics aqui
}
```

**`CartService.addToCart()` em `services.js:111-124`** — persiste no localStorage com `lineId = ${product.slug}-${variant?.id || 'default'}` e `price: Number(...)`. Todos os dados necessários estão disponíveis neste ponto.

**dataLayer esperado:**
```js
{ ecommerce: null }
{
  event: 'add_to_cart',
  ecommerce: {
    currency: 'BRL',
    value: 120,    // Number(variant?.getPrimaryPrice() || product.getPrimaryPrice())
    items: [{
      item_id: 'linho-anatoliano',
      item_name: 'Linho Anatoliano',
      item_brand: 'Tramatto',
      item_variant: 'Branco natural',
      price: 120,
      quantity: 1
    }]
  },
  page_location, page_path, page_title
}
```

**GTM Trigger:** AUSENTE (listado em `plannedFutureEvents`)

**Dependências:** NENHUMA — implementável agora.

**Impacto da ausência:** impossível medir taxa de conversão produto→carrinho. Meta Pixel `AddToCart` (evento padrão de alto valor) também bloqueado.

---

### 3.5 `remove_from_cart`

**Status:** 🔴 Ausente — `CartService.removeFromCart()` existe, UI inexistente, analytics ausente

**Situação:** `services.js:126-130` tem `removeFromCart(lineId)` funcional, mas não há UI que permita ao usuário remover itens (sem drawer, sem página de carrinho). A função não é chamada em nenhum lugar do `script.js`.

**GTM Trigger:** AUSENTE (listado em `plannedFutureEvents`)

**Dependências:** Depende do Roadmap #3 (carrinho visível / drawer).

---

### 3.6 `view_cart`

**Status:** 🔴 Ausente — UI inexistente, analytics ausente

**Situação:** o carrinho existe apenas como objeto em memória/localStorage (via `CartService`). Não existe drawer, modal, nem página de sacola. `updateCartBadge()` apenas exibe o contador no nav.

**GTM Trigger:** AUSENTE

**Dependências:** Depende do Roadmap #3 (carrinho visível / drawer).

---

### 3.7 `begin_checkout`

**Status:** 🔴 Ausente — sem fluxo de checkout, sem analytics

**Situação:** não existe botão de finalizar compra, redirect para Nuvemshop, nem link WhatsApp para pedido. O Roadmap #3 (bridge WhatsApp) representaria o início do checkout quando implementado — o `begin_checkout` deveria disparar nesse momento.

**GTM Trigger:** AUSENTE

**Dependências:** Depende do Roadmap #3 (mínimo: bridge WhatsApp) ou #19-21 (Nuvemshop real).

---

### 3.8 `purchase`

**Status:** 🔴 Ausente — sem fluxo de confirmação de pedido, sem analytics

**Situação:** não existe página de order confirmation, obrigado, ou qualquer ponto de confirmação de venda.

**GTM Trigger:** AUSENTE

**Dependências:** Depende do Roadmap #21 (estratégia de checkout real — Nuvemshop hospedado ou próprio).

---

### 3.9 `search`

**Status:** ✅ Implementado — completo para o escopo atual

**Fluxo:**
```
script.js:initCollectionSearch() → input event
  → CustomEvent 'tramatto:search' (search_term, results_count)
      → analytics.js:initSearchTracking()
          → track('search', {...})
              → window.dataLayer.push(...)
```

**dataLayer enviado:**
```js
{
  event: 'search',
  search_term: 'linho',
  results_count: 2,
  page_location: 'https://tramatto.com/collection.html',
  page_path: '/collection.html',
  page_title: 'Coleção — Tramatto'
}
```

**GTM:**
- Trigger: `CE - search` ✅
- Tag: `GA4 Event - search` ✅ (mapeando `search_term`, `results_count`)

**Comportamento correto:** o evento `search` é seguido de `view_collection` re-disparado com os itens filtrados — a dupla search + view_item_list funciona corretamente.

**Lacunas menores:** não dispara quando o campo é limpo (retorno à lista completa sem evento de search); `results_count: 0` funciona e captura buscas sem resultado.

---

### 3.10 `click_whatsapp`

**Status:** ✅ Implementado — completo

**Fluxo:**
```
analytics.js:initWhatsappTracking()
  → document click delegation
      → a[href*="wa.me"], a[href*="api.whatsapp.com"], .whatsapp-float
          → track('click_whatsapp', {...})
```

**dataLayer enviado:**
```js
{
  event: 'click_whatsapp',
  link_url: 'https://wa.me/5511999999999',
  link_text: 'WhatsApp',
  page_location, page_path, page_title
}
```

**GTM:**
- Trigger: `CE - click_whatsapp` ✅
- Tag: `GA4 Event - click_whatsapp` ✅

**Observação:** o número atual pode ser placeholder (Roadmap #1). O evento capturará o número real sem alteração no código analytics.

---

## 4. Mapa de Dependências

```
Implementável SEM Nuvemshop (agora):
  ├── select_item           → adicionar listener no product-card-link
  ├── add_to_cart           → adicionar dispatchAddToCart() em script.js:addToCart()
  ├── view_item (melhorias) → adicionar item_brand, item_category, quantity
  └── view_item_list (melhoria) → adicionar item_list_id, currency, item_brand

Depende do Roadmap #3 (carrinho drawer):
  ├── view_cart
  └── remove_from_cart

Depende do Roadmap #3 ou #21 (checkout):
  └── begin_checkout

Depende exclusivamente do Roadmap #21 (checkout real):
  └── purchase
```

---

## 5. GTM — Estado dos Triggers e Tags

### Triggers existentes (reutilizáveis)
| Trigger | Status | Usado por |
|---|---|---|
| `CE - click_whatsapp` | ✅ Publicado | GA4, Meta Pixel (futuro) |
| `CE - click_instagram` | ✅ Publicado | GA4, Meta Pixel (futuro) |
| `CE - click_ver_colecao` | ✅ Publicado | GA4, Meta Pixel (futuro) |
| `CE - scroll_90` | ✅ Publicado | GA4 |
| `CE - view_collection` | ✅ Publicado | GA4 (`view_item_list`) |
| `CE - view_product` | ✅ Publicado | GA4 (`view_item`) |
| `CE - search` | ✅ Publicado | GA4 |

### Triggers faltando
| Trigger | Evento | Dependência |
|---|---|---|
| `CE - select_item` | `select_item` | Nenhuma |
| `CE - add_to_cart` | `add_to_cart` | Nenhuma |
| `CE - remove_from_cart` | `remove_from_cart` | Roadmap #3 |
| `CE - view_cart` | `view_cart` | Roadmap #3 |
| `CE - begin_checkout` | `begin_checkout` | Roadmap #3 ou #21 |
| `CE - purchase` | `purchase` | Roadmap #21 |

---

## 6. Qualidade do Data Layer Existente

| Aspecto | Avaliação |
|---|---|
| Limpeza de ecommerce antes de push | ✅ Correta (`{ecommerce: null}`) |
| Preços como number | ✅ Garantido por `parsePrice()` no adapter |
| Moeda (`BRL`) | ✅ Presente em `view_product`, ausente em `view_collection` |
| Contexto de página (location/path/title) | ✅ Consistente em todos os eventos |
| Arquitetura desacoplada (DOM events) | ✅ Boa separação script.js → analytics.js |
| `item_brand` nos eventos | ❌ Ausente (disponível no domain model) |
| `item_category` nos eventos | ❌ Ausente (disponível no domain model) |
| `quantity` nos eventos de item | ❌ Ausente |
| IDs de produto (slugs) | ✅ Consistentes entre pages |

---

## 7. Conclusão

**O que funciona bem:**
- Infraestrutura GTM completa e corretamente instalada em todas as páginas
- Camada de analytics desacoplada via Custom DOM Events — escalável
- `search` e `click_whatsapp` são completos e confiáveis
- Preços chegam corretamente como number no dataLayer
- Triggers do GTM reutilizáveis para Meta Pixel (sem duplicação)

**O que bloqueia o "Ecommerce Tracking Completo":**
1. `select_item` e `add_to_cart` ausentes — implementáveis agora, sem dependência externa
2. `view_cart`, `remove_from_cart`, `begin_checkout` bloqueados pela ausência de UI de carrinho (Roadmap #3)
3. `purchase` bloqueado pelo checkout real (Roadmap #21)
4. `view_item` e `view_item_list` incompletos nos parâmetros de item (brand, category, quantity)
