(function (global) {
  const root = globalThis;
  const Domain = root.TramattoDomain || {};

  class BaseAdapter {
    async getProducts() { throw new Error('Adapter must implement getProducts().'); }
    async getProductBySlug() { throw new Error('Adapter must implement getProductBySlug().'); }
    async getCollections() { throw new Error('Adapter must implement getCollections().'); }
    async getCart() { return new Domain.Cart(); }
    async addToCart() { return new Domain.Cart(); }
    async removeFromCart() { return new Domain.Cart(); }
    async updateQuantity() { return new Domain.Cart(); }
  }

  class CatalogService {
    constructor(adapter) {
      this.adapter = adapter || new BaseAdapter();
    }

    async getProducts() {
      return this.adapter.getProducts();
    }

    async getCollections() {
      return this.adapter.getCollections();
    }
  }

  class ProductService {
    constructor(adapter) {
      this.adapter = adapter || new BaseAdapter();
    }

    async getProductBySlug(slug) {
      return this.adapter.getProductBySlug(slug);
    }

    async getProductSchema(product) {
      if (!product) return null;
      return {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.title,
        description: product.description,
        image: product.gallery || [product.image],
        offers: {
          '@type': 'Offer',
          priceCurrency: product.currency || 'BRL',
          price: product.getPrimaryPrice?.() || product.price,
          availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
        }
      };
    }

    async getBreadcrumbSchema(product) {
      if (!product) return null;
      return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://tramatto.com/' },
          { '@type': 'ListItem', position: 2, name: 'Coleção', item: 'https://tramatto.com/collection.html' },
          { '@type': 'ListItem', position: 3, name: product.title, item: `https://tramatto.com/product.html?slug=${product.slug}` }
        ]
      };
    }
  }

  class CollectionService {
    constructor(adapter) {
      this.adapter = adapter || new BaseAdapter();
    }

    async getCollections() {
      return this.adapter.getCollections();
    }
  }

  class CartService {
    constructor(adapter) {
      this.adapter = adapter || new BaseAdapter();
      this.storageKey = 'tramatto-cart';
      this.cart = this.loadCart();
    }

    loadCart() {
      try {
        const storedCart = localStorage.getItem(this.storageKey);
        if (!storedCart) {
          return new Domain.Cart();
        }
        const parsed = JSON.parse(storedCart);
        return new Domain.Cart(parsed);
      } catch (error) {
        return new Domain.Cart();
      }
    }

    persist() {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(this.cart.toJSON()));
      } catch (error) {
        console.warn('Cart storage unavailable.', error);
      }
    }

    getCart() {
      return this.cart;
    }

    async addToCart(product, variant = null, quantity = 1) {
      const lineItem = {
        lineId: `${product.slug}-${variant?.id || 'default'}`,
        productId: product.slug,
        product,
        variant,
        quantity,
        price: Number(variant?.getPrimaryPrice?.() || product.getPrimaryPrice?.() || product.price || 0)
      };

      this.cart.addItem(lineItem);
      this.persist();
      return this.cart;
    }

    async removeFromCart(lineId) {
      this.cart.removeItem(lineId);
      this.persist();
      return this.cart;
    }

    async updateQuantity(lineId, quantity) {
      this.cart.updateQuantity(lineId, quantity);
      this.persist();
      return this.cart;
    }
  }

  root.TramattoServices = {
    BaseAdapter,
    CatalogService,
    ProductService,
    CollectionService,
    CartService
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = root.TramattoServices;
  }
})(typeof window !== 'undefined' ? window : globalThis);
