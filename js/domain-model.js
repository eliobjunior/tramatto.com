(function (global) {
  const root = globalThis;

  class Product {
    constructor(data = {}) {
      this.id = data.id || data.slug || data.handle || `product-${Math.random().toString(36).slice(2)}`;
      this.title = data.title || data.name || 'Produto Tramatto';
      this.slug = data.slug || data.handle || this.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      // handle: nome do campo bruto da API Nuvemshop, preservado à parte de
      // `slug` (usado internamente pelo frontend) — ver docs/nuvemshop-integration.md.
      this.handle = data.handle || this.slug;
      this.description = data.description || 'Produto premium da Tramatto.';
      this.canonicalUrl = data.canonicalUrl || null;
      this.published = data.published !== undefined ? data.published : true;
      this.visibility = data.visibility || 'visible';
      this.price = data.price || 0;
      this.promotionalPrice = data.promotionalPrice || null;
      this.currency = data.currency || 'BRL';
      this.inStock = data.inStock !== undefined ? data.inStock : true;
      // hasStock: flag bruta do produto na Nuvemshop (raw.has_stock). Some
      // adapters (Mock/Mirror) não têm essa informação — cai para `inStock`.
      this.hasStock = data.hasStock !== undefined ? data.hasStock : this.inStock;
      this.collectionId = data.collectionId || null;
      // categories: lista completa de categorias reais retornadas pela API
      // (id/name/slug), preservada além de collectionId (categoria primária).
      this.categories = Array.isArray(data.categories) ? data.categories : [];
      this.tags = Array.isArray(data.tags) ? data.tags : [];
      this.image = data.image || null;
      this.gallery = Array.isArray(data.gallery) && data.gallery.length ? data.gallery : [data.image].filter(Boolean);
      this.colors = Array.isArray(data.colors) ? data.colors : [];
      this.sizes = Array.isArray(data.sizes) ? data.sizes : [];
      this.variants = Array.isArray(data.variants) ? data.variants.map((item) => new Variant(item)) : [new Variant({ id: `${this.slug}-default`, name: 'Padrão', price: this.price, promotionalPrice: this.promotionalPrice, stock: data.stock || 10, image: data.image })];
      this.badge = data.badge || '';
      this.label = data.label || 'Peça premium';
      this.small = data.small || 'Disponível em catalogo';
      this.metadata = data.metadata || {};

      // Atributos para Google Merchant Center / GA4 ecommerce (ver docs/merchant-center.md)
      this.brand = data.brand || 'Tramatto';
      this.condition = data.condition || 'new';
      this.productType = data.productType || '';
      this.googleProductCategory = data.googleProductCategory || '';
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
      // productId: variant.product_id real da API — não confundir com o
      // product.id do produto pai (ver docs/nuvemshop-integration.md).
      this.productId = data.productId || null;
      this.name = data.name || 'Padrão';
      this.sku = data.sku || this.id;
      this.price = data.price || 0;
      this.promotionalPrice = data.promotionalPrice || null;
      this.stock = data.stock !== undefined ? data.stock : 10;
      this.stockManagement = data.stockManagement !== undefined ? data.stockManagement : null;
      this.visible = data.visible !== undefined ? data.visible : true;
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
      // Só mescla por lineId (que já embute productId+variantId — ver
      // CartService.addToCart). Mesclar também por productId juntaria
      // variantes diferentes do mesmo produto na mesma linha, perdendo o
      // variant_id real de uma delas — proibido pela arquitetura do carrinho.
      const existingItem = this.items.find((entry) => entry.lineId === item.lineId);
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
