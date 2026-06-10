# Integração Nuvemshop — arquitetura definitiva

## Objetivo
Criar uma base de storefront pronta para consumir dados de produtos, coleções, estoque e carrinho de forma desacoplada da plataforma Nuvemshop, sem depender diretamente dela na camada de interface.

## Modelo de domínio
- Product: representa um produto da loja com preço, descrição, estoque, galeria, variantes e coleção.
- Variant: representa uma variação de produto, como cor, tamanho ou SKU.
- Collection: representa uma coleção de produtos, usada para agrupamento editorial e navegação.
- Cart: mantém items do carrinho, quantidade e contexto do cliente.
- Customer: armazena identificação mínima do comprador para o futuro checkout.

## Serviços
- CatalogService: acesso ao catálogo e coleções.
- ProductService: obtenção de detalhe de produto e geração de metadata SEO.
- CollectionService: listagem e agrupamento de coleções.
- CartService: adição, remoção, atualização de quantidade e persistência localStorage.

## Camada Nuvemshop
Os arquivos em integrations/nuvemshop/ encapsulam a comunicação futura com a plataforma e mantêm a aplicação isolada.

### Fluxo de catálogo
1. O storefront solicita produtos via CatalogService.
2. O adapter selecionado (MockAdapter ou NuvemshopAdapter) entrega os dados.
3. O mapper transforma o payload para o modelo de domínio.
4. A UI renderiza catálogo, coleção e detalhe.

### Fluxo de produto
1. O ProductService busca o produto por slug.
2. O produto retorna com variantes, preço promocional, estoque e galeria.
3. O renderizador exibe a seleção de variações e a página de produto com SEO.

### Fluxo de estoque
1. Cada variante carrega um valor de estoque.
2. O estado visual do produto reflete disponibilidade.
3. O fluxo pode evoluir para checagem em tempo real quando houver integração completa.

### Fluxo de variantes
1. Cada produto suporta cores, tamanhos e variações de SKU.
2. O adapter normaliza essas informações para o modelo Variant.
3. O cart e a interface usam a variante selecionada para composição do item.

### Fluxo de checkout
1. O carrinho é persistido localmente.
2. O checkout futuro pode consumir o mesmo serviço CartService e o adapter de checkout.
3. A integração com a Nuvemshop pode ser implementada sem reescrever a UI.
