# Meta Pixel — Plano de Implementação (Tramatto)

> **Status:** Auditoria concluída. Implementação pendente.
> **Data:** 2026-06-16
> **Container GTM:** `GTM-W7NZMTL7` | **GA4:** `G-13KSN16JDG`

---

## 1. Auditoria da Infraestrutura Atual

### 1.1 GTM — Diagnóstico

| Item | Status | Observação |
|---|---|---|
| Snippet GTM no `<head>` | ✅ OK | `collection.html`, `product.html`, `404.html`, páginas em `/pages/` |
| Snippet GTM em `index.html` | ⚠️ Verificar | Snippet aparece na linha 723 — pode estar fora do `<head>`. Confirmar posição antes da implementação. |
| `<noscript>` após `<body>` | ✅ OK | Presente em todos os arquivos verificados |
| `dataLayer` pré-inicializado | ✅ OK | `window.dataLayer = window.dataLayer || []` em `analytics.js` antes do GTM carregar |
| Variáveis DLV configuradas | ✅ OK | 10 variáveis mapeadas em `gtm-config.json` |
| Triggers CE configurados | ✅ OK | 7 Custom Event triggers prontos |
| Tags GA4 configuradas | ✅ OK | 7 tags GA4 Event + 1 Configuration |

### 1.2 Data Layer — Consistência

| Aspecto | Status | Detalhe |
|---|---|---|
| Contexto de página | ✅ Forte | `page_location`, `page_path`, `page_title` em todos os eventos |
| Limpeza de ecommerce | ✅ Forte | `{ ecommerce: null }` enviado antes de cada evento de ecommerce |
| Arquitetura desacoplada | ✅ Forte | script.js → evento DOM customizado → analytics.js → dataLayer |
| IDs de produto | ✅ OK | `item_id` = slug do produto (ex: `"linho-anatoliano"`) |
| Moeda | ✅ OK | `currency: 'BRL'` presente em `view_product` |
| Preço como número | ⚠️ Risco | `catalog-data.js` armazena preço como string `"R$ 120,00"`. Verificar se `item.price` chega como `number` no dataLayer antes de usar o parâmetro `value` no Meta Pixel |
| `content_ids` | ❌ Ausente | Meta Pixel exige — precisa ser derivado do `item_id` existente |
| `content_type` | ❌ Ausente | Meta Pixel exige `"product"` ou `"product_group"` — precisa ser adicionado |
| `content_category` | ❌ Ausente | Opcional mas recomendado — disponível no domain model (`productType`) mas não está no dataLayer |

### 1.3 Eventos Atuais no dataLayer

| Evento | Arquivo | Trigger |
|---|---|---|
| `page_view` | `analytics.js` | DOMContentLoaded, todas as páginas |
| `click_whatsapp` | `analytics.js` | Clique em link WhatsApp |
| `click_instagram` | `analytics.js` | Clique em link Instagram |
| `click_ver_colecao` | `analytics.js` | Clique em CTA com `data-analytics-event` |
| `scroll_90` | `analytics.js` | Scroll ≥ 90% do documento |
| `view_collection` | `analytics.js` | Evento DOM `tramatto:view_collection` |
| `view_product` | `analytics.js` | Evento DOM `tramatto:view_product` |
| `search` | `analytics.js` | Evento DOM `tramatto:search` |

---

## 2. Arquitetura Recomendada

```
Páginas HTML (index, collection, product, ...)
    │
    ▼
GTM Container (GTM-W7NZMTL7) ← já instalado
    │
    ├── Tag: GA4 Configuration → GA4 (G-13KSN16JDG) ← já existe
    │
    ├── Tag: Meta Pixel — Base Code        ← NOVO (All Pages)
    │       fbq('init', 'PIXEL_ID')
    │       fbq('track', 'PageView')
    │
    ├── Tag: Meta Pixel — ViewContent      ← NOVO (CE - view_product)
    ├── Tag: Meta Pixel — Search           ← NOVO (CE - search)
    ├── Tag: Meta Pixel — Contact          ← NOVO (CE - click_whatsapp)
    ├── Tag: Meta Pixel — ViewContent List ← NOVO (CE - view_collection)
    └── Tag: Meta Pixel — Custom Events    ← NOVO (CE - click_ver_colecao, scroll_90)

dataLayer (analytics.js)
    └── Dispara os Custom Event triggers já existentes
        Os mesmos triggers do GA4 servem para o Meta Pixel (reutilização total)
```

