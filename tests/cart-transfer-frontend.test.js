const test = require('node:test');
const assert = require('node:assert/strict');

const cartTransfer = require('../js/cart-transfer');

function withMockedFetch(mockFetch, run) {
  const originalFetch = global.fetch;
  global.fetch = mockFetch;
  return run().finally(() => {
    global.fetch = originalFetch;
  });
}

function jsonResponse(body, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body)
  };
}

// ===== normalização de IDs (item 1 do plano) =====

test('normalizeCartItemForTransfer: productId/variantId string numéricos viram Number', () => {
  const item = { productId: '356837536', variantId: '1562965466', quantity: 2 };
  const normalized = cartTransfer.normalizeCartItemForTransfer(item);
  assert.deepEqual(normalized, { productId: 356837536, variantId: 1562965466, quantity: 2 });
  assert.equal(typeof normalized.productId, 'number');
  assert.equal(typeof normalized.variantId, 'number');
});

test('normalizeCartItemForTransfer: productId/variantId já numéricos permanecem válidos', () => {
  const item = { productId: 356837536, variantId: 1562965466, quantity: 2 };
  assert.deepEqual(cartTransfer.normalizeCartItemForTransfer(item), {
    productId: 356837536,
    variantId: 1562965466,
    quantity: 2
  });
});

test('normalizeCartItemForTransfer: slug/string não numérica é rejeitado (retorna null)', () => {
  assert.equal(cartTransfer.normalizeCartItemForTransfer({ productId: 'kit-mika-verde', variantId: 1, quantity: 1 }), null);
  assert.equal(cartTransfer.normalizeCartItemForTransfer({ productId: 1, variantId: '1562965466-produto', quantity: 1 }), null);
  assert.equal(cartTransfer.normalizeCartItemForTransfer({ productId: '123abc', variantId: 1, quantity: 1 }), null);
});

test('normalizeCartItemForTransfer: decimal é rejeitado', () => {
  assert.equal(cartTransfer.normalizeCartItemForTransfer({ productId: 1.5, variantId: 1, quantity: 1 }), null);
  assert.equal(cartTransfer.normalizeCartItemForTransfer({ productId: 1, variantId: '1.5', quantity: 1 }), null);
});

test('normalizeCartItemForTransfer: zero é rejeitado', () => {
  assert.equal(cartTransfer.normalizeCartItemForTransfer({ productId: 0, variantId: 1, quantity: 1 }), null);
  assert.equal(cartTransfer.normalizeCartItemForTransfer({ productId: 1, variantId: '0', quantity: 1 }), null);
});

test('normalizeCartItemForTransfer: negativo é rejeitado', () => {
  assert.equal(cartTransfer.normalizeCartItemForTransfer({ productId: -1, variantId: 1, quantity: 1 }), null);
  assert.equal(cartTransfer.normalizeCartItemForTransfer({ productId: 1, variantId: '-5', quantity: 1 }), null);
});

test('normalizeCartItemForTransfer: quantity inválida (zero, negativa, decimal, string não numérica) é rejeitada', () => {
  assert.equal(cartTransfer.normalizeCartItemForTransfer({ productId: 1, variantId: 1, quantity: 0 }), null);
  assert.equal(cartTransfer.normalizeCartItemForTransfer({ productId: 1, variantId: 1, quantity: -2 }), null);
  assert.equal(cartTransfer.normalizeCartItemForTransfer({ productId: 1, variantId: 1, quantity: 1.5 }), null);
  assert.equal(cartTransfer.normalizeCartItemForTransfer({ productId: 1, variantId: 1, quantity: 'muitas' }), null);
});

test('normalizeCartItemForTransfer: nunca aceita notação exótica (hex, científica, espaços) como productId', () => {
  assert.equal(cartTransfer.normalizeCartItemForTransfer({ productId: '0x10', variantId: 1, quantity: 1 }), null);
  assert.equal(cartTransfer.normalizeCartItemForTransfer({ productId: '1e3', variantId: 1, quantity: 1 }), null);
  assert.equal(cartTransfer.normalizeCartItemForTransfer({ productId: ' 123 ', variantId: 1, quantity: 1 }), null);
});

// ===== filtro de itens indisponíveis/inválidos (item 2 do plano) =====

test('buildTransferableItems: item disponível permanece no payload', () => {
  const items = [{ productId: 1, variantId: 10, quantity: 2 }];
  assert.deepEqual(cartTransfer.buildTransferableItems(items), [{ productId: 1, variantId: 10, quantity: 2 }]);
});

