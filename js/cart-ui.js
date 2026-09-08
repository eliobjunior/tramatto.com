(function (global) {
  const root = globalThis;

  const WHATSAPP_NUMBER = '5547991176648'; // mesmo número já usado no botão flutuante do site

  function formatPriceBRL(value) {
    const number = Number(value || 0);
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    }).format(number);
  }

  function getItemPrice(item) {
    return Number(item.price || item.variant?.getPrimaryPrice?.() || item.product?.getPrimaryPrice?.() || 0);
  }

  function getSubtotal(cart) {
    return (cart?.items || []).reduce((sum, item) => sum + getItemPrice(item) * Number(item.quantity || 0), 0);
  }

  function getTotalItems(cart) {
    return (cart?.items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  }

  // Monta a mensagem/URL de "Finalizar pelo WhatsApp" — ponte de checkout
  // provisória para carrinho com múltiplos itens/produtos distintos,
  // enquanto a integração NubeSDK (Fase 9-11, carrinho real da Nuvemshop)
  // não está validada. Não processa pagamento nenhum: só abre uma conversa
  // com a mensagem já preenchida; quem finaliza a venda é um humano do lado
  // da Tramatto. Já é a estratégia registrada em docs/master-roadmap.md
  // (#3) para destravar venda multi-item antes do checkout nativo.
  function buildWhatsAppCheckoutMessage(cart) {
    const items = cart?.items || [];
    if (!items.length) return '';

    const lines = items.map((item) => {
      const name = item.product?.title || 'Produto Tramatto';
      const variantName = item.variant?.name && item.variant.name !== 'Padrão' ? ` (${item.variant.name})` : '';
      const lineTotal = formatPriceBRL(getItemPrice(item) * Number(item.quantity || 0));
      return `- ${item.quantity}x ${name}${variantName} — ${lineTotal}`;
    });

    return [
      'Olá! Gostaria de finalizar esta compra na Tramatto:',
      '',
      ...lines,
      '',
      `Subtotal: ${formatPriceBRL(getSubtotal(cart))}`
    ].join('\n');
  }

  function buildWhatsAppCheckoutUrl(cart, { whatsappNumber = WHATSAPP_NUMBER } = {}) {
    const message = buildWhatsAppCheckoutMessage(cart);
    if (!message) return null;
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  }

  // Só monta o link de compra nativa da Nuvemshop quando o carrinho tem
  // exatamente UMA linha (um produto + variante) — é o único caso validado
  // (ver js/purchase.js e docs/nuvemshop-integration.md). Carrinho com mais
  // de uma linha nunca usa /comprar/ (proibido pela arquitetura do
  // projeto), só a ponte WhatsApp acima.
  function buildNativeBuyUrlForSingleItemCart(cart) {
    const items = cart?.items || [];
    if (items.length !== 1) return null;

    const [item] = items;
    const variantId = item.variant?.id ?? item.product?.variants?.[0]?.id;
    const environment = root.TramattoConfig?.resolveEnvironment?.(root.TramattoConfig.environment);
    const storeUrl = environment?.storeUrl;

    return root.TramattoPurchase?.buildBuyUrl?.({ storeUrl, variantId, quantity: item.quantity }) || null;
  }

  function escapeHTML(value = '') {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function createCartUI(cartService) {
    if (typeof document === 'undefined') {
      return null;
    }

    let overlay = document.getElementById('cartDrawerOverlay');
    let drawer = document.getElementById('cartDrawer');

    if (!drawer) {
      overlay = document.createElement('div');
      overlay.id = 'cartDrawerOverlay';
      overlay.className = 'cart-drawer-overlay';

      drawer = document.createElement('aside');
      drawer.id = 'cartDrawer';
      drawer.className = 'cart-drawer';
      drawer.setAttribute('role', 'dialog');
      drawer.setAttribute('aria-label', 'Sua sacola');
      drawer.innerHTML = `
        <div class="cart-drawer-header">
          <h2>Sua sacola</h2>
          <button type="button" class="cart-drawer-close" aria-label="Fechar sacola">&times;</button>
        </div>
        <div class="cart-drawer-items"></div>
        <div class="cart-drawer-footer">
          <div class="cart-drawer-subtotal">
            <span>Subtotal</span>
            <strong data-cart-subtotal>R$ 0,00</strong>
          </div>
          <a class="btn-primary cart-drawer-buy" data-cart-native-buy hidden>Comprar agora</a>
          <a class="btn-secondary cart-drawer-whatsapp" data-cart-whatsapp-buy target="_blank" rel="noopener">Finalizar pelo WhatsApp</a>
          <button type="button" class="btn-secondary cart-drawer-continue">Continuar comprando</button>
        </div>
      `;

      document.body.appendChild(overlay);
      document.body.appendChild(drawer);

      overlay.addEventListener('click', close);
      drawer.querySelector('.cart-drawer-close').addEventListener('click', close);
      drawer.querySelector('.cart-drawer-continue').addEventListener('click', close);
    }

    function render() {
      const cart = cartService.getCart();
      const itemsContainer = drawer.querySelector('.cart-drawer-items');
      const subtotalEl = drawer.querySelector('[data-cart-subtotal]');
      const nativeBuyLink = drawer.querySelector('[data-cart-native-buy]');
      const whatsappLink = drawer.querySelector('[data-cart-whatsapp-buy]');

      if (!cart.items.length) {
        itemsContainer.innerHTML = '<p class="cart-drawer-empty">Sua sacola está vazia.</p>';
      } else {
        itemsContainer.innerHTML = cart.items.map((item) => `
          <div class="cart-drawer-item" data-line-id="${escapeHTML(item.lineId)}">
            <div class="cart-drawer-item-image" style="background-image:url('${escapeHTML(item.product?.image || item.variant?.image || '')}')"></div>
            <div class="cart-drawer-item-info">
              <div class="cart-drawer-item-name">${escapeHTML(item.product?.title || 'Produto Tramatto')}</div>
              ${item.variant?.name && item.variant.name !== 'Padrão' ? `<div class="cart-drawer-item-variant">${escapeHTML(item.variant.name)}</div>` : ''}
              <div class="cart-drawer-item-price">${formatPriceBRL(getItemPrice(item))}</div>
              <div class="cart-drawer-item-qty">
                <button type="button" class="cart-qty-decrease" aria-label="Diminuir quantidade">-</button>
                <span>${item.quantity}</span>
                <button type="button" class="cart-qty-increase" aria-label="Aumentar quantidade">+</button>
              </div>
            </div>
            <button type="button" class="cart-drawer-item-remove" aria-label="Remover item">&times;</button>
          </div>
        `).join('');
      }

      subtotalEl.textContent = formatPriceBRL(getSubtotal(cart));

      const nativeBuyUrl = buildNativeBuyUrlForSingleItemCart(cart);
      if (nativeBuyUrl) {
        nativeBuyLink.href = nativeBuyUrl;
        nativeBuyLink.hidden = false;
      } else {
        nativeBuyLink.hidden = true;
      }

      const whatsappUrl = buildWhatsAppCheckoutUrl(cart);
      if (whatsappUrl) {
        whatsappLink.href = whatsappUrl;
        whatsappLink.classList.remove('is-disabled');
      } else {
        whatsappLink.href = '#';
        whatsappLink.classList.add('is-disabled');
      }
    }

    function open() {
      render();
      overlay.classList.add('visible');
      drawer.classList.add('open');
      document.body.classList.add('cart-drawer-locked');
    }

    function close() {
      overlay.classList.remove('visible');
      drawer.classList.remove('open');
      document.body.classList.remove('cart-drawer-locked');
    }

    async function handleItemsClick(event) {
      const itemRow = event.target.closest('.cart-drawer-item');
      if (!itemRow) return;
      const lineId = itemRow.getAttribute('data-line-id');
      const cart = cartService.getCart();
      const item = cart.items.find((entry) => entry.lineId === lineId);
      if (!item) return;

      if (event.target.closest('.cart-qty-increase')) {
        await cartService.updateQuantity(lineId, item.quantity + 1);
      } else if (event.target.closest('.cart-qty-decrease')) {
        await cartService.updateQuantity(lineId, item.quantity - 1);
      } else if (event.target.closest('.cart-drawer-item-remove')) {
        await cartService.removeFromCart(lineId);
      } else {
        return;
      }

      document.dispatchEvent(new CustomEvent('tramatto:cart-updated'));
      render();
    }

    drawer.querySelector('.cart-drawer-items').addEventListener('click', handleItemsClick);

    document.addEventListener('tramatto:cart-updated', () => {
      if (drawer.classList.contains('open')) render();
    });

    return { open, close, render };
  }

  function init(cartService) {
    if (typeof document === 'undefined') return null;

    const ui = createCartUI(cartService);
    if (!ui) return null;

    document.addEventListener('click', (event) => {
      const trigger = event.target.closest('[data-open-cart]');
      if (!trigger) return;
      event.preventDefault();
      ui.open();
    });

    return ui;
  }

  root.TramattoCartUI = {
    init,
    formatPriceBRL,
    getSubtotal,
    getTotalItems,
    buildWhatsAppCheckoutMessage,
    buildWhatsAppCheckoutUrl,
    buildNativeBuyUrlForSingleItemCart
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = root.TramattoCartUI;
  }
})(typeof window !== 'undefined' ? window : globalThis);
