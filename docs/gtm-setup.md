# Tramatto — Estrutura GTM (Container `GTM-W7NZMTL7`)

**Base:** [analytics-events.md](../analytics-events.md) (camada de dataLayer já implementada em `js/analytics.js` / `script.js`).
**Objetivo:** especificar exatamente o que criar dentro do GTM — Variáveis, Triggers e Tags GA4 — para os 7 eventos já implementados, com convenção de nomes, JSON de referência para importação/scripting futuro e checklist de validação (Preview + GA4 DebugView).

GA4 Measurement ID: `G-13KSN16JDG`

---

## 0. Convenção de nomenclatura

| Tipo de elemento | Padrão | Exemplo |
|---|---|---|
| Variável "Data Layer Variable" | `DLV - {campo}` | `DLV - link_url` |
| Variável de objeto ecommerce | `DLV - ecommerce` | — |
| Constante | `CONST - {nome}` | `CONST - GA4 Measurement ID` |
| Trigger "Custom Event" | `CE - {nome_evento_dataLayer}` | `CE - click_whatsapp` |
| Tag de configuração GA4 | `GA4 - Configuration` | — |
| Tag de evento GA4 | `GA4 Event - {nome_evento_ga4}` | `GA4 Event - view_item_list` |

Manter o **nome do evento no dataLayer** (`click_whatsapp`, `view_collection`, etc.) sempre igual ao nome usado no Trigger `CE - ...`. O **nome do evento enviado ao GA4** pode ser diferente (ex.: `view_collection` → GA4 `view_item_list`) — isso é definido no campo "Event Name" da Tag, não no Trigger.

---

## 1. Variáveis (Data Layer Variables)

| Nome GTM | Tipo | Data Layer Variable Name | Usado em |
|---|---|---|---|
| `DLV - link_url` | Data Layer Variable | `link_url` | click_whatsapp, click_instagram, click_ver_colecao |
| `DLV - link_text` | Data Layer Variable | `link_text` | click_whatsapp, click_instagram, click_ver_colecao |
| `DLV - page_location` | Data Layer Variable | `page_location` | todos |
| `DLV - page_path` | Data Layer Variable | `page_path` | todos |
| `DLV - page_title` | Data Layer Variable | `page_title` | todos |
| `DLV - percent_scrolled` | Data Layer Variable | `percent_scrolled` | scroll_90 |
| `DLV - search_term` | Data Layer Variable | `search_term` | search |
| `DLV - results_count` | Data Layer Variable | `results_count` | search |
| `DLV - ecommerce` | Data Layer Variable | `ecommerce` | view_collection, view_product |
| `CONST - GA4 Measurement ID` | Constante | — (valor fixo `G-13KSN16JDG`) | tag de configuração GA4 |

> Dica: em "Data Layer Variable", deixe **"Version" = Version 2** (suporta objetos aninhados e funciona corretamente com `dataLayer.push({ecommerce: null})` seguido do push real, que é o padrão usado em `view_collection`/`view_product`).

---

## 2. Triggers (Custom Event)

| Nome GTM | Tipo | Event name (Custom Event) | Condições adicionais |
|---|---|---|---|
| `CE - click_whatsapp` | Custom Event | `click_whatsapp` | Nenhuma |
| `CE - click_instagram` | Custom Event | `click_instagram` | Nenhuma |
| `CE - click_ver_colecao` | Custom Event | `click_ver_colecao` | Nenhuma |
| `CE - scroll_90` | Custom Event | `scroll_90` | Nenhuma |
| `CE - view_collection` | Custom Event | `view_collection` | Nenhuma (já só dispara em `collection.html`) |
| `CE - view_product` | Custom Event | `view_product` | Nenhuma (já só dispara em `product.html`) |
| `CE - search` | Custom Event | `search` | Nenhuma (`search_term` sempre presente — analytics.js já filtra termos vazios) |

---

## 3. Tags GA4

### 3.1 Tag base de configuração

