let appState = null;
let currentProductSelection = null;

const SITE_URL = 'https://tramatto.com';
const DEFAULT_OG_IMAGE = `${SITE_URL}/tramatto_og.jpg`;

// Converte um caminho relativo (ex.: "assets/images/foo.jpg") em URL absoluta do site.
function toAbsoluteUrl(path) {
  if (!path) return null;
  if (/^(https?:)?\/\//i.test(path) || path.startsWith('data:')) return path;
  return `${SITE_URL}/${path.replace(/^\//, '')}`;
}

function escapeHTML(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Compara dois variant.id normalizando para String — necessário porque
// atributos HTML (data-select-variant) são sempre string, mas variant.id
// pode vir como number (MirrorAdapter/nuvemshop-mirror-data.js) ou como
// string (NuvemshopAdapter/mapper.js). Só usado para comparação de UI —
// nunca altera o tipo/valor real armazenado no CartItem (ver
// CartService.addToCart, que sempre chama String(targetVariant.id) só na
// hora de montar o lineId, preservando variant.id original em variantId).
function isSameVariantId(a, b) {
  return a !== undefined && a !== null && b !== undefined && b !== null && String(a) === String(b);
}

function formatPrice(value) {
  const number = Number(value || 0);
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2
  }).format(number);
}

function buildPlaceholderImage(label) {
  const markup = encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000"><rect width="100%" height="100%" fill="#F5F0E8"/><text x="50%" y="50%" text-anchor="middle" font-family="Arial" font-size="34" fill="#9B6B4B">${label}</text></svg>`);
  return `data:image/svg+xml;charset=UTF-8,${markup}`;
}

// Monta o link de "comprar" da Nuvemshop (js/purchase.js) a partir do
// produto/variante selecionados na PDP. Retorna null quando o ambiente não
// tem storeUrl configurada (MockAdapter/desenvolvimento) — nesse caso o
// botão "Comprar" fica desabilitado em vez de redirecionar para um link
// inválido (ver Fase D do plano de integração Nuvemshop).
function getBuyUrl(product, variant, quantity = 1) {
  const environment = window.TramattoConfig?.resolveEnvironment?.(window.TramattoConfig.environment);
  const storeUrl = environment?.storeUrl;
  const variantId = variant?.id ?? product?.variants?.[0]?.id;
  return window.TramattoPurchase?.buildBuyUrl?.({ storeUrl, variantId, quantity }) || null;
}

// Liga as setas (se existirem) à troca de imagem ativa na galeria da PDP.
// Navegação circular: passar do último volta ao primeiro e vice-versa —
// evita ter que desabilitar seta nas pontas e nunca produz índice inválido.
function initGalleryNavigation(container) {
  const gallery = container.querySelector('[data-gallery]');
  if (!gallery) return;

  const images = Array.from(gallery.querySelectorAll('.product-gallery-image'));
  const prevButton = gallery.querySelector('[data-gallery-prev]');
  const nextButton = gallery.querySelector('[data-gallery-next]');
  if (images.length <= 1 || (!prevButton && !nextButton)) return;

  let currentIndex = Math.max(0, images.findIndex((image) => image.classList.contains('active')));

  function showImage(index) {
    const safeIndex = ((index % images.length) + images.length) % images.length;
    images[currentIndex]?.classList.remove('active');
    images[safeIndex].classList.add('active');
    currentIndex = safeIndex;
  }

  prevButton?.addEventListener('click', () => showImage(currentIndex - 1));
  nextButton?.addEventListener('click', () => showImage(currentIndex + 1));
}

function getAppState() {
  if (!appState) {
    const services = window.TramattoConfig?.createServices?.(window.TramattoConfig.environment || 'development');
    appState = { services };
  }
  return appState;
}

