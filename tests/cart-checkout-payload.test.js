const test = require('node:test');
const assert = require('node:assert/strict');

class MemoryStorage {
  constructor() { this.store = new Map(); }
  getItem(key) { return this.store.has(key) ? this.store.get(key) : null; }
  setItem(key, value) { this.store.set(key, String(value)); }
  removeItem(key) { this.store.delete(key); }
}

test.beforeEach(() => {
  global.localStorage = new MemoryStorage();
});

const { Product, Variant } = require('../js/domain-model');
const { CartService } = require('../js/services');

// Teste de contrato — Fase 2B (NubeSDK, ainda não implementada). Garante que
// CartService consegue produzir, hoje, o payload mínimo que a futura
// integração vai consumir: [{ productId, variantId, quantity }]. Não testa
// nenhuma chamada de rede/Nuvemshop — CartService.getCheckoutItems() não faz
// nenhuma.

test('getCheckoutItems(): produz [{productId, variantId, quantity}] com os IDs reais preservados', async () => {
  const product = new Product({ id: '356837536', slug: 'mika--verde-kit-2-pecas', title: 'Kit Mika Verde', price: 89.9 });
  const variant = new Variant({ id: 1562965466, name: 'Padrão', price: 89.9, stock: 600 });
  const cartService = new CartService({});

  await cartService.addToCart(product, variant, 2);

  const payload = cartService.getCheckoutItems();
  assert.deepEqual(payload, [
    { productId: '356837536', variantId: 1562965466, quantity: 2 }
  ]);
});

test('getCheckoutItems(): productId preservado (nunca slug)', async () => {
  const product = new Product({ id: '999', slug: 'nome-do-produto-na-url', title: 'Produto', price: 10 });
  const variant = new Variant({ id: 500, price: 10 });
  const cartService = new CartService({});
  await cartService.addToCart(product, variant, 1);

  const [item] = cartService.getCheckoutItems();
  assert.equal(item.productId, '999');
  assert.notEqual(item.productId, 'nome-do-produto-na-url');
});

test('getCheckoutItems(): variantId preservado (nunca lineId, nome ou índice)', async () => {
  const product = new Product({ id: '1', slug: 'produto', title: 'Produto de Teste com Nome Longo', price: 10 });
  const variant = new Variant({ id: 777, name: 'Variante Especial', price: 10 });
  const cartService = new CartService({});
  await cartService.addToCart(product, variant, 1);

  const [item] = cartService.getCheckoutItems();
  assert.equal(item.variantId, 777);
  assert.notEqual(item.variantId, 'Variante Especial');
  assert.notEqual(item.variantId, '777-0'); // nunca um índice/derivado embutido
});

test('getCheckoutItems(): quantity preservada, inclusive após incrementos', async () => {
  const product = new Product({ id: '1', slug: 'produto', price: 10 });
  const variant = new Variant({ id: 100, price: 10 });
  const cartService = new CartService({});
  await cartService.addToCart(product, variant, 1);
  await cartService.addToCart(product, variant, 4);

  const [item] = cartService.getCheckoutItems();
  assert.equal(item.quantity, 5);
});

test('getCheckoutItems(): duas variantes diferentes do mesmo produto viram duas linhas no payload', async () => {
  const product = new Product({ id: '1', slug: 'produto', price: 10 });
  const variantA = new Variant({ id: 201, name: 'Branco', price: 10 });
  const variantB = new Variant({ id: 202, name: 'Areia', price: 10 });
  const cartService = new CartService({});

  await cartService.addToCart(product, variantA, 1);
  await cartService.addToCart(product, variantB, 3);

  const payload = cartService.getCheckoutItems();
  assert.equal(payload.length, 2);
  assert.deepEqual(
    payload.sort((a, b) => a.variantId - b.variantId),
    [
      { productId: '1', variantId: 201, quantity: 1 },
      { productId: '1', variantId: 202, quantity: 3 }
    ]
  );
});

test('getCheckoutItems(): produtos distintos nunca têm productId/variantId confundidos entre si', async () => {
  const productA = new Product({ id: 'a1', slug: 'produto-a', price: 50 });
  const variantA = new Variant({ id: 301, price: 50 });
  const productB = new Product({ id: 'b2', slug: 'produto-b', price: 70 });
  const variantB = new Variant({ id: 302, price: 70 });

  const cartService = new CartService({});
  await cartService.addToCart(productA, variantA, 1);
  await cartService.addToCart(productB, variantB, 2);

  const payload = cartService.getCheckoutItems();
  const itemA = payload.find((item) => item.variantId === 301);
  const itemB = payload.find((item) => item.variantId === 302);

  assert.equal(itemA.productId, 'a1');
  assert.equal(itemB.productId, 'b2');
});

test('getCheckoutItems(): carrinho vazio produz payload vazio (nunca lança erro)', () => {
  const cartService = new CartService({});
  assert.deepEqual(cartService.getCheckoutItems(), []);
});

test('getCheckoutItems(): reflete o carrinho recarregado do localStorage (não só o estado em memória do add)', async () => {
  const product = new Product({ id: '1', slug: 'produto', price: 10 });
  const variant = new Variant({ id: 400, price: 10 });
  const cartService = new CartService({});
  await cartService.addToCart(product, variant, 2);

  const reloaded = new CartService({});
  assert.deepEqual(reloaded.getCheckoutItems(), [
    { productId: '1', variantId: 400, quantity: 2 }
  ]);
});