| Nome GTM | Tipo | Measurement ID | Trigger |
|---|---|---|---|
| `GA4 - Configuration` | Google Tag (GA4 Configuration) | `{{CONST - GA4 Measurement ID}}` | All Pages |

> Se essa tag já existir no container (provavelmente sim, já que o GA4 está "ativo"), **não duplicar** — apenas garanta que ela existe e está em "All Pages" antes de criar as tags de evento abaixo, pois todas elas usam "Configuration Tag" apontando para essa tag base.

### 3.2 Tags de evento

| Nome GTM | Trigger | Event Name (GA4) | Event Parameters |
|---|---|---|---|
| `GA4 Event - click_whatsapp` | `CE - click_whatsapp` | `click_whatsapp` | `link_url={{DLV - link_url}}`, `link_text={{DLV - link_text}}`, `page_location={{DLV - page_location}}`, `page_path={{DLV - page_path}}`, `page_title={{DLV - page_title}}` |
| `GA4 Event - click_instagram` | `CE - click_instagram` | `click_instagram` | `link_url={{DLV - link_url}}`, `link_text={{DLV - link_text}}`, `page_location={{DLV - page_location}}`, `page_path={{DLV - page_path}}`, `page_title={{DLV - page_title}}` |
| `GA4 Event - click_ver_colecao` | `CE - click_ver_colecao` | `click_ver_colecao` | `link_url={{DLV - link_url}}`, `link_text={{DLV - link_text}}`, `page_location={{DLV - page_location}}`, `page_path={{DLV - page_path}}`, `page_title={{DLV - page_title}}` |
| `GA4 Event - scroll_90` | `CE - scroll_90` | `scroll_90` | `percent_scrolled={{DLV - percent_scrolled}}`, `page_location={{DLV - page_location}}`, `page_path={{DLV - page_path}}`, `page_title={{DLV - page_title}}` |
| `GA4 Event - view_item_list` | `CE - view_collection` | `view_item_list` | **Ecommerce data** = `{{DLV - ecommerce}}` (mapeia `item_list_name` + `items[]` automaticamente), `page_location={{DLV - page_location}}`, `page_path={{DLV - page_path}}`, `page_title={{DLV - page_title}}` |
| `GA4 Event - view_item` | `CE - view_product` | `view_item` | **Ecommerce data** = `{{DLV - ecommerce}}` (mapeia `currency`, `value`, `items[]` automaticamente), `page_location={{DLV - page_location}}`, `page_path={{DLV - page_path}}`, `page_title={{DLV - page_title}}` |
| `GA4 Event - search` | `CE - search` | `search` | `search_term={{DLV - search_term}}`, `results_count={{DLV - results_count}}`, `page_location={{DLV - page_location}}`, `page_path={{DLV - page_path}}`, `page_title={{DLV - page_title}}` |

> No editor de tag GA4 Event do GTM, marque a caixa **"Send Ecommerce data"** e selecione **"Data Layer"** como fonte para `GA4 Event - view_item_list` e `GA4 Event - view_item` — o template já lê `ecommerce.items`, `ecommerce.value`, `ecommerce.currency`, `ecommerce.item_list_name` automaticamente, sem precisar mapear item a item.

---

## 4. Tabela consolidada — Nome GTM × GA4 × Parâmetros × Objetivo

