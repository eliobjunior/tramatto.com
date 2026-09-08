# Integração Nuvemshop — arquitetura definitiva

## Objetivo
Tornar o Tramatto.com uma vitrine/frontend próprio da marca, com a Nuvemshop
como fonte oficial dos dados comerciais (catálogo, estoque, preço) e como
ambiente final de checkout/pagamento.

```
Nuvemshop → API oficial → proxy/ (Cloudflare Worker) → tramatto.com
   → carrinho próprio (localStorage) → cliente clica em Comprar
   → carrinho/checkout real da Nuvemshop
```

## Loja
- Loja Nuvemshop: Tramatto, ID `5828361`, plano Escala.
- App próprio: "Tramatto Frontend", escopo `read_products` (somente leitura).
- Domínio da loja Nuvemshop: `https://tramatto.lojavirtualnuvem.com.br`.

## Modelo de domínio (js/domain-model.js)
- `Product`: produto com preço, descrição, estoque, galeria, variantes e coleção.
- `Variant`: variação (cor/tamanho/SKU), preserva `id` = variant_id real da Nuvemshop.
- `Collection`: agrupamento editorial/navegação (mapeado de `categories`).
- `Cart` / `CartItem`: carrinho local, `lineId` único por produto+variante
  (nunca mescla variantes diferentes do mesmo produto na mesma linha).
- `Customer`: reservado para checkout futuro (não usado hoje).

## Serviços (js/services.js)
- `CatalogService` / `ProductService` / `CollectionService`: leitura de catálogo.
- `CartService`: add/remove/update quantidade, persistência em `localStorage`
  (chave `tramatto-cart`).

## Adapters (js/adapters.js)
Três adapters, selecionados por `js/config.js` conforme o hostname:

| Adapter | Quando roda | Fonte dos dados |
|---|---|---|
| `MockAdapter` | dev/local | `catalog-data.js` (fixtures) |
| `MirrorAdapter` | produção (`tramatto.com`) hoje | `nuvemshop-mirror-data.js`, gerado por scraping público (`scripts/sync-nuvemshop-mirror.js`) |
| `NuvemshopAdapter` | produção, após validação | API real via `proxy/` |

`NuvemshopAdapter` nunca propaga erro para a UI: qualquer falha (API fora
do ar, timeout, rate limit) faz cada método cair para lista vazia / `null`
/ `Cart` vazio, e o storefront mostra um estado vazio amigável em vez de
travar em branco (ver `tests/nuvemshop-robustness.test.js`).

**Migração para `NuvemshopAdapter` em produção**: trocar `adapter: 'mirror'`
para `adapter: 'nuvemshop'` no bloco `production` de `js/config.js`, com
`apiBaseUrl` apontando para o Worker já deployado. Só fazer isso depois de
validar em `staging` que a saída do `NuvemshopAdapter` bate com o mirror
atual. O `MirrorAdapter` continua no código como rede de segurança até essa
validação — não remover antes disso.

## Camada Nuvemshop (integrations/nuvemshop/)
- `client.js`: fala exclusivamente com o proxy (nunca com `api.nuvemshop.com.br`
  diretamente, nunca vê o `access_token`). Timeout de 8s por requisição.
- `mapper.js`: `NuvemshopProduct → TramattoProduct`, único lugar que
  transforma o schema real da API (campos multilíngues `name`/`description`/
  `handle`, variantes com `values[]` posicionais, `stock: ""` = ilimitado,
  imagens ordenadas por `position`).
- `catalog.js`: pagina `GET /products` e `GET /categories` (até 200
  itens/página, trava de segurança em 20 páginas).
- `products.js`: busca produto por slug (via `handle`).
- `cart.js`: stub — carrinho/checkout da Nuvemshop ficam fora desta camada
  (ver seção "Carrinho" abaixo).

## Proxy seguro (proxy/ — Cloudflare Worker)
Único ponto do projeto autorizado a conhecer o `access_token`. Detalhes,
deploy e segurança em [proxy/README.md](../proxy/README.md). Resumo:

- `GET /products`, `GET /categories` → repassam para `GET /v1/{store_id}/...`
  da Nuvemshop, com `Authorization: Bearer` do lado do servidor.
- Allowlist de query params, CORS restrito por origem.
- Timeout (8s), retry com backoff em `429` (rate limit — Nuvemshop aceita
  ~2 req/s, pico de 40), cache de 5min no edge para reduzir chamadas
  redundantes (a Nuvemshop continua sendo a fonte de verdade; o cache só
  reduz tráfego).
