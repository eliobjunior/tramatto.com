(function (global) {
  const root = globalThis;
  const mapper = root.TramattoNuvemshopMapper || {};

  const DEFAULT_PER_PAGE = 200; // limite máximo documentado pela API Nuvemshop
  const DEFAULT_MAX_PAGES = 20; // trava de segurança (até 4000 produtos)

  async function fetchProductsPage(client, { page = 1, perPage = DEFAULT_PER_PAGE } = {}) {
    const rawProducts = await client.getProductsPage({ page, perPage });
    return rawProducts.map((product) => mapper.mapProduct?.(product)).filter(Boolean);
  }

  // Percorre todas as páginas de produtos até a API devolver uma página
  // incompleta (sinal de que chegou ao fim) ou até o limite de segurança.
  async function fetchCatalog(client, { perPage = DEFAULT_PER_PAGE, maxPages = DEFAULT_MAX_PAGES } = {}) {
    const allProducts = [];

    for (let page = 1; page <= maxPages; page += 1) {
      const pageProducts = await fetchProductsPage(client, { page, perPage });
      allProducts.push(...pageProducts);
      if (pageProducts.length < perPage) break;
    }

    return allProducts;
  }

  async function fetchCategoriesPage(client, { page = 1, perPage = DEFAULT_PER_PAGE } = {}) {
    const rawCategories = await client.getCategoriesPage({ page, perPage });
    return rawCategories.map((category) => mapper.mapCollection?.(category)).filter(Boolean);
  }

  async function fetchCollections(client, { perPage = DEFAULT_PER_PAGE, maxPages = DEFAULT_MAX_PAGES } = {}) {
    const allCollections = [];

    for (let page = 1; page <= maxPages; page += 1) {
      const pageCollections = await fetchCategoriesPage(client, { page, perPage });
      allCollections.push(...pageCollections);
      if (pageCollections.length < perPage) break;
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