| Nome GTM (Tag) | Tipo | Evento GA4 | Parâmetros enviados | Objetivo de negócio |
|---|---|---|---|---|
| `GA4 - Configuration` | GA4 Configuration | — (config) | — | Base para todas as tags de evento; garante `page_view` e sessão |
| `GA4 Event - click_whatsapp` | GA4 Event | `click_whatsapp` | `link_url`, `link_text`, `page_location`, `page_path`, `page_title` | Medir intenção de contato direto / lead via WhatsApp (alto valor — sugerido como conversão) |
| `GA4 Event - click_instagram` | GA4 Event | `click_instagram` | `link_url`, `link_text`, `page_location`, `page_path`, `page_title` | Medir engajamento social e tráfego de saída para Instagram |
| `GA4 Event - click_ver_colecao` | GA4 Event | `click_ver_colecao` | `link_url`, `link_text`, `page_location`, `page_path`, `page_title` | Medir eficácia do CTA principal do hero (home → coleção) |
| `GA4 Event - scroll_90` | GA4 Event | `scroll_90` | `percent_scrolled`, `page_location`, `page_path`, `page_title` | Medir profundidade de engajamento/leitura por página |
| `GA4 Event - view_item_list` | GA4 Event (ecommerce) | `view_item_list` | `item_list_name`, `items[].item_id`, `items[].item_name`, `items[].price`, `items[].index`, `currency` (BRL, opcional) | Medir exposição de produtos na coleção; base do funil de ecommerce e remarketing |
| `GA4 Event - view_item` | GA4 Event (ecommerce) | `view_item` | `currency`, `value`, `items[].item_id`, `items[].item_name`, `items[].item_variant`, `items[].price` | Medir visualizações de produto (PDP); base para funil view→cart→purchase e remarketing dinâmico (Google Ads) |
| `GA4 Event - search` | GA4 Event (recomendado) | `search` | `search_term`, `results_count`, `page_location`, `page_path`, `page_title` | Entender demanda dos usuários e identificar buscas sem resultado (`results_count = 0`) |

---

## 5. JSON de documentação para importação futura

O arquivo [`docs/gtm-config.json`](gtm-config.json) descreve, em formato estruturado (não é um export literal de `containerVersion` do GTM, mas pode ser usado como especificação para criação manual, via GTM API, ou como input para um script de automação), todas as Variáveis, Triggers e Tags acima.

---

## 6. Checklist de validação

### 6.1 Antes de publicar

- [ ] `GA4 - Configuration` existe e aponta para `G-13KSN16JDG`, trigger "All Pages"
- [ ] Todas as 9 variáveis `DLV - *` criadas com "Version 2" habilitado
- [ ] 7 triggers `CE - *` criados, um para cada evento do dataLayer
- [ ] 7 tags `GA4 Event - *` criadas, cada uma associada ao trigger correto
- [ ] Tags `view_item_list` e `view_item` com "Send Ecommerce data" = Data Layer habilitado

### 6.2 Validação via GTM Preview

Para cada página, abrir o GTM Preview e confirmar:

- [ ] `index.html`: ao carregar → `page_view` no dataLayer
- [ ] `index.html`: clicar em "Ver a coleção" → evento `click_ver_colecao` disparado, tag `GA4 Event - click_ver_colecao` em "Fired"
- [ ] Qualquer página: clicar no botão flutuante do WhatsApp → `click_whatsapp` disparado com `link_url` contendo `wa.me`
- [ ] Qualquer página: clicar em "Instagram" no rodapé → `click_instagram` disparado com `link_url = https://www.instagram.com/tramatto`
- [ ] Qualquer página: rolar até o fim → `scroll_90` disparado **uma única vez**
- [ ] `collection.html`: ao carregar → `view_collection` disparado com `ecommerce.items` contendo todos os produtos da grade
- [ ] `collection.html`: digitar um termo no campo de busca → `search` disparado com `search_term` e `results_count` corretos, seguido de um novo `view_collection` com os itens filtrados
- [ ] `collection.html`: digitar um termo sem resultados → `search` disparado com `results_count = 0`
- [ ] `product.html?slug=...`: ao carregar → `view_product` disparado com `ecommerce.items[0].item_id` = slug do produto
- [ ] `product.html?slug=...`: trocar a variação (cor/tamanho) → novo `view_product` disparado com `item_variant` atualizado

### 6.3 Validação no GA4 (DebugView)

Com o modo Debug do GA4 ativo (extensão "Tag Assistant" ou `?gtm_debug=x`):

