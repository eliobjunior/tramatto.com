# Fluxo de integração com Nuvemshop

## Objetivo
Preparar o storefront para integrar produtos, estoques e informações comerciais a partir de uma fonte externa sem quebrar a experiência atual.

## Modelo recomendado
- O catálogo local continua ativo como fallback.
- A camada em integrations/nuvemshop.js encapsula o carregamento e o mapeamento dos dados.
- Em seguida, a interface usa esses dados para renderizar coleção e detalhes.

## Próximos passos
- Definir endpoint ou token da loja Nuvemshop.
- Mapear campos de produto para o modelo interno.
- Adicionar estado de estoque, preço promocional e variantes.
