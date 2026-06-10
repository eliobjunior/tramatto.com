(function (global) {
  const root = globalThis;
  const Domain = root.TramattoDomain || {};

  function mapProduct(raw) {
    return new Domain.Product({
      id: raw.id || raw.slug,
      title: raw.title || raw.name || 'Produto',
      slug: raw.slug || raw.handle || raw.title || 'produto',
      description: raw.description || raw.body || 'Produto importado via Nuvemshop.',
      price: Number(raw.price || raw.price_value || 0),
      promotionalPrice: raw.promotionalPrice ? Number(raw.promotionalPrice) : null,
      currency: raw.currency || 'BRL',
      inStock: raw.inStock !== undefined ? raw.inStock : true,
      collectionId: raw.collectionId || null,
      image: raw.image || raw.image_url || null,
      gallery: raw.gallery || [raw.image || raw.image_url].filter(Boolean),
      colors: Array.isArray(raw.colors) ? raw.colors : [],
      sizes: Array.isArray(raw.sizes) ? raw.sizes : [],
      variants: Array.isArray(raw.variants) ? raw.variants.map((item) => mapVariant(item)) : [],
      badge: raw.badge || '',
      label: raw.label || 'Peça premium',
      small: raw.small || 'Importado pela camada Nuvemshop',
      metadata: raw.metadata || {}
    });
  }

  function mapVariant(raw) {
    return new Domain.Variant({
      id: raw.id || raw.sku || `${raw.color || 'variant'}-${raw.size || 'default'}`,
      name: raw.name || `${raw.color || ''} ${raw.size || ''}`.trim() || 'Padrão',
      sku: raw.sku || raw.id || 'sku',
      price: Number(raw.price || 0),
      promotionalPrice: raw.promotionalPrice ? Number(raw.promotionalPrice) : null,
      stock: raw.stock !== undefined ? Number(raw.stock) : 10,
      color: raw.color || null,
      size: raw.size || null,
      image: raw.image || null,
      attributes: raw.attributes || {}
    });
  }

  function mapCollection(raw) {
    return new Domain.Collection({
      id: raw.id || raw.slug,
      name: raw.name || 'Coleção',
      slug: raw.slug || raw.name,
      description: raw.description || '',
      products: Array.isArray(raw.products) ? raw.products.map(mapProduct) : [],
      image: raw.image || null
    });
  }

  function mapCart(raw) {
    return new Domain.Cart(raw || {});
  }

  root.TramattoNuvemshopMapper = {
    mapProduct,
    mapVariant,
    mapCollection,
    mapCart
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = root.TramattoNuvemshopMapper;
  }
})(typeof window !== 'undefined' ? window : globalThis);
