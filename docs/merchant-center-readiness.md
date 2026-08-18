# Google Merchant Center Readiness — Tramatto
**Data:** 2026-06-16  
**Premissa central:** não existem produtos reais ainda (imagens, preços, GTINs e descrições são placeholders). Este documento é um plano de aprovação futura, não uma checagem de prontidão imediata.  
**Documentos anteriores de referência:** [merchant-center.md](merchant-center.md) (auditoria inicial, score 44/100) · [merchant-center-phase1.md](merchant-center-phase1.md) (implementação Fase 1, score ~78/100)

---

## Estado atual (pós-Fase 1)

A Fase 1 de implementação entregou a infraestrutura técnica completa para o feed:

| Categoria | Score anterior | Score atual | O que mudou |
|---|:---:|:---:|---|
| Dados básicos (title, description, price, brand, condition, availability) | 16/20 | 20/20 | `brand` e `condition` adicionados ao catálogo |
| Categorização (`google_product_category`, `product_type`) | 0/10 | 9/10 | Ambos preenchidos nos 4 produtos |
| Imagens (`image_link` + `additional_image_link`) | 6/15 | 6/15 | Sem mudança — ainda 1 imagem por produto |
| Identificadores únicos (GTIN / MPN / `identifier_exists`) | 0/10 | 4/10 | `mpn` e `brand` no schema; sem GTIN real |
| Product Schema (JSON-LD) | 5/10 | 9/10 | `sku`, `mpn`, `brand`, `category`, `itemCondition`, URLs absolutas |
| Open Graph | 3/10 | 9/10 | OG dinâmico por produto; `collection.html` agora tem OG |
| Canonical correto por produto | 2/10 | 9/10 | Canonical dinâmico via JS por slug |
| URLs indexáveis / sitemap | 2/10 | 7/10 | `sitemap-products.xml` com os 4 slugs |
| Políticas (frete, devolução, dados empresa) | 6/10 | 6/10 | CNPJ/endereço ainda ausentes |
| Tracking (GA4/GTM) | 4/5 | 4/5 | Sem mudança nesta fase |
| **Total** | **44/100** | **83/100** | **+39 pontos** |

**O que bloqueia os 17 pontos restantes:** imagens adicionais (−9), identificadores reais (−6), dados da empresa (−2). Os três dependem de decisões/ações fora do código — não de implementação técnica.

**Nota: o score de 83 pressupõe produtos reais.** Com dados placeholder (imagens de stock, preços genéricos, descrições curtas), o Google provavelmente vai desaprovar itens por qualidade. O score real com os produtos atuais é mais próximo de 60–65.

---

## 1. Google Product Category

### Estado atual
Todos os 4 produtos têm:
```
googleProductCategory: "Home & Garden > Kitchen & Dining > Kitchen & Dining Linens > Dish Towels"
```
Definido em `catalog-data.js`, propagado para `domain-model.js` e para o Product schema via `injectProductSchema()`.

### Análise
O Google Merchant Center aceita tanto o nome textual quanto o ID numérico da taxonomia. O nome textual está correto para panos de prato, mas tem um risco: **a taxonomia é atualizada periodicamente** e nomes podem mudar. O ID numérico é imutável.

| Forma | Vantagem | Risco |
|---|---|---|
| Texto (`"Home & Garden > ..."`) | Legível, fácil de auditar | Pode desatualizar com updates da taxonomia |
| ID numérico (ex.: `4171`) | Estável, sem ambiguidade | Menos legível |

**Taxonomia a validar:**  
`https://www.google.com/basepages/producttype/taxonomy-with-ids.en-US.txt`  
Procurar por: `Dish Towels` → anotar o ID e adicionar campo `googleProductCategoryId` em `catalog-data.js`.

### Ação antes de submeter
1. Acessar o arquivo de taxonomia acima e confirmar o ID numérico de "Dish Towels"
2. Adicionar `googleProductCategoryId: [número]` em cada produto no `catalog-data.js`
3. No feed, usar o ID numérico no campo `google_product_category` (mais seguro que texto)

