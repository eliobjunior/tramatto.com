# Tramatto — Eventos de Analytics (dataLayer / GTM / GA4)

Documentação dos eventos enviados via `window.dataLayer.push()` pelo arquivo
[`js/analytics.js`](js/analytics.js) e por gatilhos disparados em
[`script.js`](script.js).

Container GTM: `GTM-W7NZMTL7`
Measurement ID GA4: `G-13KSN16JDG`

---

## 1. `page_view`

Evento "extra" enviado pela própria camada de analytics (complementar ao
`gtm.js` automático do GTM), com contexto consistente de página.

- **Local de disparo:** todas as páginas, no `DOMContentLoaded`.
- **Parâmetros enviados:**
  | Parâmetro | Tipo | Descrição |
  |---|---|---|
  | `event` | string | `"page_view"` |
  | `page_location` | string | URL completa (`window.location.href`) |
  | `page_path` | string | Caminho da URL (`window.location.pathname`) |
  | `page_title` | string | `document.title` |
- **Uso no GTM:** crie um *Trigger* "Custom Event" → `page_view` (opcional,
  pois o GTM já dispara `gtm.js`/`Page View` nativamente). Use principalmente
  como variável de contexto (`page_location`, `page_path`, `page_title`) em
  outros gatilhos.
- **Uso no GA4:** normalmente não é necessário — o GA4 já recebe `page_view`
  automaticamente via tag de configuração. Útil apenas se o site for um SPA e
  o `gtm.js` não recarregar.

---

## 2. `click_whatsapp`

- **Local de disparo:** clique em qualquer link do WhatsApp — botão flutuante
  `.whatsapp-float` (presente em `index.html`, `collection.html` e
  `product.html`) ou qualquer `<a href="wa.me/...">` / `api.whatsapp.com`
  adicionado no futuro.
- **Arquivo responsável:** `js/analytics.js` → `initWhatsappTracking()`.
- **Parâmetros enviados:**
  | Parâmetro | Tipo | Descrição |
  |---|---|---|
  | `event` | string | `"click_whatsapp"` |
  | `link_url` | string | URL completa do link clicado (`wa.me/...`) |
  | `link_text` | string | Texto visível do link ou `aria-label` |
  | `page_location` | string | URL da página onde o clique ocorreu |
  | `page_path` | string | Caminho da página |
  | `page_title` | string | Título da página |
- **Uso no GTM:**
  - Trigger: "Custom Event" → nome do evento `click_whatsapp`.
  - Tag: GA4 Event Tag com nome de evento `click_whatsapp`, mapeando os
    parâmetros acima como Event Parameters.
- **Uso no GA4:**
  - Evento customizado `click_whatsapp`.
  - Recomendado marcar como "conversão" (lead/contato) no GA4, já que indica
    intenção de compra/contato direto.

---

## 3. `click_instagram`

- **Local de disparo:** clique em qualquer link `<a href="...instagram.com...">`
  — atualmente o ícone "Instagram" no rodapé de `index.html`,
  `collection.html` e `product.html`, que aponta para
  `https://www.instagram.com/tramatto`.
- **Arquivo responsável:** `js/analytics.js` → `initInstagramTracking()`.
- **Parâmetros enviados:**
  | Parâmetro | Tipo | Descrição |
  |---|---|---|
  | `event` | string | `"click_instagram"` |
  | `link_url` | string | URL do perfil do Instagram |
  | `link_text` | string | Texto visível do link (`"Instagram"`) |
  | `page_location` | string | URL da página onde o clique ocorreu |
  | `page_path` | string | Caminho da página |
  | `page_title` | string | Título da página |
- **Uso no GTM:**
  - Trigger: "Custom Event" → `click_instagram`.
  - Tag: GA4 Event Tag com nome de evento `click_instagram`.
- **Uso no GA4:**
  - Evento customizado `click_instagram`, útil para medir engajamento social
    e tráfego de saída (outbound click).

---

## 4. `click_ver_colecao`

- **Local de disparo:** clique no CTA principal do hero da home
  (`index.html`), botão "Ver a coleção", marcado com o atributo
  `data-analytics-event="click_ver_colecao"`.
- **Arquivo responsável:** `js/analytics.js` → `initCtaTracking()` (listener
  genérico para qualquer elemento com `data-analytics-event`).
