/**
 * Tramatto — proxy Nuvemshop (Cloudflare Worker)
 *
 * Único ponto que fala com a API da Nuvemshop. Guarda o access_token como
 * secret (env.NUVEMSHOP_ACCESS_TOKEN) e nunca o expõe na resposta. O
 * frontend estático (tramatto.com) só conhece a URL deste proxy — nunca o
 * token nem qualquer header de autenticação.
 *
 * Fase 1: somente leitura de catálogo (produtos e categorias).
 * Carrinho e checkout continuam fora deste proxy (ver docs da Fase 2).
 */

// Versão confirmada na documentação oficial (dev.nuvemshop.com.br /
// tiendanube.github.io/api-documentation): a API Nuvemshop usa "v1" no
// path, não uma data. Não trocar sem reconfirmar contra a doc oficial.
const NUVEMSHOP_API_VERSION = 'v1';

// Nuvemshop: até 2 req/s com pico de 40 (Leaky Bucket), por loja+app.
// Em 429 ela devolve x-rate-limit-reset (ms até esvaziar o bucket).
const MAX_UPSTREAM_ATTEMPTS = 3;
const DEFAULT_RETRY_DELAY_MS = 500;
const UPSTREAM_TIMEOUT_MS = 8000;

// Catálogo muda por ação humana no admin da Nuvemshop, não a cada segundo —
// um cache curto no edge evita bater na API a cada carregamento de página
// sem deixar o catálogo defasado por muito tempo. A Nuvemshop continua
// sendo a fonte de verdade; isto é só para reduzir chamadas redundantes.
const CACHE_TTL_SECONDS = 300;

// Allowlist de query params repassados à Nuvemshop — evita que um cliente
// injete parâmetros arbitrários na chamada upstream.
const PRODUCTS_ALLOWED_PARAMS = new Set([
  'page', 'per_page', 'handle', 'category_id', 'q', 'ids', 'since_id',
  'published', 'visibility', 'sort_by', 'fields', 'language',
  'updated_at_min', 'updated_at_max', 'created_at_min', 'created_at_max'
]);

const CATEGORIES_ALLOWED_PARAMS = new Set(['page', 'per_page', 'parent_id', 'fields', 'language']);

// Fase 2B — hand-off one-time de carrinho Tramatto → carrinho nativo
// Nuvemshop via NubeSDK. cart:add roda no client-side do storefront, na
// sessão do próprio visitante — este endpoint nunca fala com a API da
// Nuvemshop, só grava/lê a KV própria do Worker. Por isso não depende de
// NUVEMSHOP_ACCESS_TOKEN/STORE_ID.
const CART_TRANSFER_TTL_SECONDS = 600; // ~10min: tempo de redirect + load.
const CART_TRANSFER_MIN_ITEMS = 1;
const CART_TRANSFER_MAX_ITEMS = 20;
const CART_TRANSFER_MIN_QUANTITY = 1;
const CART_TRANSFER_MAX_QUANTITY = 20;
// Token é sempre um crypto.randomUUID() — valida o formato antes de
// consultar a KV, tanto para rejeitar lixo cedo quanto para nunca deixar um
// valor arbitrário do cliente virar chave de busca sem verificação.
const CART_TRANSFER_TOKEN_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Webhooks LGPD obrigatórios (store/redact, customers/redact,
// customers/data_request) — exigidos pela Nuvemshop para liberar o link de
// instalação do app no Partner Portal (ver docs/nuvemshop-integration.md).
// Semanticamente mínimos de propósito: este projeto nunca armazenou dado
// pessoal de cliente em lugar nenhum (nem aqui, nem no NubeSDK/nube-app),
// então não há o que "redact" nem que reportar — só confirmam recebimento.
// Nunca persistem nem logam o corpo da requisição.
const LGPD_HMAC_HEADER = 'x-linkedstore-hmac-sha256';
const textEncoder = new TextEncoder();

function parseAllowedOrigins(env) {
  return (env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function buildCorsHeaders(request, env) {
  const allowedOrigins = parseAllowedOrigins(env);
  const origin = request.headers.get('Origin');

  const headers = {
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    // x-total-count/Link permitem que o frontend pagine seguindo a
    // recomendação oficial (usar o header Link em vez de construir a URL
    // da próxima página manualmente) em vez de adivinhar pelo tamanho da página.
    'Access-Control-Expose-Headers': 'X-Total-Count, Link',
    Vary: 'Origin'
  };

  if (origin && allowedOrigins.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  }

  return headers;
}

function jsonResponse(body, status, corsHeaders) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...corsHeaders
    }
  });
}