**Princípio:** os triggers do GTM já existem. Cada nova tag Meta Pixel reaproveita
o trigger correspondente do GA4 — zero configuração de trigger nova necessária.

**Template recomendado:** usar o template oficial "Meta Pixel" da GTM Community
Template Gallery. Alternativa: Custom HTML com código nativo `fbq()`.

---

## 3. Mapeamento Completo de Eventos

### 3.1 Evento → Evento Meta Pixel

| Evento dataLayer (Tramatto) | Evento GA4 | Evento Meta Pixel | Tipo |
|---|---|---|---|
| `page_view` | `page_view` | `PageView` | Padrão |
| `view_product` | `view_item` | `ViewContent` | Padrão |
| `view_collection` | `view_item_list` | `ViewContent` (product_group) | Padrão |
| `search` | `search` | `Search` | Padrão |
| `click_whatsapp` | `click_whatsapp` | `Contact` | Padrão |
| `click_ver_colecao` | `click_ver_colecao` | `ViewContent` (collection) | Personalizado → Padrão |
| `scroll_90` | `scroll_90` | `CustomEvent: scroll_90` | Personalizado |
| `click_instagram` | `click_instagram` | `CustomEvent: click_instagram` | Personalizado |

> **Nota:** `click_ver_colecao` é o CTA do hero "Ver a coleção" — representa intenção
> de descoberta de produto. Mapear como `ViewContent` com `content_type: 'product_group'`
> é mais adequado do que um evento completamente customizado, pois alimenta o funil
> nativo do Meta.

---

### 3.2 Parâmetros por Evento

#### `PageView`
Disparado automaticamente pelo código base. Sem parâmetros adicionais.
```
Trigger GTM: All Pages (mesmo da GA4 Configuration)
fbq('track', 'PageView')
```

---

#### `ViewContent` — Produto Individual
```
Trigger GTM: CE - view_product (reutiliza o existente)

Parâmetros Meta:
  content_ids:   [ ecommerce.items[0].item_id ]   ← ex: ["linho-anatoliano"]
  content_type:  "product"
  content_name:  ecommerce.items[0].item_name      ← ex: "Linho Anatoliano"
  value:         ecommerce.value                   ← ⚠️ confirmar tipo numérico
  currency:      "BRL"

Variáveis GTM necessárias (já existem):
  {{DLV - ecommerce}} → ecommerce.items, ecommerce.value, ecommerce.currency
```

---

#### `ViewContent` — Lista/Coleção
```
Trigger GTM: CE - view_collection (reutiliza o existente)

Parâmetros Meta:
  content_ids:   ecommerce.items.map(i => i.item_id)   ← array de slugs
  content_type:  "product_group"
  content_name:  ecommerce.item_list_name               ← "Coleção Premium"

Variáveis GTM necessárias (já existem):
  {{DLV - ecommerce}}
```

---

#### `ViewContent` — CTA Hero (click_ver_colecao)
```
Trigger GTM: CE - click_ver_colecao (reutiliza o existente)

Parâmetros Meta:
  content_type:  "product_group"
  content_name:  "Coleção Tramatto"

Variáveis GTM necessárias:
  Nenhuma nova — parâmetros são estáticos
```

---

#### `Search`
```
Trigger GTM: CE - search (reutiliza o existente)

Parâmetros Meta:
  search_string: {{DLV - search_term}}

Variáveis GTM necessárias (já existe):
  {{DLV - search_term}}
```

---

#### `Contact` — WhatsApp
```
Trigger GTM: CE - click_whatsapp (reutiliza o existente)

Parâmetros Meta: (nenhum obrigatório para Contact)
  Opcional: content_name = {{DLV - link_text}}

Variáveis GTM necessárias (já existe):
  {{DLV - link_text}}
```

---

#### `CustomEvent: scroll_90`
```
Trigger GTM: CE - scroll_90 (reutiliza o existente)

fbq('trackCustom', 'scroll_90', {
  percent_scrolled: {{DLV - percent_scrolled}},
  page_path: {{DLV - page_path}}
})
```

---