async function initializeStorefront() {
  const app = getAppState();
  const { catalogService, collectionService, cartService } = app.services;

  // allSettled (não Promise.all): se o catálogo real da Nuvemshop falhar
  // (API fora do ar, timeout, rate limit), a página não pode travar em
  // branco — cai para lista vazia e a UI mostra um estado vazio amigável
  // em vez de propagar a exceção e nunca renderizar nada (nem o carrinho).
  const [productsResult, collectionsResult] = await Promise.allSettled([
    catalogService.getProducts(),
    collectionService.getCollections()
  ]);

  app.products = productsResult.status === 'fulfilled' ? productsResult.value : [];
  app.collections = collectionsResult.status === 'fulfilled' ? collectionsResult.value : [];
  app.catalogUnavailable = productsResult.status === 'rejected';
  app.cartService = cartService;
  window.TramattoCartUI?.init(cartService);

  if (productsResult.status === 'rejected') {
    console.warn('Tramatto: catálogo indisponível no momento.', productsResult.reason);
  } else {
    // A Nuvemshop continua sendo a fonte de verdade (Fase 2A, regra 5): a
    // cada catálogo real carregado com sucesso, atualiza nome/preço/imagem/
    // estoque de cada linha já no carrinho (localStorage) por variant.id —
    // nunca confia permanentemente no preço salvo. Só roda em sucesso: uma
    // falha de rede não pode marcar o carrinho inteiro como indisponível.
    cartService.syncWithCatalog(app.products);
  }

  updateCartBadge();
  renderHomeProducts();
  renderCollectionPage();
  renderKits();
  renderProductDetail();
  renderCollections();
  initCollectionSearch();
}

function updateCartBadge() {
  const app = getAppState();
  const cart = app?.services?.cartService?.getCart?.();
  const itemCount = cart?.getTotalItems?.() || 0;

  // [data-open-cart] (não só .nav-cart): cobre também o link da sacola no
  // menu mobile, que não tem a classe .nav-cart.
  document.querySelectorAll('[data-open-cart]').forEach((link) => {
    link.innerHTML = `Sacola <span data-cart-badge>${itemCount}</span>`;
  });

  const cartStatus = document.getElementById('cartStatus');
  if (cartStatus) {
    cartStatus.textContent = itemCount > 0
      ? `${itemCount} item${itemCount > 1 ? 's' : ''} na sacola`
      : 'Sua sacola está vazia';
  }

  document.dispatchEvent(new CustomEvent('tramatto:cart-updated'));
}

function showToast(message) {
  let toast = document.getElementById('cartToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'cartToast';
    toast.className = 'cart-toast';
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add('visible');
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => {
    toast.classList.remove('visible');
  }, 1800);
}

async function addToCart(product, variant = null) {
  const app = getAppState();
  const targetVariant = variant || product.variants?.[0] || null;
  const lineId = targetVariant ? String(targetVariant.id) : null;
  const beforeQty = lineId ? (app.services.cartService.getCart().items.find((item) => item.lineId === lineId)?.quantity || 0) : 0;

  try {
    await app.services.cartService.addToCart(product, targetVariant, 1);
  } catch (error) {
    // Fase 2A, regra 2/8: produto sem estoque (ou sem variante válida) não é
    // adicionado — e o erro aparece pro usuário, nunca falha silenciosa.
    showToast(error.message || 'Não foi possível adicionar este item à sacola.');
    return;
  }

  updateCartBadge();

  const afterQty = lineId ? (app.services.cartService.getCart().items.find((item) => item.lineId === lineId)?.quantity || 0) : 0;
  if (afterQty === beforeQty) {
    // Estoque já estava no máximo permitido antes deste clique.
    showToast('Quantidade máxima em estoque já está na sacola.');
    return;
  }

  dispatchAddToCart(product, targetVariant, 1);
  showToast(`${product.title} adicionado à sacola`);
}

