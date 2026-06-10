(function (global) {
  const DEFAULT_PRODUCTS_URL = global.NUVEMSHOP_PRODUCTS_URL || '';

  async function fetchProducts(url = DEFAULT_PRODUCTS_URL) {
    if (!url) {
      return [];
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const payload = await response.json();
      return Array.isArray(payload.products) ? payload.products : [];
    } catch (error) {
      console.warn('Tramatto: unable to load Nuvemshop catalog.', error);
      return [];
    }
  }

  function mapProduct(product) {
    return {
      title: product.title || product.name || 'Produto Tramatto',
      variant: product.variant || product.option || 'Edição premium',
      price: product.price || product.price_formatted || 'Sob consulta',
      badge: product.badge || '',
      label: product.label || 'Peça premium',
      small: product.small || 'Disponível via integração',
      slug: product.slug || product.handle || 'produto',
      description: product.description || 'Produto carregado via Nuvemshop.',
      highlights: Array.isArray(product.highlights) ? product.highlights : ['Disponível em catálogo externo']
    };
  }

  global.TramattoIntegrations = {
    fetchProducts,
    mapProduct
  };
})(window);
