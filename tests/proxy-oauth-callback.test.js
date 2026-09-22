const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

// proxy/src/index.js é ESM (export default) porque roda como Cloudflare
// Worker Module — importamos dinamicamente (mesmo padrão de
// tests/proxy.test.js e tests/proxy-lgpd-webhooks.test.js).
const proxyModulePromise = import(pathToFileURL(path.join(__dirname, '..', 'proxy', 'src', 'index.js')).href);

const FAKE_CLIENT_SECRET = 'test-client-secret-fixture-nunca-usar-em-producao';
const FAKE_ACCESS_TOKEN = 'test-access-token-fixture-nunca-usar-em-producao';

const BASE_ENV = {
  ALLOWED_ORIGINS: 'https://tramatto.com',
  NUVEMSHOP_CLIENT_SECRET: FAKE_CLIENT_SECRET
};

// KV que lança em qualquer uso — prova que o callback nunca tenta
// persistir nada (nem o access_token, nem nenhum outro dado).
const POISONED_KV = {
  get() { throw new Error('CART_TRANSFER_KV.get não deveria ser chamado pelo oauth/callback'); },
  put() { throw new Error('CART_TRANSFER_KV.put não deveria ser chamado pelo oauth/callback (nunca persiste token)'); },
  delete() { throw new Error('CART_TRANSFER_KV.delete não deveria ser chamado pelo oauth/callback'); }
};

function callbackRequest(query = '', { method = 'GET' } = {}) {
  return new Request(`https://proxy.example.com/oauth/callback${query}`, { method });
}

function withMockedFetch(responses, run) {
  const originalFetch = global.fetch;
  const calls = [];
  let call = 0;
  global.fetch = async (url, options) => {
    calls.push({ url: url.toString(), options });
    const response = responses[Math.min(call, responses.length - 1)];
    call += 1;
    return typeof response === 'function' ? response(url, options) : response;
  };
  return run(calls).finally(() => {
    global.fetch = originalFetch;
  });
}

function tokenExchangeSuccessResponse(overrides = {}) {
  return new Response(JSON.stringify({
    access_token: FAKE_ACCESS_TOKEN,
    token_type: 'bearer',
    scope: 'write_scripts',
    user_id: '5828361',
    ...overrides
  }), { status: 200, headers: { 'Content-Type': 'application/json' } });
}

test('GET /oauth/callback sem ?code retorna 400 (HTML genérico, nunca expõe detalhe)', async () => {
  const { default: worker } = await proxyModulePromise;
  const response = await worker.fetch(callbackRequest(), { ...BASE_ENV, CART_TRANSFER_KV: POISONED_KV });

  assert.equal(response.status, 400);
  assert.match(response.headers.get('content-type'), /text\/html/);
  const html = await response.text();
  assert.ok(!html.includes(FAKE_CLIENT_SECRET));
  assert.ok(!html.toLowerCase().includes('code'));
});

test('troca bem-sucedida: retorna 200 com HTML de sucesso, nunca expõe access_token/secret/code', async () => {
  const { default: worker } = await proxyModulePromise;

  const response = await withMockedFetch(
    [tokenExchangeSuccessResponse()],
    () => worker.fetch(callbackRequest('?code=abc123'), { ...BASE_ENV, CART_TRANSFER_KV: POISONED_KV })
  );

  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /text\/html/);
  const html = await response.text();
  assert.ok(html.includes('instalado com sucesso'));
  assert.ok(!html.includes(FAKE_ACCESS_TOKEN));
  assert.ok(!html.includes(FAKE_CLIENT_SECRET));
  assert.ok(!html.includes('abc123'));
});

test('envia exatamente client_id=42251, grant_type=authorization_code, o code recebido e o client_secret do env — nada vindo da URL', async () => {
  const { default: worker } = await proxyModulePromise;

  const calls = await withMockedFetch(
    [tokenExchangeSuccessResponse()],
    async (calls) => {
      // client_id/client_secret/access_token na query string devem ser
      // ignorados — o servidor nunca aceita essas credenciais do navegador.
      await worker.fetch(
        callbackRequest('?code=abc123&client_id=999999&client_secret=hijacked&access_token=hijacked'),
        { ...BASE_ENV, CART_TRANSFER_KV: POISONED_KV }
      );
      return calls;
    }
  );

  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://www.tiendanube.com/apps/authorize/token');
  assert.equal(calls[0].options.method, 'POST');
  assert.equal(calls[0].options.headers['Content-Type'], 'application/json');

  const sentBody = JSON.parse(calls[0].options.body);
  assert.deepEqual(sentBody, {
    client_id: '42251',
    client_secret: FAKE_CLIENT_SECRET,
    grant_type: 'authorization_code',
    code: 'abc123'
  });
});

