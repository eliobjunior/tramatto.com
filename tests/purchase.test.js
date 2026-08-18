const test = require('node:test');
const assert = require('node:assert/strict');

const { buildBuyUrl } = require('../js/purchase');

// Loja e variante reais, validadas manualmente antes desta implementação
// (ver auditoria): o item entrou no carrinho, a quantidade foi respeitada
// e o cliente caiu direto no checkout nativo da Nuvemshop.
const REAL_STORE_URL = 'https://tramatto.lojavirtualnuvem.com.br';
const REAL_VARIANT_ID = 1562965536; // Kit 2 Panos de Prato Viva Vermelho

test('1. variante correta gera exatamente a URL validada manualmente na loja real', () => {
  const url = buildBuyUrl({ storeUrl: REAL_STORE_URL, variantId: REAL_VARIANT_ID, quantity: 1 });
  assert.equal(url, 'https://tramatto.lojavirtualnuvem.com.br/comprar/1562965536-1/');
});

test('2. quantidade 1 (explícita ou default) gera sufixo -1', () => {
  assert.equal(
    buildBuyUrl({ storeUrl: REAL_STORE_URL, variantId: REAL_VARIANT_ID, quantity: 1 }),
    'https://tramatto.lojavirtualnuvem.com.br/comprar/1562965536-1/'
  );
  assert.equal(
    buildBuyUrl({ storeUrl: REAL_STORE_URL, variantId: REAL_VARIANT_ID }),
    'https://tramatto.lojavirtualnuvem.com.br/comprar/1562965536-1/'
  );
});

test('3. quantidade > 1 gera o sufixo correto', () => {
  assert.equal(
    buildBuyUrl({ storeUrl: REAL_STORE_URL, variantId: REAL_VARIANT_ID, quantity: 3 }),
    'https://tramatto.lojavirtualnuvem.com.br/comprar/1562965536-3/'
  );
});

test('4. variante inexistente (variantId undefined/null/"") retorna null, nunca um link quebrado', () => {
  assert.equal(buildBuyUrl({ storeUrl: REAL_STORE_URL, variantId: undefined }), null);
  assert.equal(buildBuyUrl({ storeUrl: REAL_STORE_URL, variantId: null }), null);
  assert.equal(buildBuyUrl({ storeUrl: REAL_STORE_URL, variantId: '' }), null);
});

test('5. ausência de variant.id (chamada sem parâmetros) retorna null', () => {
  assert.equal(buildBuyUrl({}), null);
  assert.equal(buildBuyUrl(), null);
});

test('quantidade inválida (0, negativa, não numérica) cai para 1 em vez de quebrar a URL', () => {
  assert.equal(buildBuyUrl({ storeUrl: REAL_STORE_URL, variantId: REAL_VARIANT_ID, quantity: 0 }), 'https://tramatto.lojavirtualnuvem.com.br/comprar/1562965536-1/');
  assert.equal(buildBuyUrl({ storeUrl: REAL_STORE_URL, variantId: REAL_VARIANT_ID, quantity: -5 }), 'https://tramatto.lojavirtualnuvem.com.br/comprar/1562965536-1/');
  assert.equal(buildBuyUrl({ storeUrl: REAL_STORE_URL, variantId: REAL_VARIANT_ID, quantity: 'abc' }), 'https://tramatto.lojavirtualnuvem.com.br/comprar/1562965536-1/');
});

test('storeUrl ausente (ambiente MockAdapter/desenvolvimento) retorna null — fallback seguro', () => {
  assert.equal(buildBuyUrl({ storeUrl: '', variantId: REAL_VARIANT_ID }), null);
  assert.equal(buildBuyUrl({ variantId: REAL_VARIANT_ID }), null);
});

test('normaliza barra final duplicada em storeUrl', () => {
  const url = buildBuyUrl({ storeUrl: 'https://tramatto.lojavirtualnuvem.com.br/', variantId: REAL_VARIANT_ID });
  assert.equal(url, 'https://tramatto.lojavirtualnuvem.com.br/comprar/1562965536-1/');
});
