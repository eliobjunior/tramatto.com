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

const NUVEMSHOP_API_VERSION = '2025-03';

// Allowlist de query params repassados à Nuvemshop — evita que um cliente
// injete parâmetros arbitrários na chamada upstream.
const PRODUCTS_ALLOWED_PARAMS = new Set([
  'page', 'per_page', 'handle', 'category_id', 'q', 'ids', 'since_id',
  'published', 'visibility', 'sort_by', 'fields', 'language',
  'updated_at_min', 'updated_at_max', 'created_at_min', 'created_at_max'
]);

const CATEGORIES_ALLOWED_PARAMS = new Set(['page', 'per_page', 'parent_id', 'fields', 'language']);

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
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
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

async function callNuvemshop(env, url) {
  return fetch(url.toString(), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${env.NUVEMSHOP_ACCESS_TOKEN}`,
      'User-Agent': env.NUVEMSHOP_USER_AGENT || 'Tramatto Storefront Proxy (contato@tramatto.com)',
      'Content-Type': 'application/json; charset=utf-8'
    }
  });
}

async function proxyResource(request, env, corsHeaders, resource, allowedParams) {
  const requestUrl = new URL(request.url);
  const upstreamUrl = buildNuvemshopUrl(env, resource, requestUrl.searchParams, allowedParams);

  let upstreamResponse;
  try {
    upstreamResponse = await callNuvemshop(env, upstreamUrl);
  } catch (error) {
    return jsonResponse({ error: 'upstream_request_failed' }, 502, corsHeaders);
  }

  const body = await upstreamResponse.text();
  return new Response(body, {
    status: upstreamResponse.status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...corsHeaders
    }
  });
}

export default {
  async fetch(request, env) {
    const corsHeaders = buildCorsHeaders(request, env);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== 'GET') {
      return jsonResponse({ error: 'method_not_allowed' }, 405, corsHeaders);
    }

    if (!env.NUVEMSHOP_ACCESS_TOKEN || !env.NUVEMSHOP_STORE_ID) {
      return jsonResponse({ error: 'proxy_not_configured' }, 500, corsHeaders);
    }

    const { pathname } = new URL(request.url);

    if (pathname === '/products') {
      return proxyResource(request, env, corsHeaders, 'products', PRODUCTS_ALLOWED_PARAMS);
    }

    if (pathname === '/categories') {
      return proxyResource(request, env, corsHeaders, 'categories', CATEGORIES_ALLOWED_PARAMS);
    }

    return jsonResponse({ error: 'not_found' }, 404, corsHeaders);
  }
};
