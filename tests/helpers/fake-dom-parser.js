'use strict';

// Implementação mínima de DOMParser só para os testes de js/sanitize.js
// rodarem sob `node --test` (Node não tem DOMParser nativo — nem jsdom
// está instalado neste projeto, que não tem build/bundler nem
// package.json na raiz). NUNCA é carregada por nenhuma página do site —
// em produção, js/sanitize.js usa o DOMParser real do navegador; este
// arquivo só decodifica entidades/tokeniza tags para dar a
// sanitizeChildrenInto() uma árvore para percorrer nos testes, imitando o
// suficiente da API real (nodeType, tagName, childNodes, textContent,
// createElement, createTextNode, innerHTML) para exercitar a MESMA lógica
// de allowlist que roda no navegador.

const VOID_TAGS = new Set(['BR', 'IMG', 'HR', 'INPUT', 'META', 'LINK', 'BASE', 'COL', 'EMBED', 'SOURCE', 'TRACK', 'WBR', 'AREA']);

const NAMED_ENTITIES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: '\'', nbsp: ' ',
  aacute: 'á', agrave: 'à', acirc: 'â', atilde: 'ã', auml: 'ä', aring: 'å',
  Aacute: 'Á', Agrave: 'À', Acirc: 'Â', Atilde: 'Ã', Auml: 'Ä',
  eacute: 'é', egrave: 'è', ecirc: 'ê', euml: 'ë',
  Eacute: 'É', Egrave: 'È', Ecirc: 'Ê', Euml: 'Ë',
  iacute: 'í', igrave: 'ì', icirc: 'î', iuml: 'ï',
  Iacute: 'Í', Igrave: 'Ì', Icirc: 'Î', Iuml: 'Ï',
  oacute: 'ó', ograve: 'ò', ocirc: 'ô', otilde: 'õ', ouml: 'ö',
  Oacute: 'Ó', Ograve: 'Ò', Ocirc: 'Ô', Otilde: 'Õ', Ouml: 'Ö',
  uacute: 'ú', ugrave: 'ù', ucirc: 'û', uuml: 'ü',
  Uacute: 'Ú', Ugrave: 'Ù', Ucirc: 'Û', Uuml: 'Ü',
  ccedil: 'ç', Ccedil: 'Ç', ntilde: 'ñ', Ntilde: 'Ñ',
  ndash: '–', mdash: '—', hellip: '…'
};

function decodeEntities(text) {
  return text.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z][a-zA-Z0-9]*);/g, (match, entity) => {
    if (entity[0] === '#') {
      const isHex = entity[1] === 'x' || entity[1] === 'X';
      const codePoint = parseInt(entity.slice(isHex ? 2 : 1), isHex ? 16 : 10);
      if (Number.isNaN(codePoint)) return match;
      try {
        return String.fromCodePoint(codePoint);
      } catch (err) {
        return match;
      }
    }
    return Object.prototype.hasOwnProperty.call(NAMED_ENTITIES, entity) ? NAMED_ENTITIES[entity] : match;
  });
}

function escapeForSerialization(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

class FakeNode {
  constructor(nodeType) {
    this.nodeType = nodeType;
    this.childNodes = [];
  }

  appendChild(node) {
    this.childNodes.push(node);
    return node;
  }

  get textContent() {
    if (this.nodeType === 3) return this._text;
    return this.childNodes.map((child) => child.textContent).join('');
  }

  get innerHTML() {
    return this.childNodes.map(serializeNode).join('');
  }
}

function serializeNode(node) {
  if (node.nodeType === 3) return escapeForSerialization(node._text);
  if (node.nodeType === 8) return '';
  const tag = node.tagName.toLowerCase();
  if (VOID_TAGS.has(node.tagName)) return `<${tag}>`;
  return `<${tag}>${node.innerHTML}</${tag}>`;
}

function createTextNode(text) {
  const node = new FakeNode(3);
  node._text = text;
  return node;
}

function createComment(text) {
  const node = new FakeNode(8);
  node._text = text;
  return node;
}

function createElement(tag) {
  const node = new FakeNode(1);
  node.tagName = tag.toUpperCase();
  return node;
}

const TOKEN_RE = /<!--[\s\S]*?-->|<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g;

function findOpenIndex(stack, tagName) {
  for (let i = stack.length - 1; i >= 1; i -= 1) { // nunca fecha a raiz (índice 0)
    if (stack[i].tagName === tagName) return i;
  }
  return -1;
}

function parseBody(html) {
  const root = createElement('BODY');
  const stack = [root];

  let lastIndex = 0;
  let match;
  TOKEN_RE.lastIndex = 0;
  while ((match = TOKEN_RE.exec(html)) !== null) {
    const textBefore = html.slice(lastIndex, match.index);
    lastIndex = TOKEN_RE.lastIndex;
    if (textBefore) {
      stack[stack.length - 1].appendChild(createTextNode(decodeEntities(textBefore)));
    }

    const full = match[0];
    if (full.startsWith('<!--')) {
      stack[stack.length - 1].appendChild(createComment(full.slice(4, -3)));
      continue;
    }

    const isClosing = full[1] === '/';
    const tagName = match[1].toUpperCase();

    if (isClosing) {
      const idx = findOpenIndex(stack, tagName);
      if (idx !== -1) stack.length = idx;
      continue;
    }

    const el = createElement(tagName);
    stack[stack.length - 1].appendChild(el);
    if (!VOID_TAGS.has(tagName) && !full.endsWith('/>')) {
      stack.push(el);
    }
  }

  const tail = html.slice(lastIndex);
  if (tail) {
    stack[stack.length - 1].appendChild(createTextNode(decodeEntities(tail)));
  }

  return root;
}

class FakeDocument {
  createElement(tag) {
    return createElement(tag);
  }

  createTextNode(text) {
    return createTextNode(text);
  }
}

class FakeDOMParser {
  parseFromString(html) {
    const doc = new FakeDocument();
    doc.body = parseBody(String(html));
    return doc;
  }
}

module.exports = { FakeDOMParser };
