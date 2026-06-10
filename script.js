let appState = null;
let currentProductSelection = null;

function escapeHTML(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
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
  const [products, collections] = await Promise.all([
    catalogService.getProducts(),
    collectionService.getCollections()
  ]);
  app.products = products;
  app.collections = collections;
  app.cartService = cartService;
  updateCartBadge();
  renderHomeProducts();
  renderCollectionPage();
  renderKits();
  renderProductDetail();
  renderCollections();
}

function updateCartBadge() {
  const app = getAppState();
  const cart = app?.services?.cartService?.getCart?.();
  const itemCount = cart?.getTotalItems?.() || 0;

  document.querySelectorAll('.nav-cart').forEach((link) => {
    link.innerHTML = `Sacola <span data-cart-badge>${itemCount}</span>`;
  });

  const cartStatus = document.getElementById('cartStatus');
  if (cartStatus) {
    cartStatus.textContent = itemCount > 0
      ? `${itemCount} item${itemCount > 1 ? 's' : ''} na sacola`
      : 'Sua sacola está vazia';
  }
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
  await app.services.cartService.addToCart(product, variant, 1);
  updateCartBadge();
  showToast(`${product.title} adicionado à sacola`);
}

function renderProducts(container, items = appState?.products || []) {
  if (!container) return;

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
    renderProducts(container, (appState?.products || []).slice(0, 4));
  }
}

function renderCollectionPage() {
  const container = document.getElementById('collectionProducts');
  if (container) {
    renderProducts(container, appState?.products || []);
  }
}

function renderKits() {
  const container = document.getElementById('kitsGrid');
  if (!container) return;

  const kits = window.catalogData?.kits || [];
  container.innerHTML = kits.map((kit) => `
    <div class="kit-card">
      <div class="kit-photo">
        <div class="photo-placeholder">
          <div class="photo-label" style="font-size:0.75rem;">
            ${escapeHTML(kit.label)}
            <small>${escapeHTML(kit.small)}</small>
          </div>
        </div>
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
  const galleryMarkup = (product.gallery || []).map((image, index) => `
    <img class="product-gallery-image ${index === 0 ? 'active' : ''}" src="${image || buildPlaceholderImage(product.title)}" alt="${escapeHTML(product.title)} ${index + 1}" />
  `).join('');
  const variantMarkup = (product.variants || []).map((variant) => `
    <button type="button" class="variant-option ${selectedVariant?.id === variant.id ? 'selected' : ''}" data-select-variant="${escapeHTML(variant.id)}">
      <span>${escapeHTML(variant.name)}</span>
      <small>${escapeHTML(variant.color || '')} ${escapeHTML(variant.size || '')}</small>
    </button>
  `).join('');

  container.innerHTML = `
    <div class="product-shell">
      <div class="product-media">
        <div class="product-gallery">${galleryMarkup}</div>
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
          <button type="button" class="btn-primary" data-add-to-cart="${escapeHTML(product.slug)}">Adicionar à sacola</button>
          <a href="collection.html" class="btn-secondary">Ver mais peças</a>
        </div>
      </div>
    </div>
  `;

  container.querySelectorAll('[data-select-variant]').forEach((button) => {
    button.addEventListener('click', () => {
      const variantId = button.getAttribute('data-select-variant');
      currentProductSelection = product.variants.find((variant) => variant.id === variantId) || product.variants[0] || null;
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

  injectProductSchema(product);
}

function injectProductSchema(product) {
  const existingSchema = document.querySelector('script[data-schema="product"]');
  if (existingSchema) {
    existingSchema.remove();
  }

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: product.gallery || [product.image],
    offers: {
      '@type': 'Offer',
      priceCurrency: 'BRL',
      price: product.getPrimaryPrice?.() || product.price || 0,
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
