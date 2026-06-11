# Auditoria Técnica — Tramatto Storefront

**Data:** 2026-06-10
**Escopo:** repositório completo (`c:\dev\tramatto.com`), 37 arquivos versionados, ~3.300 linhas de HTML/CSS/JS.
**Método:** análise estática do código-fonte e da documentação existente em `docs/`. Nenhum código foi alterado.

---

## 1. Resumo executivo

O projeto é um storefront estático (HTML/CSS/JS "vanilla", sem build step, sem framework e sem `package.json`) com uma camada de domínio/serviços bem desenhada para uma futura integração com a Nuvemshop. A arquitetura de domínio (`js/domain-model.js`, `js/services.js`, `js/adapters.js`) é o ponto mais forte do repositório. Os maiores riscos atuais são:

1. **Duas folhas de estilo divergentes** (`styles.css` na raiz vs `css/styles.css`), causando UI inconsistente entre `index.html` e as demais páginas.
2. **666 linhas de CSS comentado** dentro de `index.html` (dead code).
3. **Integração Nuvemshop 100% mockada** — `client.js` retorna sempre arrays vazios e aponta para um domínio de exemplo (`api.nuvemshop.example`); não há autenticação, paginação, nem checkout real.
4. **Catálogo com 4 produtos hardcoded** e imagens hotlinked do Unsplash — não escala para um catálogo real.
5. **Sem testes automatizados em CI, sem `package.json`/lint/build**, o que torna fácil reintroduzir as inconsistências acima sem detecção.

Nenhum problema de segurança crítico foi encontrado (não há `eval`, não há injeção de HTML não sanitizada visível), mas faltam controles básicos de hardening (CSP, SRI, headers de cache/segurança).

---

## 2. Arquitetura

### 2.1 Visão geral
```
index.html, collection.html, product.html, 404.html, pages/*.html  → páginas estáticas
css/styles.css, styles.css                                          → estilos (duplicados)
catalog-data.js                                                     → dados mock do catálogo
js/config.js                                                        → seleção de ambiente/adapter
js/domain-model.js                                                  → Product, Variant, Collection, Cart, Customer
js/services.js                                                      → CatalogService, ProductService, CollectionService, CartService
js/adapters.js                                                      → MockAdapter / NuvemshopAdapter
integrations/nuvemshop/*                                            → client, mapper, catalog, products, cart (camada Nuvemshop)
integrations/nuvemshop.js                                           → camada legada/paralela (fetchProducts/mapProduct)
script.js                                                           → renderização do DOM e bootstrap
js/analytics.js                                                     → dataLayer básico
```

### 2.2 Pontos fortes
- Separação em **domínio / serviço / adapter** ([js/domain-model.js](../js/domain-model.js), [js/services.js](../js/services.js), [js/adapters.js](../js/adapters.js)) segue um padrão Ports & Adapters limpo, permitindo trocar `MockAdapter` por `NuvemshopAdapter` via `js/config.js` sem tocar na UI.
- `CatalogService`, `ProductService`, `CollectionService`, `CartService` têm responsabilidades únicas e bem nomeadas.
- O modelo `Product`/`Variant` normaliza preços, estoque, variantes e SEO de forma consistente (`getPrimaryPrice`, `getHasPromotion`).

### 2.3 Problemas estruturais

