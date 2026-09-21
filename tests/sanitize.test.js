const test = require('node:test');
const assert = require('node:assert/strict');

const { sanitizeDescriptionHtml } = require('../js/sanitize');
const { FakeDOMParser } = require('./helpers/fake-dom-parser');

// js/sanitize.js usa o DOMParser real do navegador em produção; em
// `node --test` (sem DOMParser nativo) injetamos o polyfill mínimo de
// tests/helpers/fake-dom-parser.js — nunca carregado por nenhuma página
// do site, só existe para exercitar a mesma lógica de allowlist aqui.
function sanitize(html) {
  return sanitizeDescriptionHtml(html, FakeDOMParser);
}

test('string vazia/null/undefined retorna string vazia', () => {
  assert.equal(sanitize(''), '');
  assert.equal(sanitize(null), '');
  assert.equal(sanitize(undefined), '');
  assert.equal(sanitize('   '), '');
});

test('sem DOMParser disponível e sem injeção, lança erro claro em vez de falhar silenciosamente', () => {
  assert.throws(() => sanitizeDescriptionHtml('<p>x</p>'), /DOMParser indisponível/);
});

// A) parágrafo com negrito
test('A) mantém parágrafo e negrito', () => {
  assert.equal(sanitize('<p>Olá <strong>mundo</strong></p>'), '<p>Olá <strong>mundo</strong></p>');
});

// B) parágrafo + lista
test('B) mantém parágrafo e lista (ul/li)', () => {
  assert.equal(
    sanitize('<p>Olá</p><ul><li>Item 1</li><li>Item 2</li></ul>'),
    '<p>Olá</p><ul><li>Item 1</li><li>Item 2</li></ul>'
  );
});

// C) script depois de conteúdo legítimo
test('C) remove <script> e seu conteúdo, preserva o parágrafo anterior', () => {
  const output = sanitize('<p>Olá</p><script>alert(1)</script>');
  assert.equal(output, '<p>Olá</p>');
  assert.ok(!output.includes('<script'));
  assert.ok(!output.includes('alert(1)'));
});

// D) tag perigosa void com atributo de evento
test('D) <img onerror=...> não sobra atributo nem tag, só o texto legítimo', () => {
  const output = sanitize('<img src=x onerror="alert(1)">Texto');
  assert.equal(output, 'Texto');
  assert.ok(!output.includes('onerror'));
  assert.ok(!output.includes('<img'));
});

// E) desembrulha div/span preservando texto
test('E) <div><span>texto</span></div> vira só o texto, sem as tags', () => {
  assert.equal(sanitize('<div><span>Texto legítimo</span></div>'), 'Texto legítimo');
});

// F) atributos/classe de editor removidos
test('F) remove class, data-start, data-end, data-section-id de uma tag permitida', () => {
  const output = sanitize(
    '<p class="PDq2gP_selectionAnchorContainer" data-start="205" data-end="242" data-section-id="x1">Kit 2 Panos de Louça &ndash; Branco</p>'
  );
  assert.equal(output, '<p>Kit 2 Panos de Louça – Branco</p>');
  assert.ok(!output.includes('class'));
  assert.ok(!output.includes('data-start'));
  assert.ok(!output.includes('data-end'));
  assert.ok(!output.includes('data-section-id'));
  assert.ok(!output.includes('PDq2gP_selectionAnchorContainer'));
});

// G) entidades decodificadas pelo parser (não por regex manual)
test('G) entidades HTML (ã, ç, á, ndash) decodificadas para o caractere real', () => {
  const output = sanitize('&atilde; &ccedil; &aacute; &ndash;');
  assert.equal(output, 'ã ç á –');
  assert.ok(!output.includes('&atilde;'));
  assert.ok(!output.includes('&ccedil;'));
  assert.ok(!output.includes('&aacute;'));
  assert.ok(!output.includes('&ndash;'));
});