function renderProducts(container, items = appState?.products || [], listName = 'Coleção Premium') {
  if (!container) return;

  if (!items.length) {
    container.innerHTML = appState?.catalogUnavailable
      ? '<p class="catalog-empty-state">Não foi possível carregar o catálogo agora. Tente novamente em instantes.</p>'
      : '<p class="catalog-empty-state">Nenhum produto disponível nesta coleção no momento.</p>';
    return;
  }

  container.innerHTML = items.map((product) => `
    <article class="product-card">
      <a href="product.html?slug=${product.slug}" class="product-card-link">
        <div class="product-img">
          <div class="photo-placeholder" style="background-image:url('${product.gallery?.[0] || buildPlaceholderImage(product.title)}'); background-size:cover; background-position:center;">
            <div class="photo-label" style="font-size:0.75rem;">
              ${escapeHTML(product.label || 'Peça premium')}
              <small>${escapeHTML(product.small || 'Catalogo premium')}</small>
            </div>
          </div>
          ${product.badge ? `<div class="product-badge">${escapeHTML(product.badge)}</div>` : ''}
        </div>
        <div class="product-name">${escapeHTML(product.title)}</div>
        <div class="product-variant">${escapeHTML(product.variant || product.variants?.[0]?.name || 'Edição premium')}</div>
        <div class="product-price">${formatPrice(product.getPrimaryPrice?.() || product.price || 0)}</div>
      </a>
      <div class="product-card-actions">
        <button type="button" class="btn-outline mini" data-add-to-cart="${escapeHTML(product.slug)}">Adicionar</button>
      </div>
    </article>
  `).join('');

  container.querySelectorAll('.product-card-link').forEach((link, index) => {
    link.addEventListener('click', () => {
      const slug = new URL(link.href, window.location.origin).searchParams.get('slug');
      const product = (appState?.products || []).find((p) => p.slug === slug);
      if (product) dispatchSelectItem(product, index, listName);
    });
  });

  container.querySelectorAll('[data-add-to-cart]').forEach((button) => {
    button.addEventListener('click', async (event) => {
      event.preventDefault();
      event.stopPropagation();
      const product = appState.products.find((item) => item.slug === button.getAttribute('data-add-to-cart'));
      if (product) {
        await addToCart(product, product.variants?.[0] || null);
      }
    });
  });
}

function renderHomeProducts() {
  const container = document.getElementById('productsGrid');
  if (container) {
    renderProducts(container, (appState?.products || []).slice(0, 4), 'Home — Destaques');
  }
}

function renderCollectionPage() {
  const container = document.getElementById('collectionProducts');
  if (container) {
    const products = appState?.products || [];
    renderProducts(container, products, 'Coleção Premium');
    dispatchViewCollection(products, 'Coleção Premium', 'colecao-premium');
  }
}

// Envia ao analytics.js a lista de produtos exibidos na coleção (evento view_collection)
function dispatchViewCollection(products, listName = 'Coleção Premium', listId = 'colecao-premium') {
  document.dispatchEvent(new CustomEvent('tramatto:view_collection', {
    detail: {
      currency: 'BRL',
      list_name: listName,
      list_id: listId,
      items: products.map((product, index) => ({
        item_id: product.slug,
        item_name: product.title,
        item_brand: product.brand,
        item_category: product.googleProductCategory || product.productType || '',
        price: product.getPrimaryPrice?.() || product.price || 0,
        quantity: 1,
        index
      }))
    }
  }));
}

// Envia ao analytics.js o produto clicado na grade (evento select_item)
function dispatchSelectItem(product, index, listName = 'Coleção Premium') {
  const listId = listName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  document.dispatchEvent(new CustomEvent('tramatto:select_item', {
    detail: {
      list_name: listName,
      list_id: listId,
      item: {
        item_id: product.slug,
        item_name: product.title,
        item_brand: product.brand,
        item_category: product.googleProductCategory || product.productType || '',
        price: product.getPrimaryPrice?.() || product.price || 0,
        quantity: 1,
        index
      }
    }
  }));
}

// Envia ao analytics.js o produto adicionado à sacola (evento add_to_cart)
function dispatchAddToCart(product, variant, quantity = 1) {
  const price = Number(
    variant?.getPrimaryPrice?.() || variant?.price ||
    product.getPrimaryPrice?.() || product.price || 0
  );
  document.dispatchEvent(new CustomEvent('tramatto:add_to_cart', {
    detail: {
      currency: 'BRL',
      value: price * quantity,
      item: {
        item_id: product.slug,
        item_name: product.title,
        item_brand: product.brand,
        item_category: product.googleProductCategory || product.productType || '',
        item_variant: variant?.name || null,
        price,
        quantity
      }
    }
  }));
}