- **Parâmetros enviados:**
  | Parâmetro | Tipo | Descrição |
  |---|---|---|
  | `event` | string | `"click_ver_colecao"` |
  | `link_url` | string | URL de destino (`collection.html`) |
  | `link_text` | string | Texto do botão (`"Ver a coleção"`) |
  | `page_location` | string | URL da página onde o clique ocorreu |
  | `page_path` | string | Caminho da página |
  | `page_title` | string | Título da página |
- **Uso no GTM:**
  - Trigger: "Custom Event" → `click_ver_colecao`.
  - Tag: GA4 Event Tag com nome de evento `click_ver_colecao`.
- **Uso no GA4:**
  - Evento customizado `click_ver_colecao`, mede a efetividade do CTA
    principal da home em levar usuários até a coleção.
- **Reaproveitamento:** para rastrear outros CTAs no futuro, basta adicionar
  `data-analytics-event="nome_do_evento"` ao elemento — nenhum código novo é
  necessário.

---

## 5. `scroll_90`

- **Local de disparo:** qualquer página, quando o usuário rola até 90% da
  altura total do documento. Disparado **no máximo uma vez por carregamento
  de página**.
- **Arquivo responsável:** `js/analytics.js` → `initScrollTracking()`.
- **Parâmetros enviados:**
  | Parâmetro | Tipo | Descrição |
  |---|---|---|
  | `event` | string | `"scroll_90"` |
  | `percent_scrolled` | number | `90` (fixo) |
  | `page_location` | string | URL da página |
  | `page_path` | string | Caminho da página |
  | `page_title` | string | Título da página |
- **Uso no GTM:**
  - Trigger: "Custom Event" → `scroll_90`.
    (Alternativa nativa: GTM possui o trigger embutido "Scroll Depth", mas
    aqui usamos um evento customizado para ter controle total e consistência
    entre páginas.)
  - Tag: GA4 Event Tag com nome de evento `scroll_90`.
- **Uso no GA4:**
  - Evento customizado `scroll_90`, complementar ao `scroll` automático do
    GA4 (que dispara em 90% por padrão) — útil se o "Enhanced measurement"
    estiver desativado ou para ter um nome de evento próprio da Tramatto.

---

## 6. `view_collection`

- **Local de disparo:** `collection.html`, após a grade de produtos
  (`#collectionProducts`) ser renderizada — tanto no carregamento inicial
  quanto após uma busca (ver evento `search`).
- **Fluxo:**
  1. `script.js` → `renderCollectionPage()` / `initCollectionSearch()`
     disparam o evento DOM customizado `tramatto:view_collection` com a
     lista de produtos exibidos.
  2. `js/analytics.js` → `initViewCollectionTracking()` escuta esse evento e
     envia ao `dataLayer`.
- **Parâmetros enviados:**
  | Parâmetro | Tipo | Descrição |
  |---|---|---|
  | `event` | string | `"view_collection"` |
  | `ecommerce.item_list_name` | string | `"Coleção Premium"` |
  | `ecommerce.items[].item_id` | string | Slug do produto |
  | `ecommerce.items[].item_name` | string | Nome do produto |
  | `ecommerce.items[].price` | number | Preço principal do produto (BRL) |
  | `ecommerce.items[].index` | number | Posição do produto na grade |
  | `page_location`, `page_path`, `page_title` | string | Contexto da página |

  > Antes de cada `view_collection`, é enviado `{ ecommerce: null }` para
  > limpar o objeto de ecommerce anterior (boa prática GA4/GTM).

- **Uso no GTM:**
  - Trigger: "Custom Event" → `view_collection`.
  - Tag: GA4 Event Tag.
    - **Opção A (recomendada):** nome de evento GA4 = `view_item_list`,
      mapeando a variável de dataLayer `ecommerce` diretamente em
      "Event Parameters → ecommerce" (suporte nativo do template de tag GA4
      Event para objetos `ecommerce`).
    - **Opção B:** manter o nome `view_collection` como evento customizado e
      mapear `item_list_name` e `items` manualmente.
- **Uso no GA4:**
  - Se mapeado como `view_item_list`, alimenta os relatórios padrão de
    "Ecommerce purchases" / listas de itens visualizados.
  - Se mantido como `view_collection`, aparece como evento customizado — pode
    ser usado em explorações e funis personalizados.

---

## 7. `view_product`

