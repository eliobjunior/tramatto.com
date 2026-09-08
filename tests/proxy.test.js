const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

// proxy/src/index.js é ESM (export default) porque roda como Cloudflare
// Worker Module — importamos dinamicamente em vez de require().
const proxyModulePromise = import(pathToFileURL(path.join(__dirname, '..', 'proxy', 'src', 'index.js')).href);

const BASE_ENV = {
  NUVEMSHOP_ACCESS_TOKEN: 'test-token',
  NUVEMSHOP_STORE_ID: '5828361',
  ALLOWED_ORIGINS: 'https://tramatto.com'
};

function fakeRequest(url, { origin = 'https://tramatto.com', method = 'GET' } = {}) {
  return new Request(url, { method, headers: origin ? { Origin: origin } : {} });
}

function withMockedFetch(responses, run) {
  const originalFetch = global.fetch;
  let call = 0;
  global.fetch = async (url) => {
    const response = responses[Math.min(call, responses.length - 1)];
    call += 1;
    return typeof response === 'function' ? response(url) : response;
  };
  return run().finally(() => {
    global.fetch = originalFetch;
  });
}

test('proxy: recusa quando faltam credenciais (nunca chama upstream sem token/store id)', async () => {
  const { default: worker } = await proxyModulePromise;
  const response = await worker.fetch(fakeRequest('https://proxy.example.com/products'), {
    ALLOWED_ORIGINS: 'https://tramatto.com'
  });
  assert.equal(response.status, 500);
  const body = await response.json();
  assert.equal(body.error, 'proxy_not_configured');
});

test('proxy: rejeita métodos diferentes de GET/OPTIONS', async () => {
  const { default: worker } = await proxyModulePromise;
  const response = await worker.fetch(fakeRequest('https://proxy.example.com/products', { method: 'POST' }), BASE_ENV);
  assert.equal(response.status, 405);
});

test('proxy: monta a URL upstream usando /v1/{store_id}/products (nunca outra versão)', async () => {
  const { default: worker } = await proxyModulePromise;
  let capturedUrl = null;

  await withMockedFetch([
    (url) => {
      capturedUrl = url.toString();
      return new Response('[]', { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
  ], () => worker.fetch(fakeRequest('https://proxy.example.com/products?page=1&per_page=30'), BASE_ENV));

  assert.equal(capturedUrl, 'https://api.nuvemshop.com.br/v1/5828361/products?page=1&per_page=30');
});

test('proxy: filtra query params fora da allowlist antes de repassar à Nuvemshop', async () => {
  const { default: worker } = await proxyModulePromise;
  let capturedUrl = null;

  await withMockedFetch([
    (url) => {
      capturedUrl = url.toString();
      return new Response('[]', { status: 200 });
    }
  ], () => worker.fetch(fakeRequest('https://proxy.example.com/products?page=1&access_token=leak&foo=bar'), BASE_ENV));

  assert.ok(!capturedUrl.includes('access_token'));
  assert.ok(!capturedUrl.includes('foo=bar'));
  assert.ok(capturedUrl.includes('page=1'));
});

test('proxy: nunca envia o header Authorization na resposta ao cliente', async () => {
  const { default: worker } = await proxyModulePromise;

  const response = await withMockedFetch([
    new Response('[]', { status: 200 })
  ], () => worker.fetch(fakeRequest('https://proxy.example.com/products'), BASE_ENV));

  assert.equal(response.headers.get('Authorization'), null);
  const bodyText = await response.text();
  assert.ok(!bodyText.includes('test-token'));
});

test('proxy: repete a chamada em 429 e devolve sucesso na tentativa seguinte', async () => {
  const { default: worker } = await proxyModulePromise;
  let attempts = 0;

  const response = await withMockedFetch([
    () => {
      attempts += 1;
      return new Response('{"error":"rate_limited"}', {
        status: 429,
        headers: { 'x-rate-limit-reset': '1' }
      });
    },
    () => {
      attempts += 1;
      return new Response('[{"id":1}]', { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
  ], () => worker.fetch(fakeRequest('https://proxy.example.com/products'), BASE_ENV));

  assert.equal(attempts, 2);
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.deepEqual(body, [{ id: 1 }]);
});

test('proxy: falha de rede upstream vira 502 sem vazar detalhes do token', async () => {
  const { default: worker } = await proxyModulePromise;

  const response = await withMockedFetch([
    () => { throw new Error('network down'); },
    () => { throw new Error('network down'); },
    () => { throw new Error('network down'); }
  ], () => worker.fetch(fakeRequest('https://proxy.example.com/products'), BASE_ENV));

  assert.equal(response.status, 502);
  const body = await response.json();
  assert.equal(body.error, 'upstream_request_failed');
});

test('proxy: rota desconhecida retorna 404', async () => {
  const { default: worker } = await proxyModulePromise;
  const response = await withMockedFetch([
    new Response('[]', { status: 200 })
  ], () => worker.fetch(fakeRequest('https://proxy.example.com/orders'), BASE_ENV));
  assert.equal(response.status, 404);
});

test('proxy: CORS só libera Access-Control-Allow-Origin para origem na allowlist', async () => {
  const { default: worker } = await proxyModulePromise;
  const response = await withMockedFetch([
    new Response('[]', { status: 200 })
  ], () => worker.fetch(fakeRequest('https://proxy.example.com/products', { origin: 'https://malicious.example.com' }), BASE_ENV));

  assert.equal(response.headers.get('Access-Control-Allow-Origin'), null);
});
