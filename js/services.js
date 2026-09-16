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
      // Chave versionada (Fase 2A): uma mudança de formato futura pode subir
      // para 'tramatto.cart.v2' sem colidir com carrinhos salvos no formato
      // antigo, em vez de tentar migrar/adivinhar o shape antigo.
      // IMPORTANTE: não existe migração automática da chave antiga
      // ('tramatto-cart', sem versão, usada antes da Fase 2A) para esta —
      // carrinhos salvos sob a chave antiga ficam órfãos (nunca lidos,
      // nunca apagados). Decisão deliberada, não esquecimento (ver
      // docs/nuvemshop-integration.md).
      this.storageKey = 'tramatto.cart.v1';
      this.cart = this.loadCart();
    }

    loadCart() {
      try {
        const storedCart = localStorage.getItem(this.storageKey);
        if (!storedCart) {
          return new Domain.Cart();
        }
        const parsed = JSON.parse(storedCart);
        // Formato desconhecido/corrompido: nunca lançamos exceção pro chamador
        // nem fingimos que é um carrinho válido — registramos e recomeçamos
        // vazio (ver regra 4 da Fase 2A).
        if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.items)) {
          console.warn('Tramatto: carrinho salvo em formato desconhecido — iniciando carrinho vazio.');
          return new Domain.Cart();
        }
        return new Domain.Cart(parsed);
      } catch (error) {
        console.warn('Tramatto: falha ao ler carrinho salvo (dados corrompidos) — iniciando carrinho vazio.', error);
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

    // Estoque: só limitamos quantidade quando stock_management (Nuvemshop)
    // está explicitamente ativo (variant.stockManagement === true). Quando
    // é false/null (não gerenciado — inclui Mock/Mirror) ou stock === ''
    // (ilimitado, convenção da API), não há teto — nunca inventamos um
    // limite que a Nuvemshop não informou.
    getAvailableStock(variant) {
      if (variant?.stockManagement !== true) return Infinity;
      if (variant.stock === '') return Infinity;
      return Number(variant.stock) || 0;
    }

    async addToCart(product, variant = null, quantity = 1) {
      const targetVariant = variant || product.variants?.[0] || null;
      if (!targetVariant || targetVariant.id === undefined || targetVariant.id === null) {
        throw new Error('Este produto não possui uma variante válida para adicionar à sacola.');
      }

      const lineId = String(targetVariant.id);
      const availableStock = this.getAvailableStock(targetVariant);
      const existingItem = this.cart.items.find((entry) => entry.lineId === lineId);
      const existingQty = existingItem?.quantity || 0;

      if (availableStock <= 0 && existingQty === 0) {
        throw new Error(`${product.title} está sem estoque no momento.`);
      }

      // Nunca deixa a quantidade final passar do estoque conhecido — se o
      // pedido exceder, adiciona só até o limite disponível.
      const finalQuantity = Math.min(existingQty + Number(quantity || 1), availableStock);
      const incrementToAdd = Math.max(0, finalQuantity - existingQty);
      if (incrementToAdd <= 0) {
        // Já está na quantidade máxima permitida pelo estoque atual.
        return this.cart;
      }

      const lineItem = {
        lineId,
        productId: product.id,
        variantId: targetVariant.id,
        product,
        variant: targetVariant,
        name: product.title,
        variantName: targetVariant.name,
        sku: targetVariant.sku,
        image: product.image || targetVariant.image || null,
        stock: targetVariant.stock,
        stockManagement: targetVariant.stockManagement,
        quantity: incrementToAdd,
        price: Number(targetVariant.getPrimaryPrice?.() ?? targetVariant.price ?? product.getPrimaryPrice?.() ?? product.price ?? 0)
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
      const item = this.cart.items.find((entry) => entry.lineId === lineId);
      if (item) {
        quantity = Math.min(Number(quantity), this.getAvailableStock(item));
      }
      this.cart.updateQuantity(lineId, quantity);
      this.persist();
      return this.cart;
    }

    // Fase 2A (regra 5): a Nuvemshop continua sendo a fonte de verdade —
    // nunca confiamos permanentemente em nome/preço/imagem/estoque salvos no
    // localStorage. Chamado sempre que o catálogo real recarrega
    // (script.js/initializeStorefront) para atualizar cada linha do
    // carrinho a partir dos dados reais atuais, por variant.id.
    // Produto sem variante correspondente no catálogo atual vira
    // `unavailable`; variante com estoque zerado (stock_management ativo)
    // vira `outOfStock`. Nenhum dos dois remove a linha automaticamente —
    // quem decide é o usuário (ver regra 8, "não esconder erros").
    syncWithCatalog(products = []) {
      const variantIndex = new Map();
      products.forEach((product) => {
        (product.variants || []).forEach((productVariant) => {
          variantIndex.set(String(productVariant.id), { product, variant: productVariant });
        });
      });

      this.cart.items.forEach((item) => {
        const match = variantIndex.get(item.lineId);
        if (!match) {
          item.unavailable = true;
          return;
        }

        const { product, variant } = match;
        item.unavailable = false;
        item.product = product;
        item.variant = variant;
        item.productId = product.id;
        item.variantId = variant.id;
        item.name = product.title;
        item.variantName = variant.name;
        item.sku = variant.sku;
        item.image = product.image || variant.image || null;
        item.stock = variant.stock;
        item.stockManagement = variant.stockManagement;
        item.price = Number(variant.getPrimaryPrice?.() ?? variant.price ?? 0);

        const availableStock = this.getAvailableStock(variant);
        item.outOfStock = variant.stockManagement === true && availableStock <= 0;
        if (!item.outOfStock && item.quantity > availableStock) {
          item.quantity = availableStock;
        }
      });

      this.persist();
      return this.cart;
    }

    // Preparação para a Fase 2B (integração NubeSDK — ainda não implementada
    // aqui, nenhuma chamada de rede/Nuvemshop acontece neste método). Projeta
    // só o payload mínimo que uma futura integração vai precisar: os IDs
    // reais preservados em cada CartItem desde addToCart()/syncWithCatalog()
    // — nunca lineId, slug ou nome. Não filtra unavailable/outOfStock (fica
    // a critério de quem consumir, na própria Fase 2B).
    getCheckoutItems() {
      return this.cart.items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity
      }));
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