// Filtra a coleção pelo termo digitado e notifica o analytics.js (evento search)
function initCollectionSearch() {
  const input = document.getElementById('collectionSearch');
  const container = document.getElementById('collectionProducts');
  if (!input || !container) return;

  input.addEventListener('input', () => {
    const term = input.value.trim();
    const allProducts = appState?.products || [];
    const filtered = term
      ? allProducts.filter((product) => product.title.toLowerCase().includes(term.toLowerCase()))
      : allProducts;

    const listName = term ? 'Busca — Coleção' : 'Coleção Premium';
    renderProducts(container, filtered, listName);

    if (term) {
      document.dispatchEvent(new CustomEvent('tramatto:search', {
        detail: { search_term: term, results_count: filtered.length }
      }));
    }
  });
}

function renderKits() {
  const container = document.getElementById('kitsGrid');
  if (!container) return;

  const kits = window.catalogData?.kits || [];
  container.innerHTML = kits.map((kit) => `
    <div class="kit-card">
      <div class="kit-photo">
        <div class="photo-placeholder" style="background-image:url('${kit.image || buildPlaceholderImage(kit.title)}'); background-size:cover; background-position:center;"></div>
      </div>
      <div class="kit-content">
        <div class="kit-tag">${escapeHTML(kit.tag)}</div>
        <div class="kit-name">${escapeHTML(kit.title)}</div>
        <p class="kit-desc">${escapeHTML(kit.description)}</p>
        <div class="kit-price">${escapeHTML(kit.price)}</div>
        <button type="button" class="btn-outline" data-add-to-cart-kit="${escapeHTML(kit.title)}">Adicionar à sacola</button>
      </div>
    </div>
  `).join('');

  container.querySelectorAll('[data-add-to-cart-kit]').forEach((button) => {
    button.addEventListener('click', async () => {
      const title = button.getAttribute('data-add-to-cart-kit');
      const fallbackProduct = appState?.products?.find((item) => item.title === title) || appState?.products?.[0];
      if (fallbackProduct) {
        await addToCart(fallbackProduct, fallbackProduct.variants?.[0] || null);
      }
    });
  });
}

function renderCollections() {
  const collectionContainer = document.getElementById('collections');
  if (!collectionContainer) return;

  const collections = appState?.collections || [];
  collectionContainer.innerHTML = collections.map((collection) => `
    <article class="collection-card">
      <h3>${escapeHTML(collection.name)}</h3>
      <p>${escapeHTML(collection.description)}</p>
    </article>
  `).join('');
}

