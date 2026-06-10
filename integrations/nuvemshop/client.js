(function (global) {
  const root = globalThis;

  function createClient(options = {}) {
    const config = {
      apiBaseUrl: options.apiBaseUrl || 'https://api.nuvemshop.example',
      storeId: options.storeId || 'demo-store'
    };

    return {
      config,
      async getCatalog() {
        return { products: [], collections: [] };
      },
      async getProductBySlug() {
        return null;
      },
      async getCollections() {
        return [];
      },
      async getCart() {
        return { items: [] };
      },
      async addToCart() {
        return { ok: true };
      },
      async removeFromCart() {
        return { ok: true };
      },
      async updateQuantity() {
        return { ok: true };
      }
    };
  }

  root.TramattoNuvemshop = {
    createClient
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = root.TramattoNuvemshop;
  }
})(typeof window !== 'undefined' ? window : globalThis);
