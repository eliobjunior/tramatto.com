(function (global) {
  const root = globalThis;
  const mapper = root.TramattoNuvemshopMapper || {};

  async function fetchProductBySlug(client, slug) {
    const payload = await client.getProductBySlug(slug);
    return payload ? mapper.mapProduct?.(payload) : null;
  }

  root.TramattoNuvemshopProducts = {
    fetchProductBySlug
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = root.TramattoNuvemshopProducts;
  }
})(typeof window !== 'undefined' ? window : globalThis);
