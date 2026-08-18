const test = require('node:test');
const assert = require('node:assert/strict');

require('../js/domain-model');
const mapper = require('../integrations/nuvemshop/mapper');

// Payload no formato real documentado pela API oficial da Nuvemshop
// (name/description/handle multilíngues, variants[].values posicionais
// em relação a product.attributes[], images[].src, categories[] como IDs).
const rawProduct = {
  id: 12345,
  name: { pt: 'Linho Anatoliano' },
  description: { pt: 'Um tecido leve e sofisticado.' },
  handle: { pt: 'linho-anatoliano' },
  brand: 'Tramatto',
  categories: [111, 222],
  attributes: [{ pt: 'Cor' }, { pt: 'Tamanho' }],
  variants: [
    {
      id: 1,
      sku: 'LA-BR-45',
      price: '120.00',
      promotional_price: null,
      stock: 8,
      values: [{ pt: 'Branco natural' }, { pt: '45x70cm' }]
    },
    {
      id: 2,
      sku: 'LA-AR-60',
      price: '135.00',
      promotional_price: '119.90',
      stock: '',
      values: [{ pt: 'Areia' }, { pt: '60x90cm' }]
    }
  ],
  images: [
    { id: 2, src: 'https://example.cloudfront.net/linho-2.jpg', position: 2 },
    { id: 1, src: 'https://example.cloudfront.net/linho-1.jpg', position: 1 }
  ]
};

const rawProductNoStock = {
  id: 999,
  name: { pt: 'Esgotado' },
  handle: { pt: 'esgotado' },
  variants: [
    { id: 9, sku: 'ESG-1', price: '50.00', stock: 0, values: [] }
  ],
  images: []
};

const rawCategory = {
  id: 111,
  name: { pt: 'Essentials' },
  handle: { pt: 'essentials' },
  description: { pt: 'Peças clássicas.' }
};

test('mapProduct mapeia campos multilíngues, slug e descrição', () => {
  const product = mapper.mapProduct(rawProduct);
  assert.equal(product.title, 'Linho Anatoliano');
  assert.equal(product.slug, 'linho-anatoliano');
  assert.equal(product.description, 'Um tecido leve e sofisticado.');
  assert.equal(product.brand, 'Tramatto');
});

test('mapProduct ordena imagens por position e usa a primeira como capa', () => {
  const product = mapper.mapProduct(rawProduct);
  assert.deepEqual(product.gallery, [
    'https://example.cloudfront.net/linho-1.jpg',
    'https://example.cloudfront.net/linho-2.jpg'
  ]);
  assert.equal(product.image, 'https://example.cloudfront.net/linho-1.jpg');
});

test('mapProduct usa a primeira categoria como collectionId', () => {
  const product = mapper.mapProduct(rawProduct);
  assert.equal(product.collectionId, '111');
});

test('mapProduct/mapVariant convertem price e promotional_price para número', () => {
  const product = mapper.mapProduct(rawProduct);
  assert.equal(product.variants.length, 2);
  assert.equal(product.variants[0].price, 120);
  assert.equal(product.variants[0].promotionalPrice, null);
  assert.equal(product.variants[1].price, 135);
  assert.equal(product.variants[1].promotionalPrice, 119.9);
});

test('mapVariant deriva color/size a partir de attributes + values posicionais', () => {
  const product = mapper.mapProduct(rawProduct);
  const [v1] = product.variants;
  assert.equal(v1.color, 'Branco natural');
  assert.equal(v1.size, '45x70cm');
  assert.equal(v1.sku, 'LA-BR-45');
});

test('mapProduct agrega colors/sizes únicos a partir das variantes', () => {
  const product = mapper.mapProduct(rawProduct);
  assert.deepEqual(product.colors, ['Branco natural', 'Areia']);
  assert.deepEqual(product.sizes, ['45x70cm', '60x90cm']);
});

test('mapProduct trata stock "" (string vazia) como estoque ilimitado/disponível', () => {
  const product = mapper.mapProduct(rawProduct);
  assert.equal(product.inStock, true);
});

test('mapProduct marca inStock=false quando todas as variantes têm stock 0', () => {
  const product = mapper.mapProduct(rawProductNoStock);
  assert.equal(product.inStock, false);
});

test('mapCollection mapeia categoria real (name/handle multilíngues)', () => {
  const collection = mapper.mapCollection(rawCategory);
  assert.equal(collection.name, 'Essentials');
  assert.equal(collection.slug, 'essentials');
  assert.equal(collection.description, 'Peças clássicas.');
});
