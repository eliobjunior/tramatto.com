const test = require('node:test');
const assert = require('node:assert/strict');

require('../js/domain-model');

// Fixture no formato real gerado por scripts/sync-nuvemshop-mirror.js —
// mesmos valores validados manualmente contra a loja real na auditoria
// (variant_id 1562965536, SKU PL-VIVA-VM-02).
global.nuvemshopMirrorData = {
  generatedAt: '2026-08-18T00:00:00.000Z',
  sourceStoreUrl: 'https://tramatto.lojavirtualnuvem.com.br',
  collections: [
    { id: 'kits', name: 'Kits', slug: 'kits', description: '', image: null }
  ],
  products: [
    {
      nuvemshopProductId: 356837564,
      title: 'Kit 2 Panos de Prato Viva Vermelho',
      slug: 'viva--vermelho-kit-2-pecas',
      description: 'Panos de louça premium importados da Turquia.',
      price: 74.9,
      promotionalPrice: null,
      currency: 'BRL',
      brand: 'Tramatto',
      inStock: true,
      stock: 275,
      collectionId: 'kits',
      gallery: ['https://dcdn-us.mitiendanube.com/assets/stores/img/no-photo-480-0.webp'],
      variants: [
        {
          id: 1562965536,
          sku: 'PL-VIVA-VM-02',
          price: 74.9,
          promotionalPrice: null,
          stock: 275,
          color: null,
          size: null,
          attributes: { option1: null, option2: null, option3: null },
          image: 'https://dcdn-us.mitiendanube.com/assets/stores/img/no-photo-1024-1024.webp'
        }
      ],
      syncedAt: '2026-08-18T00:00:00.000Z',
      condition: 'new',
      productType: '',
      googleProductCategory: '',
      badge: '',
      label: 'Peça premium',
      small: '',
      highlights: [],
      colors: [],
      sizes: [],
      needsEditorialReview: true
    },
    {
      // Produto propositalmente com uma variante sem id real — simula o
      // que o sync script produz quando não encontra variant_id na loja.
      nuvemshopProductId: 999999999,
      title: 'Produto Sem Variante Real',
      slug: 'produto-sem-variante-real',
      description: '',
      price: 50,
      promotionalPrice: null,
      currency: 'BRL',
      brand: 'Tramatto',
      inStock: false,
      stock: 0,
      collectionId: 'kits',
      gallery: [],
      variants: [
        { sku: 'SEM-ID', price: 50, promotionalPrice: null, stock: 0, color: null, size: null, attributes: {}, image: null }
      ],
      syncedAt: '2026-08-18T00:00:00.000Z',
      condition: 'new',
      productType: '',
      googleProductCategory: '',
      badge: '',
      label: 'Peça premium',
      small: '',
      highlights: [],
      colors: [],
      sizes: [],
      needsEditorialReview: true
    }
  ]
};

const { MockAdapter, MirrorAdapter } = require('../js/adapters');
const { buildBuyUrl } = require('../js/purchase');

test('MirrorAdapter.getProducts() retorna produto real com dados corretos', async () => {
  const adapter = new MirrorAdapter();
  const products = await adapter.getProducts();
  const product = products.find((item) => item.slug === 'viva--vermelho-kit-2-pecas');

  assert.ok(product, 'produto real deveria estar presente');
  assert.equal(product.title, 'Kit 2 Panos de Prato Viva Vermelho');
  assert.equal(product.price, 74.9);
  assert.equal(product.inStock, true);
  assert.equal(product.collectionId, 'kits');
});

test('MirrorAdapter mantém variant.id como o variant_id NUMÉRICO real da Nuvemshop', async () => {
  const adapter = new MirrorAdapter();
  const product = await adapter.getProductBySlug('viva--vermelho-kit-2-pecas');
  const [variant] = product.variants;

  assert.equal(variant.id, 1562965536);
  assert.equal(typeof variant.id, 'number');
});

test('MirrorAdapter preserva SKU da variante', async () => {
  const adapter = new MirrorAdapter();
  const product = await adapter.getProductBySlug('viva--vermelho-kit-2-pecas');
  assert.equal(product.variants[0].sku, 'PL-VIVA-VM-02');
});

test('MirrorAdapter preserva preço da variante', async () => {
  const adapter = new MirrorAdapter();
  const product = await adapter.getProductBySlug('viva--vermelho-kit-2-pecas');
  assert.equal(product.variants[0].price, 74.9);
  assert.equal(product.variants[0].promotionalPrice, null);
});

test('MirrorAdapter preserva estoque da variante e do produto', async () => {
  const adapter = new MirrorAdapter();
  const product = await adapter.getProductBySlug('viva--vermelho-kit-2-pecas');
  assert.equal(product.variants[0].stock, 275);
  assert.equal(product.inStock, true);
});

test('MirrorAdapter DESCARTA variante sem variant_id real (nunca inventa id local)', async () => {
  const adapter = new MirrorAdapter();
  const product = await adapter.getProductBySlug('produto-sem-variante-real');

  assert.ok(product, 'produto deveria existir mesmo sem variante válida');
  assert.equal(product.variants.length, 0, 'variante sem id real não deveria aparecer no domain model');
});

test('MirrorAdapter.getProductBySlug() retorna null para slug inexistente', async () => {
  const adapter = new MirrorAdapter();
  const product = await adapter.getProductBySlug('nao-existe');
  assert.equal(product, null);
});

test('MirrorAdapter.getCollections() mapeia coleções reais', async () => {
  const adapter = new MirrorAdapter();
  const collections = await adapter.getCollections();
  assert.equal(collections.length, 1);
  assert.equal(collections[0].name, 'Kits');
});

test('integração: variant.id real do MirrorAdapter monta a URL /comprar/{variant_id}-{quantity}/ correta', async () => {
  const adapter = new MirrorAdapter();
  const product = await adapter.getProductBySlug('viva--vermelho-kit-2-pecas');
  const variant = product.variants[0];

  const url = buildBuyUrl({
    storeUrl: 'https://tramatto.lojavirtualnuvem.com.br',
    variantId: variant.id,
    quantity: 1
  });

  assert.equal(url, 'https://tramatto.lojavirtualnuvem.com.br/comprar/1562965536-1/');
});

test('integração: produto sem variante real nunca produz um link de compra (buildBuyUrl retorna null)', async () => {
  const adapter = new MirrorAdapter();
  const product = await adapter.getProductBySlug('produto-sem-variante-real');
  const variant = product.variants[0] || null;

  const url = buildBuyUrl({
    storeUrl: 'https://tramatto.lojavirtualnuvem.com.br',
    variantId: variant?.id,
    quantity: 1
  });

  assert.equal(url, null);
});

test('MockAdapter continua funcionando normalmente em desenvolvimento (não afetado pela Opção A)', async () => {
  const mockCatalog = {
    products: [
      {
        title: 'Produto Mock', slug: 'produto-mock', price: 'R$ 10,00',
        variants: [{ id: 'mock-variant', name: 'Padrão', price: 'R$ 10,00', stock: 5 }]
      }
    ],
    collections: []
  };
  const adapter = new MockAdapter(mockCatalog);
  const products = await adapter.getProducts();

  assert.equal(products.length, 1);
  assert.equal(products[0].title, 'Produto Mock');
  assert.equal(products[0].price, 10);
  assert.equal(products[0].variants[0].id, 'mock-variant');
});
