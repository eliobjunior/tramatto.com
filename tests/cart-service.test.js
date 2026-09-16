const test = require('node:test');
const assert = require('node:assert/strict');

class MemoryStorage {
  constructor() { this.store = new Map(); }
  getItem(key) { return this.store.has(key) ? this.store.get(key) : null; }
  setItem(key, value) { this.store.set(key, String(value)); }
  removeItem(key) { this.store.delete(key); }
}

// CartService persiste por chave fixa — sem resetar entre testes, um
// `new CartService({})` carregaria o carrinho deixado pelo teste anterior.
test.beforeEach(() => {
  global.localStorage = new MemoryStorage();
});

const { Product, Variant } = require('../js/domain-model');
const { CartService } = require('../js/services');

function makeProduct(overrides = {}) {
  return new Product({
    id: '100',
    title: 'Kit Linho',
    slug: 'kit-linho',
    price: 100,
    image: 'https://example.com/linho.jpg',
    ...overrides
  });
}

function makeVariant(overrides = {}) {
  return new Variant({
    id: 1000,
    name: 'Padrão',
    sku: 'SKU-1000',
    price: 100,
    stock: 10,
    ...overrides
  });
}

test('carrinho vazio: novo CartService inicia sem itens', () => {
  const cartService = new CartService({});
  const cart = cartService.getCart();
  assert.deepEqual(cart.items, []);
  assert.equal(cart.getTotalItems(), 0);
});

test('adicionar: cria uma linha com variant.id como lineId e preserva product.id/sku/imagem/estoque', async () => {
  const product = makeProduct();
  const variant = makeVariant();
  const cartService = new CartService({});

  const cart = await cartService.addToCart(product, variant, 1);
  assert.equal(cart.items.length, 1);
  const [item] = cart.items;
  assert.equal(item.lineId, '1000');
  assert.equal(item.variantId, 1000);
  assert.equal(item.productId, '100');
  assert.equal(item.sku, 'SKU-1000');
  assert.equal(item.image, 'https://example.com/linho.jpg');
  assert.equal(item.stock, 10);
  assert.equal(item.quantity, 1);
  assert.equal(item.price, 100);
});

test('adicionar novamente: mesmo variant.id incrementa a quantidade da mesma linha (não cria linha nova)', async () => {
  const product = makeProduct();
  const variant = makeVariant();
  const cartService = new CartService({});

  await cartService.addToCart(product, variant, 1);
  const cart = await cartService.addToCart(product, variant, 2);

  assert.equal(cart.items.length, 1);
  assert.equal(cart.items[0].quantity, 3);
});

test('incrementar: updateQuantity aumenta a quantidade da linha', async () => {
  const product = makeProduct();
  const variant = makeVariant();
  const cartService = new CartService({});
  await cartService.addToCart(product, variant, 1);

  const cart = await cartService.updateQuantity('1000', 5);
  assert.equal(cart.items[0].quantity, 5);
});

test('decrementar: updateQuantity reduz a quantidade da linha', async () => {
  const product = makeProduct();
  const variant = makeVariant();
  const cartService = new CartService({});
  await cartService.addToCart(product, variant, 5);

  const cart = await cartService.updateQuantity('1000', 2);
  assert.equal(cart.items[0].quantity, 2);
});

test('decrementar até zero remove o item (convenção já existente do domain model)', async () => {
  const product = makeProduct();
  const variant = makeVariant();
  const cartService = new CartService({});
  await cartService.addToCart(product, variant, 1);

  const cart = await cartService.updateQuantity('1000', 0);
  assert.equal(cart.items.length, 0);
});

test('remover: removeFromCart tira a linha do carrinho', async () => {
  const product = makeProduct();
  const variant = makeVariant();
  const cartService = new CartService({});
  await cartService.addToCart(product, variant, 1);

  const cart = await cartService.removeFromCart('1000');
  assert.equal(cart.items.length, 0);
});

test('múltiplas variantes: duas variantes do mesmo produto viram duas linhas distintas, identificadas por variant.id', async () => {
  const product = makeProduct();
  const variantA = makeVariant({ id: 1001, name: 'Branco' });
  const variantB = makeVariant({ id: 1002, name: 'Areia' });
  const cartService = new CartService({});

  await cartService.addToCart(product, variantA, 1);
  const cart = await cartService.addToCart(product, variantB, 1);

  assert.equal(cart.items.length, 2);
  assert.deepEqual(cart.items.map((item) => item.lineId).sort(), ['1001', '1002']);
});

