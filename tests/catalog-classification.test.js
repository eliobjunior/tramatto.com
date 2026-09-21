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
// — só filtramos por collectionId no primeiro caso (ver script.js).
function setEnvironment(adapterName) {
  global.window.TramattoConfig = {
    environment: 'x',
    resolveEnvironment: () => ({ adapter: adapterName })
  };
}

const { getAvulsoProducts, getKitProducts } = require('../script.js');

function product(collectionId, title) {
  return { collectionId, title };
}

test('ambiente real (nuvemshop/mirror): produto collectionId "panos-de-louca" entra em avulsos', () => {
  setEnvironment('nuvemshop');
  const products = [product('panos-de-louca', 'Pano Avulso')];
  assert.deepEqual(getAvulsoProducts(products), products);
});

test('ambiente real: produto collectionId "kits" NÃO entra em avulsos', () => {
  setEnvironment('nuvemshop');
  const products = [product('kits', 'Kit 2 Panos de Louça')];
  assert.deepEqual(getAvulsoProducts(products), []);
});

test('ambiente real: produto collectionId "kits" entra em kits', () => {
  setEnvironment('mirror');
  const products = [product('kits', 'Kit 2 Panos de Louça')];
  assert.deepEqual(getKitProducts(products), products);
});

test('ambiente real: produto collectionId "panos-de-louca" NÃO entra em kits', () => {
  setEnvironment('mirror');
  const products = [product('panos-de-louca', 'Pano Avulso')];
  assert.deepEqual(getKitProducts(products), []);
});

test('ambiente real: avulsos e kits misturados na mesma lista são separados corretamente', () => {
  setEnvironment('nuvemshop');
  const avulso1 = product('panos-de-louca', 'Pano de Louça Golgeli Cinza | Unitário');
  const kit1 = product('kits', 'Kit 2 Panos de Louça Adia Cinza');
  const kit2 = product('kits', 'Kit 3 Panos de Louça Orna – Multicolor');
  const avulso2 = product('panos-de-louca', 'Pano de Louça Zehra | Unitário');
  const products = [kit1, avulso1, kit2, avulso2]; // kit vem primeiro de propósito — nunca usar posição

  assert.deepEqual(getAvulsoProducts(products), [avulso1, avulso2]);
  assert.deepEqual(getKitProducts(products), [kit1, kit2]);
});

test('classificação nunca usa nome do produto como critério (só collectionId)', () => {
  setEnvironment('nuvemshop');
  // título contém "Kit" mas o collectionId real é "panos-de-louca" — a
  // fonte de verdade é a Nuvemshop, não o texto do título.
  const products = [product('panos-de-louca', 'Kit-Point Pano de Louça | Unitário')];
  assert.deepEqual(getAvulsoProducts(products), products);
  assert.deepEqual(getKitProducts(products), []);
});

test('ambiente mock/demo (catalog-data.js): sem esquema real de collectionId, avulsos preserva a lista inteira (comportamento de demo atual)', () => {
  setEnvironment('mock');
  const products = [product('essentials', 'Linho Anatoliano'), product('signature', 'Borda Dourada')];
  assert.deepEqual(getAvulsoProducts(products), products);
});

test('ambiente mock/demo: getKitProducts retorna vazio (renderKits() cai para catalogData.kits fictício)', () => {
  setEnvironment('mock');
  const products = [product('essentials', 'Linho Anatoliano')];
  assert.deepEqual(getKitProducts(products), []);
});
