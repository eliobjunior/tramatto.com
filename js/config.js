(function (global) {
  const root = globalThis;
  // NUVEMSHOP_STORE_URL: domínio público da loja Nuvemshop da Tramatto —
  // não é segredo (é a própria URL da loja), usado só para montar o link
  // de "comprar" (ver js/purchase.js). Validado manualmente antes desta
  // configuração: https://tramatto.lojavirtualnuvem.com.br
  const NUVEMSHOP_STORE_URL = 'https://tramatto.lojavirtualnuvem.com.br';

  const environments = {
    development: {
      adapter: 'mock',
      apiBaseUrl: '',
      // Vazio de propósito: MockAdapter usa IDs fictícios que não existem
      // na loja real — js/purchase.js trata storeUrl vazio como "compra
      // indisponível neste ambiente" (ver Fase D do plano de integração).
      storeUrl: '',
      // cartTransferStoreUrl: loja demo/teste do fluxo NubeSDK (Fase 2B —
      // ver js/cart-ui.js/handleCheckoutClick e js/cart-transfer.js). Campo
      // isolado de `storeUrl` acima (fluxo antigo de 1 item) de propósito —
      // dev/teste continuam contra a loja demo mesmo com storeUrl vazio.
      cartTransferStoreUrl: 'https://tramattotestenubesdk.lojavirtualnuvem.com.br',
      debug: true
    },
    staging: {
      // Opção A aprovada: catálogo espelhado (nuvemshop-mirror-data.js),
      // gerado por scripts/sync-nuvemshop-mirror.js a partir só de páginas
      // públicas da loja — sem access_token, sem proxy, sem API privada.
      adapter: 'mirror',
      // apiBaseUrl do proxy (Fase 1) fica registrado, mas não é usado
      // enquanto o adapter for 'mirror' — ver proxy/README.md se algum dia
      // precisarmos reativar o NuvemshopAdapter.
      apiBaseUrl: 'https://tramatto-nuvemshop-proxy-staging.example.workers.dev',
      storeUrl: NUVEMSHOP_STORE_URL,
      // Ainda pré-produção: mantém o fluxo NubeSDK contra a loja demo/teste,
      // nunca a loja real (mesma lógica do development, ver comentário acima).
      cartTransferStoreUrl: 'https://tramattotestenubesdk.lojavirtualnuvem.com.br',
      debug: true
    },
    production: {
      // NuvemshopAdapter (API real via proxy) é a fonte de verdade do
      // catálogo em produção. MirrorAdapter permanece como fallback (ver
      // createAdapter) apenas para falha de rede/API — não é mais a fonte
      // primária (docs/nuvemshop-integration.md, seção "Migração").
      adapter: 'nuvemshop',
      apiBaseUrl: 'https://tramatto-nuvemshop-proxy.eliobj.workers.dev',
      storeUrl: NUVEMSHOP_STORE_URL,
      // Nunca a loja demo em produção — clientes reais só podem ser
      // redirecionados para a loja real da Nuvemshop (ver auditoria do
      // fluxo NubeSDK em docs/nuvemshop-integration.md).
      cartTransferStoreUrl: NUVEMSHOP_STORE_URL,
      debug: false
    }
  };

  function resolveEnvironment(environmentName) {
    return environments[environmentName] || environments.development;
  }

  // Sites estáticos sem build não têm variável de ambiente em runtime —
  // detectamos o ambiente pelo hostname. Qualquer host que não seja o
  // domínio de produção (localhost, previews, file://, etc.) continua no
  // MockAdapter, então dev/testes nunca dependem do proxy/Nuvemshop real.
  function detectEnvironment() {
    if (typeof window === 'undefined' || !window.location) {
      return 'development';
    }
    const host = window.location.hostname;
    if (host === 'tramatto.com' || host === 'www.tramatto.com') {
      return 'production';
    }
    return 'development';
  }

  function createAdapter(environmentName = 'development') {
    const environment = resolveEnvironment(environmentName);
    if (!root.TramattoAdapters) {
      throw new Error('Tramatto adapters were not loaded yet.');
    }

    if (environment.adapter === 'mirror') {
      return new root.TramattoAdapters.MirrorAdapter();
    }

    if (environment.adapter === 'nuvemshop') {
      const client = root.TramattoNuvemshop?.createClient?.({ apiBaseUrl: environment.apiBaseUrl });
      // MirrorAdapter como fallback: só é usado se getProducts/getCollections/
      // getProductBySlug/getCart do NuvemshopAdapter falharem por rede/API
      // (ver js/adapters.js) — nunca substitui o catálogo real com sucesso.
      const fallbackAdapter = new root.TramattoAdapters.MirrorAdapter();
      return new root.TramattoAdapters.NuvemshopAdapter(client, { fallbackAdapter });
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
    environment: detectEnvironment(),
    detectEnvironment,
    resolveEnvironment,
    createAdapter,
    createServices
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = root.TramattoConfig;
  }
})(typeof window !== 'undefined' ? window : globalThis);