test('variant.id como identidade: lineId nunca usa nome, slug, índice ou preço', async () => {
  const productA = makeProduct({ id: '100', slug: 'produto-a', title: 'Produto A', price: 999 });
  const cartService = new CartService({});
  const variant = makeVariant({ id: 42 });

  const cart = await cartService.addToCart(productA, variant, 1);
  assert.equal(cart.items[0].lineId, '42');
  assert.notEqual(cart.items[0].lineId, 'produto-a-42');
});

test('persistência: chave versionada tramatto.cart.v1 e um novo CartService recupera o carrinho salvo', async () => {
  const product = makeProduct();
  const variant = makeVariant();
  const cartService = new CartService({});
  await cartService.addToCart(product, variant, 3);

  assert.equal(cartService.storageKey, 'tramatto.cart.v1');
  assert.ok(global.localStorage.getItem('tramatto.cart.v1'));

  const reloaded = new CartService({});
  assert.equal(reloaded.getCart().items.length, 1);
  assert.equal(reloaded.getCart().items[0].quantity, 3);
  assert.equal(reloaded.getCart().items[0].lineId, '1000');
});

test('limite de estoque: adicionar mais do que o estoque disponível (stock_management ativo) limita à quantidade máxima', async () => {
  const product = makeProduct();
  const variant = makeVariant({ id: 2000, stock: 2, stockManagement: true });
  const cartService = new CartService({});

  const cart = await cartService.addToCart(product, variant, 5);
  assert.equal(cart.items[0].quantity, 2);
});

test('limite de estoque: adicionar de novo quando já está no máximo não incrementa além do estoque', async () => {
  const product = makeProduct();
  const variant = makeVariant({ id: 2001, stock: 2, stockManagement: true });
  const cartService = new CartService({});

  await cartService.addToCart(product, variant, 2);
  const cart = await cartService.addToCart(product, variant, 1);
  assert.equal(cart.items[0].quantity, 2);
});

test('limite de estoque: produto sem estoque (stock 0, stock_management ativo) não pode ser adicionado', async () => {
  const product = makeProduct();
  const variant = makeVariant({ id: 2002, stock: 0, stockManagement: true });
  const cartService = new CartService({});

  await assert.rejects(() => cartService.addToCart(product, variant, 1), /sem estoque/);
  assert.equal(cartService.getCart().items.length, 0);
});

test('limite de estoque: stock_management inativo (false/null) nunca limita a quantidade', async () => {
  const product = makeProduct();
  const variant = makeVariant({ id: 2003, stock: 1, stockManagement: false });
  const cartService = new CartService({});

  const cart = await cartService.addToCart(product, variant, 50);
  assert.equal(cart.items[0].quantity, 50);
});

test('limite de estoque: stock "" (ilimitado, convenção da API) nunca limita a quantidade mesmo com stock_management ativo', async () => {
  const product = makeProduct();
  const variant = makeVariant({ id: 2004, stock: '', stockManagement: true });
  const cartService = new CartService({});

  const cart = await cartService.addToCart(product, variant, 999);
  assert.equal(cart.items[0].quantity, 999);
});

test('updateQuantity também respeita o teto de estoque conhecido pela linha', async () => {
  const product = makeProduct();
  const variant = makeVariant({ id: 2005, stock: 3, stockManagement: true });
  const cartService = new CartService({});
  await cartService.addToCart(product, variant, 1);

  const cart = await cartService.updateQuantity('2005', 10);
  assert.equal(cart.items[0].quantity, 3);
});

test('dados inválidos: localStorage com JSON corrompido não derruba o carrinho (inicia vazio)', () => {
  global.localStorage.setItem('tramatto.cart.v1', '{not valid json');
  const cartService = new CartService({});
  assert.deepEqual(cartService.getCart().items, []);
});

