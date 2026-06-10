(function (global) {
  const root = globalThis;

  class Product {
    constructor(data = {}) {
      this.id = data.id || data.slug || data.handle || `product-${Math.random().toString(36).slice(2)}`;
      this.title = data.title || data.name || 'Produto Tramatto';
      this.slug = data.slug || data.handle || this.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      this.description = data.description || 'Produto premium da Tramatto.';
      this.price = data.price || 0;
      this.promotionalPrice = data.promotionalPrice || null;
      this.currency = data.currency || 'BRL';
      this.inStock = data.inStock !== undefined ? data.inStock : true;
      this.collectionId = data.collectionId || null;
      this.image = data.image || null;
      this.gallery = Array.isArray(data.gallery) && data.gallery.length ? data.gallery : [data.image].filter(Boolean);
      this.colors = Array.isArray(data.colors) ? data.colors : [];
      this.sizes = Array.isArray(data.sizes) ? data.sizes : [];
      this.variants = Array.isArray(data.variants) ? data.variants.map((item) => new Variant(item)) : [new Variant({ id: `${this.slug}-default`, name: 'Padrão', price: this.price, promotionalPrice: this.promotionalPrice, stock: data.stock || 10, image: data.image })];
      this.badge = data.badge || '';
      this.label = data.label || 'Peça premium';
      this.small = data.small || 'Disponível em catalogo';
      this.metadata = data.metadata || {};
    }

    getPrimaryPrice() {
      return this.promotionalPrice || this.price;
    }

    getHasPromotion() {
      return Boolean(this.promotionalPrice && this.promotionalPrice < this.price);
    }
  }

  class Variant {
    constructor(data = {}) {
      this.id = data.id || `variant-${Math.random().toString(36).slice(2)}`;
      this.name = data.name || 'Padrão';
      this.sku = data.sku || this.id;
      this.price = data.price || 0;
      this.promotionalPrice = data.promotionalPrice || null;
      this.stock = data.stock !== undefined ? data.stock : 10;
      this.color = data.color || null;
      this.size = data.size || null;
      this.image = data.image || null;
      this.attributes = data.attributes || {};
    }

    getPrimaryPrice() {
      return this.promotionalPrice || this.price;
    }
  }

  class Collection {
    constructor(data = {}) {
      this.id = data.id || data.slug || `collection-${Math.random().toString(36).slice(2)}`;
      this.name = data.name || 'Coleção Tramatto';
      this.slug = data.slug || this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      this.description = data.description || '';
      this.products = Array.isArray(data.products) ? data.products : [];
      this.image = data.image || null;
    }
  }

  class Customer {
    constructor(data = {}) {
      this.id = data.id || `customer-${Math.random().toString(36).slice(2)}`;
      this.name = data.name || '';
      this.email = data.email || '';
      this.phone = data.phone || '';
      this.address = data.address || null;
    }
  }

  class CartItem {
    constructor(data = {}) {
      this.lineId = data.lineId || `${data.productId || 'item'}-${Math.random().toString(36).slice(2)}`;
      this.productId = data.productId || null;
      this.product = data.product || null;
      this.variant = data.variant || null;
      this.quantity = Number(data.quantity || 1);
      this.price = Number(data.price || 0);
    }
  }

  class Cart {
    constructor(data = {}) {
      this.items = Array.isArray(data.items) ? data.items.map((item) => new CartItem(item)) : [];
      this.customer = data.customer ? new Customer(data.customer) : null;
    }

    addItem(item) {
      const existingItem = this.items.find((entry) => entry.lineId === item.lineId || entry.productId === item.productId);
      if (existingItem) {
        existingItem.quantity += item.quantity || 1;
        return existingItem;
      }

      this.items.push(new CartItem(item));
      return this.items[this.items.length - 1];
    }

    removeItem(lineId) {
      this.items = this.items.filter((item) => item.lineId !== lineId);
      return this.items;
    }

    updateQuantity(lineId, quantity) {
      const item = this.items.find((entry) => entry.lineId === lineId);
      if (!item) return null;
      item.quantity = Math.max(0, Number(quantity));
      if (item.quantity === 0) {
        this.removeItem(lineId);
      }
      return item;
    }

    getTotalItems() {
      return this.items.reduce((sum, item) => sum + item.quantity, 0);
    }

    toJSON() {
      return {
        items: this.items.map((item) => ({ ...item, product: item.product, variant: item.variant })),
        customer: this.customer
      };
    }
  }

  const api = {
    Product,
    Variant,
    Collection,
    Customer,
    CartItem,
    Cart
  };

  root.TramattoDomain = api;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