test('resposta da Nuvemshop sem access_token: erro (502), HTML genérico', async () => {
  const { default: worker } = await proxyModulePromise;

  const response = await withMockedFetch(
    [new Response(JSON.stringify({ scope: 'write_scripts', user_id: '5828361' }), { status: 200, headers: { 'Content-Type': 'application/json' } })],
    () => worker.fetch(callbackRequest('?code=abc123'), { ...BASE_ENV, CART_TRANSFER_KV: POISONED_KV })
  );

  assert.equal(response.status, 502);
  const html = await response.text();
  assert.ok(html.includes('Não foi possível concluir'));
});

test('resposta não-200 da Nuvemshop (ex.: code expirado/inválido): erro (502), nunca vaza o corpo do erro upstream', async () => {
  const { default: worker } = await proxyModulePromise;

  const response = await withMockedFetch(
    [new Response(JSON.stringify({ error: 'invalid_grant', error_description: 'segredo interno qualquer' }), { status: 400, headers: { 'Content-Type': 'application/json' } })],
    () => worker.fetch(callbackRequest('?code=expirado'), { ...BASE_ENV, CART_TRANSFER_KV: POISONED_KV })
  );

  assert.equal(response.status, 502);
  const html = await response.text();
  assert.ok(!html.includes('invalid_grant'));
  assert.ok(!html.includes('segredo interno qualquer'));
});

test('falha de rede na troca (fetch rejeita): erro (502), nunca lança/derruba o Worker', async () => {
  const { default: worker } = await proxyModulePromise;

  const response = await withMockedFetch(
    [() => { throw new Error('network down'); }],
    () => worker.fetch(callbackRequest('?code=abc123'), { ...BASE_ENV, CART_TRANSFER_KV: POISONED_KV })
  );

  assert.equal(response.status, 502);
});

test('resposta da Nuvemshop não é JSON válido: erro (502), não lança', async () => {
  const { default: worker } = await proxyModulePromise;

  const response = await withMockedFetch(
    [new Response('isto nao e json', { status: 200 })],
    () => worker.fetch(callbackRequest('?code=abc123'), { ...BASE_ENV, CART_TRANSFER_KV: POISONED_KV })
  );

  assert.equal(response.status, 502);
});

test('método POST é rejeitado (405) — endpoint só aceita GET', async () => {
  const { default: worker } = await proxyModulePromise;
  const response = await worker.fetch(callbackRequest('?code=abc123', { method: 'POST' }), { ...BASE_ENV, CART_TRANSFER_KV: POISONED_KV });
  assert.equal(response.status, 405);
});

test('sem NUVEMSHOP_CLIENT_SECRET configurado: erro (500) em vez de tentar trocar o code', async () => {
  const { default: worker } = await proxyModulePromise;
  const response = await worker.fetch(
    callbackRequest('?code=abc123'),
    { ALLOWED_ORIGINS: 'https://tramatto.com', CART_TRANSFER_KV: POISONED_KV }
  );
  assert.equal(response.status, 500);
  const html = await response.text();
  assert.ok(!html.includes(FAKE_CLIENT_SECRET));
});

test('scope diferente de "write_scripts" (ou com escopo adicional) ainda é aceito — não exige match exato', async () => {
  const { default: worker } = await proxyModulePromise;

  const response = await withMockedFetch(
    [tokenExchangeSuccessResponse({ scope: 'write_scripts,read_products' })],
    () => worker.fetch(callbackRequest('?code=abc123'), { ...BASE_ENV, CART_TRANSFER_KV: POISONED_KV })
  );

  assert.equal(response.status, 200);
});

test('user_id diferente da loja 5828361 ainda é aceito — endpoint não é hardcoded para uma loja só', async () => {
  const { default: worker } = await proxyModulePromise;

  const response = await withMockedFetch(
    [tokenExchangeSuccessResponse({ user_id: '9999999' })],
    () => worker.fetch(callbackRequest('?code=abc123'), { ...BASE_ENV, CART_TRANSFER_KV: POISONED_KV })
  );

  assert.equal(response.status, 200);
});