function renderProductDetail() {
  const container = document.getElementById('productDetail');
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');
  const product = (appState?.products || []).find((item) => item.slug === slug) || (appState?.products || [])[0];

  if (!product) {
    container.innerHTML = '<div class="collection-page"><p>Produto não encontrado.</p></div>';
    return;
  }

  const selectedVariant = currentProductSelection || product.variants?.[0] || null;
  const galleryImages = product.gallery?.length ? product.gallery : [buildPlaceholderImage(product.title)];
  const galleryMarkup = galleryImages.map((image, index) => `
    <img class="product-gallery-image ${index === 0 ? 'active' : ''}" src="${image || buildPlaceholderImage(product.title)}" alt="${escapeHTML(product.title)} ${index + 1}" />
  `).join('');
  // Setas só aparecem quando há mais de uma imagem — produto com 1 imagem
  // (real ou placeholder) não mostra navegação nenhuma.
  const galleryArrowsMarkup = galleryImages.length > 1 ? `
    <button type="button" class="gallery-arrow gallery-arrow-prev" data-gallery-prev aria-label="Imagem anterior">‹</button>
    <button type="button" class="gallery-arrow gallery-arrow-next" data-gallery-next aria-label="Próxima imagem">›</button>
  ` : '';
  const variantMarkup = (product.variants || []).map((variant) => `
    <button type="button" class="variant-option ${isSameVariantId(selectedVariant?.id, variant.id) ? 'selected' : ''}" data-select-variant="${escapeHTML(variant.id)}">
      <span>${escapeHTML(variant.name)}</span>
      <small>${escapeHTML(variant.color || '')} ${escapeHTML(variant.size || '')}</small>
    </button>
  `).join('');

  container.innerHTML = `
    <div class="product-shell">
      <div class="product-media">
        <div class="product-gallery" data-gallery>${galleryMarkup}${galleryArrowsMarkup}</div>
      </div>
      <div class="product-info">
        <a href="collection.html" class="back-link">← Voltar à coleção</a>
        <div class="section-tag">Peça selecionada</div>
        <h1 class="product-detail-title">${escapeHTML(product.title)}</h1>
        <p class="product-detail-price">${formatPrice(selectedVariant?.getPrimaryPrice?.() || selectedVariant?.price || product.getPrimaryPrice?.() || product.price || 0)}</p>
        <p class="product-detail-description">${escapeHTML(product.description)}</p>
        <div class="product-variant-group">
          <div class="variant-label">Variações</div>
          <div class="variant-list">${variantMarkup}</div>
        </div>
        <div class="product-highlights">
          ${(product.highlights || []).map((item) => `<div class="detail-card">${escapeHTML(item)}</div>`).join('')}
        </div>
        <div class="product-meta">
          <div class="stock-pill">${product.inStock ? 'Em estoque' : 'Esgotado'}</div>
          <div class="stock-pill secondary">${product.colors?.length ? `Cores: ${product.colors.join(', ')}` : 'Disponível em edição premium'}</div>
        </div>
        <div class="product-actions">
          <button type="button" class="btn-primary" data-buy-now="true">Comprar</button>
          <button type="button" class="btn-secondary" data-add-to-cart="${escapeHTML(product.slug)}">Adicionar à sacola</button>
          <a href="collection.html" class="btn-secondary">Ver mais peças</a>
        </div>
      </div>
    </div>
  `;

  initGalleryNavigation(container);

  container.querySelectorAll('[data-select-variant]').forEach((button) => {
    button.addEventListener('click', () => {
      const variantId = button.getAttribute('data-select-variant');
      currentProductSelection = product.variants.find((variant) => isSameVariantId(variant.id, variantId)) || product.variants[0] || null;
      renderProductDetail();
    });
  });

  const addButton = container.querySelector('[data-add-to-cart]');
  if (addButton) {
    addButton.addEventListener('click', async () => {
      const targetProduct = appState.products.find((item) => item.slug === addButton.getAttribute('data-add-to-cart')) || product;
      await addToCart(targetProduct, currentProductSelection || targetProduct.variants?.[0] || null);
    });
  }

  // "Comprar" leva direto para o carrinho/checkout hospedado da Nuvemshop
  // (link nativo /comprar/{variant_id}-{quantity}/, validado manualmente
  // contra a loja real). A Tramatto não implementa carrinho, checkout,
  // frete, retirada, pagamento ou criação de pedido — só monta a URL.
  const buyButton = container.querySelector('[data-buy-now]');
  if (buyButton) {
    const buyUrl = getBuyUrl(product, selectedVariant);
    if (buyUrl) {
      buyButton.addEventListener('click', () => {
        window.location.href = buyUrl;
      });
    } else {
      buyButton.disabled = true;
      buyButton.title = 'Compra direta disponível apenas quando o catálogo real da Nuvemshop estiver ativo.';
    }
  }

  updateCanonicalUrl(product.slug);
  updateProductMetaTags(product, selectedVariant);
  injectProductSchema(product, selectedVariant);
  dispatchViewProduct(product, selectedVariant);
}

// Corrige o <link rel="canonical"> para apontar para a PDP do produto exibido
// (cada slug passa a ter sua própria URL canônica, em vez de product.html genérico).
function updateCanonicalUrl(slug) {
  const canonical = document.getElementById('canonicalLink');
  if (canonical) {
    canonical.href = `${SITE_URL}/product.html?slug=${slug}`;
  }
}

// Atualiza as meta tags Open Graph / Twitter Card com os dados do produto exibido.
function setMetaContent(id, value) {
  const el = document.getElementById(id);
  if (el && value !== undefined && value !== null) {
    el.setAttribute('content', String(value));
  }
}

