# Ecommerce Tracking — Checklist de Implementação (Tramatto)

> Referência cruzada: [docs/ecommerce-tracking-audit.md](ecommerce-tracking-audit.md)
> Container GTM: `GTM-W7NZMTL7` | GA4: `G-13KSN16JDG`

---

## Visão Geral — O que pode ser feito agora vs. o que está bloqueado

```
FASE A — Implementável agora (sem Nuvemshop, sem dependências externas)
  ├── A1. Enriquecer view_item (brand, category, quantity)
  ├── A2. Enriquecer view_item_list (currency, brand, category, quantity)
  ├── A3. Implementar select_item
  └── A4. Implementar add_to_cart

FASE B — Depende de Roadmap #3 (carrinho visível)
  ├── B1. view_cart
  └── B2. remove_from_cart

FASE C — Depende de Roadmap #3 ou #21 (checkout)
  └── C1. begin_checkout

FASE D — Depende de Roadmap #21 (checkout real + confirmation page)
  └── D1. purchase
```

---

## FASE A — ✅ CONCLUÍDA (2026-06-16)

### A1. Enriquecer `view_item` ✅

**Implementado em:** `script.js` → `dispatchViewProduct()` (campos adicionados: `item_brand`, `item_category`, `quantity`)

- [x] `item_brand: product.brand` → `"Tramatto"`
- [x] `item_category: product.googleProductCategory || product.productType || ''`
- [x] `quantity: 1`
- [ ] **GTM:** validar no Preview Mode — abrir `product.html?slug=linho-anatoliano` e confirmar novos campos

---

### A2. Enriquecer `view_item_list` ✅

**Implementado em:** `script.js` → `dispatchViewCollection()` (campos adicionados: `currency`, `item_list_id`, `item_brand`, `item_category`, `quantity`)

- [x] `currency: 'BRL'` no objeto ecommerce
- [x] `list_id` derivado do `listName`
- [x] `item_brand`, `item_category`, `quantity: 1` em cada item
- [x] `initCollectionSearch()` passa `listName = 'Busca — Coleção'` ao renderizar resultados
- [ ] **GTM:** validar no Preview Mode — abrir `collection.html` e inspecionar ecommerce.items

---

### A3. Implementar `select_item` ✅

**Implementado em:**
- `script.js` → `dispatchSelectItem()` (novo) + listener em `renderProducts()`
- `analytics.js` → `initSelectItemTracking()` (novo), registrado no `DOMContentLoaded`

- [x] `dispatchSelectItem(product, index, listName)` criado
- [x] `list_id` derivado do `listName` via regex
- [x] Listener em `.product-card-link` dentro de `renderProducts()`
- [x] `renderHomeProducts()` passa `'Home — Destaques'`
- [x] `renderCollectionPage()` passa `'Coleção Premium'`
- [x] `initCollectionSearch()` passa `'Busca — Coleção'` nos resultados filtrados
- [x] `initSelectItemTracking()` em `analytics.js`
- [ ] **GTM — PENDENTE:** Criar trigger `CE - select_item` (Custom Event → `select_item`)
- [ ] **GTM — PENDENTE:** Criar tag `GA4 Event - select_item` (sendEcommerceData: true, source: `{{DLV - ecommerce}}`)
- [ ] Validar no GTM Preview Mode: clicar em card de produto e confirmar `select_item` no dataLayer com `item_id`, `item_brand`, `index`
- [ ] Confirmar que a navegação para a PDP ocorre normalmente (listener sem `preventDefault`)

---

### A4. Implementar `add_to_cart` ✅

**Implementado em:**
- `script.js` → `dispatchAddToCart()` (novo) + chamada em `addToCart()`
- `analytics.js` → `initAddToCartTracking()` (novo), registrado no `DOMContentLoaded`

- [x] `dispatchAddToCart(product, variant, quantity)` criado
- [x] `price` calculado via `Number(variant?.getPrimaryPrice?.() || ...)` (garantia numérica)
- [x] `value: price * quantity` calculado corretamente
- [x] Chamada `dispatchAddToCart(product, variant, 1)` em `addToCart()` após `cartService.addToCart()`
- [x] Cobre todos os 3 pontos de entrada: card na coleção, card na home, botão na PDP
- [x] Cobre Kits (`renderKits()` usa `addToCart()` — dispara automaticamente)
- [x] `initAddToCartTracking()` em `analytics.js`
- [ ] **GTM — PENDENTE:** Criar trigger `CE - add_to_cart` (Custom Event → `add_to_cart`)
- [ ] **GTM — PENDENTE:** Criar tag `GA4 Event - add_to_cart` (sendEcommerceData: true, source: `{{DLV - ecommerce}}`)
- [ ] Validar no GTM Preview Mode: clicar "Adicionar" em produto → confirmar `add_to_cart` com `currency`, `value`, `item_id`, `quantity`
- [ ] Testar card na coleção, card na home e botão na PDP

