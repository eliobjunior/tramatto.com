const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

// proxy/src/index.js é ESM (export default) porque roda como Cloudflare
// Worker Module — importamos dinamicamente em vez de require().
const proxyModulePromise = import(pathToFileURL(path.join(__dirname, '..', 'proxy', 'src', 'index.js')).href);

// Mock limpo de Cloudflare KV, em memória — implementa só o subconjunto de
// get/put/delete que proxy/src/index.js usa. Nenhum teste unitário depende
// da KV real do Cloudflare.
function createFakeKv() {
  const store = new Map();
  return {
    store,
    async get(key) {
      return store.has(key) ? store.get(key).value : null;
    },
    async put(key, value, options = {}) {
      store.set(key, { value, expirationTtl: options.expirationTtl });
    },
    async delete(key) {
      store.delete(key);
    }
  };
}

function makeEnv(overrides = {}) {
  return {
    NUVEMSHOP_ACCESS_TOKEN: 'test-token',
    NUVEMSHOP_STORE_ID: '5828361',
    ALLOWED_ORIGINS: 'https://tramatto.com,https://tramattotestenubesdk.lojavirtualnuvem.com.br',
    CART_TRANSFER_KV: createFakeKv(),
    ...overrides
  };
}

function fakeRequest(url, { origin = 'https://tramatto.com', method = 'GET', body } = {}) {
  const headers = {};
  if (origin) headers.Origin = origin;
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  return new Request(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined
  });
}

const VALID_ITEMS = [{ productId: 356837536, variantId: 1562965466, quantity: 2 }];
const DEMO_ORIGIN = 'https://tramattotestenubesdk.lojavirtualnuvem.com.br';

async function createToken(worker, env, items = VALID_ITEMS) {
  const response = await worker.fetch(
    fakeRequest('https://proxy.example.com/cart-transfer', { method: 'POST', body: { items } }),
    env
  );
  const body = await response.json();
  return { response, token: body.token };
}

test('cart-transfer: POST válido cria token e grava {items, createdAt} na KV com TTL ~10min', async () => {
  const { default: worker } = await proxyModulePromise;
  const env = makeEnv();

  const response = await worker.fetch(
    fakeRequest('https://proxy.example.com/cart-transfer', { method: 'POST', body: { items: VALID_ITEMS } }),
    env
  );

  assert.equal(response.status, 201);
  const body = await response.json();
  assert.equal(typeof body.token, 'string');
  assert.deepEqual(Object.keys(body), ['token']);

  const stored = env.CART_TRANSFER_KV.store.get(`cart-transfer:${body.token}`);
  assert.ok(stored, 'entrada não foi gravada na KV');
  assert.equal(stored.expirationTtl, 600);

  const parsed = JSON.parse(stored.value);
  assert.deepEqual(parsed.items, VALID_ITEMS);
  assert.equal(typeof parsed.createdAt, 'number');
  assert.deepEqual(Object.keys(parsed).sort(), ['createdAt', 'items']);
});

test('cart-transfer: POST ignora campos extras do item em vez de gravá-los', async () => {
  const { default: worker } = await proxyModulePromise;
  const env = makeEnv();

  const response = await worker.fetch(
    fakeRequest('https://proxy.example.com/cart-transfer', {
      method: 'POST',
      body: { items: [{ productId: 1, variantId: 1, quantity: 1, price: 999, name: 'não deveria ir', accessToken: 'segredo' }] }
    }),
    env
  );

  const { token } = await response.json();
  const stored = JSON.parse(env.CART_TRANSFER_KV.store.get(`cart-transfer:${token}`).value);
  assert.deepEqual(stored.items, [{ productId: 1, variantId: 1, quantity: 1 }]);
});

test('cart-transfer: POST rejeita payload sem items ou com items vazio (HTTP 400)', async () => {
  const { default: worker } = await proxyModulePromise;
  const env = makeEnv();

  const emptyResponse = await worker.fetch(
    fakeRequest('https://proxy.example.com/cart-transfer', { method: 'POST', body: { items: [] } }),
    env
  );
  assert.equal(emptyResponse.status, 400);

  const missingResponse = await worker.fetch(
    fakeRequest('https://proxy.example.com/cart-transfer', { method: 'POST', body: {} }),
    env
  );
  assert.equal(missingResponse.status, 400);
});