- [ ] Todos os 7 eventos aparecem no DebugView com os nomes corretos (`click_whatsapp`, `click_instagram`, `click_ver_colecao`, `scroll_90`, `view_item_list`, `view_item`, `search`)
- [ ] `view_item_list` e `view_item` aparecem na seção "Ecommerce" do DebugView, com `items` populados
- [ ] Evento `search` aciona o relatório "Termos de pesquisa" (Engagement → Eventos → `search` → `search_term`)
- [ ] Nenhum evento de ecommerce aparece com `items` vazio ou `undefined`

### 6.4 Pós-publicação (24–48h)

- [ ] Eventos aparecem em Relatórios em tempo real do GA4
- [ ] Marcar `click_whatsapp` como evento de conversão (Admin → Eventos → Marcar como conversão)
- [ ] Revisar se `view_item_list`/`view_item` populam corretamente os relatórios padrão de Ecommerce (Monetização → Itens)

---

## 7. Eventos adicionais recomendados (funil de ecommerce GA4)

Os 7 eventos atuais cobrem awareness/engajamento e topo de funil (`view_item_list`,
`view_item`, `search`). Para fechar o **funil de ecommerce GA4** completo
(`view_item_list` → `select_item` → `view_item` → `add_to_cart` → `view_cart`
→ `begin_checkout` → `purchase`) e habilitar relatórios de "Monetização" e
remarketing dinâmico no Google Ads, recomenda-se implementar os 6 eventos
abaixo, na ordem de prioridade indicada (ROI: impacto no funil ÷ esforço de
implementação).

> Todos seguem o mesmo padrão já estabelecido: `script.js` dispara um
> `CustomEvent('tramatto:<nome>', { detail: {...} })`, e `js/analytics.js`
> escuta e converte para `dataLayer.push` com `trackEcommerce()` (que já faz
> o `{ ecommerce: null }` de limpeza).

### 7.1 `select_item` — Prioridade 1 (Baixo esforço)

- **Onde disparar:** `script.js` → `renderProducts()`, no clique em
  `.product-card-link` (antes da navegação para `product.html?slug=...`).
- **Implementação:**
  ```js
  // dentro de renderProducts(), após o querySelectorAll de [data-add-to-cart]
  container.querySelectorAll('.product-card-link').forEach((link, index) => {
    link.addEventListener('click', () => {
      const product = items[index];
      document.dispatchEvent(new CustomEvent('tramatto:select_item', {
        detail: {
          list_name: 'Coleção Premium',
          item: {
            item_id: product.slug,
            item_name: product.title,
            price: product.getPrimaryPrice?.() || product.price || 0,
            index
          }
        }
      }));
    });
  });
  ```
- **`analytics.js`:**
  ```js
  document.addEventListener('tramatto:select_item', (event) => {
    const { list_name, item } = event.detail || {};
    if (!item) return;
    trackEcommerce('select_item', { item_list_name: list_name, items: [item] }, getPageContext());
  });
  ```
- **Trigger/Tag GTM:** `CE - select_item` → `GA4 Event - select_item` (`select_item`, ecommerce data = `{{DLV - ecommerce}}`).
- **Objetivo de negócio:** liga `view_item_list` a `view_item` — mostra qual posição/lista gera mais cliques (otimização da ordem da grade).

### 7.2 `add_to_cart` — Prioridade 1 (Baixo esforço)

- **Onde disparar:** `script.js` → função `addToCart(product, variant)` (já
  centraliza todas as adições — chamada tanto na home, quanto na coleção e na
  PDP).
- **Implementação:**
  ```js
  async function addToCart(product, variant = null) {
    const app = getAppState();
    await app.services.cartService.addToCart(product, variant, 1);
    updateCartBadge();
    showToast(`${product.title} adicionado à sacola`);

    const price = Number(variant?.getPrimaryPrice?.() || product.getPrimaryPrice?.() || product.price || 0);
    document.dispatchEvent(new CustomEvent('tramatto:add_to_cart', {
      detail: {
        currency: 'BRL',
        value: price,
        items: [{
          item_id: product.slug,
          item_name: product.title,
          item_variant: variant?.name,
          price,
          quantity: 1
        }]
      }
    }));
  }
  ```