test('buildTransferableItems: item unavailable é removido', () => {
  const items = [
    { productId: 1, variantId: 10, quantity: 1, unavailable: true },
    { productId: 2, variantId: 20, quantity: 1 }
  ];
  assert.deepEqual(cartTransfer.buildTransferableItems(items), [{ productId: 2, variantId: 20, quantity: 1 }]);
});

test('buildTransferableItems: item outOfStock é removido', () => {
  const items = [
    { productId: 1, variantId: 10, quantity: 1, outOfStock: true },
    { productId: 2, variantId: 20, quantity: 1 }
  ];
  assert.deepEqual(cartTransfer.buildTransferableItems(items), [{ productId: 2, variantId: 20, quantity: 1 }]);
});

test('buildTransferableItems: mistura de disponíveis e indisponíveis mantém só os disponíveis', () => {
  const items = [
    { productId: 1, variantId: 10, quantity: 1 },
    { productId: 2, variantId: 20, quantity: 1, unavailable: true },
    { productId: 3, variantId: 30, quantity: 1, outOfStock: true },
    { productId: 4, variantId: 40, quantity: 2 }
  ];
  assert.deepEqual(cartTransfer.buildTransferableItems(items), [
    { productId: 1, variantId: 10, quantity: 1 },
    { productId: 4, variantId: 40, quantity: 2 }
  ]);
});

test('buildTransferableItems: todos indisponíveis produz payload vazio (nunca lança)', () => {
  const items = [
    { productId: 1, variantId: 10, quantity: 1, unavailable: true },
    { productId: 2, variantId: 20, quantity: 1, outOfStock: true }
  ];
  assert.deepEqual(cartTransfer.buildTransferableItems(items), []);
});

test('buildTransferableItems: item com productId/variantId/quantity inválido não entra no payload', () => {
  const items = [
    { productId: 'slug-invalido', variantId: 10, quantity: 1 },
    { productId: 1, variantId: 'abc', quantity: 1 },
    { productId: 1, variantId: 10, quantity: 0 },
    { productId: 2, variantId: 20, quantity: 3 }
  ];
  assert.deepEqual(cartTransfer.buildTransferableItems(items), [{ productId: 2, variantId: 20, quantity: 3 }]);
});

test('buildTransferableItems: carrinho vazio produz payload vazio', () => {
  assert.deepEqual(cartTransfer.buildTransferableItems([]), []);
  assert.deepEqual(cartTransfer.buildTransferableItems(undefined), []);
});

// ===== construção da URL de redirect =====

test('buildDemoRedirectUrl: monta a URL da loja demo com o token em ?tramatto_cart=', () => {
  const url = cartTransfer.buildDemoRedirectUrl('abc-123');
  assert.equal(url, 'https://tramattotestenubesdk.lojavirtualnuvem.com.br/?tramatto_cart=abc-123');
});

test('buildDemoRedirectUrl: normaliza barra final duplicada em storeUrl customizada', () => {
  const url = cartTransfer.buildDemoRedirectUrl('tok', { storeUrl: 'https://exemplo.lojavirtualnuvem.com.br/' });
  assert.equal(url, 'https://exemplo.lojavirtualnuvem.com.br/?tramatto_cart=tok');
});

// ===== POST /cart-transfer e resultado tipado (item 3/4 do plano) =====

test('createCartTransfer: HTTP 201 com token válido resolve com o token', async () => {
  const token = await cartTransfer.createCartTransfer(
    [{ productId: 1, variantId: 10, quantity: 1 }],
    { fetchImpl: async () => jsonResponse({ token: 'token-valido' }, 201) }
  );
  assert.equal(token, 'token-valido');
});

test('createCartTransfer: envia POST com Content-Type json e o body {items}', async () => {
  let captured = null;
  await cartTransfer.createCartTransfer(
    [{ productId: 1, variantId: 10, quantity: 2 }],
    {
      fetchImpl: async (url, options) => {
        captured = { url, options };
        return jsonResponse({ token: 'tok' }, 201);
      }
    }
  );
  assert.equal(captured.url, cartTransfer.CART_TRANSFER_ENDPOINT);
  assert.equal(captured.options.method, 'POST');
  assert.equal(captured.options.headers['Content-Type'], 'application/json');
  assert.deepEqual(JSON.parse(captured.options.body), { items: [{ productId: 1, variantId: 10, quantity: 2 }] });
});