function buildNuvemshopUrl(env, resource, searchParams, allowedParams) {
  const url = new URL(`https://api.nuvemshop.com.br/${NUVEMSHOP_API_VERSION}/${env.NUVEMSHOP_STORE_ID}/${resource}`);
  for (const [key, value] of searchParams.entries()) {
    if (allowedParams.has(key) && value !== '') {
      url.searchParams.set(key, value);
    }
  }
  return url;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Faz um único fetch upstream com timeout — nunca deixa uma chamada presa
// travar a resposta ao cliente indefinidamente.
async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

// Chama a Nuvemshop com retry em 429 (rate limit) e em falha de rede/timeout,
// respeitando x-rate-limit-reset quando presente. Nunca loga o token.
async function callNuvemshopWithRetry(env, url) {
  const requestOptions = {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${env.NUVEMSHOP_ACCESS_TOKEN}`,
      'User-Agent': env.NUVEMSHOP_USER_AGENT || 'Tramatto Storefront Proxy (contato@tramatto.com)',
      'Content-Type': 'application/json; charset=utf-8'
    }
  };

  let lastError = null;

  for (let attempt = 1; attempt <= MAX_UPSTREAM_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetchWithTimeout(url, requestOptions, UPSTREAM_TIMEOUT_MS);

      if (response.status === 429 && attempt < MAX_UPSTREAM_ATTEMPTS) {
        const resetMs = Number(response.headers.get('x-rate-limit-reset'));
        const delayMs = Number.isFinite(resetMs) && resetMs > 0 ? resetMs : DEFAULT_RETRY_DELAY_MS * attempt;
        console.warn(`[Nuvemshop] rate limited (429), retrying in ${delayMs}ms (attempt ${attempt}/${MAX_UPSTREAM_ATTEMPTS})`);
        await sleep(delayMs);
        continue;
      }

      return response;
    } catch (error) {
      lastError = error;
      console.warn(`[Nuvemshop] upstream request failed (attempt ${attempt}/${MAX_UPSTREAM_ATTEMPTS}): ${error.name || 'error'}`);
      if (attempt < MAX_UPSTREAM_ATTEMPTS) {
        await sleep(DEFAULT_RETRY_DELAY_MS * attempt);
      }
    }
  }

  throw lastError || new Error('upstream_request_failed');
}

// Cache Cloudflare Edge (Cache API) — só existe no runtime real do Worker.
// Em ambientes sem `caches` (ex.: testes Node) o proxy funciona normalmente,
// só sem cache.
function getCacheStorage() {
  return typeof caches !== 'undefined' && caches.default ? caches.default : null;
}

async function proxyResource(request, env, corsHeaders, resource, allowedParams) {
  const requestUrl = new URL(request.url);
  const upstreamUrl = buildNuvemshopUrl(env, resource, requestUrl.searchParams, allowedParams);

  const cache = getCacheStorage();
  // Chave de cache própria (não a URL do proxy, que pode ter params fora de
  // ordem) — normaliza pela URL upstream final, já filtrada pela allowlist.
  const cacheKey = new Request(upstreamUrl.toString(), { method: 'GET' });

  if (cache) {
    const cached = await cache.match(cacheKey);
    if (cached) {
      const cachedResponse = new Response(cached.body, cached);
      Object.entries(corsHeaders).forEach(([key, value]) => cachedResponse.headers.set(key, value));
      cachedResponse.headers.set('X-Tramatto-Cache', 'HIT');
      return cachedResponse;
    }
  }

  let upstreamResponse;
  try {
    upstreamResponse = await callNuvemshopWithRetry(env, upstreamUrl);
  } catch (error) {
    console.error(`[Nuvemshop] ${resource} request failed: ${error.name || 'unknown_error'}`);
    return jsonResponse({ error: 'upstream_request_failed' }, 502, corsHeaders);
  }

  const body = await upstreamResponse.text();

  if (!upstreamResponse.ok) {
    console.warn(`[Nuvemshop] ${resource} request returned ${upstreamResponse.status}`);
  }

  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    ...corsHeaders
  };

  const totalCount = upstreamResponse.headers.get('x-total-count');
  if (totalCount) headers['X-Total-Count'] = totalCount;
  const linkHeader = upstreamResponse.headers.get('link');
  if (linkHeader) headers.Link = linkHeader;

  // Só cacheia respostas de sucesso — nunca guarda erro/rate-limit em cache.
  if (cache && upstreamResponse.ok) {
    headers['Cache-Control'] = `public, max-age=${CACHE_TTL_SECONDS}`;
    const cacheableResponse = new Response(body, { status: upstreamResponse.status, headers });
    await cache.put(cacheKey, cacheableResponse.clone());
    cacheableResponse.headers.set('X-Tramatto-Cache', 'MISS');
    return cacheableResponse;
  }

  return new Response(body, { status: upstreamResponse.status, headers });
}

// Valida o payload de POST /cart-transfer. Só aceita exatamente os três
// campos esperados por item — qualquer outro campo do body é ignorado, nunca
// usado como fonte de dado (ex.: um "price"/"name" mandado pelo cliente
// jamais entra na KV).
function validateCartTransferItems(rawItems) {
  if (!Array.isArray(rawItems)) {
    return { error: 'items precisa ser um array' };
  }
  if (rawItems.length < CART_TRANSFER_MIN_ITEMS || rawItems.length > CART_TRANSFER_MAX_ITEMS) {
    return { error: `items precisa ter entre ${CART_TRANSFER_MIN_ITEMS} e ${CART_TRANSFER_MAX_ITEMS} itens` };
  }

  const items = [];
  for (const rawItem of rawItems) {
    if (!rawItem || typeof rawItem !== 'object') {
      return { error: 'cada item precisa ser um objeto' };
    }

    const { productId, variantId, quantity } = rawItem;

    if (!Number.isInteger(productId) || productId <= 0) {
      return { error: 'productId precisa ser um inteiro positivo' };
    }
    if (!Number.isInteger(variantId) || variantId <= 0) {
      return { error: 'variantId precisa ser um inteiro positivo' };
    }
    if (!Number.isInteger(quantity) || quantity < CART_TRANSFER_MIN_QUANTITY || quantity > CART_TRANSFER_MAX_QUANTITY) {
      return { error: `quantity precisa ser um inteiro entre ${CART_TRANSFER_MIN_QUANTITY} e ${CART_TRANSFER_MAX_QUANTITY}` };
    }

    items.push({ productId, variantId, quantity });
  }

  return { items };
}

function isValidCartTransferToken(token) {
  return typeof token === 'string' && CART_TRANSFER_TOKEN_PATTERN.test(token);
}

function cartTransferKvKey(token) {
  return `cart-transfer:${token}`;
}

async function handleCartTransferCreate(request, env, corsHeaders) {
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'invalid_json' }, 400, corsHeaders);
  }

  const { items, error } = validateCartTransferItems(body?.items);
  if (error) {
    return jsonResponse({ error: 'invalid_items', message: error }, 400, corsHeaders);
  }

  // Token opaco, aleatório e não-previsível — nunca contém id/preço/nome,
  // só identifica a entrada na KV.
  const token = crypto.randomUUID();

  await env.CART_TRANSFER_KV.put(
    cartTransferKvKey(token),
    JSON.stringify({ items, createdAt: Date.now() }),
    { expirationTtl: CART_TRANSFER_TTL_SECONDS }
  );

  return jsonResponse({ token }, 201, corsHeaders);
}

async function handleCartTransferRead(token, env, corsHeaders) {
  if (!isValidCartTransferToken(token)) {
    return jsonResponse({ error: 'invalid_token' }, 400, corsHeaders);
  }

  const key = cartTransferKvKey(token);
  const stored = await env.CART_TRANSFER_KV.get(key);
  if (!stored) {
    return jsonResponse({ error: 'not_found' }, 404, corsHeaders);
  }

  // Uso único: apaga antes de responder — uma segunda leitura do mesmo
  // token (refresh, aba duplicada, replay) sempre recebe 404 a partir daqui.
  await env.CART_TRANSFER_KV.delete(key);

  let parsed;
  try {
    parsed = JSON.parse(stored);
  } catch (error) {
    console.error(`[cart-transfer] entrada corrompida na KV: ${error.name || 'parse_error'}`);
    return jsonResponse({ error: 'corrupted_entry' }, 500, corsHeaders);
  }

  // Só devolve o que o NubeSDK precisa — nunca createdAt nem qualquer outro
  // metadado interno.
  return jsonResponse({ items: parsed.items }, 200, corsHeaders);
}

async function handleCartTransfer(request, env, corsHeaders, pathname) {
  if (!env.CART_TRANSFER_KV) {
    return jsonResponse({ error: 'cart_transfer_not_configured' }, 500, corsHeaders);
  }

  if (pathname === '/cart-transfer') {
    if (request.method !== 'POST') {
      return jsonResponse({ error: 'method_not_allowed' }, 405, corsHeaders);
    }
    return handleCartTransferCreate(request, env, corsHeaders);
  }

  // /cart-transfer/{token}
  const token = pathname.slice('/cart-transfer/'.length);
  if (!token) {
    return jsonResponse({ error: 'not_found' }, 404, corsHeaders);
  }
  if (request.method !== 'GET') {
    return jsonResponse({ error: 'method_not_allowed' }, 405, corsHeaders);
  }
  return handleCartTransferRead(token, env, corsHeaders);
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// HMAC-SHA256 do corpo CRU (nunca de um JSON reserializado — o whitespace/
// ordem de chaves original importa para a assinatura bater) via Web Crypto,
// nativo no runtime do Worker (sem node:crypto). Assinatura em base64,
// mesmo padrão usado por outras plataformas (Shopify HMAC de webhook) —
// ainda não validado contra um payload real da Nuvemshop; se a primeira
// entrega real falhar a verificação, confirmar o encoding exato com a
// Nuvemshop antes de mudar isto.
async function computeHmacSha256Base64(secret, rawBody) {
  const key = await crypto.subtle.importKey(
    'raw',
    textEncoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, textEncoder.encode(rawBody));
  return arrayBufferToBase64(signature);
}

// Comparação em tempo constante — nunca usa "===" direto numa assinatura
// (evita vazar por timing quanto da string está correta). Tamanhos
// diferentes retornam false imediatamente: o tamanho de um HMAC-SHA256 em
// base64 é sempre fixo e público, não há segredo nisso (mesmo
// comportamento de crypto.timingSafeEqual do Node).
function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

// Handler único para os 3 webhooks LGPD — todos com a mesma validação
// (POST + HMAC do App Secret) e a mesma resposta mínima (nunca persistem
// nem logam o corpo, nunca logam email/telefone/identificação).
async function handleLgpdWebhook(request, env, corsHeaders) {
  if (request.method !== 'POST') {
    return jsonResponse({ error: 'method_not_allowed' }, 405, corsHeaders);
  }

  if (!env.NUVEMSHOP_CLIENT_SECRET) {
    console.error('[LGPD webhook] NUVEMSHOP_CLIENT_SECRET não configurado.');
    return jsonResponse({ error: 'webhook_not_configured' }, 500, corsHeaders);
  }

  const signature = request.headers.get(LGPD_HMAC_HEADER);
  if (!signature) {
    return jsonResponse({ error: 'missing_signature' }, 401, corsHeaders);
  }

  // Corpo cru primeiro — o HMAC é calculado sobre exatamente esses bytes,
  // nunca sobre um JSON.parse/JSON.stringify de volta (mudaria a string).
  const rawBody = await request.text();

  const expectedSignature = await computeHmacSha256Base64(env.NUVEMSHOP_CLIENT_SECRET, rawBody);
  if (!timingSafeEqual(signature.trim(), expectedSignature)) {
    return jsonResponse({ error: 'invalid_signature' }, 403, corsHeaders);
  }

  try {
    JSON.parse(rawBody);
  } catch {
    return jsonResponse({ error: 'invalid_json' }, 400, corsHeaders);
  }

  // Nunca persistido, nunca logado — só confirma recebimento (ver
  // comentário no topo do arquivo sobre por que os handlers são mínimos).
  return jsonResponse({ ok: true }, 200, corsHeaders);
}

export default {
  async fetch(request, env) {
    const corsHeaders = buildCorsHeaders(request, env);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const { pathname } = new URL(request.url);

    // /cart-transfer não depende do access_token da Nuvemshop (só de KV
    // própria) — resolvido antes do gate de credenciais abaixo, que é
    // específico dos endpoints de catálogo (/products, /categories).
    if (pathname === '/cart-transfer' || pathname.startsWith('/cart-transfer/')) {
      return handleCartTransfer(request, env, corsHeaders, pathname);
    }

    // Webhooks LGPD (store/redact, customers/redact, customers/data_request)
    // — resolvidos antes do gate de GET abaixo (são sempre POST) e antes do
    // gate de credenciais da Nuvemshop (dependem só do NUVEMSHOP_CLIENT_SECRET,
    // uma credencial diferente do NUVEMSHOP_ACCESS_TOKEN usado por /products
    // e /categories).
    if (pathname === '/webhooks/store-redact'
      || pathname === '/webhooks/customers-redact'
      || pathname === '/webhooks/customers-data-request') {
      return handleLgpdWebhook(request, env, corsHeaders);
    }

    if (request.method !== 'GET') {
      return jsonResponse({ error: 'method_not_allowed' }, 405, corsHeaders);
    }

    if (!env.NUVEMSHOP_ACCESS_TOKEN || !env.NUVEMSHOP_STORE_ID) {
      return jsonResponse({ error: 'proxy_not_configured' }, 500, corsHeaders);
    }

    if (pathname === '/products') {
      return proxyResource(request, env, corsHeaders, 'products', PRODUCTS_ALLOWED_PARAMS);
    }

    if (pathname === '/categories') {
      return proxyResource(request, env, corsHeaders, 'categories', CATEGORIES_ALLOWED_PARAMS);
    }

    return jsonResponse({ error: 'not_found' }, 404, corsHeaders);
  }
};