- **`analytics.js`:**
  ```js
  document.addEventListener('tramatto:add_to_cart', (event) => {
    trackEcommerce('add_to_cart', event.detail, getPageContext());
  });
  ```
- **Trigger/Tag GTM:** `CE - add_to_cart` → `GA4 Event - add_to_cart` (ecommerce data = `{{DLV - ecommerce}}`).
- **Objetivo de negócio:** mede taxa de adição ao carrinho por produto/lista; principal métrica de intenção de compra no funil de ecommerce padrão GA4.

### 7.3 `view_cart` — Prioridade 2 (Médio esforço — depende do carrinho/drawer)

- **Pré-requisito:** atualmente não há UI de carrinho visível (item #3 do
  [master-roadmap](master-roadmap.md), "Carrinho/drawer visível"). O evento
  só faz sentido quando essa tela existir.
- **Onde disparar:** ao abrir o drawer/página do carrinho, ler
  `cartService.getCart()` e mapear `cart.items`.
- **Implementação (esboço, função a ser chamada ao abrir o drawer):**
  ```js
  function dispatchViewCart() {
    const cart = appState?.cartService?.getCart?.();
    if (!cart || !cart.items.length) return;

    document.dispatchEvent(new CustomEvent('tramatto:view_cart', {
      detail: {
        currency: 'BRL',
        value: cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
        items: cart.items.map((item) => ({
          item_id: item.productId,
          item_name: item.product?.title,
          item_variant: item.variant?.name,
          price: item.price,
          quantity: item.quantity
        }))
      }
    }));
  }
  ```
- **`analytics.js`:** mesmo padrão — `trackEcommerce('view_cart', event.detail, getPageContext())`.
- **Trigger/Tag GTM:** `CE - view_cart` → `GA4 Event - view_cart`.
- **Objetivo de negócio:** mede abandono entre "produto adicionado" e "carrinho visualizado"; base para campanhas de recuperação.

### 7.4 `remove_from_cart` — Prioridade 2 (Médio esforço — depende do carrinho/drawer)

- **Pré-requisito:** mesmo do item 7.3. `CartService.removeFromCart(lineId)`
  já existe em `js/services.js:126`, mas nenhuma UI a chama ainda.
- **Onde disparar:** no botão "Remover" de cada linha do drawer/carrinho,
  antes/depois de chamar `cartService.removeFromCart(lineId)`.
- **Implementação (esboço):**
  ```js
  async function removeCartLine(lineId) {
    const cart = appState.cartService.getCart();
    const item = cart.items.find((entry) => entry.lineId === lineId);
    await appState.cartService.removeFromCart(lineId);
    updateCartBadge();

    if (item) {
      document.dispatchEvent(new CustomEvent('tramatto:remove_from_cart', {
        detail: {
          currency: 'BRL',
          value: item.price * item.quantity,
          items: [{
            item_id: item.productId,
            item_name: item.product?.title,
            item_variant: item.variant?.name,
            price: item.price,
            quantity: item.quantity
          }]
        }
      }));
    }
  }
  ```
- **`analytics.js`:** `trackEcommerce('remove_from_cart', event.detail, getPageContext())`.
- **Trigger/Tag GTM:** `CE - remove_from_cart` → `GA4 Event - remove_from_cart`.
- **Objetivo de negócio:** identifica produtos/variações com alta taxa de remoção (problema de preço, foto, descrição).

### 7.5 `begin_checkout` — Prioridade 1 (Baixo esforço, alto impacto)