test('createCartTransfer: resposta HTTP de erro lança com a mensagem do Worker', async () => {
  await assert.rejects(
    cartTransfer.createCartTransfer(
      [{ productId: 1, variantId: 10, quantity: 1 }],
      { fetchImpl: async () => jsonResponse({ error: 'invalid_items', message: 'quantity precisa ser um inteiro' }, 400) }
    ),
    /quantity precisa ser um inteiro/
  );
});

test('createCartTransfer: resposta sem token válido lança erro', async () => {
  await assert.rejects(
    cartTransfer.createCartTransfer(
      [{ productId: 1, variantId: 10, quantity: 1 }],
      { fetchImpl: async () => jsonResponse({}, 201) }
    ),
    /token/i
  );
});

test('transferCartToNuvemshop: nenhum item transferível -> não chama fetch, retorna reason no_transferable_items', async () => {
  let fetchCalled = false;
  const result = await cartTransfer.transferCartToNuvemshop(
    [{ productId: 1, variantId: 10, quantity: 1, unavailable: true }],
    { fetchImpl: async () => { fetchCalled = true; return jsonResponse({ token: 'x' }, 201); } }
  );
  assert.equal(fetchCalled, false);
  assert.deepEqual(result, { ok: false, reason: 'no_transferable_items' });
});

test('transferCartToNuvemshop: carrinho vazio -> mesmo resultado, sem chamar fetch', async () => {
  let fetchCalled = false;
  const result = await cartTransfer.transferCartToNuvemshop([], {
    fetchImpl: async () => { fetchCalled = true; return jsonResponse({ token: 'x' }, 201); }
  });
  assert.equal(fetchCalled, false);
  assert.deepEqual(result, { ok: false, reason: 'no_transferable_items' });
});

test('transferCartToNuvemshop: sucesso retorna token e redirectUrl para a loja demo', async () => {
  const result = await cartTransfer.transferCartToNuvemshop(
    [{ productId: 356837536, variantId: 1562965466, quantity: 2 }],
    { fetchImpl: async () => jsonResponse({ token: 'token-real' }, 201) }
  );
  assert.deepEqual(result, {
    ok: true,
    token: 'token-real',
    redirectUrl: 'https://tramattotestenubesdk.lojavirtualnuvem.com.br/?tramatto_cart=token-real'
  });
});

test('transferCartToNuvemshop: itens string numéricos + item unavailable -> filtra e normaliza antes do POST', async () => {
  let sentBody = null;
  const result = await cartTransfer.transferCartToNuvemshop(
    [
      { productId: '367452828', variantId: '1596838996', quantity: 1 },
      { productId: 2, variantId: 20, quantity: 1, unavailable: true }
    ],
    {
      fetchImpl: async (url, options) => {
        sentBody = JSON.parse(options.body);
        return jsonResponse({ token: 'tok' }, 201);
      }
    }
  );
  assert.deepEqual(sentBody, { items: [{ productId: 367452828, variantId: 1596838996, quantity: 1 }] });
  assert.equal(result.ok, true);
});

test('transferCartToNuvemshop: erro de rede -> ok:false, reason transfer_failed, nunca lança', async () => {
  const result = await cartTransfer.transferCartToNuvemshop(
    [{ productId: 1, variantId: 10, quantity: 1 }],
    { fetchImpl: async () => { throw new Error('network down'); } }
  );
  assert.equal(result.ok, false);
  assert.equal(result.reason, 'transfer_failed');
  assert.match(result.error, /network down/);
});

test('transferCartToNuvemshop: Worker responde HTTP de erro -> ok:false, reason transfer_failed com a mensagem', async () => {
  const result = await cartTransfer.transferCartToNuvemshop(
    [{ productId: 1, variantId: 10, quantity: 1 }],
    { fetchImpl: async () => jsonResponse({ error: 'invalid_items', message: 'items precisa ter entre 1 e 20 itens' }, 400) }
  );
  assert.equal(result.ok, false);
  assert.equal(result.reason, 'transfer_failed');
  assert.match(result.error, /items precisa ter entre 1 e 20 itens/);
});

test('transferCartToNuvemshop: usa global.fetch quando fetchImpl não é passado', async () => {
  await withMockedFetch(
    async () => jsonResponse({ token: 'tok-global' }, 201),
    async () => {
      const result = await cartTransfer.transferCartToNuvemshop([{ productId: 1, variantId: 10, quantity: 1 }]);
      assert.equal(result.ok, true);
      assert.equal(result.token, 'tok-global');
    }
  );
});
