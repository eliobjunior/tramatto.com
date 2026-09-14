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

// --- Fallback API real → MirrorAdapter (só em falha de rede/API, nunca mascarado) ---

function makeFallbackSpy() {
  const calls = [];
  return {
    calls,
    getProducts: async () => { calls.push('getProducts'); return [{ slug: 'fallback-produto' }]; },
    getProductBySlug: async (slug) => { calls.push(`getProductBySlug:${slug}`); return { slug: 'fallback-produto' }; },
    getCollections: async () => { calls.push('getCollections'); return [{ slug: 'fallback-colecao' }]; },
    getCart: async () => { calls.push('getCart'); return { getTotalItems: () => 0 }; }
  };
}

test('NuvemshopAdapter usa fallbackAdapter (MirrorAdapter) quando getProducts falha por rede/API, e registra o uso do fallback', async () => {
  const { NuvemshopAdapter } = loadAdaptersWithMocks({
    fetchCatalog: async () => { throw new Error('Tramatto: falha ao contatar o proxy Nuvemshop para /products (network_error)'); }
  });
  const fallback = makeFallbackSpy();
  const adapter = new NuvemshopAdapter({}, { fallbackAdapter: fallback });

  const originalWarn = console.warn;
  const warnings = [];
  console.warn = (...args) => warnings.push(args.join(' '));
  try {
    const products = await adapter.getProducts();
    assert.deepEqual(products, [{ slug: 'fallback-produto' }]);
    assert.deepEqual(fallback.calls, ['getProducts']);
    assert.ok(warnings.some((line) => /fallback/i.test(line)), 'deveria logar que o fallback foi usado');
  } finally {
    console.warn = originalWarn;
  }
});

test('NuvemshopAdapter usa fallbackAdapter para getCollections/getProductBySlug/getCart em falha upstream', async () => {
  const { NuvemshopAdapter } = loadAdaptersWithMocks({
    fetchCollections: async () => { throw new Error('502'); },
    fetchProductBySlug: async () => { throw new Error('502'); },
    fetchCart: async () => { throw new Error('502'); }
  });
  const fallback = makeFallbackSpy();
  const adapter = new NuvemshopAdapter({}, { fallbackAdapter: fallback });

  const collections = await adapter.getCollections();
  const product = await adapter.getProductBySlug('algum-slug');
  const cart = await adapter.getCart();

  assert.deepEqual(collections, [{ slug: 'fallback-colecao' }]);
  assert.deepEqual(product, { slug: 'fallback-produto' });
  assert.equal(cart.getTotalItems(), 0);
  assert.deepEqual(fallback.calls, ['getCollections', 'getProductBySlug:algum-slug', 'getCart']);
});

test('NuvemshopAdapter NÃO usa fallbackAdapter quando a API responde com sucesso (dado real nunca é sobrescrito)', async () => {
  const { NuvemshopAdapter } = loadAdaptersWithMocks({
    fetchCatalog: async () => [{ slug: 'produto-real-da-api' }]
  });
  const fallback = makeFallbackSpy();
  const adapter = new NuvemshopAdapter({}, { fallbackAdapter: fallback });

  const products = await adapter.getProducts();
  assert.deepEqual(products, [{ slug: 'produto-real-da-api' }]);
  assert.deepEqual(fallback.calls, [], 'fallback não deveria ser chamado quando a API real funciona');
});

test('NuvemshopAdapter sem fallbackAdapter mantém o comportamento anterior (lista vazia em erro, não quebra)', async () => {
  const { NuvemshopAdapter } = loadAdaptersWithMocks({
    fetchCatalog: async () => { throw new Error('502'); }
  });
  const adapter = new NuvemshopAdapter({});
  const products = await adapter.getProducts();
  assert.deepEqual(products, []);
});

// --- Paginação via headers (X-Total-Count / Link) ---

