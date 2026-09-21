const test = require('node:test');
const assert = require('node:assert/strict');

// script.js é um script solto de página (não um módulo IIFE como os outros
// arquivos de js/) — precisa de um `window` utilizável para carregar sem
// erro (mesma configuração de tests/script-variant-selection.test.js).
global.window = global.window || {};
if (typeof global.window.addEventListener !== 'function') {
  global.window.addEventListener = () => {};
}

// getAvulsoProducts/getKitProducts leem window.TramattoConfig para saber se
// o catálogo atual é real (Nuvemshop/mirror) ou o mock de dev (catalog-data.js)
// — só filtramos por category slug no primeiro caso (ver script.js).
function setEnvironment(adapterName) {
  global.window.TramattoConfig = {
    environment: 'x',
    resolveEnvironment: () => ({ adapter: adapterName })
  };
}

const { getAvulsoProducts, getKitProducts, hasCategorySlug } = require('../script.js');

// Formato real do NuvemshopAdapter (integrations/nuvemshop/mapper.js:84-91):
// collectionId é o ID NUMÉRICO da categoria; o slug amigável só existe em
// categories[].slug.
function realProduct({ title, categorySlug, categoryId = '39770000', collectionId }) {
  return {
    title,
    collectionId: collectionId !== undefined ? collectionId : categoryId,
    categories: categorySlug ? [{ id: categoryId, name: categorySlug, slug: categorySlug }] : []
  };
}

test('hasCategorySlug: produto com categories[].slug correspondente retorna true', () => {
  const product = { categories: [{ slug: 'panos-de-louca' }] };
  assert.equal(hasCategorySlug(product, 'panos-de-louca'), true);
});

test('hasCategorySlug: collectionId numérico não interfere na classificação (categories[] manda)', () => {
  const product = { collectionId: '39773033', categories: [{ id: '39773033', slug: 'kits' }] };
  assert.equal(hasCategorySlug(product, 'kits'), true);
  assert.equal(hasCategorySlug(product, 'panos-de-louca'), false);
  // o próprio ID numérico nunca deve "casar" por acidente com um slug
  assert.equal(hasCategorySlug(product, '39773033'), false);
});

test('hasCategorySlug: produto sem categories (undefined/null/vazio) não quebra e retorna false quando collectionId também não bate', () => {
  assert.equal(hasCategorySlug({ title: 'x', collectionId: null }, 'kits'), false);
  assert.equal(hasCategorySlug({ title: 'x' }, 'kits'), false);
  assert.equal(hasCategorySlug({ title: 'x', categories: null }, 'kits'), false);
  assert.equal(hasCategorySlug({ title: 'x', categories: [] }, 'kits'), false);
  assert.equal(hasCategorySlug(null, 'kits'), false);
  assert.equal(hasCategorySlug(undefined, 'kits'), false);
});

test('hasCategorySlug: produto com outra categoria não entra em nenhuma das duas', () => {
  const product = { categories: [{ slug: 'essentials' }] };
  assert.equal(hasCategorySlug(product, 'panos-de-louca'), false);
  assert.equal(hasCategorySlug(product, 'kits'), false);
});

test('hasCategorySlug: MirrorAdapter (sem categories[], collectionId já é o slug amigável) ainda classifica', () => {
  // Formato real de nuvemshop-mirror-data.js: nunca tem categories[], só
  // collectionId como string 'kits'/'panos-de-louca'.
  assert.equal(hasCategorySlug({ title: 'x', collectionId: 'kits' }, 'kits'), true);
  assert.equal(hasCategorySlug({ title: 'x', collectionId: 'panos-de-louca' }, 'panos-de-louca'), true);
  assert.equal(hasCategorySlug({ title: 'x', collectionId: 'kits' }, 'panos-de-louca'), false);
});

