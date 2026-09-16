(function (global) {
  const root = globalThis;

  // Fase 2B — hand-off do carrinho visual (Tramatto) para o carrinho nativo
  // Nuvemshop via NubeSDK. Único responsável por: filtrar itens não
  // transferíveis, normalizar IDs/quantidade para o formato estrito que o
  // Worker exige, criar o token (POST /cart-transfer) e montar a URL de
  // redirect para a loja. Nunca fala com a Nuvemshop diretamente e nunca
  // manuseia access_token/client secret — só conhece a URL pública do Worker.
  const CART_TRANSFER_ENDPOINT = 'https://tramatto-nuvemshop-proxy.eliobj.workers.dev/cart-transfer';
  // Loja demo/teste onde o NubeSDK do Fase 2B roda (mesma origem já liberada
  // em proxy/wrangler.toml ALLOWED_ORIGINS). Trocar pela loja real da
  // Tramatto só depois de validar o fluxo completo nesta loja de teste.
  const DEMO_STORE_URL = 'https://tramattotestenubesdk.lojavirtualnuvem.com.br';
  const CART_TRANSFER_QUERY_PARAM = 'tramatto_cart';

  // Só dígitos: rejeita decimal ("1.5"), negativo ("-1"), notação científica
  // ("1e3"), hex ("0x10") e qualquer slug/string não numérica — nunca
  // confiamos em Number(valor) sozinho, que aceitaria todos esses formatos.
  const POSITIVE_INTEGER_PATTERN = /^[0-9]+$/;

  function toPositiveInteger(value) {
    if (typeof value === 'number') {
      return Number.isInteger(value) && value > 0 ? value : null;
    }
    if (typeof value === 'string' && POSITIVE_INTEGER_PATTERN.test(value)) {
      const normalized = Number(value);
      return Number.isInteger(normalized) && normalized > 0 ? normalized : null;
    }
    return null;
  }

  // Normaliza um item de carrinho (productId/variantId podem vir como string
  // ou number, dependendo do adapter — ver mapper.js/adapters.js) para o
  // shape estrito {productId: number, variantId: number, quantity: number}
  // que proxy/src/index.js exige. Retorna null (nunca lança) quando algum
  // campo não é um inteiro positivo válido — quem chama decide o que fazer
  // com um item inválido (aqui, é descartado do payload, nunca corrigido
  // silenciosamente para um valor arbitrário).
  function normalizeCartItemForTransfer(item) {
    const productId = toPositiveInteger(item?.productId);
    const variantId = toPositiveInteger(item?.variantId);
    const quantity = toPositiveInteger(item?.quantity);

    if (productId === null || variantId === null || quantity === null) {
      return null;
    }

    return { productId, variantId, quantity };
  }

  // Filtra itens não transferíveis (unavailable/outOfStock, definidos só por
  // CartService.syncWithCatalog() a partir do catálogo real — nunca
  // inferidos aqui) e normaliza os demais. Não modifica o array/objetos de
  // entrada nem a representação do item no carrinho visual (drawer continua
  // mostrando unavailable/outOfStock normalmente) — só projeta uma lista nova
  // com o shape que o Worker aceita.
  function buildTransferableItems(cartItems) {
    const items = [];
    for (const item of cartItems || []) {
      if (!item || item.unavailable === true || item.outOfStock === true) {
        continue;
      }
      const normalized = normalizeCartItemForTransfer(item);
      if (normalized) {
        items.push(normalized);
      }
    }
    return items;
  }

  function buildDemoRedirectUrl(token, { storeUrl = DEMO_STORE_URL } = {}) {
    const normalizedStoreUrl = String(storeUrl || '').trim().replace(/\/+$/, '');
    return `${normalizedStoreUrl}/?${CART_TRANSFER_QUERY_PARAM}=${encodeURIComponent(token)}`;
  }

  // Extrai uma mensagem de erro legível do corpo de erro do Worker
  // ({error, message}) sem nunca lançar por causa de um corpo não-JSON.
  async function readErrorMessage(response) {
    try {
      const body = await response.json();
      return body?.message || body?.error || `HTTP ${response.status}`;
    } catch {
      return `HTTP ${response.status}`;
    }
  }

  // POST /cart-transfer com os itens já filtrados/normalizados. Nunca envia
  // access_token/client secret/qualquer credencial Nuvemshop — só o payload
  // público {items: [...]}. Lança em qualquer falha (rede, HTTP não-2xx,
  // resposta sem token) para quem chamar decidir a mensagem para o usuário.
  async function createCartTransfer(items, { endpoint = CART_TRANSFER_ENDPOINT, fetchImpl } = {}) {
    const doFetch = fetchImpl || (typeof fetch !== 'undefined' ? fetch : null);
    if (!doFetch) {
      throw new Error('fetch não está disponível neste ambiente.');
    }

    const response = await doFetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items })
    });

    if (!response.ok) {
      throw new Error(await readErrorMessage(response));
    }

    const body = await response.json();
    if (!body || typeof body.token !== 'string' || !body.token) {
      throw new Error('Resposta do Worker não trouxe um token válido.');
    }

    return body.token;
  }

  // Ponto de entrada único do módulo: recebe os itens BRUTOS do carrinho
  // (CartService.getCart().items — precisa de unavailable/outOfStock, que
  // CartService.getCheckoutItems() descarta de propósito, ver js/services.js),
  // filtra, normaliza, cria o token no Worker e monta a URL de redirect.
  //
  // Nunca lança para "carrinho sem item transferível" nem para falha de
  // rede/Worker — sempre resolve com um resultado tipado para a UI decidir o
  // que fazer, nunca dispara POST nem redirect nesse caso:
  //   { ok: true, token, redirectUrl }
  //   { ok: false, reason: 'no_transferable_items' }
  //   { ok: false, reason: 'transfer_failed', error: string }
  async function transferCartToNuvemshop(cartItems, options = {}) {
    const items = buildTransferableItems(cartItems);

    if (items.length === 0) {
      return { ok: false, reason: 'no_transferable_items' };
    }

    try {
      const token = await createCartTransfer(items, options);
      const redirectUrl = buildDemoRedirectUrl(token, options);
      return { ok: true, token, redirectUrl };
    } catch (error) {
      return { ok: false, reason: 'transfer_failed', error: error?.message || String(error) };
    }
  }

  root.TramattoCartTransfer = {
    CART_TRANSFER_ENDPOINT,
    DEMO_STORE_URL,
    toPositiveInteger,
    normalizeCartItemForTransfer,
    buildTransferableItems,
    buildDemoRedirectUrl,
    createCartTransfer,
    transferCartToNuvemshop
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = root.TramattoCartTransfer;
  }
})(typeof window !== 'undefined' ? window : globalThis);
