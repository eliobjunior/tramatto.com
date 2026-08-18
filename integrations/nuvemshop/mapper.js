(function (global) {
  const root = globalThis;
  const Domain = root.TramattoDomain || {};

  // Mapeia o schema REAL da API Nuvemshop (confirmado na documentação
  // oficial: name/description/handle são objetos multilíngues, variantes
  // ficam em variants[] com price/promotional_price/stock/sku/values,
  // imagens em images[].src, categorias em categories[] como IDs) para o
  // domain model interno (Product/Variant/Collection).

  function localizedText(field, fallback = '') {
    if (!field) return fallback;
    if (typeof field === 'string') return field;
    return field.pt || field.es || field.en || Object.values(field)[0] || fallback;
  }

  function parseDecimal(value) {
    if (value === null || value === undefined || value === '') return null;
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }

  // As variantes da Nuvemshop não têm campos explícitos "color"/"size" —
  // os valores em variant.values[] correspondem posicionalmente aos
  // atributos do produto (product.attributes[]). Aqui tentamos identificar
  // cor/tamanho pelo nome do atributo; o restante fica em `attributes`.
  function mapVariantAttributes(productAttributes, variantValues) {
    const attributeNames = (productAttributes || []).map((attr) => localizedText(attr).toLowerCase());
    const values = (variantValues || []).map((value) => localizedText(value));

    const attributes = {};
    let color = null;
    let size = null;

    attributeNames.forEach((name, index) => {
      const value = values[index];
      if (value === undefined) return;
      attributes[name] = value;

      if (/cor|color/.test(name)) {
        color = value;
      } else if (/tamanho|size/.test(name)) {
        size = value;
      }
    });

    return { attributes, color, size, values };
  }

  function mapVariant(raw, productAttributes) {
    const { attributes, color, size, values } = mapVariantAttributes(productAttributes, raw.values);
    const price = parseDecimal(raw.price) || 0;
    const promotionalPrice = parseDecimal(raw.promotional_price);
    const name = values.filter(Boolean).join(' / ') || 'Padrão';

    return new Domain.Variant({
      id: raw.id !== undefined ? String(raw.id) : (raw.sku || `variant-${Math.random().toString(36).slice(2)}`),
      name,
      sku: raw.sku || null,
      price,
      promotionalPrice,
      // stock pode vir como número, ou string vazia = estoque ilimitado
      // (documentação oficial). Preservamos o valor bruto; quem consome
      // (mapProduct.inStock) trata a semântica de "ilimitado".
      stock: raw.stock === '' ? '' : (raw.stock !== undefined && raw.stock !== null ? Number(raw.stock) : 0),
      color,
      size,
      image: null,
      attributes
    });
  }

  function hasAvailableStock(variants) {
    return variants.some((variant) => variant.stock === '' || Number(variant.stock) > 0);
  }

  function mapProduct(raw) {
    const attributes = raw.attributes || [];
    const variants = Array.isArray(raw.variants) ? raw.variants.map((item) => mapVariant(item, attributes)) : [];
    const images = Array.isArray(raw.images)
      ? [...raw.images].sort((a, b) => (a.position || 0) - (b.position || 0)).map((image) => image.src).filter(Boolean)
      : [];

    const firstVariant = variants[0] || null;
    const title = localizedText(raw.name, 'Produto Tramatto');
    const handle = localizedText(raw.handle, title.toLowerCase().replace(/[^a-z0-9]+/g, '-'));

    return new Domain.Product({
      id: raw.id !== undefined ? String(raw.id) : handle,
      title,
      slug: handle,
      description: localizedText(raw.description, 'Produto importado via Nuvemshop.'),
      price: firstVariant ? firstVariant.price : 0,
      promotionalPrice: firstVariant ? firstVariant.promotionalPrice : null,
      currency: 'BRL',
      inStock: variants.length ? hasAvailableStock(variants) : true,
      // A Nuvemshop permite múltiplas categorias por produto
      // (categories: [ids]); o domain model atual só suporta uma
      // coleção primária, então usamos a primeira como collectionId.
      collectionId: Array.isArray(raw.categories) && raw.categories.length ? String(raw.categories[0]) : null,
      image: images[0] || null,
      gallery: images,
      colors: [...new Set(variants.map((variant) => variant.color).filter(Boolean))],
      sizes: [...new Set(variants.map((variant) => variant.size).filter(Boolean))],
      variants,
      badge: '',
      label: 'Peça premium',
      small: 'Importado da Nuvemshop',
      brand: raw.brand || 'Tramatto',
      condition: 'new',
      metadata: { nuvemshopId: raw.id }
    });
  }

  function mapCollection(raw) {
    const name = localizedText(raw.name, 'Coleção');
    const handle = localizedText(raw.handle, name.toLowerCase().replace(/[^a-z0-9]+/g, '-'));

    return new Domain.Collection({
      id: raw.id !== undefined ? String(raw.id) : handle,
      name,
      slug: handle,
      description: localizedText(raw.description, ''),
      // A API de categorias não retorna produtos aninhados — quem precisar
      // do relacionamento produto↔categoria usa Product.collectionId.
      products: [],
      image: null
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