test('ambiente real (nuvemshop): produto com categories: [{slug:"panos-de-louca"}] entra em avulsos', () => {
  setEnvironment('nuvemshop');
  const products = [realProduct({ title: 'Pano Avulso', categorySlug: 'panos-de-louca', categoryId: '39773031' })];
  assert.deepEqual(getAvulsoProducts(products), products);
});

test('ambiente real (nuvemshop): produto com categories: [{slug:"kits"}] entra em kits', () => {
  setEnvironment('nuvemshop');
  const products = [realProduct({ title: 'Kit 2 Panos de Louça', categorySlug: 'kits', categoryId: '39773033' })];
  assert.deepEqual(getKitProducts(products), products);
});

test('ambiente real: collectionId numérico não interfere — produto de kits nunca entra em avulsos', () => {
  setEnvironment('nuvemshop');
  const kit = realProduct({ title: 'Kit 2 Panos de Louça Adia Cinza', categorySlug: 'kits', categoryId: '39773033' });
  assert.deepEqual(getAvulsoProducts([kit]), []);
});

test('ambiente real: produto sem categories não quebra a classificação (não entra em nenhuma)', () => {
  setEnvironment('nuvemshop');
  const semCategoria = { title: 'Produto sem categoria', collectionId: '39779999', categories: [] };
  assert.deepEqual(getAvulsoProducts([semCategoria]), []);
  assert.deepEqual(getKitProducts([semCategoria]), []);
});

test('ambiente real: produto com outra categoria não entra em nenhuma das duas', () => {
  setEnvironment('nuvemshop');
  const outraCategoria = realProduct({ title: 'Produto Essentials', categorySlug: 'essentials', categoryId: '39770001' });
  assert.deepEqual(getAvulsoProducts([outraCategoria]), []);
  assert.deepEqual(getKitProducts([outraCategoria]), []);
});

test('ambiente real: avulsos e kits misturados na mesma lista são separados corretamente, kit primeiro no array não vaza para avulsos', () => {
  setEnvironment('nuvemshop');
  const kit1 = realProduct({ title: 'Kit 2 Panos de Louça Adia Cinza', categorySlug: 'kits', categoryId: '39773033' });
  const avulso1 = realProduct({ title: 'Pano de Louça Golgeli Cinza | Unitário', categorySlug: 'panos-de-louca', categoryId: '39773031' });
  const kit2 = realProduct({ title: 'Kit 3 Panos de Louça Orna – Multicolor', categorySlug: 'kits', categoryId: '39773033' });
  const avulso2 = realProduct({ title: 'Pano de Louça Zehra | Unitário', categorySlug: 'panos-de-louca', categoryId: '39773031' });
  const products = [kit1, avulso1, kit2, avulso2]; // kit deliberadamente em primeiro

  assert.deepEqual(getAvulsoProducts(products), [avulso1, avulso2]);
  assert.deepEqual(getKitProducts(products), [kit1, kit2]);
});

test('classificação nunca usa nome do produto como critério (só category slug)', () => {
  setEnvironment('nuvemshop');
  // título contém "Kit" mas a categoria real é "panos-de-louca"
  const products = [realProduct({ title: 'Kit-Point Pano de Louça | Unitário', categorySlug: 'panos-de-louca', categoryId: '39773031' })];
  assert.deepEqual(getAvulsoProducts(products), products);
  assert.deepEqual(getKitProducts(products), []);
});

test('ambiente mock/demo (catalog-data.js): comportamento existente preservado — avulsos mantém a lista inteira', () => {
  setEnvironment('mock');
  const products = [
    { title: 'Linho Anatoliano', collectionId: 'essentials', categories: [] },
    { title: 'Borda Dourada', collectionId: 'signature', categories: [] }
  ];
  assert.deepEqual(getAvulsoProducts(products), products);
});

test('ambiente mock/demo: getKitProducts retorna vazio (renderKits() cai para catalogData.kits fictício)', () => {
  setEnvironment('mock');
  const products = [{ title: 'Linho Anatoliano', collectionId: 'essentials', categories: [] }];
  assert.deepEqual(getKitProducts(products), []);
});