test('dados inválidos: localStorage com formato inesperado (não é um objeto de carrinho) inicia vazio em vez de quebrar', () => {
  global.localStorage.setItem('tramatto.cart.v1', JSON.stringify(['isso', 'não', 'é', 'um', 'carrinho']));
  const cartService = new CartService({});
  assert.deepEqual(cartService.getCart().items, []);
});

test('adicionar sem variante válida (produto sem variantes reais) lança erro em vez de inventar uma linha', async () => {
  const product = makeProduct({ variants: [] }); // Product só injeta a variante default quando data.variants é omitido
  const cartService = new CartService({});

  await assert.rejects(() => cartService.addToCart(product, null, 1), /variante válida/);
});

test('atualização dos dados do catálogo: syncWithCatalog atualiza nome/preço/imagem/estoque a partir do catálogo real (nunca confia no preço antigo salvo)', async () => {
  const staleProduct = makeProduct({ price: 100, title: 'Nome Antigo', image: 'antiga.jpg' });
  const staleVariant = makeVariant({ id: 3000, price: 100, stock: 10 });
  const cartService = new CartService({});
  await cartService.addToCart(staleProduct, staleVariant, 1);

  const freshProduct = makeProduct({ price: 130, title: 'Nome Atual', image: 'nova.jpg' });
  const freshVariant = makeVariant({ id: 3000, price: 130, stock: 7, sku: 'SKU-NOVO' });
  freshProduct.variants = [freshVariant];

  cartService.syncWithCatalog([freshProduct]);

  const [item] = cartService.getCart().items;
  assert.equal(item.name, 'Nome Atual');
  assert.equal(item.price, 130);
  assert.equal(item.image, 'nova.jpg');
  assert.equal(item.stock, 7);
  assert.equal(item.sku, 'SKU-NOVO');
  assert.equal(item.unavailable, false);
});

test('atualização dos dados do catálogo: variant.id que não existe mais no catálogo real vira unavailable (não remove a linha)', async () => {
  const product = makeProduct();
  const variant = makeVariant({ id: 4000 });
  const cartService = new CartService({});
  await cartService.addToCart(product, variant, 1);

  cartService.syncWithCatalog([]); // catálogo real não tem mais esse produto/variante

  const [item] = cartService.getCart().items;
  assert.equal(item.unavailable, true);
  assert.equal(cartService.getCart().items.length, 1);
});

test('atualização dos dados do catálogo: estoque zerado (stock_management ativo) vira outOfStock sem remover a linha', async () => {
  const product = makeProduct();
  const variant = makeVariant({ id: 4001, stock: 5, stockManagement: true });
  const cartService = new CartService({});
  await cartService.addToCart(product, variant, 2);

  const freshVariant = makeVariant({ id: 4001, stock: 0, stockManagement: true });
  const freshProduct = makeProduct();
  freshProduct.variants = [freshVariant];
  cartService.syncWithCatalog([freshProduct]);

  const [item] = cartService.getCart().items;
  assert.equal(item.outOfStock, true);
  assert.equal(item.quantity, 2, 'quantidade não é zerada automaticamente — usuário decide');
});

test('atualização dos dados do catálogo: estoque insuficiente (reduzido) ajusta a quantidade da linha ao novo máximo', async () => {
  const product = makeProduct();
  const variant = makeVariant({ id: 4002, stock: 10, stockManagement: true });
  const cartService = new CartService({});
  await cartService.addToCart(product, variant, 8);

  const freshVariant = makeVariant({ id: 4002, stock: 3, stockManagement: true });
  const freshProduct = makeProduct();
  freshProduct.variants = [freshVariant];
  cartService.syncWithCatalog([freshProduct]);

  const [item] = cartService.getCart().items;
  assert.equal(item.quantity, 3);
  assert.equal(item.outOfStock, false);
});

test('subtotal geral: soma preço atual x quantidade de todas as linhas após sync', async () => {
  const productA = makeProduct({ id: 'a', slug: 'a' });
  const variantA = makeVariant({ id: 5001, price: 50 });
  const productB = makeProduct({ id: 'b', slug: 'b' });
  const variantB = makeVariant({ id: 5002, price: 30 });

  const cartService = new CartService({});
  await cartService.addToCart(productA, variantA, 2);
  await cartService.addToCart(productB, variantB, 1);

  const total = cartService.getCart().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  assert.equal(total, 130);
});
