const test = require('node:test');
const assert = require('node:assert/strict');

require('../js/domain-model');
const mapper = require('../integrations/nuvemshop/mapper');

// Payload no formato real documentado pela API oficial da Nuvemshop
// (name/description/handle multilíngues, variants[].values posicionais
// em relação a product.attributes[], images[].src, categories[] como IDs).
// categories: confirmado contra a resposta real da API (via proxy em
// produção) — vem como lista de OBJETOS de categoria completos, nunca IDs
// soltos. tags vem como string única separada por vírgula, não array.
const rawProduct = {
  id: 12345,
  name: { pt: 'Linho Anatoliano' },
  description: { pt: 'Um tecido leve e sofisticado.' },
  handle: { pt: 'linho-anatoliano' },
  canonical_url: 'https://tramatto.lojavirtualnuvem.com.br/produtos/linho-anatoliano/',
  published: true,
  visibility: 'visible',
  has_stock: true,
  brand: 'Tramatto',
  tags: '100% linho, importado, cozinha',
  categories: [
    { id: 111, name: { pt: 'Essentials' }, handle: { pt: 'essentials' }, description: { pt: '' } },
    { id: 222, name: { pt: 'Novidades' }, handle: { pt: 'novidades' }, description: { pt: '' } }
  ],
  attributes: [{ pt: 'Cor' }, { pt: 'Tamanho' }],
  variants: [
    {
      id: 1,
      product_id: 12345,
      sku: 'LA-BR-45',
      price: '120.00',
      promotional_price: null,
      stock: 8,
      stock_management: true,
      visible: true,
      values: [{ pt: 'Branco natural' }, { pt: '45x70cm' }]
    },
    {
      id: 2,
      product_id: 12345,
      sku: 'LA-AR-60',
      price: '135.00',
      promotional_price: '119.90',
      stock: '',
      stock_management: false,
      visible: true,
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
  has_stock: false,
  variants: [
    { id: 9, product_id: 999, sku: 'ESG-1', price: '50.00', stock: 0, values: [] }
  ],
  images: []
};

const rawProductNoImagesNoTagsNoCategories = {
  id: 555,
  name: { pt: 'Produto sem imagem' },
  handle: { pt: 'produto-sem-imagem' },
  variants: [
    { id: 5, product_id: 555, sku: 'SEM-IMG', price: '30.00', promotional_price: '', stock: 4, values: [] }
  ],
  images: [],
  categories: [],
  tags: ''
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

test('mapProduct preserva a lista completa de categorias reais (id/name/slug), não só a primeira', () => {
  const product = mapper.mapProduct(rawProduct);
  assert.deepEqual(product.categories, [
    { id: '111', name: 'Essentials', slug: 'essentials' },
    { id: '222', name: 'Novidades', slug: 'novidades' }
  ]);
});

test('mapProduct converte tags (string separada por vírgula) em array', () => {
  const product = mapper.mapProduct(rawProduct);
  assert.deepEqual(product.tags, ['100% linho', 'importado', 'cozinha']);
});

test('mapProduct preserva canonical_url, published, visibility e has_stock reais (não inventa)', () => {
  const product = mapper.mapProduct(rawProduct);
  assert.equal(product.canonicalUrl, 'https://tramatto.lojavirtualnuvem.com.br/produtos/linho-anatoliano/');
  assert.equal(product.published, true);
  assert.equal(product.visibility, 'visible');
  assert.equal(product.hasStock, true);
});

test('mapProduct preserva product.handle separado de product.slug', () => {
  const product = mapper.mapProduct(rawProduct);
  assert.equal(product.handle, 'linho-anatoliano');
  assert.equal(product.slug, 'linho-anatoliano');
});

test('mapVariant preserva product_id (nunca confunde com product.id), stock_management e visible', () => {
  const product = mapper.mapProduct(rawProduct);
  const [v1, v2] = product.variants;
  assert.equal(v1.productId, '12345');
  assert.equal(v1.stockManagement, true);
  assert.equal(v1.visible, true);
  assert.equal(v2.stockManagement, false);
  assert.equal(product.id, '12345');
  assert.equal(v1.id, '1');
  assert.notEqual(v1.productId, v1.id);
});

test('mapProduct: produto sem imagem mantém gallery/image vazios (frontend cai para placeholder, nunca inventa imagem)', () => {
  const product = mapper.mapProduct(rawProductNoImagesNoTagsNoCategories);
  assert.deepEqual(product.gallery, []);
  assert.equal(product.image, null);
});

test('mapProduct: produto com promotional_price vazio ("") trata como ausente (usa price)', () => {
  const product = mapper.mapProduct(rawProductNoImagesNoTagsNoCategories);
  assert.equal(product.price, 30);
  assert.equal(product.promotionalPrice, null);
  assert.equal(product.getPrimaryPrice(), 30);
});

test('mapProduct: sem categories/tags no payload, nunca inventa valores (listas vazias)', () => {
  const product = mapper.mapProduct(rawProductNoImagesNoTagsNoCategories);
  assert.deepEqual(product.categories, []);
  assert.deepEqual(product.tags, []);
  assert.equal(product.collectionId, null);
});

test('mapProductCategory: categoria sem name/handle não inventa rótulo (fica null)', () => {
  const product = mapper.mapProduct({
    ...rawProduct,
    categories: [{ id: 333 }]
  });
  assert.deepEqual(product.categories, [{ id: '333', name: null, slug: null }]);
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