---

## FASE B — Depende do Roadmap #3 (carrinho visível / drawer)

> Estes eventos só fazem sentido quando o carrinho tiver uma UI visível ao usuário.
> Não implementar antes do Roadmap #3 estar concluído.

### B1. `view_cart`

**Quando disparar:** abertura do drawer/modal do carrinho, ou carregamento da página de carrinho.

- [ ] *(Aguarda Roadmap #3)* Criar `dispatchViewCart(cart)` em `script.js`
- [ ] *(Aguarda Roadmap #3)* Adicionar `initViewCartTracking()` em `analytics.js`
- [ ] *(Aguarda Roadmap #3)* Criar trigger `CE - view_cart` no GTM
- [ ] *(Aguarda Roadmap #3)* Criar tag `GA4 Event - view_cart` no GTM
- [ ] Validar com GTM Preview Mode após implementação

**dataLayer esperado:**
```js
{ ecommerce: null }
{
  event: 'view_cart',
  ecommerce: {
    currency: 'BRL',
    value: <total_cart>,
    items: cart.items.map(item => ({
      item_id: item.productId,
      item_name: item.product?.title,
      item_brand: item.product?.brand,
      price: item.price,
      quantity: item.quantity
    }))
  }
}
```

---

### B2. `remove_from_cart`

**Quando disparar:** clique no botão de remover item no drawer/carrinho.

- [ ] *(Aguarda Roadmap #3)* `CartService.removeFromCart()` já existe em `services.js` — apenas adicionar dispatcher
- [ ] *(Aguarda Roadmap #3)* Criar trigger `CE - remove_from_cart` no GTM
- [ ] *(Aguarda Roadmap #3)* Criar tag `GA4 Event - remove_from_cart` no GTM
- [ ] Validar com GTM Preview Mode após implementação

---

## FASE C — Depende do Roadmap #3 ou #21

### C1. `begin_checkout`

**Quando disparar:** clique em "Finalizar pelo WhatsApp" (Roadmap #3 mínimo) ou no botão de checkout (Roadmap #21).

- [ ] *(Aguarda Roadmap #3)* Criar `dispatchBeginCheckout(cart)` em `script.js`
- [ ] *(Aguarda Roadmap #3)* Adicionar `initBeginCheckoutTracking()` em `analytics.js`
- [ ] *(Aguarda Roadmap #3)* Criar trigger `CE - begin_checkout` no GTM
- [ ] *(Aguarda Roadmap #3)* Criar tag `GA4 Event - begin_checkout` no GTM

**dataLayer esperado:**
```js
{ ecommerce: null }
{
  event: 'begin_checkout',
  ecommerce: {
    currency: 'BRL',
    value: <total_cart>,
    items: <cart_items>
  }
}
```

---

## FASE D — Depende do Roadmap #21

### D1. `purchase`

**Quando disparar:** confirmação de pedido — página "Obrigado" ou webhook de confirmação Nuvemshop.

- [ ] *(Aguarda Roadmap #21)* Definir onde ocorre a confirmação (Nuvemshop hospedado vs. custom)
- [ ] *(Aguarda Roadmap #21)* Criar trigger `CE - purchase` no GTM
- [ ] *(Aguarda Roadmap #21)* Criar tag `GA4 Event - purchase` no GTM com `transaction_id`, `value`, `tax`, `shipping`, `items`

**dataLayer esperado:**
```js
{ ecommerce: null }
{
  event: 'purchase',
  ecommerce: {
    transaction_id: '<order_id>',
    currency: 'BRL',
    value: <total>,
    tax: 0,
    shipping: <frete>,
    items: [...]
  }
}
```

---

## Resumo — Contagem de Work Items

| Fase | Eventos | Arquivo(s) | GTM (triggers + tags) | Dependência |
|---|---|---|---|---|
| A1 | view_item (enriquecimento) | script.js | 0 | Nenhuma |
| A2 | view_item_list (enriquecimento) | script.js | 0 | Nenhuma |
| A3 | select_item (novo) | script.js + analytics.js | 1 trigger + 1 tag | Nenhuma |
| A4 | add_to_cart (novo) | script.js + analytics.js | 1 trigger + 1 tag | Nenhuma |
| B1 | view_cart (novo) | script.js + analytics.js | 1 trigger + 1 tag | Roadmap #3 |
| B2 | remove_from_cart (novo) | script.js + analytics.js | 1 trigger + 1 tag | Roadmap #3 |
| C1 | begin_checkout (novo) | script.js + analytics.js | 1 trigger + 1 tag | Roadmap #3/#21 |
| D1 | purchase (novo) | TBD | 1 trigger + 1 tag | Roadmap #21 |

**Fase A total:** 4 itens de analytics · 2 triggers · 2 tags GTM · sem dependências externas