test('client.js: expõe totalCount e hasNextPage a partir dos headers X-Total-Count/Link do proxy', async () => {
  const client = freshRequire('../integrations/nuvemshop/client');
  const originalFetch = global.fetch;
  global.fetch = async () => new Response('[{"id":1},{"id":2}]', {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'X-Total-Count': '11',
      Link: '<https://proxy.example.com/products?page=2>; rel="next", <https://proxy.example.com/products?page=6>; rel="last"'
    }
  });

  try {
    const proxyClient = client.createClient({ apiBaseUrl: 'https://proxy.example.com' });
    const result = await proxyClient.getProductsPage({ page: 1, perPage: 2 });
    assert.deepEqual(result.items, [{ id: 1 }, { id: 2 }]);
    assert.equal(result.totalCount, 11);
    assert.equal(result.hasNextPage, true);
  } finally {
    global.fetch = originalFetch;
  }
});

test('client.js: última página (Link sem rel="next") sinaliza hasNextPage=false mesmo com página cheia', async () => {
  const client = freshRequire('../integrations/nuvemshop/client');
  const originalFetch = global.fetch;
  global.fetch = async () => new Response('[{"id":1},{"id":2}]', {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'X-Total-Count': '2',
      Link: '<https://proxy.example.com/products?page=1>; rel="last"'
    }
  });

  try {
    const proxyClient = client.createClient({ apiBaseUrl: 'https://proxy.example.com' });
    const result = await proxyClient.getProductsPage({ page: 1, perPage: 2 });
    assert.equal(result.hasNextPage, false);
  } finally {
    global.fetch = originalFetch;
  }
});

test('client.js: sem header Link (proxy antigo), hasNextPage é null — nunca presume fim de página', async () => {
  const client = freshRequire('../integrations/nuvemshop/client');
  const originalFetch = global.fetch;
  global.fetch = async () => new Response('[]', { status: 200, headers: { 'Content-Type': 'application/json' } });

  try {
    const proxyClient = client.createClient({ apiBaseUrl: 'https://proxy.example.com' });
    const result = await proxyClient.getProductsPage({ page: 1, perPage: 30 });
    assert.deepEqual(result.items, []);
    assert.equal(result.totalCount, null);
    assert.equal(result.hasNextPage, null);
  } finally {
    global.fetch = originalFetch;
  }
});

test('catalog.js: fetchCatalog segue Link/X-Total-Count através de múltiplas páginas e para no total real (nunca presume 1 página fixa)', async () => {
  global.TramattoNuvemshopMapper = { mapProduct: (p) => p };
  const catalog = freshRequire('../integrations/nuvemshop/catalog');

  const pages = [
    { items: [{ id: 1 }, { id: 2 }], totalCount: 3, hasNextPage: true },
    { items: [{ id: 3 }], totalCount: 3, hasNextPage: false }
  ];
  let call = 0;
  const client = {
    getProductsPage: async () => pages[Math.min(call++, pages.length - 1)]
  };

  const products = await catalog.fetchCatalog(client, { perPage: 2 });
  assert.deepEqual(products, [{ id: 1 }, { id: 2 }, { id: 3 }]);
  assert.equal(call, 2, 'deveria parar assim que hasNextPage=false, sem chamar uma 3ª página');
});

test('catalog.js: fetchCatalog com resposta vazia (catálogo sem produtos) retorna lista vazia sem erro', async () => {
  global.TramattoNuvemshopMapper = { mapProduct: (p) => p };
  const catalog = freshRequire('../integrations/nuvemshop/catalog');

  const client = { getProductsPage: async () => ({ items: [], totalCount: 0, hasNextPage: false }) };
  const products = await catalog.fetchCatalog(client);
  assert.deepEqual(products, []);
});

test('catalog.js: fetchCatalog sem headers de paginação cai para heurística de página incompleta (compatibilidade)', async () => {
  global.TramattoNuvemshopMapper = { mapProduct: (p) => p };
  const catalog = freshRequire('../integrations/nuvemshop/catalog');

  const client = { getProductsPage: async () => ({ items: [{ id: 1 }], totalCount: null, hasNextPage: null }) };
  const products = await catalog.fetchCatalog(client, { perPage: 5 });
  assert.deepEqual(products, [{ id: 1 }]);
});