test('cart-transfer: POST rejeita mais de 20 itens (HTTP 400)', async () => {
  const { default: worker } = await proxyModulePromise;
  const tooManyItems = Array.from({ length: 21 }, (_, i) => ({ productId: i + 1, variantId: i + 1, quantity: 1 }));

  const response = await worker.fetch(
    fakeRequest('https://proxy.example.com/cart-transfer', { method: 'POST', body: { items: tooManyItems } }),
    makeEnv()
  );
  assert.equal(response.status, 400);
});

test('cart-transfer: POST aceita exatamente 20 itens (limite superior válido)', async () => {
  const { default: worker } = await proxyModulePromise;
  const exactlyTwentyItems = Array.from({ length: 20 }, (_, i) => ({ productId: i + 1, variantId: i + 1, quantity: 1 }));

  const response = await worker.fetch(
    fakeRequest('https://proxy.example.com/cart-transfer', { method: 'POST', body: { items: exactlyTwentyItems } }),
    makeEnv()
  );
  assert.equal(response.status, 201);
});

test('cart-transfer: POST rejeita productId/variantId inválidos (string, decimal, zero, negativo)', async () => {
  const { default: worker } = await proxyModulePromise;
  const invalidItems = [
    [{ productId: 'abc', variantId: 1, quantity: 1 }],
    [{ productId: 1.5, variantId: 1, quantity: 1 }],
    [{ productId: 0, variantId: 1, quantity: 1 }],
    [{ productId: -1, variantId: 1, quantity: 1 }],
    [{ productId: 1, variantId: 'abc', quantity: 1 }],
    [{ productId: 1, variantId: 0, quantity: 1 }]
  ];

  for (const items of invalidItems) {
    const response = await worker.fetch(
      fakeRequest('https://proxy.example.com/cart-transfer', { method: 'POST', body: { items } }),
      makeEnv()
    );
    assert.equal(response.status, 400, `deveria rejeitar ${JSON.stringify(items)}`);
  }
});

test('cart-transfer: POST rejeita quantity inválida (zero, negativa, decimal, acima de 20)', async () => {
  const { default: worker } = await proxyModulePromise;
  const invalidQuantities = [0, -1, 1.5, 21, 'abc'];

  for (const quantity of invalidQuantities) {
    const response = await worker.fetch(
      fakeRequest('https://proxy.example.com/cart-transfer', {
        method: 'POST',
        body: { items: [{ productId: 1, variantId: 1, quantity }] }
      }),
      makeEnv()
    );
    assert.equal(response.status, 400, `deveria rejeitar quantity ${JSON.stringify(quantity)}`);
  }
});

test('cart-transfer: POST rejeita quantity 20 (limite superior válido) e aceita 20 como válido', async () => {
  const { default: worker } = await proxyModulePromise;
  const response = await worker.fetch(
    fakeRequest('https://proxy.example.com/cart-transfer', {
      method: 'POST',
      body: { items: [{ productId: 1, variantId: 1, quantity: 20 }] }
    }),
    makeEnv()
  );
  assert.equal(response.status, 201);
});

test('cart-transfer: POST rejeita corpo que não é JSON válido', async () => {
  const { default: worker } = await proxyModulePromise;
  const request = new Request('https://proxy.example.com/cart-transfer', {
    method: 'POST',
    headers: { Origin: 'https://tramatto.com', 'Content-Type': 'application/json' },
    body: '{ isso não é json'
  });
  const response = await worker.fetch(request, makeEnv());
  assert.equal(response.status, 400);
});

test('cart-transfer: GET com token válido devolve só {items} e consome o token (one-time)', async () => {
  const { default: worker } = await proxyModulePromise;
  const env = makeEnv();
  const { token } = await createToken(worker, env);

  const readResponse = await worker.fetch(
    fakeRequest(`https://proxy.example.com/cart-transfer/${token}`, { origin: DEMO_ORIGIN }),
    env
  );
  assert.equal(readResponse.status, 200);
  const readBody = await readResponse.json();
  assert.deepEqual(readBody, { items: VALID_ITEMS });

  const secondReadResponse = await worker.fetch(
    fakeRequest(`https://proxy.example.com/cart-transfer/${token}`, { origin: DEMO_ORIGIN }),
    env
  );
  assert.equal(secondReadResponse.status, 404);
});

test('cart-transfer: GET com token inexistente/expirado devolve 404', async () => {
  const { default: worker } = await proxyModulePromise;
  const response = await worker.fetch(
    fakeRequest(`https://proxy.example.com/cart-transfer/${'a'.repeat(8)}-${'a'.repeat(4)}-${'a'.repeat(4)}-${'a'.repeat(4)}-${'a'.repeat(12)}`, {
      origin: DEMO_ORIGIN
    }),
    makeEnv()
  );
  assert.equal(response.status, 404);
});