#### `CustomEvent: click_instagram`
```
Trigger GTM: CE - click_instagram (reutiliza o existente)

fbq('trackCustom', 'click_instagram', {
  link_url: {{DLV - link_url}}
})
```

---

## 4. Variáveis GTM — Novas Necessárias

Todos os triggers já existem. As variáveis DLV abaixo **já existem** no `gtm-config.json`:
- `{{DLV - ecommerce}}`
- `{{DLV - search_term}}`
- `{{DLV - link_url}}`
- `{{DLV - link_text}}`
- `{{DLV - percent_scrolled}}`
- `{{DLV - page_path}}`

**Variáveis novas necessárias:**

| Nome | Tipo | Caminho no dataLayer | Uso |
|---|---|---|---|
| `DLV - ecommerce.items` | Data Layer Variable | `ecommerce.items` | `content_ids` e `content_name` no ViewContent |
| `DLV - ecommerce.value` | Data Layer Variable | `ecommerce.value` | `value` no ViewContent (produto) |
| `CONST - Meta Pixel ID` | Constant | — | ID do Pixel (preenchido após criação) |

> **Alternativa sem novas variáveis:** usar Custom HTML com JavaScript inline para
> extrair os valores do `dataLayer` diretamente via `dataLayer.find(...)` — mais
> flexível porém menos legível no GTM.

---

## 5. Novas Tags GTM — Resumo

| Tag | Tipo | Trigger | Evento Meta |
|---|---|---|---|
| `Meta Pixel — Base Code` | Custom HTML | All Pages | `init` + `PageView` |
| `Meta Pixel — ViewContent (Produto)` | Custom HTML | CE - view_product | `ViewContent` |
| `Meta Pixel — ViewContent (Coleção)` | Custom HTML | CE - view_collection | `ViewContent` |
| `Meta Pixel — ViewContent (CTA Hero)` | Custom HTML | CE - click_ver_colecao | `ViewContent` |
| `Meta Pixel — Search` | Custom HTML | CE - search | `Search` |
| `Meta Pixel — Contact (WhatsApp)` | Custom HTML | CE - click_whatsapp | `Contact` |
| `Meta Pixel — Custom scroll_90` | Custom HTML | CE - scroll_90 | `trackCustom` |
| `Meta Pixel — Custom click_instagram` | Custom HTML | CE - click_instagram | `trackCustom` |

Total: **8 tags novas**, **0 triggers novos**, **3 variáveis novas**.

---

## 6. Riscos e Observações

### Risco 1 — Preço como string
`catalog-data.js` define preços como `"R$ 120,00"` (string). Se esse valor chegar
ao dataLayer sem conversão numérica, o parâmetro `value` do Meta Pixel vai receber
uma string, o que invalida o evento `ViewContent` no Events Manager.

**Resolução antes da implementação:** validar no GTM Preview se
`dataLayer.find(e => e.event === 'view_product').ecommerce.value` é do tipo `number`.

### Risco 2 — Posição do GTM em `index.html`
O snippet GTM em `index.html` está na linha 723 — significativamente mais tarde do
que nos outros arquivos (linha ~24). Se estiver dentro do `<body>` ou próximo do
`</body>`, o Pixel pode disparar tarde demais e perder visualizações.

**Resolução:** mover o snippet para o `<head>` de `index.html` antes da instalação.

### Risco 3 — `content_ids` sem prefixo de catálogo
O Meta Pixel exige que `content_ids` corresponda aos IDs no Catálogo de Produtos
do Meta (se for usado remarketing dinâmico). Os IDs atuais são slugs como
`"linho-anatoliano"`. Quando o catálogo for criado no Meta Commerce Manager, os IDs
devem ser idênticos.

---

## 7. Próximos Passos (ordem de execução)

1. Criar o Meta Pixel no Meta Business Manager → obter o `PIXEL_ID`
2. Verificar posição do GTM em `index.html` e corrigir se necessário
3. Validar tipo do campo `ecommerce.value` no GTM Preview Mode
4. Configurar as 3 variáveis novas no GTM
5. Instalar as 8 tags Meta Pixel no GTM
6. Publicar uma versão GTM de teste
7. Validar no Meta Pixel Helper (extensão Chrome) e no Events Manager
8. Publicar versão definitiva
