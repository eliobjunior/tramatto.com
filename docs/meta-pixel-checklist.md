# Meta Pixel — Checklist Operacional (Tramatto)

> Referência cruzada: [docs/meta-pixel-implementation.md](meta-pixel-implementation.md)
> Container GTM: `GTM-W7NZMTL7`

---

## Fase 1 — Criação do Pixel no Meta Business Manager

- [ ] Acessar [business.facebook.com](https://business.facebook.com) com a conta da Tramatto
- [ ] Navegar para: **Gerenciador de Eventos** → **Conectar fontes de dados** → **Web**
- [ ] Selecionar **Meta Pixel** → clicar em **Conectar**
- [ ] Nomear o Pixel: `Tramatto Web`
- [ ] Informar a URL do site: `https://tramatto.com`
- [ ] Copiar e salvar o **Pixel ID** gerado (formato: 15–16 dígitos numéricos)
- [ ] Confirmar que o Pixel aparece na lista do Gerenciador de Eventos com status "Sem atividade recente" (esperado antes da instalação)

---

## Fase 2 — Pré-verificação do GTM

- [ ] Abrir o GTM em [tagmanager.google.com](https://tagmanager.google.com) → container `GTM-W7NZMTL7`
- [ ] Verificar se os 7 Custom Event triggers existentes estão publicados:
  - [ ] `CE - click_whatsapp`
  - [ ] `CE - click_instagram`
  - [ ] `CE - click_ver_colecao`
  - [ ] `CE - scroll_90`
  - [ ] `CE - view_collection`
  - [ ] `CE - view_product`
  - [ ] `CE - search`
- [ ] Ativar **GTM Preview Mode** e abrir `https://tramatto.com` para confirmar que os eventos GA4 estão chegando corretamente antes de adicionar o Pixel
- [ ] Verificar no Preview Mode se `ecommerce.value` em `view_product` é do tipo **number** (não string)
  - Se for string `"R$ 120,00"`: resolver a conversão antes de prosseguir (ver Risco 1 em `meta-pixel-implementation.md`)
- [ ] Verificar se o snippet GTM em `index.html` está posicionado dentro do `<head>` (linha esperada: antes de `</head>`)

---

## Fase 3 — Instalação via GTM

### 3.1 Criar variável Pixel ID
- [ ] Em **Variáveis** → **Nova variável**
- [ ] Tipo: **Constante**
- [ ] Nome: `CONST - Meta Pixel ID`
- [ ] Valor: colar o Pixel ID da Fase 1
- [ ] Salvar

### 3.2 Criar variáveis DLV adicionais
- [ ] Criar `DLV - ecommerce.items` → tipo Data Layer Variable → caminho: `ecommerce.items`
- [ ] Criar `DLV - ecommerce.value` → tipo Data Layer Variable → caminho: `ecommerce.value`

### 3.3 Criar tag — Meta Pixel Base Code
- [ ] Nova tag → tipo **Custom HTML**
- [ ] Nome: `Meta Pixel — Base Code`
- [ ] Trigger: **All Pages**
- [ ] Conteúdo HTML:
  ```html
  <script>
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', '{{CONST - Meta Pixel ID}}');
  fbq('track', 'PageView');
  </script>
  ```
- [ ] Salvar

### 3.4 Criar tag — ViewContent (Produto)
- [ ] Nova tag → tipo **Custom HTML**
- [ ] Nome: `Meta Pixel — ViewContent (Produto)`
- [ ] Trigger: `CE - view_product`
- [ ] Conteúdo HTML:
  ```html
  <script>
  var items = {{DLV - ecommerce.items}} || [];
  var ids = items.map(function(i){ return i.item_id; });
  var name = items[0] ? items[0].item_name : '';
  fbq('track', 'ViewContent', {
    content_ids: ids,
    content_type: 'product',
    content_name: name,
    value: {{DLV - ecommerce.value}},
    currency: 'BRL'
  });
  </script>
  ```
- [ ] Salvar

### 3.5 Criar tag — ViewContent (Coleção)
- [ ] Nova tag → tipo **Custom HTML**
- [ ] Nome: `Meta Pixel — ViewContent (Coleção)`
- [ ] Trigger: `CE - view_collection`
- [ ] Conteúdo HTML:
  ```html
  <script>
  var ecomm = {{DLV - ecommerce}} || {};
  var items = ecomm.items || [];
  var ids = items.map(function(i){ return i.item_id; });
  fbq('track', 'ViewContent', {
    content_ids: ids,
    content_type: 'product_group',
    content_name: ecomm.item_list_name || 'Coleção Tramatto'
  });
  </script>
  ```
- [ ] Salvar

### 3.6 Criar tag — ViewContent (CTA Hero)
- [ ] Nova tag → tipo **Custom HTML**
- [ ] Nome: `Meta Pixel — ViewContent (CTA Hero)`
- [ ] Trigger: `CE - click_ver_colecao`
- [ ] Conteúdo HTML:
  ```html
  <script>
  fbq('track', 'ViewContent', {
    content_type: 'product_group',
    content_name: 'Coleção Tramatto'
  });
  </script>
  ```
- [ ] Salvar

### 3.7 Criar tag — Search
- [ ] Nova tag → tipo **Custom HTML**
- [ ] Nome: `Meta Pixel — Search`
- [ ] Trigger: `CE - search`
- [ ] Conteúdo HTML:
  ```html
  <script>
  fbq('track', 'Search', {
    search_string: {{DLV - search_term}}
  });
  </script>
  ```
- [ ] Salvar

### 3.8 Criar tag — Contact (WhatsApp)
- [ ] Nova tag → tipo **Custom HTML**
- [ ] Nome: `Meta Pixel — Contact (WhatsApp)`
- [ ] Trigger: `CE - click_whatsapp`
- [ ] Conteúdo HTML:
  ```html
  <script>
  fbq('track', 'Contact');
  </script>
  ```
- [ ] Salvar

### 3.9 Criar tag — Custom scroll_90
- [ ] Nova tag → tipo **Custom HTML**
- [ ] Nome: `Meta Pixel — Custom scroll_90`
- [ ] Trigger: `CE - scroll_90`
- [ ] Conteúdo HTML:
  ```html
  <script>
  fbq('trackCustom', 'scroll_90', {
    percent_scrolled: {{DLV - percent_scrolled}},
    page_path: {{DLV - page_path}}
  });
  </script>
  ```
- [ ] Salvar

### 3.10 Criar tag — Custom click_instagram
- [ ] Nova tag → tipo **Custom HTML**
- [ ] Nome: `Meta Pixel — Custom click_instagram`
- [ ] Trigger: `CE - click_instagram`
- [ ] Conteúdo HTML:
  ```html
  <script>
  fbq('trackCustom', 'click_instagram', {
    link_url: '{{DLV - link_url}}'
  });
  </script>
  ```
- [ ] Salvar

---

## Fase 4 — Validação no GTM Preview Mode

- [ ] Clicar em **Preview** no GTM e abrir `https://tramatto.com`
- [ ] Confirmar que a tag `Meta Pixel — Base Code` dispara em **All Pages**
- [ ] Instalar a extensão **Meta Pixel Helper** no Chrome (se não instalada)
- [ ] Verificar no Meta Pixel Helper que o evento `PageView` aparece na home (`/`)
- [ ] Navegar para `collection.html` e confirmar:
  - [ ] `PageView` disparado
  - [ ] `ViewContent` (Coleção) disparado após a grade carregar
  - [ ] Clicar em um produto e confirmar redirecionamento para `product.html`
- [ ] Navegar para `product.html` e confirmar:
  - [ ] `PageView` disparado
  - [ ] `ViewContent` (Produto) disparado com `content_ids`, `content_type: "product"`, `value` numérico
- [ ] Ainda em `collection.html`: digitar um termo no campo de busca e confirmar:
  - [ ] `Search` disparado com `search_string` preenchido
- [ ] Clicar no botão WhatsApp (flutuante) e confirmar:
  - [ ] `Contact` disparado
- [ ] Clicar no CTA "Ver a coleção" (hero da home) e confirmar:
  - [ ] `ViewContent` (CTA Hero) disparado
- [ ] Rolar qualquer página até o final e confirmar:
  - [ ] `CustomEvent: scroll_90` disparado
- [ ] Clicar no ícone do Instagram (rodapé) e confirmar:
  - [ ] `CustomEvent: click_instagram` disparado

---

## Fase 5 — Validação no Meta Events Manager

- [ ] Acessar [business.facebook.com/events_manager](https://business.facebook.com/events_manager)
- [ ] Selecionar o Pixel `Tramatto Web`
- [ ] Na aba **Testar Eventos**: inserir `https://tramatto.com` e abrir o link gerado
- [ ] Navegar pelas páginas e verificar que os eventos aparecem em tempo real no painel:
  - [ ] `PageView` — todas as páginas
  - [ ] `ViewContent` — produto e coleção
  - [ ] `Search` — ao pesquisar na coleção
  - [ ] `Contact` — ao clicar no WhatsApp
  - [ ] Eventos customizados — `scroll_90`, `click_instagram`
- [ ] Verificar se não há erros de validação (ícone vermelho) nos eventos padrão
- [ ] Confirmar que `ViewContent` de produto tem `value` com tipo numérico (sem `R$`)
- [ ] Confirmar que `content_ids` está preenchido e não está vazio

---

## Fase 6 — Publicação e Testes Finais

- [ ] Voltar ao GTM e criar uma nova **versão** com nome: `v{N} — Meta Pixel inicial`
- [ ] Adicionar nota de versão descrevendo as 8 tags adicionadas
- [ ] **Publicar** a versão
- [ ] Aguardar 24h e acessar o Gerenciador de Eventos para confirmar:
  - [ ] Status do Pixel mudou para "Ativo"
  - [ ] Eventos aparecem no gráfico de atividade
  - [ ] Nenhum alerta de "Sinal de baixa qualidade de correspondência"
- [ ] Verificar na aba **Diagnósticos** se há sugestões de melhoria (ex: parâmetros ausentes)
- [ ] Documentar o Pixel ID no `docs/gtm-config.json` adicionando a chave `"metaPixelId"`

---

## Resumo — Contagem de Itens GTM

| Item | Quantidade | Criação necessária |
|---|---|---|
| Tags | 8 | Sim (todas novas) |
| Triggers | 7 | Não (todos existentes) |
| Variáveis novas | 3 | Sim (`CONST - Meta Pixel ID`, `DLV - ecommerce.items`, `DLV - ecommerce.value`) |
| Variáveis reutilizadas | 7 | Não (já existentes) |
