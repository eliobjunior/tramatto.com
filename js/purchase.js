(function (global) {
  const root = globalThis;

  // Monta a URL do link nativo de "compra rápida" da Nuvemshop
  // (https://{loja}/comprar/{variant_id}-{quantity}/), validado
  // manualmente contra a loja real da Tramatto antes desta implementação.
  // Não faz nenhuma chamada de rede — é só uma URL para redirecionar o
  // navegador. Retorna null quando faltar storeUrl ou variantId (ex.: em
  // desenvolvimento, com MockAdapter e IDs fictícios); quem chama deve
  // tratar esse null como "compra indisponível neste ambiente" e nunca
  // navegar para um link inválido.
  function buildBuyUrl({ storeUrl, variantId, quantity = 1 } = {}) {
    if (variantId === undefined || variantId === null || variantId === '') {
      return null;
    }

    const normalizedStoreUrl = String(storeUrl || '').trim().replace(/\/+$/, '');
    if (!normalizedStoreUrl) {
      return null;
    }

    const parsedQuantity = Number(quantity);
    const safeQuantity = Number.isFinite(parsedQuantity) && parsedQuantity > 0
      ? Math.floor(parsedQuantity)
      : 1;

    return `${normalizedStoreUrl}/comprar/${encodeURIComponent(variantId)}-${safeQuantity}/`;
  }

  root.TramattoPurchase = {
    buildBuyUrl
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = root.TramattoPurchase;
  }
})(typeof window !== 'undefined' ? window : globalThis);