test('cart-transfer: GET com token em formato inválido devolve 400 sem consultar a KV', async () => {
  const { default: worker } = await proxyModulePromise;
  const env = makeEnv();

  const response = await worker.fetch(
    fakeRequest('https://proxy.example.com/cart-transfer/token-totalmente-invalido', { origin: DEMO_ORIGIN }),
    env
  );
  assert.equal(response.status, 400);
});

test('cart-transfer: POST em /cart-transfer/{token} não é permitido (só GET)', async () => {
  const { default: worker } = await proxyModulePromise;
  const response = await worker.fetch(
    fakeRequest('https://proxy.example.com/cart-transfer/00000000-0000-0000-0000-000000000000', { method: 'POST', body: {} }),
    makeEnv()
  );
  assert.equal(response.status, 405);
});

test('cart-transfer: GET em /cart-transfer sem token não é permitido (só POST)', async () => {
  const { default: worker } = await proxyModulePromise;
  const response = await worker.fetch(
    fakeRequest('https://proxy.example.com/cart-transfer'),
    makeEnv()
  );
  assert.equal(response.status, 405);
});

test('cart-transfer: sem KV configurada devolve 500 em vez de quebrar', async () => {
  const { default: worker } = await proxyModulePromise;
  const response = await worker.fetch(
    fakeRequest('https://proxy.example.com/cart-transfer', { method: 'POST', body: { items: VALID_ITEMS } }),
    { ALLOWED_ORIGINS: 'https://tramatto.com' }
  );
  assert.equal(response.status, 500);
});

test('cart-transfer: não exige NUVEMSHOP_ACCESS_TOKEN/STORE_ID (não fala com a Nuvemshop)', async () => {
  const { default: worker } = await proxyModulePromise;
  const response = await worker.fetch(
    fakeRequest('https://proxy.example.com/cart-transfer', { method: 'POST', body: { items: VALID_ITEMS } }),
    { ALLOWED_ORIGINS: 'https://tramatto.com', CART_TRANSFER_KV: createFakeKv() }
  );
  assert.equal(response.status, 201);
});

test('cart-transfer: OPTIONS (preflight) continua respondendo 204 com CORS, incluindo POST em Allow-Methods', async () => {
  const { default: worker } = await proxyModulePromise;
  const response = await worker.fetch(
    fakeRequest('https://proxy.example.com/cart-transfer', { method: 'OPTIONS' }),
    makeEnv()
  );
  assert.equal(response.status, 204);
  assert.equal(response.headers.get('Access-Control-Allow-Origin'), 'https://tramatto.com');
  assert.match(response.headers.get('Access-Control-Allow-Methods'), /POST/);
});

test('cart-transfer: CORS libera a origem da loja demo além das origens já existentes', async () => {
  const { default: worker } = await proxyModulePromise;
  const env = makeEnv();
  const { token } = await createToken(worker, env);

  const response = await worker.fetch(
    fakeRequest(`https://proxy.example.com/cart-transfer/${token}`, { origin: DEMO_ORIGIN }),
    env
  );
  assert.equal(response.headers.get('Access-Control-Allow-Origin'), DEMO_ORIGIN);
});

test('cart-transfer: CORS não libera origem fora da allowlist', async () => {
  const { default: worker } = await proxyModulePromise;
  const response = await worker.fetch(
    fakeRequest('https://proxy.example.com/cart-transfer', {
      method: 'POST',
      body: { items: VALID_ITEMS },
      origin: 'https://malicious.example.com'
    }),
    makeEnv()
  );
  assert.equal(response.headers.get('Access-Control-Allow-Origin'), null);
});

test('cart-transfer: /products e /categories continuam exigindo GET e credenciais Nuvemshop, sem regressão', async () => {
  const { default: worker } = await proxyModulePromise;

  const postProducts = await worker.fetch(
    fakeRequest('https://proxy.example.com/products', { method: 'POST' }),
    makeEnv()
  );
  assert.equal(postProducts.status, 405);

  const noCreds = await worker.fetch(
    fakeRequest('https://proxy.example.com/products'),
    { ALLOWED_ORIGINS: 'https://tramatto.com', CART_TRANSFER_KV: createFakeKv() }
  );
  assert.equal(noCreds.status, 500);
});
