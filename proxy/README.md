# Proxy Nuvemshop (Fase 1 — catálogo)

Worker Cloudflare que fica entre o frontend estático (`tramatto.com`) e a
API oficial da Nuvemshop. É o único lugar do projeto autorizado a conhecer
o `access_token` da loja. O frontend nunca recebe `access_token`,
`client_secret` ou qualquer header `Authorization`.

Endpoints expostos (somente leitura, Fase 1):

- `GET /products` — repassa para `GET /v1/{store_id}/products` da Nuvemshop
- `GET /categories` — repassa para `GET /v1/{store_id}/categories` da Nuvemshop

Query params são filtrados por allowlist (ver `src/index.js`) antes de
serem repassados — o proxy nunca encaminha parâmetros arbitrários.

## Robustez

- **Timeout**: cada chamada upstream tem 8s de limite (`AbortController`);
  passado isso, o proxy responde `502` ao invés de travar.
- **Rate limit**: a Nuvemshop aceita ~2 req/s por loja+app (Leaky Bucket,
  pico de 40) e responde `429` quando excedido. O proxy tenta de novo até
  3 vezes, respeitando o header `x-rate-limit-reset` quando presente.
- **Falha de rede/upstream indisponível**: retorna `502 { error: "upstream_request_failed" }`
  ao cliente, sem detalhes internos.
- **Paginação**: os headers `X-Total-Count` e `Link` da Nuvemshop são
  repassados ao frontend (via `Access-Control-Expose-Headers`), para que o
  cliente siga a recomendação oficial de paginar pelo header `Link` em vez
  de adivinhar o fim da lista.

## Cache

Respostas de sucesso de `/products` e `/categories` ficam em cache no edge
(Cloudflare Cache API) por 5 minutos (`Cache-Control: public, max-age=300`).
Isso reduz chamadas redundantes à API sem transformar o cache em uma
segunda fonte de verdade — o catálogo real continua sendo o da Nuvemshop, e
o cache expira sozinho. Respostas de erro ou `429` nunca são cacheadas. A
resposta inclui o header `X-Tramatto-Cache: HIT|MISS` para depuração.

## Pré-requisitos

- Conta Cloudflare (free tier é suficiente)
- `npm install -g wrangler` (ou `npx wrangler`)
- Um app privado criado na loja Nuvemshop da Tramatto (loja ID `5828361`,
  app "Tramatto Frontend"), com escopo `read_products`, gerando um
  `access_token` permanente (Admin da loja > Configurações > Apps >
  "Criar aplicativo próprio", conforme documentado pela Nuvemshop)

> `NUVEMSHOP_STORE_ID` não é um segredo por si só, mas por convenção deste
> projeto ele não fica hardcoded em `wrangler.toml` (arquivo versionado).
> Configure-o como variável no painel Cloudflare (Worker > Settings >
> Variables) em produção, ou em `.dev.vars` (git-ignorado) localmente. Valor
> da Tramatto: `5828361`.

## Rodando localmente

```bash
cd proxy
cp .dev.vars.example .dev.vars
# edite .dev.vars com o access_token/store_id de uma loja de TESTE
wrangler dev
```

Isso sobe o proxy em `http://localhost:8787`. Teste com:

```bash
curl "http://localhost:8787/products?page=1&per_page=5"
```

## Deploy

```bash
cd proxy
wrangler login
wrangler secret put NUVEMSHOP_ACCESS_TOKEN
# defina NUVEMSHOP_STORE_ID: edite [vars] em wrangler.toml OU configure
# pelo painel Cloudflare (Worker > Settings > Variables) para não
# versionar o ID real da loja
wrangler deploy
```

O deploy retorna uma URL do tipo `https://tramatto-nuvemshop-proxy.<sua-conta>.workers.dev`.
Essa URL é o `apiBaseUrl` que `js/config.js` usa no ambiente `production`
(veja o comentário nesse arquivo — hoje contém um placeholder que precisa
ser substituído pela URL real antes de ir para produção).

## Segurança

- `NUVEMSHOP_ACCESS_TOKEN` só existe como secret do Worker — nunca em
  arquivo versionado, nunca na resposta HTTP.
- CORS restrito às origens em `ALLOWED_ORIGINS` (`wrangler.toml`).
- Apenas `GET` é aceito; qualquer outro método retorna `405`.
- Fase 1 não implementa nenhuma operação de escrita (carrinho/checkout
  continuam fora deste proxy — ver auditoria da Fase 2).
