(function (global) {
  const root = globalThis;
  const mapper = root.TramattoNuvemshopMapper || {};

  async function fetchCatalog(client) {
    const payload = await client.getCatalog();
    return (payload.products || []).map((product) => mapper.mapProduct?.(product));
  }

  async function fetchCollections(client) {
    const payload = await client.getCollections();
    return (payload || []).map((collection) => mapper.mapCollection?.(collection));
  }

  root.TramattoNuvemshopCatalog = {
    fetchCatalog,
    fetchCollections
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = root.TramattoNuvemshopCatalog;
  }
})(typeof window !== 'undefined' ? window : globalThis);
