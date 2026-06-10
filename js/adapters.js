(function (global) {
  const root = globalThis;
  const Domain = root.TramattoDomain || {};
  const Mapper = root.TramattoNuvemshopMapper || {};
  const Catalog = root.TramattoNuvemshopCatalog || {};
  const Products = root.TramattoNuvemshopProducts || {};
  const CartUtil = root.TramattoNuvemshopCart || {};

  class MockAdapter {
    constructor(data = root.catalogData || {}) {
      this.data = data;
    }

    async getProducts() {
      return (this.data.products || []).map((item) => new Domain.Product({
        ...item,
        price: Number(String(item.price).replace(/[R$.,]/g, '').trim()) || 0,
        promotionalPrice: item.promotionalPrice ? Number(String(item.promotionalPrice).replace(/[R$.,]/g, '').trim()) : null,
        variants: Array.isArray(item.variants) ? item.variants.map((variant) => new Domain.Variant({
          ...variant,
          price: Number(String(variant.price).replace(/[R$.,]/g, '').trim()) || 0,
          promotionalPrice: variant.promotionalPrice ? Number(String(variant.promotionalPrice).replace(/[R$.,]/g, '').trim()) : null
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
    NuvemshopAdapter
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = root.TramattoAdapters;
  }
})(typeof window !== 'undefined' ? window : globalThis);