- **Onde disparar:** no clique do CTA de checkout. Hoje o "checkout" da
  Tramatto é, na prática, o **WhatsApp** (item #3 do roadmap: "Carrinho/drawer
  visível + 'Finalizar pelo WhatsApp'"). Enquanto não existir um checkout
  Nuvemshop real, trate o clique em **"Finalizar pelo WhatsApp"** (a ser
  criado) como `begin_checkout`.
- **Implementação (quando o botão existir, ex.: `data-action="checkout-whatsapp"`):**
  ```js
  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action="checkout-whatsapp"]');
    if (!button) return;

    const cart = appState.cartService.getCart();
    document.dispatchEvent(new CustomEvent('tramatto:begin_checkout', {
      detail: {
        currency: 'BRL',
        value: cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
        items: cart.items.map((item) => ({
          item_id: item.productId,
          item_name: item.product?.title,
          item_variant: item.variant?.name,
          price: item.price,
          quantity: item.quantity
        }))
      }
    }));
  });
  ```
- **`analytics.js`:** `trackEcommerce('begin_checkout', event.detail, getPageContext())`.
- **Trigger/Tag GTM:** `CE - begin_checkout` → `GA4 Event - begin_checkout`. Marcar como **conversão** no GA4 enquanto não houver `purchase`.
- **Objetivo de negócio:** principal "conversão" mensurável hoje — sinaliza intenção real de compra antes de sair para o WhatsApp.

### 7.6 `purchase` — Prioridade 3 (Alto esforço — depende de checkout real)

- **Pré-requisito:** o item #21 do roadmap ("Estratégia de checkout real:
  hospedado Nuvemshop vs. próprio") ainda não está decidido/implementado. Sem
  uma etapa de checkout com confirmação de pedido, **não é possível medir
  `purchase` de forma confiável no cliente** (o usuário sai para o WhatsApp e
  não há garantia de que a compra foi concluída).
- **Caminhos de implementação futura:**
  1. **Checkout hospedado Nuvemshop:** após o redirecionamento de volta para
     `tramatto.com` (página de "obrigado"), ler `transaction_id`, `value`,
     `items` da URL/API da Nuvemshop e disparar `tramatto:purchase` no
     `DOMContentLoaded` dessa página — uma única vez (usar
     `sessionStorage`/`localStorage` para evitar duplicidade em
     recarregamentos).
  2. **Checkout via WhatsApp (curto prazo):** não há `purchase` automático
     possível. Como proxy, usar `begin_checkout` (7.5) como conversão
     principal, e complementar manualmente com dados de vendas do WhatsApp
     Business/Nuvemshop via importação de conversões offline no GA4.
- **`analytics.js` (quando aplicável):**
  ```js
  document.addEventListener('tramatto:purchase', (event) => {
    trackEcommerce('purchase', event.detail, getPageContext());
  });
  ```
  `event.detail` deve incluir `transaction_id`, `value`, `currency`, `items[]`
  (parâmetros obrigatórios do evento `purchase` no GA4).
- **Trigger/Tag GTM:** `CE - purchase` → `GA4 Event - purchase`, marcado como
  conversão principal (substitui `begin_checkout` como conversão "soft" assim
  que existir).
- **Objetivo de negócio:** mede receita real, ROAS de campanhas e alimenta
  estratégias de lances baseadas em valor no Google Ads.

### 7.7 Tabela resumo dos eventos adicionais

| Evento GA4 | Prioridade | Esforço | Pré-requisito | Trigger GTM sugerido |
|---|---|---|---|---|
| `select_item` | 1 | Baixo | Nenhum | `CE - select_item` |
| `add_to_cart` | 1 | Baixo | Nenhum (função `addToCart` já existe) | `CE - add_to_cart` |
| `begin_checkout` | 1 | Baixo | Botão "Finalizar pelo WhatsApp" (roadmap #3) | `CE - begin_checkout` |
| `view_cart` | 2 | Médio | Carrinho/drawer visível (roadmap #3) | `CE - view_cart` |
| `remove_from_cart` | 2 | Médio | Carrinho/drawer visível (roadmap #3) | `CE - remove_from_cart` |
| `purchase` | 3 | Alto | Checkout real (roadmap #21) | `CE - purchase` |
