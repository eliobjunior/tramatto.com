(function (global) {
  const root = globalThis;

  // Cliente HTTP para o proxy próprio da Tramatto (ver proxy/README.md).
  // Nunca fala com api.nuvemshop.com.br diretamente e nunca envia (nem
  // recebe) access_token, client_secret ou header Authorization — isso
  // fica inteiramente do lado do proxy.
  function createClient(options = {}) {
    const config = {
      proxyBaseUrl: options.apiBaseUrl || options.proxyBaseUrl || ''
    };

    async function proxyFetch(path, params = {}) {
      if (!config.proxyBaseUrl) {
        throw new Error('Tramatto: proxyBaseUrl não configurada para o NuvemshopAdapter (ver js/config.js).');
      }

      const url = new URL(path, config.proxyBaseUrl);
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.set(key, value);
        }
      });

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`Tramatto: proxy Nuvemshop respondeu ${response.status} para ${path}`);
      }
      return response.json();
    }

    return {
      config,

      async getProductsPage({ page = 1, perPage = 30 } = {}) {
        const products = await proxyFetch('/products', { page, per_page: perPage });
        return Array.isArray(products) ? products : [];
      },

      async getProductBySlug(slug) {
        const products = await proxyFetch('/products', { handle: slug, per_page: 1 });
        return Array.isArray(products) && products.length ? products[0] : null;
      },

      async getCategoriesPage({ page = 1, perPage = 30 } = {}) {
        const categories = await proxyFetch('/categories', { page, per_page: perPage });
        return Array.isArray(categories) ? categories : [];
      },

      // Carrinho/checkout ficam fora do escopo da Fase 1 (ver docs de
      // auditoria) — mantidos como stub para não quebrar o encadeamento
      // de NuvemshopAdapter, mas não são chamados pelo CartService hoje
      // (o carrinho continua 100% local em localStorage).
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
