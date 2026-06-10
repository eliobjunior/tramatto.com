(function (global) {
  const root = globalThis;
  const environments = {
    development: {
      adapter: 'mock',
      apiBaseUrl: '',
      debug: true
    },
    staging: {
      adapter: 'nuvemshop',
      apiBaseUrl: 'https://api.nuvemshop.example',
      debug: true
    },
    production: {
      adapter: 'nuvemshop',
      apiBaseUrl: 'https://api.nuvemshop.example',
      debug: false
    }
  };

  function resolveEnvironment(environmentName) {
    return environments[environmentName] || environments.development;
  }

  function createAdapter(environmentName = 'development') {
    const environment = resolveEnvironment(environmentName);
    if (!root.TramattoAdapters) {
      throw new Error('Tramatto adapters were not loaded yet.');
    }

    if (environment.adapter === 'nuvemshop') {
      const client = root.TramattoNuvemshop?.createClient?.({ apiBaseUrl: environment.apiBaseUrl });
      return new root.TramattoAdapters.NuvemshopAdapter(client);
    }

    return new root.TramattoAdapters.MockAdapter();
  }

  function createServices(environmentName = 'development') {
    const adapter = createAdapter(environmentName);
    return {
      adapter,
      catalogService: new root.TramattoServices.CatalogService(adapter),
      productService: new root.TramattoServices.ProductService(adapter),
      collectionService: new root.TramattoServices.CollectionService(adapter),
      cartService: new root.TramattoServices.CartService(adapter)
    };
  }

  root.TramattoConfig = {
    environments,
    environment: 'development',
    resolveEnvironment,
    createAdapter,
    createServices
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = root.TramattoConfig;
  }
})(typeof window !== 'undefined' ? window : globalThis);
