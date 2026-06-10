const test = require('node:test');
const assert = require('node:assert/strict');

class MemoryStorage {
  constructor() {
    this.store = new Map();
  }
  getItem(key) {
    return this.store.has(key) ? this.store.get(key) : null;
  }
  setItem(key, value) {
    this.store.set(key, String(value));
  }
  removeItem(key) {
    this.store.delete(key);
  }
}

global.localStorage = new MemoryStorage();

const { Product, Variant, Cart } = require('../js/domain-model');
const { CartService } = require('../js/services');

test('domain model creates product with variants and price accessors', () => {
  const product = new Product({
    title: 'Pano premium',
    slug: 'pano-premium',
    price: 100,
    promotionalPrice: 85,
    variants: [{ id: 'v1', name: 'Branco', price: 100, stock: 5 }]
  });

  assert.equal(product.getPrimaryPrice(), 85);
  assert.equal(product.variants[0].name, 'Branco');
  assert.equal(product.variants[0].stock, 5);
});

test('cart service adds, updates and removes items with persistence', async () => {
  const cartService = new CartService({});
  const product = new Product({ title: 'Pano', slug: 'pano', price: 90 });
  const variant = new Variant({ id: 'v2', name: 'Terracota', price: 90, stock: 3 });

  const cart = await cartService.addToCart(product, variant, 2);
  assert.equal(cart.getTotalItems(), 2);

  await cartService.updateQuantity(`${product.slug}-${variant.id}`, 3);
  assert.equal(cartService.getCart().getTotalItems(), 3);

  await cartService.removeFromCart(`${product.slug}-${variant.id}`);
  assert.equal(cartService.getCart().getTotalItems(), 0);
  assert.equal(global.localStorage.getItem(cartService.storageKey).includes('items'), true);
});

test('cart domain supports quantity updates and item removal', () => {
  const cart = new Cart();
  cart.addItem({ lineId: 'line-1', productId: 'p1', quantity: 1, price: 10 });
  cart.updateQuantity('line-1', 4);
  assert.equal(cart.getTotalItems(), 4);
  cart.removeItem('line-1');
  assert.equal(cart.getTotalItems(), 0);
});
