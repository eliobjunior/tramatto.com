// Sanitizador de HTML para campos de descrição vindos da Nuvemshop.
//
// Usa o DOMParser real do navegador para interpretar a string (nunca regex
// para entender estrutura de tags/atributos/entidades) e reconstrói o
// resultado percorrendo a árvore recursivamente com uma allowlist — só as
// tags em ALLOWED_TAGS sobrevivem, sem nenhum atributo; tags perigosas
// (script/style/iframe/...) são descartadas com todo o conteúdo interno;
// qualquer outra tag é "desembrulhada" (o texto/formatação permitida de
// dentro é preservado, só a tag em si é descartada).
//
// Sem dependência externa (sem bundler/build neste projeto — ver
// index.html/collection.html/product.html, tudo <script> solta), mas sem
// reimplementar um parser de HTML: quem interpreta a string É o DOMParser
// do próprio navegador. O segundo parâmetro (DOMParserRef) só existe para
// os testes automatizados rodarem sob `node --test` (Node não tem
// DOMParser nativo) — em produção nunca é passado, e o parâmetro default
// já resolve para o DOMParser real do navegador.
(function (global) {
  const root = globalThis;

  const ALLOWED_TAGS = new Set(['P', 'STRONG', 'EM', 'UL', 'OL', 'LI', 'BR']);

  // Descartados junto com todo o conteúdo/descendência — nunca vira texto
  // visível, mesmo que o elemento tenha filhos.
  const DROP_TAGS = new Set([
    'SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'SVG', 'MATH',
    'FORM', 'INPUT', 'BUTTON', 'TEXTAREA', 'SELECT',
    'NOSCRIPT', 'TEMPLATE', 'HEAD'
  ]);

  const ELEMENT_NODE = 1;
  const TEXT_NODE = 3;

  // Percorre os filhos de `sourceNode` e reconstrói só o que é permitido
  // dentro de `targetParent` (elemento criado no MESMO document que o
  // DOMParser produziu, então `.appendChild`/`.createElement` funcionam
  // normalmente). Nunca copia atributos: tags permitidas viram um elemento
  // novo e "limpo" do mesmo nome; tags descartadas (e sua árvore inteira)
  // simplesmente não entram na recursão; qualquer outra tag é
  // "desembrulhada" — os filhos dela continuam sendo processados no lugar
  // dela, para não perder texto legítimo.
  function sanitizeChildrenInto(sourceNode, targetParent, targetDocument) {
    const children = sourceNode.childNodes;
    for (let i = 0; i < children.length; i += 1) {
      const node = children[i];

      if (node.nodeType === TEXT_NODE) {
        targetParent.appendChild(targetDocument.createTextNode(node.textContent));
        continue;
      }

      if (node.nodeType !== ELEMENT_NODE) {
        continue; // comentários e outros tipos de nó: descarta
      }

      const tagName = node.tagName;

      if (DROP_TAGS.has(tagName)) {
        continue; // descarta a tag inteira — nunca recursa nos filhos dela
      }

      if (ALLOWED_TAGS.has(tagName)) {
        const clean = targetDocument.createElement(tagName.toLowerCase());
        sanitizeChildrenInto(node, clean, targetDocument); // nunca copia atributos
        targetParent.appendChild(clean);
        continue;
      }

      // Tag não reconhecida (div, span, a, img, class de editor etc.):
      // desembrulha — processa os filhos no lugar dela, sem preservar a tag.
      sanitizeChildrenInto(node, targetParent, targetDocument);
    }
  }

  function sanitizeDescriptionHtml(value, DOMParserRef) {
    if (value === null || value === undefined) return '';
    const input = String(value);
    if (!input.trim()) return '';

    const ParserCtor = DOMParserRef || (typeof DOMParser !== 'undefined' ? DOMParser : undefined);
    if (!ParserCtor) {
      throw new Error('sanitizeDescriptionHtml: DOMParser indisponível neste ambiente.');
    }

    // O DOMParser decodifica entidades HTML (&ndash;, &ccedil;, &atilde; ...)
    // como parte normal do parsing — nenhum decode manual é necessário aqui.
    const parsedDocument = new ParserCtor().parseFromString(input, 'text/html');
    const container = parsedDocument.createElement('div');
    sanitizeChildrenInto(parsedDocument.body, container, parsedDocument);

    return container.innerHTML;
  }

  const api = { sanitizeDescriptionHtml };
  root.TramattoSanitize = api;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
