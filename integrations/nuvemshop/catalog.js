(function (global) {
  const root = globalThis;
  const mapper = root.TramattoNuvemshopMapper || {};

  const DEFAULT_PER_PAGE = 200; // limite máximo documentado pela API Nuvemshop
  const DEFAULT_MAX_PAGES = 20; // trava de segurança (até 4000 produtos)

  async function fetchProductsPage(client, { page = 1, perPage = DEFAULT_PER_PAGE } = {}) {
    const { items, totalCount, hasNextPage } = await client.getProductsPage({ page, perPage });
    return {
      products: items.map((product) => mapper.mapProduct?.(product)).filter(Boolean),
      totalCount,
      hasNextPage
    };
  }

  // Nunca presume um total fixo de itens. Prioriza os headers devolvidos
  // pelo proxy (X-Total-Count / Link, ver proxy/src/index.js): para quando
  // o Link indica que não há próxima página, ou quando já recebemos
  // totalCount itens. Só cai para a heurística de "página incompleta" quando
  // o proxy não devolve nenhum dos dois headers (ex.: rota sem paginação).
  async function fetchCatalog(client, { perPage = DEFAULT_PER_PAGE, maxPages = DEFAULT_MAX_PAGES } = {}) {
    const allProducts = [];

    for (let page = 1; page <= maxPages; page += 1) {
      const { products, totalCount, hasNextPage } = await fetchProductsPage(client, { page, perPage });
      allProducts.push(...products);

      if (hasNextPage === false) break;
      if (hasNextPage === null && products.length < perPage) break;
      if (typeof totalCount === 'number' && allProducts.length >= totalCount) break;
    }

    return allProducts;
  }

  async function fetchCategoriesPage(client, { page = 1, perPage = DEFAULT_PER_PAGE } = {}) {
    const { items, totalCount, hasNextPage } = await client.getCategoriesPage({ page, perPage });
    return {
      collections: items.map((category) => mapper.mapCollection?.(category)).filter(Boolean),
      totalCount,
      hasNextPage
    };
  }

  async function fetchCollections(client, { perPage = DEFAULT_PER_PAGE, maxPages = DEFAULT_MAX_PAGES } = {}) {
    const allCollections = [];

    for (let page = 1; page <= maxPages; page += 1) {
      const { collections, totalCount, hasNextPage } = await fetchCategoriesPage(client, { page, perPage });
      allCollections.push(...collections);

      if (hasNextPage === false) break;
      if (hasNextPage === null && collections.length < perPage) break;
      if (typeof totalCount === 'number' && allCollections.length >= totalCount) break;
    }

    return allCollections;
  }

  root.TramattoNuvemshopCatalog = {
    fetchProductsPage,
    fetchCatalog,
    fetchCategoriesPage,
    fetchCollections
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = root.TramattoNuvemshopCatalog;
  }
})(typeof window !== 'undefined' ? window : globalThis);
