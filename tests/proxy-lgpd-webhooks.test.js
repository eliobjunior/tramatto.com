const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const crypto = require('node:crypto');
const { pathToFileURL } = require('node:url');

// proxy/src/index.js é ESM (export default) porque roda como Cloudflare
// Worker Module — importamos dinamicamente em vez de require() (mesmo
// padrão de tests/proxy.test.js e tests/proxy-cart-transfer.test.js).
const proxyModulePromise = import(pathToFileURL(path.join(__dirname, '..', 'proxy', 'src', 'index.js')).href);

const FAKE_CLIENT_SECRET = 'test-client-secret-fixture-nunca-usar-em-producao';

const BASE_ENV = {
  ALLOWED_ORIGINS: 'https://tramatto.com',
  NUVEMSHOP_CLIENT_SECRET: FAKE_CLIENT_SECRET
};

// KV que lança em qualquer uso — se um teste passar com isto injetado, prova
// que o handler nunca tentou ler/gravar nada, mesmo indiretamente.
const POISONED_KV = {
  get() { throw new Error('CART_TRANSFER_KV.get não deveria ser chamado pelos webhooks LGPD'); },
  put() { throw new Error('CART_TRANSFER_KV.put não deveria ser chamado pelos webhooks LGPD'); },
  delete() { throw new Error('CART_TRANSFER_KV.delete não deveria ser chamado pelos webhooks LGPD'); }
};

function signBody(rawBody, secret = FAKE_CLIENT_SECRET) {
  return crypto.createHmac('sha256', secret).update(rawBody).digest('base64');
}

function webhookRequest(path, { body, signature, method = 'POST', omitSignatureHeader = false } = {}) {
  const headers = { Origin: 'https://tramatto.com', 'Content-Type': 'application/json' };
  if (!omitSignatureHeader) {
    headers['x-linkedstore-hmac-sha256'] = signature !== undefined ? signature : signBody(body ?? '');
  }
  return new Request(`https://proxy.example.com${path}`, {
    method,
    headers,
    body: method === 'GET' ? undefined : body
  });
}

const ENDPOINTS = [
  '/webhooks/store-redact',
  '/webhooks/customers-redact',
  '/webhooks/customers-data-request'
];

for (const endpoint of ENDPOINTS) {
  test(`${endpoint}: POST válido com HMAC correto retorna 200 e não persiste nada (KV nunca tocado)`, async () => {
    const { default: worker } = await proxyModulePromise;
    const rawBody = JSON.stringify({ store_id: 5828361, customer: { id: 1, email: 'cliente@example.com' } });

    const response = await worker.fetch(
      webhookRequest(endpoint, { body: rawBody }),
      { ...BASE_ENV, CART_TRANSFER_KV: POISONED_KV }
    );

    assert.equal(response.status, 200);
    const responseBody = await response.json();
    assert.equal(responseBody.ok, true);
    // O e-mail do payload nunca deve vazar de volta na resposta.
    assert.ok(!JSON.stringify(responseBody).includes('cliente@example.com'));
  });

  test(`${endpoint}: POST sem header de assinatura é rejeitado (401)`, async () => {
    const { default: worker } = await proxyModulePromise;
    const rawBody = JSON.stringify({ store_id: 5828361 });

    const response = await worker.fetch(
      webhookRequest(endpoint, { body: rawBody, omitSignatureHeader: true }),
      BASE_ENV
    );

    assert.equal(response.status, 401);
    const body = await response.json();
    assert.equal(body.error, 'missing_signature');
  });

  test(`${endpoint}: POST com HMAC incorreto é rejeitado (403)`, async () => {
    const { default: worker } = await proxyModulePromise;
    const rawBody = JSON.stringify({ store_id: 5828361 });

    const response = await worker.fetch(
      webhookRequest(endpoint, { body: rawBody, signature: signBody(rawBody, 'secret-errado') }),
      BASE_ENV
    );

    assert.equal(response.status, 403);
    const body = await response.json();
    assert.equal(body.error, 'invalid_signature');
  });

  test(`${endpoint}: JSON inválido (mas com HMAC correto do corpo cru) retorna 400`, async () => {
    const { default: worker } = await proxyModulePromise;
    const rawBody = '{isto nao e json valido';

    const response = await worker.fetch(
      webhookRequest(endpoint, { body: rawBody, signature: signBody(rawBody) }),
      BASE_ENV
    );

    assert.equal(response.status, 400);
    const body = await response.json();
    assert.equal(body.error, 'invalid_json');
  });

  test(`${endpoint}: método GET retorna 405`, async () => {
    const { default: worker } = await proxyModulePromise;
    const response = await worker.fetch(webhookRequest(endpoint, { method: 'GET' }), BASE_ENV);
    assert.equal(response.status, 405);
  });

  test(`${endpoint}: sem NUVEMSHOP_CLIENT_SECRET configurado retorna 500 em vez de aceitar sem validar`, async () => {
    const { default: worker } = await proxyModulePromise;
    const rawBody = JSON.stringify({ store_id: 5828361 });

    const response = await worker.fetch(
      webhookRequest(endpoint, { body: rawBody, signature: 'qualquer-coisa' }),
      { ALLOWED_ORIGINS: 'https://tramatto.com' }
    );

    assert.equal(response.status, 500);
    const body = await response.json();
    assert.equal(body.error, 'webhook_not_configured');
  });
}

test('HMAC usa o corpo CRU, não um JSON reserializado (whitespace diferente quebra a assinatura)', async () => {
  const { default: worker } = await proxyModulePromise;
  const compactBody = '{"store_id":5828361}';
  const spacedBody = '{ "store_id": 5828361 }'; // mesmo objeto, string diferente

  // Assinatura calculada para o compactBody, mas enviada com o spacedBody.
  const response = await worker.fetch(
    webhookRequest('/webhooks/store-redact', { body: spacedBody, signature: signBody(compactBody) }),
    BASE_ENV
  );

  assert.equal(response.status, 403);
});
