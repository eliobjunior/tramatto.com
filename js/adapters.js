(function (global) {
  const root = globalThis;
  const Domain = root.TramattoDomain || {};

  // Lidas em cada chamada (não capturadas uma vez no topo do módulo):
  // js/adapters.js é carregado via <script> ANTES de integrations/nuvemshop/*.js
  // (ver index.html/collection.html/product.html) — capturar
  // `root.TramattoNuvemshopCatalog` etc. aqui em cima congelaria um objeto
  // `{}` vazio para sempre, fazendo NuvemshopAdapter falhar silenciosamente
  // (sem lançar erro, sem log, sem fallback) mesmo com a API funcionando.
  function getCatalog() { return root.TramattoNuvemshopCatalog || {}; }
  function getProductsApi() { return root.TramattoNuvemshopProducts || {}; }
  function getCartUtil() { return root.TramattoNuvemshopCart || {}; }

  function parsePrice(value) {
    const normalized = String(value).replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.');
    return Number(normalized) || 0;
  }

  class MockAdapter {
    constructor(data = root.catalogData || {}) {
      this.data = data;
    }

    async getProducts() {
      return (this.data.products || []).map((item) => new Domain.Product({
        ...item,
        price: parsePrice(item.price),
        promotionalPrice: item.promotionalPrice ? parsePrice(item.promotionalPrice) : null,
        variants: Array.isArray(item.variants) ? item.variants.map((variant) => new Domain.Variant({
          ...variant,
          price: parsePrice(variant.price),
          promotionalPrice: variant.promotionalPrice ? parsePrice(variant.promotionalPrice) : null
        })) : []
      }));
    }

    async getProductBySlug(slug) {
      const products = await this.getProducts();
      return products.find((product) => product.slug === slug) || null;
    }

    async getCollections() {
      return (this.data.collections || []).map((item) => new Domain.Collection(item));
    }

    async getCart() {
      return new Domain.Cart();
    }

    async addToCart(cart, payload) {
      return cart.addItem(payload);
    }

    async removeFromCart(cart, lineId) {
      return cart.removeItem(lineId);
    }

    async updateQuantity(cart, lineId, quantity) {
      return cart.updateQuantity(lineId, quantity);
    }
  }

  // Catálogo espelhado (Opção A): produção lê nuvemshop-mirror-data.js,
  // gerado por scripts/sync-nuvemshop-mirror.js a partir só de páginas
  // públicas da loja Nuvemshop — sem access_token, sem API privada.
  class MirrorAdapter {
    constructor(data = root.nuvemshopMirrorData || {}) {
      this.data = data;
    }

    async getProducts() {
      return (this.data.products || []).map((item) => new Domain.Product({
        ...item,
        // Regra crítica: nunca deixamos o domain model inventar um id de
        // variante. Variantes sem variant_id real (sync não encontrou) são
        // descartadas aqui, antes de chegar em Domain.Variant — que, se
        // recebesse um item sem id, geraria um id aleatório sozinho.
        variants: Array.isArray(item.variants)
          ? item.variants
            .filter((variant) => variant.id !== undefined && variant.id !== null)
            .map((variant) => new Domain.Variant(variant))
          : []
      }));
    }

    async getProductBySlug(slug) {
      const products = await this.getProducts();
      return products.find((product) => product.slug === slug) || null;
    }

    async getCollections() {
      return (this.data.collections || []).map((item) => new Domain.Collection(item));
    }

    async getCart() {
      return new Domain.Cart();
    }

    async addToCart(cart, payload) {
      return cart.addItem(payload);
    }

    async removeFromCart(cart, lineId) {
      return cart.removeItem(lineId);
    }

    async updateQuantity(cart, lineId, quantity) {
      return cart.updateQuantity(lineId, quantity);
    }
  }

  class NuvemshopAdapter {
    // options.fallbackAdapter (opcional): quando presente, uma falha real de
    // rede/API (proxy fora do ar, timeout, HTTP não-2xx) usa esse adapter
    // como rede de segurança em vez de cair para lista vazia — hoje é o
    // MirrorAdapter em produção (ver js/config.js). Sem fallbackAdapter, o
    // comportamento é o mesmo de antes (Fase 4: falha "para vazio").
    constructor(client, options = {}) {
      this.client = client;
      this.fallbackAdapter = options.fallbackAdapter || null;
    }

    // Fase 4 (robustez): API/proxy indisponível, timeout ou rate limit não
    // podem derrubar o storefront inteiro. Cada método nunca propaga a
    // exceção para a UI — ou usa o fallbackAdapter (logando que o fallback
    // foi acionado, nunca silenciosamente), ou falha "para vazio" (lista
    // vazia / null). O erro é logado sem detalhes sensíveis (client.js nunca
    // tem acesso a token, então não há o que vazar aqui).
    async getProducts() {
      try {
        return await getCatalog().fetchCatalog?.(this.client) || [];
      } catch (error) {
        console.warn('[Nuvemshop] getProducts failed:', error.message || error);
        if (this.fallbackAdapter) {
          console.warn('[Nuvemshop] Usando MirrorAdapter como fallback (getProducts) após falha de rede/API.');
          return this.fallbackAdapter.getProducts();
        }
        return [];
      }
    }

    async getProductBySlug(slug) {
      try {
        return await getProductsApi().fetchProductBySlug?.(this.client, slug) || null;
      } catch (error) {
        console.warn('[Nuvemshop] getProductBySlug failed:', error.message || error);
        if (this.fallbackAdapter) {
          console.warn('[Nuvemshop] Usando MirrorAdapter como fallback (getProductBySlug) após falha de rede/API.');
          return this.fallbackAdapter.getProductBySlug(slug);
        }
        return null;
      }
    }

    async getCollections() {
      try {
        return await getCatalog().fetchCollections?.(this.client) || [];
      } catch (error) {
        console.warn('[Nuvemshop] getCollections failed:', error.message || error);
        if (this.fallbackAdapter) {
          console.warn('[Nuvemshop] Usando MirrorAdapter como fallback (getCollections) após falha de rede/API.');
          return this.fallbackAdapter.getCollections();
        }
        return [];
      }
    }

    // Nota: fetchCatalog/fetchCollections já paginam internamente (ver
    // integrations/nuvemshop/catalog.js) — a interface pública do adapter
    // não muda, continua devolvendo a lista completa.

    async getCart() {
      try {
        return await getCartUtil().fetchCart?.(this.client) || new Domain.Cart();
      } catch (error) {
        console.warn('[Nuvemshop] getCart failed:', error.message || error);
        if (this.fallbackAdapter) {
          console.warn('[Nuvemshop] Usando MirrorAdapter como fallback (getCart) após falha de rede/API.');
          return this.fallbackAdapter.getCart();
        }
        return new Domain.Cart();
      }
    }

    async addToCart(cart, payload) {
      return getCartUtil().addCartItem?.(this.client, payload) || cart;
    }

    async removeFromCart(cart, lineId) {
      return getCartUtil().removeCartItem?.(this.client, lineId) || cart;
    }

    async updateQuantity(cart, lineId, quantity) {
      return getCartUtil().updateCartItemQuantity?.(this.client, lineId, quantity) || cart;
    }
  }

  root.TramattoAdapters = {
    MockAdapter,
    MirrorAdapter,
    NuvemshopAdapter
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = root.TramattoAdapters;
  }
})(typeof window !== 'undefined' ? window : globalThis);