| # | Problema | Local | Impacto |
|---|----------|-------|---------|
| A1 | **Duas implementações de integração Nuvemshop coexistindo**: `integrations/nuvemshop.js` (API antiga, `fetchProducts`/`mapProduct`, usada por nenhum arquivo carregado em runtime) e `integrations/nuvemshop/*` (API nova, usada pelo `NuvemshopAdapter`). A primeira está morta mas continua no repo e na documentação. | [integrations/nuvemshop.js](../integrations/nuvemshop.js) | Confusão para novos devs; manutenção duplicada; nenhum dos dois caminhos é exercitado por testes. |
| A2 | **Carregamento de scripts via `<script src>` em ordem manual repetida em 9 arquivos HTML** (index, collection, product, 404, 5 páginas institucionais). Qualquer novo módulo precisa ser adicionado em todos os arquivos, na ordem certa, manualmente. | todos os `*.html` | Alto risco de drift; já há indícios de drift no CSS (ver 2.4). |
| A3 | **Estado global via `globalThis`** (`TramattoDomain`, `TramattoServices`, `TramattoAdapters`, `TramattoConfig`, `TramattoNuvemshop*`) — funcional para scripts soltos, mas sem nenhum isolamento de namespace/versionamento, e cada módulo assume que os anteriores já carregaram (`root.TramattoDomain || {}`), falhando silenciosamente (retorna `{}`) se a ordem mudar. | [js/adapters.js](../js/adapters.js), [integrations/nuvemshop/*.js](../integrations/nuvemshop) | Erros silenciosos difíceis de depurar (ex.: `Catalog.fetchCatalog?.()` retorna `undefined` → `[]` sem aviso). |
| A4 | **`appState` global e `currentProductSelection` global** em `script.js`, sem encapsulamento — qualquer outro script pode mutar o estado da aplicação. | [script.js:1-2](../script.js#L1-L2) | Acoplamento alto; difícil de testar em isolamento. |

---

## 3. Qualidade de código

### 3.1 Pontos positivos
- `escapeHTML()` é usado consistentemente em `script.js` ao interpolar dados do catálogo no `innerHTML` (mitiga XSS via dados do produto).
- Nomenclatura clara e consistente em PT-BR para conteúdo, EN para código — convenção mantida.
- `tests/architecture.test.js` cobre o núcleo do domínio (`Product`, `Cart`, `CartService`) usando `node:test`, sem dependências externas — bom para CI leve.

### 3.2 Problemas

| # | Problema | Local | Recomendação |
|---|----------|-------|--------------|
| B1 | **666 linhas de CSS comentado** (`<!-- <style> ... </style> -->`) dentro de `index.html`, um resquício do protótipo original antes da extração para `css/styles.css`. | [index.html:54-720](../index.html#L54-L720) | Remover completamente; é ~40% do arquivo. |
| B2 | **`integrations/nuvemshop/client.js` é um stub permanente** — `getCatalog`, `getCollections`, `getCart`, `addToCart` etc. retornam dados vazios/`{ ok: true }` fixos, sem nenhuma chamada `fetch`. Isso está documentado como "fase 2", mas não há nenhum esqueleto de chamada HTTP real (headers, auth, paginação) para servir de ponto de partida. | [integrations/nuvemshop/client.js](../integrations/nuvemshop/client.js) | Definir contrato HTTP real (mesmo que atrás de feature flag) para reduzir o salto da Fase 3. |
| B3 | **Sem `package.json`** — não há como rodar `npm test`, não há lockfile, não há scripts de lint/build documentados. `tests/architecture.test.js` só roda via `node --test tests/` manual. | raiz do projeto | Adicionar `package.json` mínimo com `"test": "node --test tests/"` e (opcional) `lint`. |
| B4 | **Falta de testes para a camada de UI** (`script.js`, 321 linhas) — toda a renderização de DOM, carrinho, toasts e injeção de schema SEO não tem cobertura. | [script.js](../script.js) | Mesmo testes simples com `jsdom` cobririam regressões de template. |
| B5 | **Funções de renderização constroem HTML via template strings grandes** sem nenhuma camada de templating — funcional, mas qualquer novo campo de produto exige editar strings HTML manualmente em múltiplos lugares (`renderProducts`, `renderProductDetail`, `injectProductSchema`). | [script.js:94-308](../script.js#L94-L308) | Aceitável na escala atual; reavaliar se o catálogo crescer. |
| B6 | **Atributos `data-add-to-cart-kit`** comparam por `title` para localizar o produto correspondente (`appState?.products?.find(item => item.title === title)`), com fallback para `products[0]` — ou seja, "Adicionar à sacola" de um Kit pode adicionar um produto avulso não relacionado ao kit. | [script.js:172-178](../script.js#L172-L178) | Modelar Kits como entidades próprias no domínio, não como fallback de produto. |

---

## 4. Débito técnico

| # | Item | Detalhe |
|---|------|---------|
| D1 | **Duas folhas de estilo (`styles.css` e `css/styles.css`) com 164 linhas de diferença.** `index.html` referencia `styles.css` (raiz, 22.250 bytes); todas as outras 8 páginas referenciam `css/styles.css` (25.554 bytes). `css/styles.css` contém classes que `styles.css` não tem: `.product-variant-group`, `.variant-option`, `.product-gallery`, `.stock-pill`, `.collection-card` e **`.skip-link`**. | Ver seção 7 (Acessibilidade) — `index.html` não tem o link "Pular para o conteúdo" porque a classe `.skip-link` não existe na sua folha de estilo. |
| D2 | **`integrations/nuvemshop.js` legado** não é referenciado em nenhum HTML (`grep` confirma) — código morto mantido apenas pela documentação antiga (`docs/integration-flow.md`). | Remover ou consolidar com `integrations/nuvemshop/*`. |
| D3 | **Catálogo 100% hardcoded em `catalog-data.js`** (4 produtos, 2 coleções, 4 kits) com imagens apontando para `images.unsplash.com` — dependência externa não controlada para o "MVP" visual. | Substituir por assets próprios antes de produção; Unsplash pode trocar/remover URLs a qualquer momento. |
| D4 | **`js/config.js` aponta `staging`/`production` para `https://api.nuvemshop.example`**, um domínio de exemplo (RFC 2606-style) que não resolve. Se o adapter `nuvemshop` for ativado hoje, todas as chamadas falharão silenciosamente (client stub retorna vazio, não erro). | Configuração não deve ser promovida para produção sem endpoint real + segredo de loja. |
| D5 | **Documentação (`docs/*.md`) descreve um fluxo de checkout e carrinho "futuro"** que parcialmente já existe (carrinho local funcional) mas o checkout real não tem nenhum esqueleto de página/rota. `docs/nuvemshop-implementation-report.md` já está desatualizado em relação ao código (afirma "Conexão com a loja real ainda não ativada" — ainda válido, mas não reflete que há dois caminhos de integração). | Consolidar documentação após decidir qual caminho de integração seguir. |
| D6 | **Sem `.gitignore` de build artifacts relevante** (verificar conteúdo) e sem CI configurado (`.github/workflows` ausente) — testes existentes não rodam automaticamente. | Adicionar workflow de CI mínimo (lint + `node --test`). |

---

## 5. Performance

| # | Observação | Local |
|---|------------|-------|
| P1 | **Nenhuma imagem própria é servida** — todo o catálogo usa `images.unsplash.com/...?auto=format&fit=crop&w=800&q=80`, sempre na mesma resolução (800px) independentemente do viewport. Sem `srcset`/`sizes`, sem `loading="lazy"`, sem CDN própria. | [catalog-data.js](../catalog-data.js) |
| P2 | **CSS não minificado** (924 linhas / ~25 KB cada arquivo) e **duplicado** (raiz + `css/`) — o navegador paga o custo de duas folhas distintas dependendo da página visitada, sem aproveitar cache compartilhado entre `index.html` e as demais. | [styles.css](../styles.css), [css/styles.css](../css/styles.css) |
| P3 | **9 arquivos `<script>` carregados sequencialmente, sem `defer`/`async`**, em todas as páginas — bloqueiam o parsing até serem baixados e executados, mesmo em páginas que não usam catálogo (ex.: `pages/contact.html`, `404.html` ainda carregam toda a stack de domínio/Nuvemshop). | todos os `*.html`, bloco final | Adicionar `defer` é uma melhoria de baixo risco e baixo custo. |
| P4 | **Google Fonts carregadas via `<link>` externo** com `preconnect` (boa prática), mas sem fallback local nem `font-display` controlado além do `&display=swap` da própria URL — aceitável, mas é uma dependência de terceiro a mais no caminho crítico. | todos os `*.html` |
| P5 | **666 linhas de CSS morto em `index.html`** aumentam o tamanho do HTML transferido (download, mesmo que não interpretado). | [index.html:54-720](../index.html#L54-L720) |
| P6 | **`renderProducts` reconstrói todo o `innerHTML` da grade a cada chamada** (incluindo re-bind de listeners) — inofensivo com 4 produtos, mas não escalará para um catálogo grande sem paginação/virtualização. | [script.js:94-129](../script.js#L94-L129) |

---

## 6. SEO

### 6.1 Pontos fortes
- `index.html` tem Open Graph, Twitter Card, `meta description`, `meta keywords`, `canonical`, JSON-LD `Organization` e `WebSite`.
- `collection.html` e `product.html` têm `meta description`, `canonical` e JSON-LD (`CollectionPage`, `WebPage`) próprios.
- `injectProductSchema()` injeta dinamicamente `Product` + `BreadcrumbList` JSON-LD por produto, com preço, disponibilidade e imagens.
- `sitemap.xml` e `robots.txt` existem e apontam um para o outro corretamente.
- `404.html` tem `meta name="robots" content="noindex, nofollow"` corretamente configurado.

### 6.2 Problemas

| # | Problema | Detalhe |
|---|----------|---------|
| S1 | **`product.html` é uma única URL para todos os produtos** (`product.html?slug=...`). O `sitemap.xml` lista apenas `https://tramatto.com/product.html` (sem slugs) e o `<link rel="canonical">` estático no `<head>` de `product.html` aponta para `https://tramatto.com/product.html` sem slug — **toda variação de produto terá o mesmo canonical**, fazendo o Google tratar todas as páginas de produto como duplicatas/canônicas para uma URL sem conteúdo. O JSON-LD dinâmico (`injectProductSchema`) é injetado via JS após o load, mas o `<link rel="canonical">` estático **não é atualizado**. | [product.html:9](../product.html#L9), [script.js:267-308](../script.js#L267-L308) |
| S2 | **Conteúdo crítico (catálogo, produto, coleções, breadcrumbs JSON-LD) é renderizado 100% client-side** via `script.js` após `DOMContentLoaded`. Crawlers que não executam JS (ou com orçamento de rendering limitado) verão `collection.html`/`product.html` praticamente vazios (`<section id="collectionProducts"></section>` / `<section id="productDetail"></section>`). | [collection.html:55](../collection.html#L55), [product.html:48](../product.html#L48) |
| S3 | **Título da `<title>` de `product.html` é estático e genérico** (`Tramatto — Produto`) e não é atualizado dinamicamente com o nome do produto pela renderização JS — afeta SEO e a aba do navegador/compartilhamento. | [product.html:6](../product.html#L6), [script.js](../script.js) (sem `document.title =`) |
| S4 | **Páginas institucionais (`pages/*.html`) não constam no `sitemap.xml`** com `<changefreq>`/`<priority>` corretos — na verdade constam (about, contact, shipping, privacy, terms), porém **`pages/about.html` etc. usam links de navegação relativos sem `index.html#origem` funcionando corretamente fora do contexto raiz** — a navegação aponta `../index.html#origem`, ok, mas o link "Sobre o tecido" no footer (`href="#"`) é um link morto em todas as páginas. | [collection.html:88](../collection.html#L88), demais páginas |
| S5 | **Links de redes sociais são `href="#"`** (Instagram/Pinterest no footer de todas as páginas), exceto o `og:sameAs` no JSON-LD do `index.html` que aponta corretamente para `https://www.instagram.com/tramatto`. | rodapé de todas as páginas |

---

## 7. Acessibilidade

| # | Problema | Detalhe |
|---|----------|---------|
| AC1 | **`index.html` não tem "skip link"** (`<a class="skip-link" href="#mainContent">`), presente em `404.html` e em `pages/*.html`. Além disso, `.skip-link` **não existe em `styles.css`** (a folha usada por `index.html`), apenas em `css/styles.css` — então mesmo que o link fosse adicionado a `index.html`, ele não teria estilo (ficaria visível permanentemente em vez de aparecer só no foco). | [index.html](../index.html) vs [404.html:13](../404.html#L13), [css/styles.css] |
| AC2 | **Botão de menu mobile (`nav-hamburger`) tem `aria-label="Menu"` mas nenhum `aria-expanded`/`aria-controls`**, então leitores de tela não anunciam o estado aberto/fechado do `#mobileMenu`. | todas as páginas, `<button class="nav-hamburger" ...>` |
| AC3 | **Nenhuma imagem `<img>` é usada no site** — todas as "fotos" de produto são `<div class="photo-placeholder">` com `background-image` inline ou `<img>` apenas dentro da galeria de produto (`product-gallery-image`), e estas **têm `alt`** (`${product.title} ${index+1}`) — correto. Porém os cards de produto/kit na home/coleção (`.photo-placeholder`) são puramente decorativos com texto sobreposto em `<div>`, **sem papel semântico** (`role="img"` ou `aria-label`) para usuários de leitor de tela, que ouvirão apenas o texto sobreposto duplicado. | [script.js:97-117](../script.js#L97-L117) |
| AC4 | **Seleção de variante (`.variant-option`) é um `<button>`** com `selected` aplicado via classe CSS, mas sem `aria-pressed`/`role="radio"` em um `radiogroup` — leitores de tela não anunciam qual variante está selecionada. | [script.js:211-216](../script.js#L211-L216) |
| AC5 | **Toast de carrinho (`#cartToast`) não usa `aria-live`**, então usuários de leitor de tela não são notificados quando um item é adicionado à sacola. | [script.js:70-85](../script.js#L70-L85) |
| AC6 | **Contraste de cores não verificado** — paleta usa tons terrosos (`--text-muted: #7A6A5E` sobre `--warm-white: #FAF8F4`); recomenda-se checagem com ferramenta (axe/Lighthouse) pois `--text-light: #A89880` sobre fundo claro é candidato a falhar WCAG AA para texto pequeno. | [css/styles.css](../css/styles.css) (variáveis `:root`) |

---

## 8. Segurança

| # | Observação | Avaliação |
|---|------------|-----------|
| SEC1 | **`escapeHTML()` é aplicado de forma consistente** a todos os campos de produto/kit interpolados em `innerHTML` (`title`, `description`, `label`, `small`, `badge`, `colors`, etc.) em `script.js`. Não foram encontrados pontos óbvios de XSS via dados do catálogo local. | Positivo |
| SEC2 | **Dados vindos da Nuvemshop (futuro) passam pelo mesmo `mapper.js` → `Product`/`Variant`**, e a renderização em `script.js` aplica `escapeHTML` da mesma forma — a sanitização não depende da origem dos dados, o que é uma boa propriedade defensiva. | Positivo |
| SEC3 | **Sem Content-Security-Policy** (meta tag ou header) em nenhuma página — combinado com `<script src>` de domínios confiáveis apenas (próprios + Google Fonts), o risco atual é baixo, mas não há defesa em profundidade contra injeção de script de terceiros se um campo de dados externo (Nuvemshop) algum dia for renderizado fora do `escapeHTML`. | Recomendação |
| SEC4 | **Sem Subresource Integrity (SRI)** nos `<link>` de Google Fonts — risco baixo (Google CDN), mas é uma prática recomendada padrão. | Recomendação |
| SEC5 | **`localStorage` usado para persistir o carrinho completo** (`tramatto-cart`), incluindo objetos `product`/`variant` inteiros via `cart.toJSON()` — não há dados sensíveis (sem PII de cliente além de um `Customer` opcional vazio), mas o tamanho do carrinho no `localStorage` cresce sem limites/expiração. | Baixo risco, mas sem TTL/limpeza |
| SEC6 | **`integrations/nuvemshop/client.js` não envia nenhuma credencial** (sem token/API key) — quando a integração real for implementada, será necessário garantir que **nenhum segredo de API fique exposto no bundle client-side** (chamadas autenticadas devem passar por um backend/proxy, já que este é um site 100% estático). Isso não está endereçado em nenhum lugar da documentação atual. | **Atenção para a Fase 3** — risco de exposição de credenciais se a API Nuvemshop exigir chave secreta direto do navegador. |
| SEC7 | **`robots.txt` permite indexação total (`Allow: /`)**, incluindo, por exemplo, `tests/` e `docs/` se publicados no mesmo host estático — verificar se o deploy exclui pastas não destinadas ao público (`tests/`, `docs/`, `.gitignore`). | Verificar pipeline de deploy |

---

## 9. Integração Nuvemshop

### 9.1 Estado atual
- A arquitetura de adapters está pronta (`MockAdapter` ↔ `NuvemshopAdapter`), selecionável via `js/config.js` por ambiente (`development` → mock, `staging`/`production` → nuvemshop).
- `NuvemshopAdapter` delega para `integrations/nuvemshop/{catalog,products,cart}.js`, que por sua vez chamam `client.js` e mapeiam via `mapper.js` para o domínio (`Product`, `Variant`, `Collection`, `Cart`).
- **`client.js` é um stub completo**: `getCatalog()`, `getCollections()`, `getProductBySlug()`, `getCart()`, `addToCart()`, `removeFromCart()`, `updateQuantity()` retornam valores fixos vazios/`{ ok: true }`, sem nenhuma chamada de rede.
- `apiBaseUrl` para staging/produção aponta para `https://api.nuvemshop.example` (placeholder).

### 9.2 Lacunas para uma integração real
1. **Autenticação**: Nuvemshop usa OAuth2 + `Authentication: bearer <token>` e `User-Agent` obrigatório por loja (`store_id`). Nada disso está modelado em `client.js` — apenas um `storeId: 'demo-store'` de exemplo.
2. **Endpoints reais**: a API pública da Nuvemshop é `https://api.nuvemshop.com.br/v1/{store_id}/...` (ou `tiendanube.com` para outros países) — o domínio configurado (`api.nuvemshop.example`) não existe.
3. **Mapeamento de campos**: `mapper.js` assume nomes genéricos (`raw.price`, `raw.price_value`, `raw.image_url`) que **não correspondem ao schema real da API Nuvemshop** (que usa `variants[].price`, `images[].src`, `name.pt`/`description.pt` como objetos multilíngues, etc.). Isso vai exigir revisão completa do `mapper.js` quando a API real for conectada.
4. **Checkout**: não há nenhuma camada de checkout — a Nuvemshop normalmente redireciona para um checkout hospedado (`checkout.tiendanube.com`/Nuvemshop Checkout) usando o `cart_id`/`token` retornado pela API de carrinho. O `CartService` atual é 100% local (`localStorage`), sem nenhum ponto de integração com o checkout hospedado.
5. **Paginação/limites**: `fetchCatalog` (`integrations/nuvemshop/catalog.js`) não pagina — a API Nuvemshop limita a 200 produtos por página e usa headers `Link` para paginação; não modelado.
6. **Duplicação**: `integrations/nuvemshop.js` (legado, não usado) descreve um fluxo `fetchProducts(url)` simples baseado em uma URL de produtos própria — conceito incompatível com o adapter atual e deveria ser removido para evitar confusão sobre "qual é o caminho real".

### 9.3 Recomendação de sequência
1. Remover `integrations/nuvemshop.js` (legado) e atualizar `docs/integration-flow.md`.
2. Definir e documentar o contrato real da API Nuvemshop (endpoints, auth, paginação) antes de implementar `client.js`.
3. Reescrever `mapper.js` com base no schema real (campos multilíngues, `variants[]`, `images[]`).
4. Definir estratégia de checkout (redirecionamento para checkout hospedado vs. carrinho próprio) — hoje não há nenhuma decisão registrada.
5. Avaliar necessidade de um pequeno backend/proxy (mesmo serverless) caso a API exija credenciais que não devam ficar no client.

---

## 10. Escalabilidade

| # | Observação |
|---|------------|
| SC1 | **Catálogo hardcoded (`catalog-data.js`, 4 produtos)** — a UI (`renderProducts`, `renderProductDetail`) itera sobre arrays em memória sem paginação; funcional até dezenas de produtos, mas sem virtualização/paginação não escalará para centenas. |
| SC2 | **9 arquivos `<script>` por página, carregados via tag separada** — cada novo módulo aumenta linearmente o número de requisições HTTP em **todas** as páginas (inclusive institucionais que não precisam de catálogo). Sem bundler, esse custo cresce a cada nova feature. |
| SC3 | **Arquitetura de domínio/serviço/adapter é a peça que melhor suporta crescimento** — uma vez que `NuvemshopAdapter` esteja implementado de verdade, o restante da aplicação (UI, SEO, carrinho) não deveria precisar mudar, o que é o maior ativo do projeto para escalar. |
| SC4 | **Falta de build/bundling** torna inviável otimizações futuras (code splitting, tree-shaking, minificação) sem uma reestruturação — atualmente cada HTML carrega toda a stack independente do que a página realmente usa. |
| SC5 | **Sem internacionalização** — todo o conteúdo está hardcoded em PT-BR (UI, schema.org, mensagens). Se houver expansão internacional, exigirá refatoração ampla de `script.js` e dos templates HTML. |

---

## 11. Recomendações priorizadas

### Curto prazo (baixo esforço, alto impacto)
1. **Unificar `styles.css` e `css/styles.css`** em um único arquivo referenciado por todas as páginas (corrige D1/AC1 — habilita o skip-link em `index.html`).
2. **Remover o bloco de 666 linhas de CSS comentado** em `index.html` (B1/P5).
3. **Remover `integrations/nuvemshop.js`** (legado, não referenciado) e atualizar `docs/integration-flow.md`/`docs/nuvemshop-integration.md` (A1/D2).
4. Adicionar `defer` aos `<script src>` em todas as páginas (P3).
5. Adicionar `aria-expanded` ao botão de menu mobile e `aria-live="polite"` ao toast do carrinho (AC2/AC5).
6. Corrigir links `href="#"` no rodapé (Instagram/Pinterest "Sobre o tecido") (S5).

### Médio prazo
7. Adicionar `package.json` com script de teste (`node --test tests/`) e configurar CI básico (B3/D6).
8. Atualizar dinamicamente `<title>` e `<link rel="canonical">` em `product.html` por slug, e considerar pré-renderização (SSG) ou ao menos `prerender`/snapshot para crawlers (S1/S2/S3).
9. Substituir imagens Unsplash por assets próprios com `srcset`/`loading="lazy"` (P1/D3).
10. Modelar Kits como entidade própria no domínio em vez de fallback por título (B6).

### Longo prazo (Fase 3 — Nuvemshop real)
11. Implementar `client.js` com endpoints/autenticação reais da API Nuvemshop, reescrever `mapper.js` conforme schema real, e definir a estratégia de checkout (seção 9.3).
12. Avaliar necessidade de bundler (Vite/esbuild) para resolver SC2/SC4 antes de a stack de scripts crescer mais.

---

## Apêndice — Inventário de arquivos analisados

| Arquivo | Linhas | Observação |
|---|---|---|
| index.html | 993 | 666 linhas de CSS morto comentado |
| collection.html | 111 | |
| product.html | 104 | canonical/title estáticos |
| 404.html | 51 | `noindex` correto |
| script.js | 321 | bootstrap + render + carrinho |
| catalog-data.js | 138 | dados mock, imagens Unsplash |
| js/config.js | 61 | seleção de ambiente/adapter |
| js/domain-model.js | 144 | Product/Variant/Collection/Cart/Customer |
| js/services.js | 150 | Catalog/Product/Collection/CartService |
| js/adapters.js | 95 | MockAdapter / NuvemshopAdapter |
| js/analytics.js | 27 | dataLayer básico |
| integrations/nuvemshop.js | 41 | **legado, não usado** |
| integrations/nuvemshop/client.js | 43 | stub, sem chamadas reais |
| integrations/nuvemshop/mapper.js | 68 | mapeamento genérico |
| integrations/nuvemshop/catalog.js | 23 | |
| integrations/nuvemshop/products.js | 17 | |
| integrations/nuvemshop/cart.js | 35 | |
| css/styles.css | 924 | usado por 8 páginas |
| styles.css | ~760 | usado só por index.html, 164 linhas atrás de css/styles.css |
| tests/architecture.test.js | 62 | cobre domínio + CartService |
| pages/*.html | 5 arquivos | about, contact, privacy, shipping, terms |