// Atualiza, de forma sincronizada, todos os pontos de SEO/compartilhamento da PDP:
// <title>, <meta name="description">, Open Graph e Twitter Card.
// Title/description ficam idênticos em todos esses lugares para evitar o
// conflito de "canonical pré-JS" identificado em docs/search-console.md (§4.2).
function updateProductMetaTags(product, variant) {
  const price = Number(variant?.getPrimaryPrice?.() || variant?.price || product.getPrimaryPrice?.() || product.price || 0);
  const image = toAbsoluteUrl(product.gallery?.[0]) || DEFAULT_OG_IMAGE;
  const url = `${SITE_URL}/product.html?slug=${product.slug}`;
  const title = `${product.title} | Panos de Louça Premium | Tramatto`;
  const description = product.description;

  document.title = title;
  setMetaContent('pageDescription', description);

  setMetaContent('ogUrl', url);
  setMetaContent('ogTitle', title);
  setMetaContent('ogDescription', description);
  setMetaContent('ogImage', image);
  setMetaContent('ogBrand', product.brand);
  setMetaContent('ogAvailability', product.inStock ? 'in stock' : 'out of stock');
  setMetaContent('ogCondition', product.condition);
  setMetaContent('ogPriceAmount', price.toFixed(2));
  setMetaContent('twitterTitle', title);
  setMetaContent('twitterDescription', description);
  setMetaContent('twitterImage', image);
}

// Envia ao analytics.js os dados do produto exibido na PDP (evento view_product)
function dispatchViewProduct(product, variant) {
  document.dispatchEvent(new CustomEvent('tramatto:view_product', {
    detail: {
      item: {
        item_id: product.slug,
        item_name: product.title,
        item_brand: product.brand,
        item_category: product.googleProductCategory || product.productType || '',
        item_variant: variant?.name,
        price: variant?.getPrimaryPrice?.() || variant?.price || product.getPrimaryPrice?.() || product.price || 0,
        quantity: 1
      }
    }
  }));
}

// Mapeia o "condition" do feed (Merchant Center) para o vocabulário schema.org
const SCHEMA_CONDITION_MAP = {
  new: 'https://schema.org/NewCondition',
  refurbished: 'https://schema.org/RefurbishedCondition',
  used: 'https://schema.org/UsedCondition'
};

function injectProductSchema(product, variant) {
  const existingSchema = document.querySelector('script[data-schema="product"]');
  if (existingSchema) {
    existingSchema.remove();
  }

  const price = Number(variant?.getPrimaryPrice?.() || variant?.price || product.getPrimaryPrice?.() || product.price || 0);
  const images = (product.gallery?.length ? product.gallery : [product.image]).map(toAbsoluteUrl).filter(Boolean);
  const itemCondition = SCHEMA_CONDITION_MAP[product.condition] || SCHEMA_CONDITION_MAP.new;

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: images.length ? images : [DEFAULT_OG_IMAGE],
    sku: product.slug,
    mpn: product.slug.toUpperCase(),
    brand: { '@type': 'Brand', name: product.brand },
    category: product.googleProductCategory || product.productType || undefined,
    itemCondition,
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/product.html?slug=${product.slug}`,
      priceCurrency: product.currency || 'BRL',
      price,
      itemCondition,
      availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
    }
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: 'https://tramatto.com/' },
      { '@type': 'ListItem', position: 2, name: 'Coleção', item: 'https://tramatto.com/collection.html' },
      { '@type': 'ListItem', position: 3, name: product.title, item: `https://tramatto.com/product.html?slug=${product.slug}` }
    ]
  };

  const schemaScript = document.createElement('script');
  schemaScript.type = 'application/ld+json';
  schemaScript.dataset.schema = 'product';
  schemaScript.textContent = JSON.stringify(productSchema);
  document.head.appendChild(schemaScript);

  const breadcrumbScript = document.createElement('script');
  breadcrumbScript.type = 'application/ld+json';
  breadcrumbScript.dataset.schema = 'breadcrumb';
  breadcrumbScript.textContent = JSON.stringify(breadcrumbSchema);
  document.head.appendChild(breadcrumbScript);
}

function toggleMenu() {
  const menu = document.getElementById('mobileMenu');
  if (menu) {
    menu.classList.toggle('open');
  }
}

window.toggleMenu = toggleMenu;

window.addEventListener('DOMContentLoaded', async () => {
  await initializeStorefront();
});

// Exposto só para teste automatizado (tests/script-variant-selection.test.js)
// — no browser, `module` não existe, então este bloco nunca executa e o
// comportamento da página não muda em nada.
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { isSameVariantId };
}
