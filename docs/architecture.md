# Arquitetura do storefront Tramatto

## Visão geral
O projeto atual usa uma estrutura estática simples, com separação entre conteúdo, estilo e comportamento para facilitar a evolução para um fluxo de ecommerce mais completo.

## Estrutura principal
- index.html: entrada principal e hero da marca
- collection.html: página de catálogo
- product.html: página de detalhe de produto
- css/styles.css: camada visual compartilhada
- script.js: renderização dinâmica do catálogo e interações básicas
- catalog-data.js: dados locais de exemplo
- integrations/nuvemshop.js: abstração para consumo futuro do catálogo via Nuvemshop
- pages/: páginas institucionais e de atendimento

## Estratégia de evolução
1. Manter catálogo local como fallback.
2. Trocar ou complementar com dados vindos do Nuvemshop por meio da camada de integração.
3. Expandir para checkout, carrinho e pós-compra quando houver integração de ecommerce completa.
