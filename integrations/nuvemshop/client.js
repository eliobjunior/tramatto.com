(function (global) {
  const root = globalThis;

  // Cliente HTTP para o proxy próprio da Tramatto (ver proxy/README.md).
  // Nunca fala com api.nuvemshop.com.br diretamente e nunca envia (nem
  // recebe) access_token, client_secret ou header Authorization — isso
  // fica inteiramente do lado do proxy.
  const REQUEST_TIMEOUT_MS = 8000;

  // Extrai rel="next" do header Link (RFC 5988), como devolvido pelo proxy
  // (ver Access-Control-Expose-Headers em proxy/src/index.js). Confirmado
  // contra a resposta real: `<url>; rel="next", <url>; rel="last"`.
  function linkHasNext(linkHeader) {
    if (!linkHeader) return null;
    return linkHeader.split(',').some((part) => /rel="next"/.test(part));
  }

  function parseTotalCount(headerValue) {
    if (headerValue === null || headerValue === undefined) return null;
    const number = Number(headerValue);
    return Number.isFinite(number) ? number : null;
  }

  function createClient(options = {}) {
    const config = {
      proxyBaseUrl: options.apiBaseUrl || options.proxyBaseUrl || ''
    };

    async function proxyFetch(path, params = {}) {
      if (!config.proxyBaseUrl) {
        throw new Error('Tramatto: proxyBaseUrl não configurada para o NuvemshopAdapter (ver js/config.js).');
      }

      const url = new URL(path, config.proxyBaseUrl);
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.set(key, value);
        }
      });

      const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const timer = controller ? setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS) : null;

      let response;
      try {
        response = await fetch(url.toString(), controller ? { signal: controller.signal } : undefined);
      } catch (error) {
        // Rede fora do ar, timeout (AbortError) ou proxy inacessível — nunca
        // vaza detalhes internos, só sinaliza que essa página falhou.
        throw new Error(`Tramatto: falha ao contatar o proxy Nuvemshop para ${path} (${error.name || 'network_error'})`);
      } finally {
        if (timer) clearTimeout(timer);
      }

      if (!response.ok) {
        throw new Error(`Tramatto: proxy Nuvemshop respondeu ${response.status} para ${path}`);
      }

      let data;
      try {
        data = await response.json();
      } catch (error) {
        throw new Error(`Tramatto: resposta inválida do proxy Nuvemshop para ${path}`);
      }

      return {
        data,
        totalCount: parseTotalCount(response.headers.get('x-total-count')),
        // null = header Link ausente (proxy antigo/rota sem paginação) —
        // quem chama decide o fallback; nunca presumimos "sem próxima página".
        hasNextPage: linkHasNext(response.headers.get('link'))
      };
    }

    return {
      config,

      async getProductsPage({ page = 1, perPage = 30 } = {}) {
        const { data, totalCount, hasNextPage } = await proxyFetch('/products', { page, per_page: perPage });
        return {
          items: Array.isArray(data) ? data : [],
          totalCount,
          hasNextPage
        };
      },

      async getProductBySlug(slug) {
        const { data } = await proxyFetch('/products', { handle: slug, per_page: 1 });
        return Array.isArray(data) && data.length ? data[0] : null;
      },

      async getCategoriesPage({ page = 1, perPage = 30 } = {}) {
        const { data, totalCount, hasNextPage } = await proxyFetch('/categories', { page, per_page: perPage });
        return {
          items: Array.isArray(data) ? data : [],
          totalCount,
          hasNextPage
        };
      },

      // Carrinho/checkout ficam fora do escopo da Fase 1 (ver docs de
      // auditoria) — mantidos como stub para não quebrar o encadeamento
      // de NuvemshopAdapter, mas não são chamados pelo CartService hoje
      // (o carrinho continua 100% local em localStorage).
      async getCart() {
        return { items: [] };
      },
      async addToCart() {
        return { ok: true };
      },
      async removeFromCart() {
        return { ok: true };
      },
      async updateQuantity() {
        return { ok: true };
      }
    };
  }

  root.TramattoNuvemshop = {
    createClient
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = root.TramattoNuvemshop;
  }
})(typeof window !== 'undefined' ? window : globalThis);
