let products = [];
let kits = [];
const CART_STORAGE_KEY = 'tramatto-cart-count';

function getStoredCartCount() {
  try {
    return Number(localStorage.getItem(CART_STORAGE_KEY) || '0');
  } catch (error) {
    return 0;
  }
}

let cartCount = getStoredCartCount();

function updateCartBadge() {
  const cartLinks = document.querySelectorAll('.nav-cart');
  cartLinks.forEach((link) => {
    link.textContent = `Sacola (${cartCount})`;
  });

  const cartStatus = document.getElementById('cartStatus');
  if (cartStatus) {
    cartStatus.textContent = cartCount > 0
      ? `${cartCount} item${cartCount > 1 ? 's' : ''} na sacola`
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

function addToCart(itemName) {
  cartCount += 1;
  try {
    localStorage.setItem(CART_STORAGE_KEY, String(cartCount));
  } catch (error) {
    console.warn('Cart storage unavailable', error);
  }
  updateCartBadge();
  showToast(`${itemName} adicionado à sacola`);
}

function renderProducts(container, items = products) {
  if (!container) return;

  container.innerHTML = items.map((product) => `
    <article class="product-card">
      <a href="product.html?slug=${product.slug}" class="product-card-link">
        <div class="product-img">
          <div class="photo-placeholder">
            <div class="photo-label" style="font-size:0.75rem;">
              ${product.label}
              <small>${product.small}</small>
            </div>
          </div>
          ${product.badge ? `<div class="product-badge">${product.badge}</div>` : ''}
        </div>
        <div class="product-name">${product.title}</div>
        <div class="product-variant">${product.variant}</div>
        <div class="product-price">${product.price}</div>
      </a>
      <div class="product-card-actions">
        <button type="button" class="btn-outline mini" data-add-to-cart="${product.title}">Adicionar</button>
      </div>
    </article>
  `).join('');

  container.querySelectorAll('[data-add-to-cart]').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      addToCart(button.getAttribute('data-add-to-cart'));
    });
  });
}

function renderKits() {
  const container = document.getElementById('kitsGrid');
  if (!container) return;

  container.innerHTML = kits.map((kit) => `
    <div class="kit-card">
      <div class="kit-photo">
        <div class="photo-placeholder">
          <div class="photo-label" style="font-size:0.75rem;">
            ${kit.label}
            <small>${kit.small}</small>
          </div>
        </div>
      </div>
      <div class="kit-content">
        <div class="kit-tag">${kit.tag}</div>
        <div class="kit-name">${kit.title}</div>
        <p class="kit-desc">${kit.description}</p>
        <div class="kit-price">${kit.price}</div>
        <button type="button" class="btn-outline" data-add-to-cart="${kit.title}">Adicionar à sacola</button>
      </div>
    </div>
  `).join('');

  container.querySelectorAll('[data-add-to-cart]').forEach((button) => {
    button.addEventListener('click', () => addToCart(button.getAttribute('data-add-to-cart')));
  });
}

function renderProductDetail() {
  const container = document.getElementById('productDetail');
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');
  const product = products.find((item) => item.slug === slug) || products[0];

  if (!product) {
    container.innerHTML = '<div class="collection-page"><p>Produto não encontrado.</p></div>';
    return;
  }

  container.innerHTML = `
    <div class="product-shell">
      <div class="product-media">
        <div class="photo-placeholder" style="min-height: 480px;">
          <div class="photo-label">
            ${product.label}
            <small>${product.small}</small>
          </div>
        </div>
      </div>
      <div class="product-info">
        <a href="collection.html" class="back-link">← Voltar à coleção</a>
        <div class="section-tag">Peça selecionada</div>
        <h1 class="product-detail-title">${product.title}</h1>
        <p class="product-detail-price">${product.price}</p>
        <p class="product-detail-description">${product.description}</p>
        <div class="product-highlights">
          ${product.highlights.map((item) => `<div class="detail-card">${item}</div>`).join('')}
        </div>
        <div class="product-actions">
          <button type="button" class="btn-primary" data-add-to-cart="${product.title}">Adicionar à sacola</button>
          <a href="collection.html" class="btn-secondary">Ver mais peças</a>
        </div>
      </div>
    </div>
  `;

  const addButton = container.querySelector('[data-add-to-cart]');
  if (addButton) {
    addButton.addEventListener('click', () => addToCart(addButton.getAttribute('data-add-to-cart')));
  }

  const schemaScript = document.createElement('script');
  schemaScript.type = 'application/ld+json';
  schemaScript.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'BRL',
      price: product.price.replace(/[R$.,]/g, '').trim(),
      availability: 'https://schema.org/InStock'
    }
  });

  const existingSchema = document.querySelector('script[type="application/ld+json"]');
  if (existingSchema) {
    existingSchema.remove();
  }
  document.head.appendChild(schemaScript);
}

async function loadCatalogData() {
  products = window.catalogData?.products || [];
  kits = window.catalogData?.kits || [];

  if (window.NUVEMSHOP_PRODUCTS_URL) {
    try {
      const response = await fetch(window.NUVEMSHOP_PRODUCTS_URL);
      if (response.ok) {
        const payload = await response.json();
        if (Array.isArray(payload.products) && payload.products.length) {
          products = payload.products;
        }
      }
    } catch (error) {
      console.warn('Nuvemshop catalog unavailable, using local data.', error);
    }
  }
}

function toggleMenu() {
  const menu = document.getElementById('mobileMenu');
  if (menu) {
    menu.classList.toggle('open');
  }
}

window.toggleMenu = toggleMenu;

window.addEventListener('DOMContentLoaded', async () => {
  await loadCatalogData();
  updateCartBadge();

  const indexProducts = document.getElementById('productsGrid');
  if (indexProducts) {
    renderProducts(indexProducts);
  }

  const collectionProducts = document.getElementById('collectionProducts');
  if (collectionProducts) {
    renderProducts(collectionProducts);
  }

  const kitsGrid = document.getElementById('kitsGrid');
  if (kitsGrid) {
    renderKits();
  }

  renderProductDetail();
});
