(function (global) {
  const root = globalThis;
  const Domain = root.TramattoDomain || {};
  const Mapper = root.TramattoNuvemshopMapper || {};
  const Catalog = root.TramattoNuvemshopCatalog || {};
  const Products = root.TramattoNuvemshopProducts || {};
  const CartUtil = root.TramattoNuvemshopCart || {};

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
    constructor(client) {
      this.client = client;
    }

    async getProducts() {
      return Catalog.fetchCatalog?.(this.client) || [];
    }

    async getProductBySlug(slug) {
      return Products.fetchProductBySlug?.(this.client, slug) || null;
    }

    async getCollections() {
      return Catalog.fetchCollections?.(this.client) || [];
    }

    // Nota: fetchCatalog/fetchCollections já paginam internamente (ver
    // integrations/nuvemshop/catalog.js) — a interface pública do adapter
    // não muda, continua devolvendo a lista completa.

    async getCart() {
      return CartUtil.fetchCart?.(this.client) || new Domain.Cart();
    }

    async addToCart(cart, payload) {
      return CartUtil.addCartItem?.(this.client, payload) || cart;
    }

    async removeFromCart(cart, lineId) {
      return CartUtil.removeCartItem?.(this.client, lineId) || cart;
    }

    async updateQuantity(cart, lineId, quantity) {
      return CartUtil.updateCartItemQuantity?.(this.client, lineId, quantity) || cart;
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