- **Local de disparo:** `product.html`, após os detalhes do produto
  (`#productDetail`) serem renderizados — no carregamento inicial e sempre
  que o usuário troca de variação (cor/tamanho).
- **Fluxo:**
  1. `script.js` → `renderProductDetail()` chama `dispatchViewProduct()`, que
     dispara o evento DOM customizado `tramatto:view_product` com os dados do
     item selecionado.
  2. `js/analytics.js` → `initViewProductTracking()` escuta esse evento e
     envia ao `dataLayer`.
- **Parâmetros enviados:**
  | Parâmetro | Tipo | Descrição |
  |---|---|---|
  | `event` | string | `"view_product"` |
  | `ecommerce.currency` | string | `"BRL"` |
  | `ecommerce.value` | number | Preço do item/variação exibido |
  | `ecommerce.items[].item_id` | string | Slug do produto |
  | `ecommerce.items[].item_name` | string | Nome do produto |
  | `ecommerce.items[].item_variant` | string | Nome da variação selecionada |
  | `ecommerce.items[].price` | number | Preço da variação (ou do produto) |
  | `page_location`, `page_path`, `page_title` | string | Contexto da página |

  > Antes de cada `view_product`, é enviado `{ ecommerce: null }` para limpar
  > o objeto de ecommerce anterior.

- **Uso no GTM:**
  - Trigger: "Custom Event" → `view_product`.
  - Tag: GA4 Event Tag.
    - **Opção A (recomendada):** nome de evento GA4 = `view_item`, mapeando a
      variável `ecommerce` (currency, value, items).
    - **Opção B:** manter `view_product` como evento customizado.
- **Uso no GA4:**
  - Se mapeado como `view_item`, alimenta os relatórios padrão de
    "Itens visualizados" e funis de ecommerce (view → add_to_cart →
    purchase).
  - Recomendado para campanhas de remarketing dinâmico (Google Ads) baseadas
    em produtos visualizados.

---

## 8. `search`

- **Local de disparo:** `collection.html`, quando o usuário digita um termo
  no campo de busca `#collectionSearch` (acima da grade de produtos).
- **Fluxo:**
  1. `script.js` → `initCollectionSearch()` filtra os produtos pelo termo
     digitado, re-renderiza a grade e dispara o evento DOM customizado
     `tramatto:search` com o termo e a quantidade de resultados.
  2. `js/analytics.js` → `initSearchTracking()` escuta esse evento e envia ao
     `dataLayer`.
  3. A re-renderização também dispara `view_collection` novamente (ver evento
     6), agora com os itens filtrados.
- **Parâmetros enviados:**
  | Parâmetro | Tipo | Descrição |
  |---|---|---|
  | `event` | string | `"search"` |
  | `search_term` | string | Termo digitado pelo usuário |
  | `results_count` | number | Quantidade de produtos retornados |
  | `page_location`, `page_path`, `page_title` | string | Contexto da página |
- **Uso no GTM:**
  - Trigger: "Custom Event" → `search`.
  - Tag: GA4 Event Tag com nome de evento `search`, mapeando `search_term` e
    `results_count` como Event Parameters.
- **Uso no GA4:**
  - `search` é um **evento recomendado pelo GA4** com o parâmetro padrão
    `search_term` — ao usar esse nome, o GA4 já reconhece e ativa o relatório
    "Termos de pesquisa" automaticamente (Enhanced Measurement → Site Search).
  - `results_count` pode ser configurado como parâmetro personalizado
    adicional para análises de "buscas sem resultado" (`results_count = 0`).

---

---

## 8. `select_item`

- **Local de disparo:** `index.html` (grade home) e `collection.html` (grade da coleção e resultados de busca), quando o usuário clica no link de um card de produto para navegar para a PDP.
- **Arquivo responsável:** `script.js` → `dispatchSelectItem()` (listener em `renderProducts()`).
- **Parâmetros enviados:**
  | Parâmetro | Tipo | Descrição |
  |---|---|---|
  | `event` | string | `"select_item"` |
  | `ecommerce.item_list_name` | string | Contexto da lista: `"Coleção Premium"`, `"Home — Destaques"` ou `"Busca — Coleção"` |
  | `ecommerce.item_list_id` | string | Slug da lista: `"colecao-premium"`, `"home-destaques"` ou `"busca-colecao"` |
  | `ecommerce.items[].item_id` | string | Slug do produto |
  | `ecommerce.items[].item_name` | string | Nome do produto |
  | `ecommerce.items[].item_brand` | string | `"Tramatto"` |
  | `ecommerce.items[].item_category` | string | `product.googleProductCategory` ou `product.productType` |
  | `ecommerce.items[].price` | number | Preço principal do produto (BRL) |
  | `ecommerce.items[].quantity` | number | `1` |
  | `ecommerce.items[].index` | number | Posição do card na grade (0-based) |
  | `page_location`, `page_path`, `page_title` | string | Contexto da página |