- Headers `X-Total-Count`/`Link` repassados ao frontend para paginação.

## Carrinho (Fase 7) — js/cart-ui.js
Drawer acessível pelo ícone "Sacola" no header (desktop) e no menu mobile,
em `index.html`, `collection.html` e `product.html`:

- Lista itens com imagem, nome, variante, preço, quantidade (+/-) e remover.
- Subtotal calculado em tempo real a partir do `CartService`.
- Persistência via `CartService` (localStorage) — sobrevive a reload.
- Cada variante distinta do mesmo produto vira uma linha própria (`lineId`
  inclui `variantId`); o `variant_id` real nunca é usado só como referência
  auxiliar — é a chave que identifica a linha.

### Checkout a partir do carrinho local
Não existe hoje um mecanismo validado para transferir um carrinho com
**múltiplos itens/produtos distintos** para o carrinho real da Nuvemshop
(isso é o trabalho da Fase 9-11, NubeSDK — ver abaixo). Enquanto isso:

- **1 linha no carrinho** → botão "Comprar agora" usa o link nativo
  `/comprar/{variant_id}-{quantity}/` (`js/purchase.js`), validado
  manualmente contra a loja real. Nunca usado para mais de 1 linha.
- **Carrinho multi-item** → botão "Finalizar pelo WhatsApp" abre uma
  conversa (mesmo número já usado no botão flutuante do site) com os itens
  e o subtotal pré-preenchidos. Não processa pagamento nenhum — é uma ponte
  manual até o checkout real existir, estratégia já registrada no roadmap
  técnico (item #3).

## Próxima fase — NubeSDK (Fase 9-11, ainda não iniciada)
Objetivo: usar o [NubeSDK](https://dev.nuvemshop.com.br/docs/applications/nube-sdk/overview)
(app rodando dentro da própria Nuvemshop, em Web Worker) para que o clique
em "Comprar" no Tramatto.com resulte em um carrinho real da Nuvemshop com
os itens corretos, usando os eventos `cart:add`/`cart:add:success`/
`cart:add:fail` etc.

Isso **precisa de validação com a loja real antes de qualquer implementação
final** — em especial, como fazer o hand-off cross-origin de
`tramatto.com` para a Nuvemshop (a navegação interna do NubeSDK é limitada
ao domínio da própria loja). Plano:

1. Criar o app NubeSDK da Tramatto no admin da Nuvemshop.
2. Prova de conceito com 2 produtos: confirmar que ambos chegam ao carrinho
   real da Nuvemshop a partir de um clique no Tramatto.com.
3. Só then integrar ao botão "Comprar agora" do drawer.

Até lá, a ponte WhatsApp cobre o caso multi-item.

## Segurança
- `access_token` só existe como secret do Worker (`wrangler secret put`) —
  nunca em arquivo versionado, nunca no bundle do frontend, nunca em
  `localStorage`/`sessionStorage`.
- `NUVEMSHOP_STORE_ID` (`5828361`) não é segredo, mas por convenção não
  fica hardcoded em `wrangler.toml` — configurar via painel Cloudflare
  (produção) ou `.dev.vars` git-ignorado (local).
- Logs do proxy nunca incluem o header `Authorization` nem o token.

## Rodando localmente
- Frontend: qualquer servidor estático (ex.: `npx serve .`) — hostname
  diferente de `tramatto.com`/`www.tramatto.com` sempre usa `MockAdapter`.
- Proxy: `cd proxy && cp .dev.vars.example .dev.vars` (preencher com
  credenciais de uma loja de teste) `&& wrangler dev`.
- Testes: `node --test tests/*.test.js` (sem dependência de credencial real).

## Deploy
- Frontend: GitHub Pages (arquivo `CNAME`), publica direto da branch `main`.
- Proxy: `cd proxy && wrangler login && wrangler secret put NUVEMSHOP_ACCESS_TOKEN && wrangler deploy`
  (ver [proxy/README.md](../proxy/README.md)). Após o deploy, atualizar
  `apiBaseUrl` de produção em `js/config.js` com a URL real do Worker.

## Revogar/rotacionar o token
No admin da Nuvemshop: Configurações > Apps > "Tramatto Frontend" → revogar
o app (invalida o `access_token` imediatamente) e criar um novo se
necessário. Depois, `wrangler secret put NUVEMSHOP_ACCESS_TOKEN` no proxy
com o novo valor.
