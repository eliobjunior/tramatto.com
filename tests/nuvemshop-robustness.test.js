const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

function freshRequire(relativePath) {
  const resolved = require.resolve(relativePath);
  delete require.cache[resolved];
  return require(resolved);
}

function loadAdaptersWithMocks({ fetchCatalog, fetchCollections, fetchProductBySlug, fetchCart } = {}) {
  freshRequire('../js/domain-model');

  global.TramattoNuvemshopCatalog = {
    fetchCatalog: fetchCatalog || (async () => []),
    fetchCollections: fetchCollections || (async () => [])
  };
  global.TramattoNuvemshopProducts = {
    fetchProductBySlug: fetchProductBySlug || (async () => null)
  };
  global.TramattoNuvemshopCart = {
    fetchCart: fetchCart || (async () => ({ items: [] }))
  };

  return freshRequire(path.join('..', 'js', 'adapters'));
}

test('NuvemshopAdapter.getProducts() falha para lista vazia em vez de derrubar o storefront quando a API/proxy está fora do ar', async () => {
  const { NuvemshopAdapter } = loadAdaptersWithMocks({
    fetchCatalog: async () => { throw new Error('Tramatto: proxy Nuvemshop respondeu 502 para /products'); }
  });

  const adapter = new NuvemshopAdapter({});
  const products = await adapter.getProducts();
  assert.deepEqual(products, []);
});

test('NuvemshopAdapter.getCollections() falha para lista vazia em erro upstream', async () => {
  const { NuvemshopAdapter } = loadAdaptersWithMocks({
    fetchCollections: async () => { throw new Error('timeout'); }
  });

  const adapter = new NuvemshopAdapter({});
  const collections = await adapter.getCollections();
  assert.deepEqual(collections, []);
});

test('NuvemshopAdapter.getProductBySlug() retorna null em erro upstream (nunca inventa produto)', async () => {
  const { NuvemshopAdapter } = loadAdaptersWithMocks({
    fetchProductBySlug: async () => { throw new Error('502'); }
  });

  const adapter = new NuvemshopAdapter({});
  const product = await adapter.getProductBySlug('qualquer-slug');
  assert.equal(product, null);
});

test('NuvemshopAdapter.getCart() cai para um Cart vazio em erro upstream', async () => {
  const { NuvemshopAdapter } = loadAdaptersWithMocks({
    fetchCart: async () => { throw new Error('502'); }
  });

  const adapter = new NuvemshopAdapter({});
  const cart = await adapter.getCart();
  assert.equal(cart.getTotalItems(), 0);
});

test('NuvemshopAdapter.getProducts() continua funcionando normalmente quando a API responde com sucesso', async () => {
  const { NuvemshopAdapter } = loadAdaptersWithMocks({
    fetchCatalog: async () => [{ slug: 'produto-real' }]
  });

  const adapter = new NuvemshopAdapter({});
  const products = await adapter.getProducts();
  assert.equal(products.length, 1);
  assert.equal(products[0].slug, 'produto-real');
});

test('client.js: timeout/erro de rede vira erro tratável (não crasha o processo)', async () => {
  const client = freshRequire('../integrations/nuvemshop/client');
  const originalFetch = global.fetch;
  global.fetch = async () => {
    const error = new Error('The operation was aborted');
    error.name = 'AbortError';
    throw error;
  };

  try {
    const proxyClient = client.createClient({ apiBaseUrl: 'https://proxy.example.com' });
    await assert.rejects(() => proxyClient.getProductsPage({ page: 1 }), /falha ao contatar o proxy Nuvemshop/);
  } finally {
    global.fetch = originalFetch;
  }
});

test('client.js: resposta com JSON inválido vira erro tratável em vez de propagar SyntaxError bruto', async () => {
  const client = freshRequire('../integrations/nuvemshop/client');
  const originalFetch = global.fetch;
  global.fetch = async () => new Response('<html>not json</html>', { status: 200 });

  try {
    const proxyClient = client.createClient({ apiBaseUrl: 'https://proxy.example.com' });
    await assert.rejects(() => proxyClient.getProductsPage({ page: 1 }), /resposta inválida do proxy Nuvemshop/);
  } finally {
    global.fetch = originalFetch;
  }
});

test('client.js: sem proxyBaseUrl configurada, falha de forma clara em vez de tentar uma URL relativa quebrada', async () => {
  const client = freshRequire('../integrations/nuvemshop/client');
  const proxyClient = client.createClient({});
  await assert.rejects(() => proxyClient.getProductsPage({ page: 1 }), /proxyBaseUrl não configurada/);
});
