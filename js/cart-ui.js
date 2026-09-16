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

  // Mesmo padrão visual do placeholder usado em script.js (buildPlaceholderImage),
  // duplicado aqui de propósito: cart-ui.js roda como script solto sem módulos
  // (mesmo padrão já usado por formatPriceBRL/escapeHTML neste arquivo) e não
  // deve depender de script.js já ter carregado.
  function buildItemPlaceholder(label) {
    const markup = encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="250"><rect width="100%" height="100%" fill="#F5F0E8"/><text x="50%" y="50%" text-anchor="middle" font-family="Arial" font-size="13" fill="#9B6B4B">${label}</text></svg>`);
    return `data:image/svg+xml;charset=UTF-8,${markup}`;
  }

  function getItemAvailableStock(item) {
    if (item.stockManagement !== true) return Infinity;
    if (item.stock === '') return Infinity;
    return Number(item.stock) || 0;
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
      const name = item.name || item.product?.title || 'Produto Tramatto';
      const itemVariantName = item.variantName || item.variant?.name;
      const variantName = itemVariantName && itemVariantName !== 'Padrão' ? ` (${itemVariantName})` : '';
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
    if (item.unavailable || item.outOfStock) return null;
    const variantId = item.variantId ?? item.variant?.id ?? item.product?.variants?.[0]?.id;
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
          <button type="button" class="btn-primary cart-drawer-buy" data-cart-checkout hidden>Finalizar compra</button>
          <a class="btn-secondary cart-drawer-whatsapp" data-cart-whatsapp-buy target="_blank" rel="noopener">Finalizar pelo WhatsApp</a>
          <button type="button" class="btn-secondary cart-drawer-continue">Continuar comprando</button>
        </div>
      `;

      document.body.appendChild(overlay);
      document.body.appendChild(drawer);

      overlay.addEventListener('click', close);
      drawer.querySelector('.cart-drawer-close').addEventListener('click', close);
      drawer.querySelector('.cart-drawer-continue').addEventListener('click', close);
      drawer.querySelector('[data-cart-checkout]').addEventListener('click', handleCheckoutClick);
    }

    function render() {
      const cart = cartService.getCart();
      const itemsContainer = drawer.querySelector('.cart-drawer-items');
      const subtotalEl = drawer.querySelector('[data-cart-subtotal]');
      const checkoutButton = drawer.querySelector('[data-cart-checkout]');
      const whatsappLink = drawer.querySelector('[data-cart-whatsapp-buy]');

      if (!cart.items.length) {
        itemsContainer.innerHTML = '<p class="cart-drawer-empty">Sua sacola está vazia.</p>';
      } else {
        itemsContainer.innerHTML = cart.items.map((item) => {
          const name = item.name || item.product?.title || 'Produto Tramatto';
          const image = item.image || item.product?.image || item.variant?.image || buildItemPlaceholder(name);
          const availableStock = getItemAvailableStock(item);
          const atMaxStock = availableStock !== Infinity && item.quantity >= availableStock;
          const increaseDisabled = item.unavailable || item.outOfStock || atMaxStock;
          const rowClasses = ['cart-drawer-item'];
          if (item.unavailable) rowClasses.push('is-unavailable');
          else if (item.outOfStock) rowClasses.push('is-out-of-stock');

          let noticeHTML = '';
          if (item.unavailable) {
            noticeHTML = '<div class="cart-drawer-item-notice">Este produto não está mais disponível.</div>';
          } else if (item.outOfStock) {
            noticeHTML = '<div class="cart-drawer-item-notice">Sem estoque no momento.</div>';
          } else if (atMaxStock) {
            noticeHTML = '<div class="cart-drawer-item-notice">Quantidade máxima em estoque.</div>';
          }

          return `
          <div class="${rowClasses.join(' ')}" data-line-id="${escapeHTML(item.lineId)}">
            <div class="cart-drawer-item-image" style="background-image:url('${escapeHTML(image)}')"></div>
            <div class="cart-drawer-item-info">
              <div class="cart-drawer-item-name">${escapeHTML(name)}</div>
              ${item.variantName && item.variantName !== 'Padrão' ? `<div class="cart-drawer-item-variant">${escapeHTML(item.variantName)}</div>` : ''}
              <div class="cart-drawer-item-price">${formatPriceBRL(getItemPrice(item))}</div>
              <div class="cart-drawer-item-qty">
                <button type="button" class="cart-qty-decrease" aria-label="Diminuir quantidade">-</button>
                <span>${item.quantity}</span>
                <button type="button" class="cart-qty-increase" aria-label="Aumentar quantidade" ${increaseDisabled ? 'disabled aria-disabled="true"' : ''}>+</button>
              </div>
              ${noticeHTML}
            </div>
            <button type="button" class="cart-drawer-item-remove" aria-label="Remover item">&times;</button>
          </div>
        `;
        }).join('');
      }

      subtotalEl.textContent = formatPriceBRL(getSubtotal(cart));

      // Botão "Finalizar compra" (Fase 2B — cart-transfer/NubeSDK): visível
      // sempre que houver ao menos 1 item no carrinho, independente da
      // quantidade de linhas — substitui o antigo link nativo /comprar/,
      // que só funcionava para exatamente 1 linha (ver
      // buildNativeBuyUrlForSingleItemCart, mantida só para os testes e uso
      // futuro, não chamada mais aqui). A checagem real de itens
      // transferíveis (unavailable/outOfStock/IDs inválidos) acontece no
      // clique, em handleCheckoutClick — nunca aqui, para não duplicar a
      // lógica de js/cart-transfer.js.
      checkoutButton.hidden = cart.items.length === 0;

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

      const increaseButton = event.target.closest('.cart-qty-increase');
      if (increaseButton) {
        if (increaseButton.disabled) return;
        await cartService.updateQuantity(lineId, item.quantity + 1);
      } else if (event.target.closest('.cart-qty-decrease')) {
        await cartService.updateQuantity(lineId, item.quantity - 1);
      } else if (event.target.closest('.cart-drawer-item-remove')) {
        await cartService.removeFromCart(lineId);
      } else {
        return;
      }

      // updateCartBadge() (js/script.js) atualiza o contador do header E
      // dispara 'tramatto:cart-updated' — usamos ela em vez de só disparar o
      // evento para não deixar o badge do header dessincronizado quando o
      // carrinho muda pelo drawer (ver regra 6 da Fase 2A). Lookup tardio
      // (não capturado no topo do arquivo) porque script.js carrega depois
      // de cart-ui.js — mesmo motivo da correção em js/adapters.js.
      root.updateCartBadge?.();
      render();
    }

    // Fase 2B — clique em "Finalizar compra": pega os itens BRUTOS do
    // carrinho (cart.items, com unavailable/outOfStock) e delega a
    // filtragem/normalização/POST/redirect inteiras para
    // js/cart-transfer.js (TramattoCartTransfer.transferCartToNuvemshop) —
    // nunca duplica essa lógica aqui. Lookup tardio (não capturado no topo
    // do arquivo) pelo mesmo motivo já documentado para TramattoConfig
    // acima: cart-ui.js pode carregar antes de cart-transfer.js na página.
    async function handleCheckoutClick() {
      const checkoutButton = drawer.querySelector('[data-cart-checkout]');
      if (checkoutButton.disabled) return;

      checkoutButton.disabled = true;
      const cart = cartService.getCart();

      // cartTransferStoreUrl vem do ambiente atual (ver js/config.js) — nunca
      // hardcoded aqui, para que produção nunca resolva para a loja demo
      // (mesmo padrão de resolveEnvironment já usado em getBuyUrl/script.js).
      const environment = root.TramattoConfig?.resolveEnvironment?.(root.TramattoConfig.environment);
      const result = (await root.TramattoCartTransfer?.transferCartToNuvemshop?.(cart.items, { storeUrl: environment?.cartTransferStoreUrl }))
        || { ok: false, reason: 'cart_transfer_unavailable' };

      if (result.ok) {
        // Redirect real para a loja do ambiente atual — a página é
        // descartada em seguida, então não há necessidade de reabilitar o
        // botão neste caminho.
        root.location.href = result.redirectUrl;
        return;
      }

      checkoutButton.disabled = false;
      // Sem UI de erro dedicada ainda (fora do escopo desta etapa) — o
      // resultado tipado ({reason, error}) já está pronto para uma futura
      // mensagem visual; por enquanto só loga para não falhar em silêncio.
      console.warn('[Tramatto] checkout (cart-transfer) não concluído:', result.reason, result.error || '');
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
