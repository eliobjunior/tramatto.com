/**
 * Tramatto — Analytics Layer
 *
 * Camada central de tracking via window.dataLayer (Google Tag Manager / GA4).
 * Cada módulo abaixo é responsável por um único evento e está documentado
 * em analytics-events.md (evento, local de disparo, parâmetros, uso em GTM/GA4).
 *
 * Eventos cobertos:
 *   1. click_whatsapp
 *   2. click_instagram
 *   3. click_ver_colecao
 *   4. scroll_90
 *   5. view_collection
 *   6. view_product
 *   7. search
 *   8. select_item
 *   9. add_to_cart
 */
(function () {
  window.dataLayer = window.dataLayer || [];

  /** Envia um evento simples para o dataLayer. */
  function track(eventName, payload = {}) {
    window.dataLayer.push({ event: eventName, ...payload });
  }

  /**
   * Envia um evento de ecommerce, limpando o objeto "ecommerce" anterior
   * antes de empurrar o novo — recomendação oficial do GA4/GTM para evitar
   * que dados de eventos anteriores "vazem" para o evento atual.
   */
  function trackEcommerce(eventName, ecommerce, extra = {}) {
    window.dataLayer.push({ ecommerce: null });
    window.dataLayer.push({ event: eventName, ecommerce, ...extra });
  }

  /** Dados de contexto comuns a praticamente todos os eventos. */
  function getPageContext() {
    return {
      page_location: window.location.href,
      page_path: window.location.pathname,
      page_title: document.title
    };
  }

  /* ------------------------------------------------------------------ *
   * page_view — disparado uma vez quando a página termina de carregar.
   * ------------------------------------------------------------------ */
  function initPageView() {
    track('page_view', getPageContext());
  }

  /* ------------------------------------------------------------------ *
   * 1. click_whatsapp
   * Disparo: clique em qualquer link do WhatsApp (botão flutuante ou
   * links de contato com wa.me / api.whatsapp.com).
   * ------------------------------------------------------------------ */
  function initWhatsappTracking() {
    document.addEventListener('click', (event) => {
      const link = event.target.closest('a[href*="wa.me"], a[href*="api.whatsapp.com"], .whatsapp-float');
      if (!link) return;

      track('click_whatsapp', {
        link_url: link.href,
        link_text: link.textContent.trim() || link.getAttribute('aria-label') || 'WhatsApp',
        ...getPageContext()
      });
    });
  }

  /* ------------------------------------------------------------------ *
   * 2. click_instagram
   * Disparo: clique em qualquer link que aponte para instagram.com
   * (ex.: ícone "Instagram" no rodapé).
   * ------------------------------------------------------------------ */
  function initInstagramTracking() {
    document.addEventListener('click', (event) => {
      const link = event.target.closest('a[href*="instagram.com"]');
      if (!link) return;

      track('click_instagram', {
        link_url: link.href,
        link_text: link.textContent.trim() || 'Instagram',
        ...getPageContext()
      });
    });
  }

  /* ------------------------------------------------------------------ *
   * 3. click_ver_colecao
   * Disparo: clique em qualquer elemento marcado com
   * data-analytics-event="click_ver_colecao" (ex.: CTA "Ver a coleção"
   * no hero da home). O atributo é genérico e pode ser reaproveitado
   * para outros CTAs no futuro, bastando trocar o valor.
   * ------------------------------------------------------------------ */
  function initCtaTracking() {
    document.addEventListener('click', (event) => {
      const el = event.target.closest('[data-analytics-event]');
      if (!el) return;

      track(el.getAttribute('data-analytics-event'), {
        link_url: el.href || undefined,
        link_text: el.textContent.trim(),
        ...getPageContext()
      });
    });
  }

  /* ------------------------------------------------------------------ *
   * 4. scroll_90
   * Disparo: usuário rola a página até atingir 90% da altura total.
   * Disparado no máximo uma vez por carregamento de página.
   * ------------------------------------------------------------------ */
  function initScrollTracking() {
    let fired = false;

    function checkScroll() {
      if (fired) return;

      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;

      const percent = (scrollTop / docHeight) * 100;
      if (percent >= 90) {
        fired = true;
        track('scroll_90', { percent_scrolled: 90, ...getPageContext() });
        window.removeEventListener('scroll', checkScroll);
      }
    }

    window.addEventListener('scroll', checkScroll, { passive: true });
  }

  /* ------------------------------------------------------------------ *
   * 5. view_collection
   * Disparo: a grade de produtos da página de coleção termina de
   * renderizar. script.js emite o evento DOM customizado
   * "tramatto:view_collection" com a lista de itens exibidos.
   * ------------------------------------------------------------------ */
  function initViewCollectionTracking() {
    document.addEventListener('tramatto:view_collection', (event) => {
      const { currency, list_name, list_id, items = [] } = event.detail || {};

      trackEcommerce('view_collection', {
        currency,
        item_list_name: list_name,
        item_list_id: list_id,
        items
      }, getPageContext());
    });
  }

  /* ------------------------------------------------------------------ *
   * 6. view_product
   * Disparo: a página de produto termina de renderizar os detalhes do
   * produto selecionado. script.js emite o evento DOM customizado
   * "tramatto:view_product" com os dados do item.
   * ------------------------------------------------------------------ */
  function initViewProductTracking() {
    document.addEventListener('tramatto:view_product', (event) => {
      const { item } = event.detail || {};
      if (!item) return;

      trackEcommerce('view_product', {
        currency: 'BRL',
        value: item.price,
        items: [item]
      }, getPageContext());
    });
  }

  /* ------------------------------------------------------------------ *
   * 7. search
   * Disparo: usuário realiza uma busca por produtos. script.js emite o
   * evento DOM customizado "tramatto:search" com o termo buscado e a
   * quantidade de resultados encontrados.
   * ------------------------------------------------------------------ */
  function initSearchTracking() {
    document.addEventListener('tramatto:search', (event) => {
      const { search_term, results_count } = event.detail || {};
      if (!search_term) return;

      track('search', {
        search_term,
        results_count,
        ...getPageContext()
      });
    });
  }

  /* ------------------------------------------------------------------ *
   * 8. select_item
   * Disparo: clique no link de um card de produto para navegar para a
   * PDP. script.js emite o evento DOM customizado "tramatto:select_item"
   * com o produto selecionado, sua posição na grade e o contexto da lista.
   * ------------------------------------------------------------------ */
  function initSelectItemTracking() {
    document.addEventListener('tramatto:select_item', (event) => {
      const { list_name, list_id, item } = event.detail || {};
      if (!item) return;

      trackEcommerce('select_item', {
        item_list_name: list_name,
        item_list_id: list_id,
        items: [item]
      }, getPageContext());
    });
  }

  /* ------------------------------------------------------------------ *
   * 9. add_to_cart
   * Disparo: clique em "Adicionar" em qualquer ponto de entrada —
   * card na coleção, card na home, botão na PDP, kit. script.js emite o
   * evento DOM customizado "tramatto:add_to_cart" com o item e o valor.
   * ------------------------------------------------------------------ */
  function initAddToCartTracking() {
    document.addEventListener('tramatto:add_to_cart', (event) => {
      const { currency, value, item } = event.detail || {};
      if (!item) return;

      trackEcommerce('add_to_cart', {
        currency,
        value,
        items: [item]
      }, getPageContext());
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initPageView();
    initWhatsappTracking();
    initInstagramTracking();
    initCtaTracking();
    initScrollTracking();
    initViewCollectionTracking();
    initViewProductTracking();
    initSearchTracking();
    initSelectItemTracking();
    initAddToCartTracking();
  });

  // API pública — útil para debug no console ou extensões futuras.
  window.TramattoAnalytics = { track, trackEcommerce };
})();