// H) HTML malformado não quebra
test('H) HTML malformado (tag não fechada) não lança erro', () => {
  assert.doesNotThrow(() => sanitize('<p>Texto sem fechar<strong>ênfase'));
  const output = sanitize('<p>Texto sem fechar<strong>ênfase');
  assert.ok(output.includes('Texto sem fechar'));
  assert.ok(output.includes('ênfase'));
  assert.ok(!output.includes('&lt;'));
});

// I) tag perigosa antes do texto legítimo
test('I) <script>alert(1)</script>Texto: descarta script + conteúdo, mantém "Texto"', () => {
  const output = sanitize('<script>alert(1)</script>Texto');
  assert.equal(output, 'Texto');
  assert.ok(!output.includes('<script'));
  assert.ok(!output.includes('alert(1)'));
});

// J) descrição real contaminada capturada da Nuvemshop em produção
test('J) descrição real da Nuvemshop (múltiplos parágrafos, negrito, lista, emoji, metadata de editor)', () => {
  const input = [
    '<p class="PDq2pG_selectionAnchorContainer" data-section-id="dlzscs" data-start="205" data-end="242">Kit 2 Panos de Prato Kita &ndash; Branco</p>',
    '<p data-start="244" data-end="553">Leve eleg&acirc;ncia e praticidade para sua cozinha com o <strong data-start="296" data-end="334">Kit 2 Panos de Lou&ccedil;a Kita &ndash; Branco</strong>. Produzido em <strong data-start="349" data-end="365">100% algod&atilde;o</strong> e importado da Turquia.</p>',
    '<p data-section-id="na3lv7" data-start="719" data-end="732">Destaques</p>',
    '<ul data-start="734" data-end="965">',
    '<li data-section-id="1nlx935" data-start="734" data-end="759">🧵 100% algod&atilde;o premium</li>',
    '<li data-section-id="1m4t8y3" data-start="760" data-end="787">🇹🇷 Importado da Turquia</li>',
    '</ul>'
  ].join('');

  const output = sanitize(input);

  // sem tags/atributos/classe de editor
  assert.ok(!output.includes('data-start'));
  assert.ok(!output.includes('data-end'));
  assert.ok(!output.includes('data-section-id'));
  assert.ok(!output.includes('PDq2pG_selectionAnchorContainer'));
  assert.ok(!output.includes('class='));

  // sem entidades literais, sem tags cruas escapadas
  assert.ok(!output.includes('&ndash;'));
  assert.ok(!output.includes('&ccedil;'));
  assert.ok(!output.includes('&atilde;'));
  assert.ok(!output.includes('&lt;'));
  assert.ok(!output.includes('&gt;'));

  // texto/acentos/formatação/emoji preservados
  assert.ok(output.includes('Kit 2 Panos de Prato Kita – Branco'));
  assert.ok(output.includes('elegância'));
  assert.ok(output.includes('Louça'));
  assert.ok(output.includes('<strong>100% algodão</strong>'));
  assert.ok(output.includes('<ul><li>'));
  assert.ok(output.includes('🧵'));
  assert.ok(output.includes('🇹🇷'));
});

test('nenhum atributo sobrevive em nenhuma tag permitida, mesmo com múltiplos atributos e aspas simples', () => {
  const output = sanitize('<ul id="x" style="color:red" data-x=\'1\'><li onclick="alert(1)">Item</li></ul>');
  assert.equal(output, '<ul><li>Item</li></ul>');
});

test('<style> e <iframe> são descartados com todo o conteúdo', () => {
  const output = sanitize('<p>Texto</p><style>body{display:none}</style><iframe src="javascript:alert(1)"></iframe>');
  assert.equal(output, '<p>Texto</p>');
});

test('<br> permanece (com ou sem barra de auto-fechamento), sem atributos', () => {
  assert.equal(sanitize('linha 1<br>linha 2'), 'linha 1<br>linha 2');
  assert.equal(sanitize('linha 1<br/>linha 2'), 'linha 1<br>linha 2');
  assert.equal(sanitize('linha 1<br class="x">linha 2'), 'linha 1<br>linha 2');
});