### Nota sobre kits
Os kits (`Cozinha Clássica`, `Presente Especial`, etc.) não têm `slug` nem página própria — não devem entrar no feed do Merchant Center até terem PDP indexável e preço por item declarado. Roadmap #8 e #18 são pré-requisitos.

---

## 2. GTIN (Global Trade Item Number)

### Estado atual
- Nenhum produto tem GTIN cadastrado em `catalog-data.js`
- Feed atual declara: `identifier_exists: no` para todos os produtos
- Schema JSON-LD não tem campo `gtin`

### O que é GTIN e quando é exigido
GTIN é o código de barras padronizado internacionalmente (EAN-13, UPC-A, etc.). O Google **exige** GTIN para produtos que já existem no catálogo global (ex.: marcas conhecidas com código de barras no mercado). Para produtos de marca própria sem registro GS1, o Google aceita:

```
identifier_exists: no
brand: [nome da marca]
mpn: [part number interno]
```

Desde que a **marca seja reconhecível** e o produto seja genuinamente sem GTIN registrado, essa declaração é suficiente para aprovação. O Google pode exibir um aviso ("Identificador único ausente") mas não necessariamente desaprova o item.

### Cenários futuros

**Cenário A — Sem GTIN (curto prazo)**  
Manter `identifier_exists: no`. Aceitável enquanto os produtos não tiverem código de barras físico. O Google tende a aprovar marcas emergentes de marca própria sem GTIN, especialmente em categorias como artigos de casa.

