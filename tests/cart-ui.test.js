const test = require('node:test');
const assert = require('node:assert/strict');

class MemoryStorage {
  constructor() { this.store = new Map(); }
  getItem(key) { return this.store.has(key) ? this.store.get(key) : null; }
  setItem(key, value) { this.store.set(key, String(value)); }
  removeItem(key) { this.store.delete(key); }
}

// CartService persiste em localStorage por chave fixa ('tramatto.cart.v1') —
// sem resetar entre testes, cada `new CartService({})` carregaria o
// carrinho deixado pelo teste anterior.
test.beforeEach(() => {
  global.localStorage = new MemoryStorage();
});

require('../js/domain-model');
require('../js/purchase');
const { Product, Variant } = require('../js/domain-model');
const { CartService } = require('../js/services');
const cartUI = require('../js/cart-ui');

function makeCartServiceWithItems(items) {
  const cartService = new CartService({});
  items.forEach(({ product, variant, quantity }) => {
    cartService.addToCart(product, variant, quantity);
  });
  return cartService;
}

test('getSubtotal soma preço x quantidade de todas as linhas do carrinho', async () => {
  const product = new Product({ title: 'Linho', slug: 'linho', price: 100 });
  const cartService = new CartService({});
  await cartService.addToCart(product, null, 2);

  const subtotal = cartUI.getSubtotal(cartService.getCart());
  assert.equal(subtotal, 200);
});

test('getSubtotal soma corretamente múltiplos produtos/variantes distintos', async () => {
  const productA = new Product({ title: 'Linho', slug: 'linho', price: 100 });
  const productB = new Product({ title: 'Jacquard', slug: 'jacquard', price: 50 });
  const cartService = new CartService({});
  await cartService.addToCart(productA, null, 1);
  await cartService.addToCart(productB, null, 3);

  assert.equal(cartUI.getSubtotal(cartService.getCart()), 100 + 150);
});

test('getTotalItems conta a quantidade total de itens, não o número de linhas', async () => {
  const product = new Product({ title: 'Linho', slug: 'linho', price: 100 });
  const cartService = new CartService({});
  await cartService.addToCart(product, null, 5);
  assert.equal(cartUI.getTotalItems(cartService.getCart()), 5);
});

test('duas variantes distintas do mesmo produto viram duas linhas separadas no carrinho', async () => {
  const product = new Product({ title: 'Linho', slug: 'linho', price: 100 });
  const variantA = new Variant({ id: 'var-a', name: 'Branco', price: 100 });
  const variantB = new Variant({ id: 'var-b', name: 'Areia', price: 100 });
  const cartService = new CartService({});
  await cartService.addToCart(product, variantA, 1);
  await cartService.addToCart(product, variantB, 1);

  const cart = cartService.getCart();
  assert.equal(cart.items.length, 2);
  assert.equal(cartUI.getTotalItems(cart), 2);
});

test('buildWhatsAppCheckoutMessage retorna vazio para carrinho vazio', () => {
  const cartService = new CartService({});
  assert.equal(cartUI.buildWhatsAppCheckoutMessage(cartService.getCart()), '');
});

test('buildWhatsAppCheckoutMessage lista cada linha com quantidade, nome e subtotal', async () => {
  const productA = new Product({ title: 'Linho Anatoliano', slug: 'linho', price: 100 });
  const productB = new Product({ title: 'Jacquard Ottomano', slug: 'jacquard', price: 50 });
  const cartService = new CartService({});
  await cartService.addToCart(productA, null, 2);
  await cartService.addToCart(productB, null, 1);

  const message = cartUI.buildWhatsAppCheckoutMessage(cartService.getCart());
  assert.ok(message.includes('2x Linho Anatoliano'));
  assert.ok(message.includes('1x Jacquard Ottomano'));
  assert.ok(message.includes(`Subtotal: ${cartUI.formatPriceBRL(250)}`));
});

test('buildWhatsAppCheckoutUrl usa o número oficial da Tramatto e nunca inclui dados de pagamento', async () => {
  const product = new Product({ title: 'Linho', slug: 'linho', price: 100 });
  const cartService = new CartService({});
  await cartService.addToCart(product, null, 1);

  const url = cartUI.buildWhatsAppCheckoutUrl(cartService.getCart());
  assert.ok(url.startsWith('https://wa.me/5547991176648?text='));
  assert.ok(!url.toLowerCase().includes('cart%C3%a3o'));
  assert.ok(!url.toLowerCase().includes('pix'));
});

test('buildWhatsAppCheckoutUrl retorna null para carrinho vazio', () => {
  const cartService = new CartService({});
  assert.equal(cartUI.buildWhatsAppCheckoutUrl(cartService.getCart()), null);
});

test('buildNativeBuyUrlForSingleItemCart monta o link nativo quando há exatamente 1 linha com variantId real', async () => {
  global.TramattoConfig = {
    environment: 'production',
    resolveEnvironment: () => ({ storeUrl: 'https://tramatto.lojavirtualnuvem.com.br' })
  };

  const product = new Product({ title: 'Linho', slug: 'linho', price: 100 });
  const variant = new Variant({ id: 1562965536, name: 'Padrão', price: 100 });
  const cartService = new CartService({});
  await cartService.addToCart(product, variant, 2);

  const url = cartUI.buildNativeBuyUrlForSingleItemCart(cartService.getCart());
  assert.equal(url, 'https://tramatto.lojavirtualnuvem.com.br/comprar/1562965536-2/');

  delete global.TramattoConfig;
});

test('buildNativeBuyUrlForSingleItemCart retorna null quando há mais de uma linha (nunca monta /comprar/ para multi-item)', async () => {
  global.TramattoConfig = {
    environment: 'production',
    resolveEnvironment: () => ({ storeUrl: 'https://tramatto.lojavirtualnuvem.com.br' })
  };

  const productA = new Product({ title: 'Linho', slug: 'linho', price: 100 });
  const productB = new Product({ title: 'Jacquard', slug: 'jacquard', price: 50 });
  const cartService = new CartService({});
  await cartService.addToCart(productA, new Variant({ id: 111, price: 100 }), 1);
  await cartService.addToCart(productB, new Variant({ id: 222, price: 50 }), 1);

  const url = cartUI.buildNativeBuyUrlForSingleItemCart(cartService.getCart());
  assert.equal(url, null);

  delete global.TramattoConfig;
});
