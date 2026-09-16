const test = require('node:test');
const assert = require('node:assert/strict');

// script.js é um script solto de página (não um módulo IIFE como os outros
// arquivos de js/) — só precisa de um `window.addEventListener` utilizável
// para carregar sem erro (o listener de DOMContentLoaded nunca dispara aqui,
// então initializeStorefront() nunca roda de verdade neste teste).
global.window = global.window || {};
if (typeof global.window.addEventListener !== 'function') {
  global.window.addEventListener = () => {};
}

const { isSameVariantId } = require('../script.js');

// Contexto do bug (ver auditoria da Fase 2A): a PDP comparava
// `variant.id === button.getAttribute('data-select-variant')`.
// getAttribute() sempre devolve string; variant.id vem como NUMBER do
// MirrorAdapter (nuvemshop-mirror-data.js, confirmado: id 1562965514 etc.)
// e como STRING do NuvemshopAdapter (mapper.js já normaliza). A comparação
// estrita falhava sempre que a origem era o MirrorAdapter — dormant hoje
// porque nenhum produto real tem 2+ variantes, mas real assim que tiver.

test('isSameVariantId: variant.id numérico (formato real do MirrorAdapter) bate com atributo HTML string', () => {
  const numericVariantId = 1562965514; // formato real de nuvemshop-mirror-data.js
  const htmlAttributeValue = String(numericVariantId); // getAttribute() sempre retorna string

  assert.equal(isSameVariantId(numericVariantId, htmlAttributeValue), true);
});

test('isSameVariantId: variant.id string (formato real do NuvemshopAdapter) bate normalmente', () => {
  assert.equal(isSameVariantId('1562965514', '1562965514'), true);
});

test('isSameVariantId: ids diferentes nunca coincidem, independente do tipo', () => {
  assert.equal(isSameVariantId(111, '222'), false);
  assert.equal(isSameVariantId('111', 222), false);
});

test('isSameVariantId: nunca trata ausência de id (null/undefined) como coincidência', () => {
  assert.equal(isSameVariantId(undefined, undefined), false);
  assert.equal(isSameVariantId(null, null), false);
  assert.equal(isSameVariantId(undefined, 'undefined'), false);
});

test('isSameVariantId: 0 é um id numérico válido, distinto de ausência de id', () => {
  assert.equal(isSameVariantId(0, '0'), true);
});

test('seleção de variante na PDP: reproduz o find() real de script.js com variant.id numérico e clique gerando string', () => {
  // Mesmo shape de nuvemshop-mirror-data.js (ids numéricos brutos).
  const variants = [
    { id: 1562965514, name: 'Branco' },
    { id: 1562965562, name: 'Areia' }
  ];

  // Equivalente ao que script.js faz: button.getAttribute('data-select-variant').
  const variantIdFromButtonClick = '1562965562';

  const selected = variants.find((variant) => isSameVariantId(variant.id, variantIdFromButtonClick)) || variants[0];
  assert.equal(selected.name, 'Areia');
  assert.equal(selected.id, 1562965562);
});

test('seleção de variante na PDP: continua funcionando quando variant.id já é string (NuvemshopAdapter)', () => {
  const variants = [
    { id: '1562965514', name: 'Branco' },
    { id: '1562965562', name: 'Areia' }
  ];

  const selected = variants.find((variant) => isSameVariantId(variant.id, '1562965514')) || variants[0];
  assert.equal(selected.name, 'Branco');
});