**Cenário B — Com GTIN (médio prazo, recomendado)**  
Ao ter embalagem física e volume de produção, registrar no **GS1 Brasil** (https://www.gs1brasil.org.br) para obter prefixo da empresa e gerar GTINs válidos.
- Custo: faixa de R$ 400–2.000/ano dependendo da faixa de faturamento
- Benefício: produtos elegíveis para "Product listings gratuitos" do Google e para Shopping Ads com prioridade maior
- Implementação: adicionar campo `gtin` em `catalog-data.js` e no Product schema (`"gtin13"` no schema.org)

### Ação antes de submeter
- **Agora:** manter `identifier_exists: no` + confirmar que `brand: "Tramatto"` e `mpn: [slug]` estão presentes no feed (já estão)
- **Quando houver produto físico:** avaliar registro GS1 Brasil

---

## 3. MPN (Manufacturer Part Number)

### Estado atual
```js
// script.js — injectProductSchema()
mpn: product.slug.toUpperCase()
// Exemplo: "LINHO-ANATOLIANO"
```
Campo `mpn` presente no Product schema. **Não está no feed TSV** — precisa ser adicionado.

### Análise
Usar o `slug` como MPN é uma prática legítima e aceita pelo Google para marcas próprias sem sistema de SKU formal. Funciona como identificador interno estável.

**Problema:** o slug é em português e inclui hífens. O Google não rejeita isso, mas o formato convencional de MPN é alfanumérico sem hífens especiais.

### Sistema de MPN recomendado para lançamento real

Ao lançar os produtos reais, adotar um padrão de MPN estruturado:

```
TRM-[COLEÇÃO]-[NÚMERO SEQUENCIAL]
```

| Produto | Coleção | MPN sugerido |
|---|---|---|
| Linho Anatoliano | Essentials | `TRM-ESS-001` |
| Borda Dourada | Signature | `TRM-SIG-001` |
| Listrado Clássico | Essentials | `TRM-ESS-002` |
| Jacquard Ottomano | Signature | `TRM-SIG-002` |

Por variante (quando houver feed por variante):

```
TRM-ESS-001-BRN-45   → Linho Anatoliano, Branco natural, 45×70cm
TRM-ESS-001-ARE-45   → Linho Anatoliano, Areia, 45×70cm
TRM-ESS-001-BRN-60   → Linho Anatoliano, Branco natural, 60×90cm
```

### Ação antes de submeter
1. Definir o sistema de MPN (slug atual ou novo padrão `TRM-XXX-NNN`)
2. Adicionar `mpn` como coluna explícita no feed TSV (hoje só está no JSON-LD)
3. Atualizar `catalog-data.js` com o campo `mpn` por produto (hoje o schema usa `slug.toUpperCase()` em tempo de execução)

---

## 4. Brand

### Estado atual
✅ **Implementado e correto.**

```js
// catalog-data.js (todos os produtos)
brand: 'Tramatto'

// domain-model.js
this.brand = data.brand || 'Tramatto'  // fallback seguro

// script.js — Product schema
brand: { '@type': 'Brand', name: product.brand }

// Feed TSV
brand: Tramatto
```

### Ponto de atenção
Quando a marca for registrada oficialmente (INPI), confirmar que o nome no Merchant Center bate exatamente com a denominação legal. O Google pode fazer verificação da marca, especialmente se houver anúncios pagos.

### Ação antes de submeter
- Nenhuma alteração técnica necessária
- Confirmar que "Tramatto" é a grafia oficial da marca (sem acento, sem variações)

---

## 5. Product Schema (JSON-LD)

### Estado atual
O Product schema é injetado dinamicamente por `injectProductSchema()` em `script.js` após o catálogo carregar. Campos presentes:

| Campo schema.org | Valor | Status |
|---|---|---|
| `@type` | `Product` | ✅ |
| `name` | `product.title` | ✅ |
| `description` | `product.description` | ✅ (curta) |
| `image` | array de URLs absolutas | ✅ |
| `sku` | `product.slug` | ✅ |
| `mpn` | `product.slug.toUpperCase()` | ✅ |
| `brand.name` | `product.brand` | ✅ |
| `category` | `googleProductCategory` | ✅ |
| `itemCondition` | mapeado via `SCHEMA_CONDITION_MAP` | ✅ |
| `offers.price` | numérico (após `parsePrice`) | ✅ |
| `offers.priceCurrency` | `"BRL"` | ✅ |
| `offers.availability` | `InStock`/`OutOfStock` | ✅ |
| `offers.url` | URL canônica por slug | ✅ |
| `gtin` / `gtin13` | — | ❌ ausente |
| `material` | — | ❌ ausente |
| `weight` | — | ❌ ausente |
| `color` | — | ❌ ausente |
| `size` | — | ❌ ausente |
| `aggregateRating` | — | ❌ (sem reviews ainda) |

### Limitação arquitetural
O schema é **client-side only** — injetado via JavaScript após o catálogo ser carregado. O Googlebot executa JavaScript (renderização em segunda onda), mas com latência. O feed é a fonte de verdade para o Merchant Center; o schema.org é complementar para rich results orgânicos.

### Campos a adicionar quando houver produtos reais
```js
// Adicionar em injectProductSchema() — exemplos de valores reais
material: 'Algodão egípcio',
color: variant.color,        // 'Branco natural', 'Areia', etc.
size: variant.size,          // '45×70cm', '60×90cm'
weight: {
  '@type': 'QuantitativeValue',
  value: 0.15,               // kg por unidade (a confirmar com fabricante)
  unitCode: 'KGM'
}
```

### Ação antes de submeter
1. Quando produtos reais existirem, adicionar `material`, `color`, `size`, `weight` ao schema
2. Quando houver GTINs, adicionar `gtin13: product.gtin` (ou `gtin8`/`gtin14` conforme o caso)
3. Quando houver avaliações, adicionar `aggregateRating` (via integração com plataforma de reviews)
4. Validar no [Rich Results Test](https://search.google.com/test/rich-results) após cada publicação

---

## 6. Availability (Disponibilidade)

### Estado atual
```js
// catalog-data.js
inStock: true   // linho-anatoliano, borda-dourada, listrado-classico
inStock: false  // jacquard-ottomano

// domain-model.js
this.inStock = data.inStock !== undefined ? data.inStock : true

// script.js
offers.availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'

// Feed TSV
availability: "in stock" | "out of stock"
```

### Valores aceitos pelo Merchant Center
| Valor no feed | Quando usar |
|---|---|
| `in stock` | Produto disponível para entrega imediata |
| `out of stock` | Produto esgotado |
| `preorder` | Produto ainda não lançado, aceitando pedidos |
| `backorder` | Produto esgotado mas aceitando pedidos futuros |

### Regra crítica do Merchant Center
**O preço e a disponibilidade no feed devem ser idênticos ao que aparece na página do produto no momento da revisão pelo Google.** Se o feed diz `in stock` mas a página não tem botão de compra ou mostra "esgotado", o item é desaprovado.

### Ação antes de submeter
1. Quando os produtos reais chegarem, garantir que o feed reflete o estoque real
2. Se houver variantes com disponibilidade diferente (ex.: 60×90cm esgotado, 45×70cm disponível), cada variante precisa de linha própria no feed com sua disponibilidade
3. Configurar atualização do feed com a mesma frequência de atualização do estoque
4. Avaliar `preorder` para produtos ainda não em estoque no lançamento

---

## 7. Price (Preço)

### Estado atual
```
Fonte: catalog-data.js → price: 'R$ 120,00'
Processado: parsePrice() em js/adapters.js → 120
Feed: "120.00 BRL"
Schema: offers.price = 120 (numérico)
```

O parsePrice converte corretamente: `'R$ 120,00'` → remove `R$`, `.` de milhar → substitui `,` por `.` → `Number('120.00')` = `120`. ✅

### Requisitos de formato do feed
```
# Correto
price: 120.00 BRL

# Errado — não incluir símbolo de moeda
price: R$ 120,00

# Errado — separador decimal deve ser ponto
price: 120,00 BRL
```

### Preço por variante
**Lacuna atual:** os 4 produtos têm um único preço (`R$ 120,00`) para todas as variantes. Quando os produtos reais chegarem, variantes de tamanho maior (60×90cm) provavelmente terão preço diferente.

Neste caso, cada variante precisa de:
- Linha própria no feed com seu `id`, `price` e `item_group_id`
- Variante própria em `catalog-data.js` com campo `price` numérico diferente

### Preço promocional
O campo `promotionalPrice` já existe no domain model e no `parsePrice`. Quando houver promoções:
```
# No feed, adicionar coluna:
sale_price: 90.00 BRL
sale_price_effective_date: 2026-11-28T00:00-03:00/2026-11-30T23:59-03:00
```

### Ação antes de submeter
1. Confirmar preços reais por variante (especialmente 45×70cm vs. 60×90cm)
2. Se preços diferirem por variante, criar entradas separadas no feed por variante
3. Verificar que o preço exibido na PDP bate com o preço no feed (regra crítica do GMC)

---

## 8. Image Requirements (Requisitos de Imagem)

### Estado atual
```
Imagens em: assets/images/
- produto-linho-anatoliano.jpg  → 1 imagem
- produto-borda-dourada.jpg     → 1 imagem
- produto-listrado-classico.jpg → 1 imagem
- produto-jacquard-ottomano.jpg → 1 imagem

additional_image_link: vazio em todos os produtos
```

### Requisitos técnicos do Merchant Center

| Parâmetro | Mínimo obrigatório | Recomendado |
|---|---|---|
| Resolução | 100×100px | 800×800px ou maior |
| Resolução máxima | — | 64 megapixels |
| Formato | JPG, PNG, GIF, WebP | JPG ou WebP |
| Tamanho do arquivo | — | < 16 MB |
| Background | Qualquer | Branco puro (#FFFFFF) ou neutro |
| URL | Acessível publicamente (sem login) | HTTPS |
| Conteúdo proibido | Marcas d'água, texto de promoção, bordas decorativas | — |

### Requisitos de conteúdo (regras de qualidade)

| ✅ Permitido | ❌ Proibido |
|---|---|
| Produto sozinho em fundo neutro | Texto sobre a imagem ("Promoção", "Frete Grátis") |
| Produto em uso / lifestyle | Placeholders ou imagens de baixa qualidade |
| Múltiplos ângulos do mesmo produto | Imagens de produtos similares em vez do produto real |
| Embalagem do produto | Imagens de coleção/grupo como imagem principal |
| Detalhe do tecido | Marcas d'água |

### Estratégia de imagens por produto (quando houver sessão de fotos)

Para cada produto, o feed deve ter:

```
image_link: [imagem principal — produto sobre fundo branco, vista frontal]
additional_image_link: [imagem 2 — detalhe do tecido/bordado]
additional_image_link: [imagem 3 — produto em uso / lifestyle (cozinha)]
additional_image_link: [imagem 4 — embalagem ou kit]
```

O Google permite até 10 `additional_image_link` por produto. Quanto mais, maior a chance de aparecer em formatos de anúncio visual (Showcase, Performance Max).

### Pré-requisito: sessão de fotos própria (Roadmap #16)
As imagens atuais (`assets/images/`) provavelmente são ilustrativas / stock. Antes de submeter ao Merchant Center, é necessária uma sessão de fotos real com:
- Fundo branco para imagem principal
- Fotos de lifestyle em cozinha real
- Close no padrão/textura do tecido
- Foto dobrado/empilhado (como enviado)

---

## 9. Feed Requirements (Requisitos do Feed)

### Estado atual
```
docs/merchant-center-feed-sample.tsv — amostra estática, 4 linhas, 1 por produto
Não está publicado em URL acessível
```

### Colunas do feed atual

| Coluna | Presente | Obrigatório |
|---|:---:|:---:|
| `id` | ✅ | Obrigatório |
| `title` | ✅ | Obrigatório |
| `description` | ✅ | Obrigatório |
| `link` | ✅ | Obrigatório |
| `image_link` | ✅ | Obrigatório |
| `additional_image_link` | ✅ (vazio) | Recomendado |
| `availability` | ✅ | Obrigatório |
| `price` | ✅ | Obrigatório |
| `brand` | ✅ | Obrigatório |
| `condition` | ✅ | Obrigatório |
| `google_product_category` | ✅ | Obrigatório/Forte recomendação |
| `product_type` | ✅ | Recomendado |
| `identifier_exists` | ✅ (`no`) | Condicional |
| `mpn` | ❌ | Condicional (recomendado) |
| `item_group_id` | ❌ | Obrigatório p/ variantes |
| `color` | ❌ | Obrigatório p/ variantes de cor |
| `size` | ❌ | Obrigatório p/ variantes de tamanho |
| `material` | ❌ | Recomendado |
| `sale_price` | ❌ | Quando houver promoção |
| `shipping` | ❌ | Configurar na conta |
| `custom_label_0` | ❌ | Opcional (útil para campanhas) |

### Feed com variantes (lacuna crítica)

O feed atual tem **1 linha por produto**. O Merchant Center espera **1 linha por variante** quando o produto tem opções de cor ou tamanho. As linhas de variante compartilham o mesmo `item_group_id` e diferem nos campos de variante.

**Estrutura correta para "Linho Anatoliano" (2 cores × 2 tamanhos = 4 variantes):**

```tsv
id              item_group_id       color          size     price      availability
linho-branco-45 linho-anatoliano    Branco natural 45×70cm  120.00 BRL in stock
linho-areia-45  linho-anatoliano    Areia          45×70cm  120.00 BRL in stock
linho-branco-60 linho-anatoliano    Branco natural 60×90cm  150.00 BRL in stock
linho-areia-60  linho-anatoliano    Areia          60×90cm  150.00 BRL in stock
```

O `link` de cada variante pode ser o mesmo (URL do produto com slug), já que o seletor de variante é na página. O `id` por variante deve ser estável e único.

### Publicação do feed

**Opção A — Arquivo estático (curto prazo)**  
Criar script Node simples que lê `catalog-data.js` e gera `public/feeds/products.tsv` publicado com o site. Configurar no Merchant Center como "busca agendada" (daily).

```
URL: https://tramatto.com/feeds/products.tsv
Atualização: diária às 03:00 (cron/build trigger)
```

**Opção B — Content API (médio prazo, após Nuvemshop real)**  
Quando a integração Nuvemshop estiver ativa (Roadmap #19-20), usar a Content API for Shopping para atualizações em tempo real.

**Recomendação:** Opção A para o lançamento; Opção B após integração Nuvemshop.

### Qualidade das descrições (bloqueador de aprovação)

As descrições atuais têm 1 frase (~80-150 caracteres). O Google recomenda 500–1000 caracteres de texto rico em informações de produto.

**Descrição atual (insuficiente):**
```
"Um tecido leve e sofisticado, pensado para quem valoriza textura, durabilidade 
e presença em cada detalhe da cozinha."
```

**Descrição ideal para o feed (com produto real):**
```
Pano de prato Tramatto Linho Anatoliano, confeccionado em algodão egípcio de 
fibra longa, proveniente das tecelagens tradicionais da Anatólia, Turquia. 
Acabamento artesanal à mão com bainha dupla nas bordas. Altamente absorvente 
e de secagem rápida, ideal para uso diário em cozinhas domésticas ou 
profissionais. Dimensões: 45 cm × 70 cm. Peso: 150g por unidade. Composição: 
100% algodão. Instrução de lavagem: máquina até 40°C, não usar alvejante, 
secar à sombra. Disponível em Branco natural, Areia e Linho. Embalagem: 
envelope de tecido com acabamento natural. Produzido na Turquia, importado 
e distribuído pela Tramatto (Brasil).
```

---

## 10. Pré-requisitos de Conta (bloqueantes, não técnicos)

Nenhum desses itens é técnico — todos dependem de decisões operacionais. Sem eles, a conta não é verificada pelo Google.

| Requisito | Status | Ação |
|---|:---:|---|
| CNPJ e razão social no site | ❌ | Adicionar no rodapé e em `pages/privacy.html` ou `pages/terms.html` |
| Endereço físico ou fiscal no site | ❌ | Adicionar no rodapé + `pages/contact.html` |
| Política de devolução/reembolso acessível | ✅ | `pages/shipping.html` tem política de 30 dias |
| Link para política de devolução no rodapé de todas as páginas | ❌ | Adicionar link `pages/shipping.html` como "Trocas e devoluções" no rodapé |
| Política de privacidade acessível | ✅ | `pages/privacy.html` existe |
| Domínio verificado no Google Search Console | ❌ | Ver `docs/search-console-readiness.md` |
| Conta Merchant Center vinculada ao Search Console | ❌ | Após verificar o domínio |
| Frete configurado na conta | ❌ | Configurar em Merchant Center → Configurações → Envio (mais simples que no feed para catálogo pequeno) |
| Configuração de impostos (se exigido) | N/A | Para vendas no Brasil via plataforma, geralmente gerenciado pela Nuvemshop |

**Item #4 do Roadmap (CNPJ/endereço) é pré-requisito absoluto.** O Google verifica manualmente a identidade da empresa durante a aprovação da conta.

---

## 11. Títulos de produto (otimização crítica para Shopping)

### Estado atual
```
"Linho Anatoliano"           (17 chars)
"Borda Dourada"              (13 chars)
"Listrado Clássico"          (18 chars)
"Jacquard Ottomano"          (18 chars)
```

### Padrão recomendado pelo Google para artigos de casa (Home & Garden)
```
[Nome do produto] + [Material] + [Dimensão/Tamanho] [Cor (se relevante)]
```

**Títulos otimizados:**
```
"Pano de Prato Linho Anatoliano Algodão Egípcio 45×70cm Branco natural"
"Pano de Prato Borda Dourada Algodão 45×70cm Areia"
"Pano de Prato Listrado Clássico 45×70cm Branco e Terracota"
"Pano de Prato Jacquard Ottomano Algodão 45×70cm Creme"
```

No feed, o campo `title` é independente do `name` exibido no site — pode (e deve) ser mais descritivo.

---

## 12. Checklist de Aprovação — Completo

### Pré-requisitos de conta
- [ ] CNPJ e razão social publicados no site (rodapé + políticas)
- [ ] Endereço físico/fiscal publicado no site
- [ ] Link "Trocas e devoluções" no rodapé de todas as páginas
- [ ] Domínio `tramatto.com` verificado no Google Search Console
- [ ] Conta Google Merchant Center criada e vinculada ao Search Console
- [ ] Frete configurado na conta Merchant Center (Configurações → Envio)

### Catálogo e dados do produto
- [ ] Produtos reais com imagens próprias (sessão de fotos — Roadmap #16)
- [ ] Imagem principal de cada produto: fundo neutro/branco, mín. 800×800px, sem texto
- [ ] Imagens adicionais por produto (detalhe, lifestyle, embalagem): mínimo 2 por produto
- [ ] Títulos enriquecidos no feed com material e dimensão
- [ ] Descrições de 500+ caracteres com: material, dimensões, composição, cuidados, origem
- [ ] Preços reais confirmados (por variante, se houver diferença de tamanho/cor)
- [ ] Estoque real refletido em `inStock` por produto/variante

### Identificadores
- [ ] `identifier_exists: no` confirmado (ou GTINs reais registrados via GS1 Brasil)
- [ ] `mpn` padronizado (sistema `TRM-XXX-NNN` ou slug — definir padrão)
- [ ] `brand: "Tramatto"` em todos os produtos ✅ (já implementado)

### Categorização
- [ ] `google_product_category` validado contra taxonomia oficial (ID numérico)
- [ ] `product_type` definido por produto ✅ (já implementado)

### Feed
- [ ] Estrutura de variantes implementada no feed (`item_group_id`, `color`, `size`) para produtos com múltiplas variantes
- [ ] Coluna `mpn` adicionada ao feed
- [ ] Imagens adicionais preenchidas em `additional_image_link`
- [ ] Feed publicado em URL acessível (`https://tramatto.com/feeds/products.tsv`)
- [ ] Preço/disponibilidade do feed conferem com os exibidos nas PDPs

### Site / SEO
- [ ] Canonical dinâmico por slug ativo ✅ (já implementado)
- [ ] Product Schema validado no Rich Results Test (incluindo `offers.price` numérico) ✅
- [ ] Open Graph por produto ativo ✅ (já implementado)
- [ ] `sitemap-products.xml` com 4 slugs ✅ (já implementado)
- [ ] PDPs acessíveis sem JavaScript (ou Googlebot confirmado a renderizar o conteúdo dinâmico)

### Tracking
- [ ] Evento `view_item` validado no GTM/GA4 ✅ (já implementado)
- [ ] Evento `add_to_cart` implementado (Roadmap #31a)
- [ ] Conta GA4 vinculada ao Merchant Center (para remarketing e Performance Max)

---

## 13. Plano de execução em fases

### Fase 0 — Pré-requisitos legais e operacionais (paralelo ao desenvolvimento)
> Sem dependências técnicas. Pode começar agora.

| Ação | Responsável | Prazo sugerido |
|---|---|---|
| Publicar CNPJ/razão social/endereço no site | Negócio + Dev | Roadmap #4 (30 dias) |
| Adicionar link "Trocas e devoluções" no rodapé | Dev | Junto com #4 |
| Criar conta Google Merchant Center | Marketing | Assim que #4 concluído |
| Verificar domínio no Merchant Center via Search Console | Dev + Marketing | Assim que Search Console verificado |
| Avaliar registro GS1 Brasil (decisão de negócio) | Negócio | Antes do lançamento |
| Definir sistema de MPN (`TRM-XXX-NNN` ou slug) | Negócio + Dev | Antes de gerar feed real |

---

### Fase 1 — Sessão de fotos e enriquecimento do catálogo (bloqueante para feed de qualidade)
> Depende de: produto real existir físicamente.

| Ação | Responsável | Referência |
|---|---|---|
| Sessão de fotos: 1 foto principal (fundo branco) + 2-3 fotos adicionais por produto | Fotógrafo | Roadmap #16 |
| Validar resolução: mín. 800×800px, < 16 MB, HTTPS | Dev | — |
| Reescrever descrições (500+ chars, com material/dimensões/cuidados) | Marketing | Roadmap (Fase 3, item 9) |
| Enriquecer títulos no feed (padrão com material + dimensão) | Marketing | — |
| Confirmar preços reais por variante | Negócio | — |
| Confirmar estoque inicial real | Negócio | — |
| Validar ID numérico de `google_product_category` | Dev | Taxonomia oficial |
| Adicionar campo `mpn` explícito em `catalog-data.js` | Dev | — |

---

### Fase 2 — Geração e validação do feed
> Depende de: Fase 1 concluída.

| Ação | Responsável | Referência |
|---|---|---|
| Criar script Node que gera `feeds/products.tsv` a partir de `catalog-data.js` | Dev | Roadmap #11 (geração do feed) |
| Adicionar variantes ao feed (`item_group_id`, `color`, `size`, `mpn`) | Dev | — |
| Adicionar `additional_image_link` (fotos da Fase 1) | Dev | — |
| Publicar feed em `https://tramatto.com/feeds/products.tsv` | Dev | — |
| Validar feed no [Feed Validator do Merchant Center](https://merchants.google.com/mc/products/diagnostics) | Dev + Marketing | — |
| Configurar frete na conta Merchant Center | Marketing | — |

---

### Fase 3 — Submissão e aprovação
> Depende de: Fase 0 e Fase 2 concluídas.

| Ação | Responsável |
|---|---|
| Submeter feed no Merchant Center (modo "teste" primeiro) | Marketing |
| Corrigir itens desaprovados (verificar relatório de Diagnóstico) | Dev + Marketing |
| Aguardar revisão manual pelo Google (pode levar 3-7 dias úteis) | — |
| Confirmar que preço/disponibilidade são idênticos entre feed e site | Dev + Marketing |
| Vincular conta Merchant Center ao Google Ads | Marketing |
| Criar primeira campanha Performance Max ou Shopping padrão | Marketing |

---

### Fase 4 — Rastreamento de conversões (para campanhas inteligentes)
> Depende de: Fase 3 + Roadmap #3 (carrinho funcional).

| Ação | Responsável | Referência |
|---|---|---|
| Implementar `add_to_cart` no GA4 via GTM | Dev | Roadmap #31a |
| Implementar `begin_checkout` | Dev | Roadmap #31b |
| Implementar `purchase` com `transaction_id` e `value` | Dev | Roadmap #31c |
| Vincular GA4 ao Google Ads e Merchant Center | Marketing | — |
| Configurar "Conversão de compra" no Google Ads | Marketing | — |

---

## 14. Estimativa de score por fase

| Fase | Score estimado | Bloqueador remanescente |
|---|:---:|---|
| Hoje (com dados placeholder) | ~60/100 | Imagens reais, descrições, CNPJ |
| Após Fase 0 (CNPJ/conta) | ~65/100 | Imagens reais, descrições, feed publicado |
| Após Fase 1 (fotos + catálogo enriquecido) | ~80/100 | Feed publicado, variantes no feed |
| Após Fase 2 (feed publicado com variantes) | ~92/100 | GTIN (opcional), SSR (roadmap #14) |
| Após Fase 3 (aprovação) | ~95/100 | Performance Max tracking |
| Após Fase 4 (tracking completo) | ~100/100 | — |

**Meta de 90%+ para lançamento:** concluir Fases 0, 1 e 2. A aprovação do Merchant Center não exige perfeccionismo — exige consistência entre feed, site e conta.

---

## 15. Referências técnicas

- Especificação de dados de produto: https://support.google.com/merchants/answer/7052112
- Taxonomia de produtos do Google: https://www.google.com/basepages/producttype/taxonomy-with-ids.en-US.txt
- Requisitos de imagem: https://support.google.com/merchants/answer/6324350
- Feed com variantes: https://support.google.com/merchants/answer/6324346
- Rich Results Test: https://search.google.com/test/rich-results
- Diagnóstico de feed: disponível dentro da conta Merchant Center → Produtos → Diagnóstico
- GS1 Brasil (registro de GTIN): https://www.gs1brasil.org.br
- Documentos internos: [merchant-center.md](merchant-center.md) · [merchant-center-phase1.md](merchant-center-phase1.md) · [merchant-center-feed-sample.tsv](merchant-center-feed-sample.tsv) · [search-console-readiness.md](search-console-readiness.md)