- **Uso no GTM:**
  - Trigger: "Custom Event" → `select_item` → nome: **`CE - select_item`** ← **criar no GTM**
  - Tag: GA4 Event Tag → nome `GA4 Event - select_item` → `sendEcommerceData: true`
- **Uso no GA4:**
  - Evento recomendado `select_item` — completa o funil `view_item_list → select_item → view_item`.

---

## 9. `add_to_cart`

- **Local de disparo:** qualquer ponto de entrada do botão "Adicionar" — card de produto na coleção (`collection.html`), card na home (`index.html`), botão "Adicionar à sacola" na PDP (`product.html`), botão "Adicionar à sacola" nos Kits.
- **Arquivo responsável:** `script.js` → `dispatchAddToCart()`, chamada em `addToCart()` após persistência no `CartService`.
- **Parâmetros enviados:**
  | Parâmetro | Tipo | Descrição |
  |---|---|---|
  | `event` | string | `"add_to_cart"` |
  | `ecommerce.currency` | string | `"BRL"` |
  | `ecommerce.value` | number | Preço × quantidade (ex: `120`) |
  | `ecommerce.items[].item_id` | string | Slug do produto |
  | `ecommerce.items[].item_name` | string | Nome do produto |
  | `ecommerce.items[].item_brand` | string | `"Tramatto"` |
  | `ecommerce.items[].item_category` | string | `product.googleProductCategory` ou `product.productType` |
  | `ecommerce.items[].item_variant` | string\|null | Nome da variação selecionada (ou `null`) |
  | `ecommerce.items[].price` | number | Preço da variação ou do produto (BRL, numeric) |
  | `ecommerce.items[].quantity` | number | `1` |
  | `page_location`, `page_path`, `page_title` | string | Contexto da página de onde o clique veio |

  > Antes de cada `add_to_cart`, é enviado `{ ecommerce: null }` para limpar o objeto anterior.

- **Uso no GTM:**
  - Trigger: "Custom Event" → `add_to_cart` → nome: **`CE - add_to_cart`** ← **criar no GTM**
  - Tag: GA4 Event Tag → nome `GA4 Event - add_to_cart` → `sendEcommerceData: true`, source: `{{DLV - ecommerce}}`
- **Uso no GA4:**
  - Evento recomendado `add_to_cart` — alimenta o funil de ecommerce, relatórios de abandonos de carrinho e audiências de remarketing.
  - **Recomendado marcar como conversão no GA4** — indica intenção de compra direta.

---

## Resumo rápido — nomes de evento para configurar no GTM

| Evento no dataLayer | Evento recomendado na tag GA4 | Status GTM |
|---|---|---|
| `click_whatsapp` | `click_whatsapp` (customizado) | ✅ Configurado |
| `click_instagram` | `click_instagram` (customizado) | ✅ Configurado |
| `click_ver_colecao` | `click_ver_colecao` (customizado) | ✅ Configurado |
| `scroll_90` | `scroll_90` (customizado) | ✅ Configurado |
| `view_collection` | `view_item_list` (recomendado GA4) | ✅ Configurado |
| `view_product` | `view_item` (recomendado GA4) | ✅ Configurado |
| `search` | `search` (recomendado GA4) | ✅ Configurado |
| `select_item` | `select_item` (recomendado GA4) | ⚠️ **Criar trigger + tag no GTM** |
| `add_to_cart` | `add_to_cart` (recomendado GA4) | ⚠️ **Criar trigger + tag no GTM** |

## Variáveis úteis para criar no GTM

Crie variáveis "Data Layer Variable" para os campos mais usados:

- `DLV - link_url`
- `DLV - link_text`
- `DLV - page_location`
- `DLV - page_path`
- `DLV - page_title`
- `DLV - search_term`
- `DLV - results_count`
- `DLV - ecommerce` (objeto completo, para tags GA4 Event com Ecommerce)
