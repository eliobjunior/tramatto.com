# Preparação para o Google Search Console — Tramatto

**Data:** 2026-06-15
**Relacionado:** [merchant-center.md](merchant-center.md) ·
[merchant-center-phase1.md](merchant-center-phase1.md) ·
[sitemap-products.md](sitemap-products.md) ·
[master-roadmap.md](master-roadmap.md) (itens #14, #15)

---

## 1. Auditoria do `robots.txt`

```
User-agent: *
Allow: /

Sitemap: https://tramatto.com/sitemap.xml
Sitemap: https://tramatto.com/sitemap-products.xml
```

| Verificação | Status | Observação |
|---|---|---|
| Não bloqueia rastreamento geral (`Allow: /`) | ✅ | Nenhum `Disallow` — Googlebot pode rastrear HTML, CSS e JS necessários para renderização. |
| Não bloqueia `css/`, `js/`, `assets/` (essencial para renderização client-side) | ✅ | Sem regras de bloqueio a recursos estáticos. |
| Referencia todos os sitemaps relevantes | ✅ | `sitemap.xml` (geral) e `sitemap-products.xml` (PDPs), ambos via diretiva `Sitemap:`. |
| Não referencia URLs inexistentes ou removidas | ✅ | Ambos os arquivos existem na raiz do site. |
| `User-agent: *` cobre todos os bots relevantes (Googlebot, Googlebot-Image, Google-Extended) | ✅ | Wildcard cobre todos; sem necessidade de regras específicas no momento. |

**Resultado:** `robots.txt` está **correto e completo** para a fase atual. Nenhuma ação necessária.

---

## 2. Auditoria do `sitemap.xml`

11 URLs no total:

| URL | `lastmod` | `changefreq` | `priority` | Observações |
|---|---|---|---|---|
| `/` | — | weekly | 1.0 | OK |
| `/collection.html` | — | weekly | 0.9 | OK |
| `/product.html?slug=linho-anatoliano` | 2026-06-15 | weekly | 0.8 | Ver §4 (canonical pré-JS) |
| `/product.html?slug=borda-dourada` | 2026-06-15 | weekly | 0.8 | Ver §4 |
| `/product.html?slug=listrado-classico` | 2026-06-15 | weekly | 0.8 | Ver §4 |
| `/product.html?slug=jacquard-ottomano` | 2026-06-15 | weekly | 0.8 | Ver §4 — produto `inStock: false`, mantido propositalmente |
| `/pages/about.html` | — | monthly | 0.7 | OK |
| `/pages/contact.html` | — | monthly | 0.7 | OK |
| `/pages/shipping.html` | — | monthly | 0.7 | OK |
| `/pages/privacy.html` | — | monthly | 0.6 | OK |
| `/pages/terms.html` | — | monthly | 0.6 | OK |

| Verificação | Status | Observação |
|---|---|---|
| XML bem formado (`urlset`, schema `sitemaps.org/0.9`) | ✅ | Validado via parser XML. |
| Nenhuma URL genérica/não-canônica (`product.html` sem slug) | ✅ | Removida na implementação do sitemap de produtos. |
| Nenhuma URL `noindex` listada (ex.: `404.html`) | ✅ | `404.html` (noindex,nofollow) não consta no sitemap. |
| Todas as URLs respondem 200 e usam protocolo `https://` | ⚠️ Não testável neste ambiente | Confirmar manualmente após deploy (ex.: `curl -I`). |
| `<lastmod>` presente em todas as entradas | ⚠️ Parcial | Apenas as 4 PDPs têm `<lastmod>`; páginas estáticas (home, coleção, institucionais) não têm. Não é erro, mas recomenda-se adicionar para sinalizar frescor. |
| Dentro do limite de 50.000 URLs / 50MB | ✅ | 11 URLs. |

**Resultado:** estrutura válida e sem URLs problemáticas. Pendência menor:
adicionar `<lastmod>` às páginas estáticas (baixa prioridade).

---

## 3. Validação do `sitemap-products.xml`

Reaproveitando a validação de [sitemap-products.md](sitemap-products.md):

| Verificação | Status |
|---|---|
| XML bem formado | ✅ |
| 4/4 produtos do catálogo representados | ✅ |
| `<loc>` idêntico ao canonical pós-JS / `og:url` / `offers.url` do Product Schema | ✅ (após execução de JS — ver §4) |
| Referenciado em `robots.txt` | ✅ |
| Produto `out of stock` (`jacquard-ottomano`) mantido | ✅ (recomendação Google) |

**Resultado:** válido. Pronto para submissão manual em **Search Console → Sitemaps**.

---

## 4. Indexabilidade das páginas — achado crítico

### 4.1 Páginas estáticas (home, coleção, institucionais, 404)

| Página | `<title>` | `meta description` | `meta robots` | `canonical` |
|---|---|---|---|---|
| `index.html` | "Tramatto — Panos de Prato Turcos Premium" | presente, única | `index, follow` | `https://tramatto.com/` |
| `collection.html` | "Tramatto — Coleção Premium" | presente, única | `index, follow` | `https://tramatto.com/collection.html` |
| `pages/about.html` | "Sobre a Tramatto \| Panos de prato premium" | presente, única | `index, follow` | `https://tramatto.com/pages/about.html` |
| `pages/contact.html` | "Contato Tramatto" | presente, única | `index, follow` | `https://tramatto.com/pages/contact.html` |
| `pages/shipping.html` | "Frete e entregas \| Tramatto" | presente, única | `index, follow` | `https://tramatto.com/pages/shipping.html` |
| `pages/privacy.html` | "Política de privacidade \| Tramatto" | presente, única | `index, follow` | `https://tramatto.com/pages/privacy.html` |
| `pages/terms.html` | "Termos e condições \| Tramatto" | presente, única | `index, follow` | `https://tramatto.com/pages/terms.html` |
| `404.html` | "Página não encontrada \| Tramatto" | — | `noindex, nofollow` | `https://tramatto.com/404.html` |

✅ Todas as 7 páginas indexáveis têm `title`, `description`, `meta robots`
e `canonical` **corretos, únicos e auto-referenciados**. `404.html`
corretamente marcado como `noindex, nofollow` e ausente do sitemap.

### 4.2 PDPs (`product.html?slug=...`) — ✅ CORRIGIDO (`<title>`/description dinâmicos)

> **Atualização 2026-06-15:** esta seção documentava um bloqueio crítico de
> conflito de canonical pré-JS. A causa raiz (`<title>` e
> `<meta name="description">` estáticos e idênticos para as 4 PDPs) foi
> corrigida — ver detalhes abaixo e o status atualizado dos riscos
> remanescentes em §10.

O `sitemap.xml` e o `sitemap-products.xml` listam **4 URLs distintas**
(`product.html?slug=linho-anatoliano`, `...borda-dourada`, etc.), cada uma
com `<link rel="canonical">`, `og:url` e `offers.url` (Product Schema)
corretos **depois que `script.js` executa** (`updateCanonicalUrl()` /
`updateProductMetaTags()` / `injectProductSchema()` — ver
[merchant-center-phase1.md](merchant-center-phase1.md)).

**Antes desta correção**, o HTML **estático** servido para
`product.html?slug=X` (qualquer valor de `X`, incluindo nenhum) era
**idêntico para as 4 URLs**:

```html
<title>Tramatto — Produto</title>
<meta name="description" content="Conheça os panos de prato premium da Tramatto, com acabamento artesanal e materiais selecionados." />
<meta name="robots" content="index, follow" />
<link rel="canonical" href="https://tramatto.com/product.html" id="canonicalLink" />
```

Isso gerava **`<title>` e `<meta description>` idênticos** entre as 4 URLs
do sitemap (sinal clássico de conteúdo duplicado), e um `<link
rel="canonical">` apontando para `https://tramatto.com/product.html` (sem
`?slug=`) — uma URL fora do sitemap — para todas elas.

### Correção implementada

`product.html` ganhou `id="pageTitle"` no `<title>` e `id="pageDescription"`
no `<meta name="description">`. A função `updateProductOpenGraph()` em
`script.js` foi renomeada/expandida para **`updateProductMetaTags(product,
variant)`**, chamada por `renderProductDetail()` junto com
`updateCanonicalUrl()` e `injectProductSchema()`. Ela agora define, **a
partir da mesma fonte de dados** (`product.title` / `product.description`):

| Elemento | Valor |
|---|---|
| `document.title` (`<title id="pageTitle">`) | `{Produto} \| Panos de Prato Premium \| Tramatto` |
| `<meta name="description" id="pageDescription">` | `product.description` (96–117 caracteres, único por produto) |
| `og:title` / `twitter:title` | mesmo valor de `document.title` |
| `og:description` / `twitter:description` | mesmo valor de `<meta name="description">` |
| `og:url` | `https://tramatto.com/product.html?slug={slug}` (mesma do canonical) |
| Product Schema `name` / `description` | `product.title` / `product.description` (nome "puro" do produto, sem o sufixo `| Tramatto`, conforme convenção schema.org) |

**Resultado:** title, description, canonical, Open Graph e Product Schema
agora derivam **da mesma fonte de verdade** (`catalog-data.js` →
`Domain.Product`) e são atualizados **no mesmo ponto de execução**
(`renderProductDetail()`), eliminando a divergência entre o estado pré-JS e
pós-JS para os elementos mais sensíveis ao "Google-selected canonical"
(`title` e `description`).

### Limitação remanescente (residual)

O `<title>`/`description` **padrão no HTML bruto** (antes do JS executar)
continua sendo o texto genérico de `product.html` — agora idêntico para as
4 URLs **apenas durante a janela entre o primeiro fetch e a execução do
JS**. Isso é inerente a uma arquitetura 100% client-side rendering (CSR) e
só é eliminado por completo com SSR/snapshot (item **#14** do roadmap,
esforço Alto). Na prática, como o Googlebot executa JS antes de avaliar
sinais de canonical na maioria dos casos, e agora `title`/`description`
pós-JS são **únicos e sincronizados com o canonical declarado**, o risco de
consolidação indevida cai significativamente — mas a inspeção de URL (§9.5)
continua sendo o ponto de verificação definitivo.

---

## 5. Verificação `meta robots` (todas as páginas)

| Página | `meta robots` | Correto? |
|---|---|---|
| `index.html` | `index, follow` | ✅ |
| `collection.html` | `index, follow` | ✅ |
| `product.html` (estático, todas as PDPs) | `index, follow` | ✅ |
| `pages/about.html` | `index, follow` | ✅ |
| `pages/contact.html` | `index, follow` | ✅ |
| `pages/privacy.html` | `index, follow` | ✅ |
| `pages/shipping.html` | `index, follow` | ✅ |
| `pages/terms.html` | `index, follow` | ✅ |
| `404.html` | `noindex, nofollow` | ✅ |

**Resultado:** 100% correto. Todas as páginas indexáveis permitem indexação
e seguimento de links; a página de erro está corretamente excluída.

---

## 6. Verificação `canonical` (todas as páginas)

| Página | `canonical` declarado | Único e auto-referenciado? |
|---|---|---|
| `index.html` | `https://tramatto.com/` | ✅ |
| `collection.html` | `https://tramatto.com/collection.html` | ✅ |
| `product.html` (estático / pré-JS) | `https://tramatto.com/product.html` (igual para as 4 PDPs) | 🟡 Inerente ao CSR — mitigado em §4.2 (title/description agora únicos pós-JS) |
| `product.html?slug=X` (pós-JS) | `https://tramatto.com/product.html?slug=X` | ✅ (após `updateCanonicalUrl()`, sincronizado com title/description/OG/Schema) |
| `pages/about.html` | `https://tramatto.com/pages/about.html` | ✅ |
| `pages/contact.html` | `https://tramatto.com/pages/contact.html` | ✅ |
| `pages/privacy.html` | `https://tramatto.com/pages/privacy.html` | ✅ |
| `pages/shipping.html` | `https://tramatto.com/pages/shipping.html` | ✅ |
| `pages/terms.html` | `https://tramatto.com/pages/terms.html` | ✅ |
| `404.html` | `https://tramatto.com/404.html` | ✅ (irrelevante, `noindex`) |

**Resultado:** 9 de 9 páginas com canonical correto e auto-referenciado
(pós-JS para as PDPs). A ressalva sobre o estado pré-JS de `product.html`
está documentada em §4.2 como limitação residual, não mais bloqueio crítico.

---

## 7. Nota SEO técnica atual

| Categoria | Peso | Pontuação | Observação |
|---|---|---|---|
| `robots.txt` | 10 | 10 | Correto e completo (§1) |
| `sitemap.xml` (estrutura/cobertura) | 15 | 13 | Falta `lastmod` em páginas estáticas (§2) |
| `sitemap-products.xml` (dedicado) | 10 | 9 | Válido; geração manual (§3) |
| `meta robots` (todas as páginas) | 10 | 10 | 100% correto (§5) |
| `canonical` — páginas estáticas | 10 | 10 | 7/7 corretas (§6) |
| `canonical` — PDPs (consistência pré/pós-JS) | 15 | 12 | Canonical pós-JS sincronizado com title/description/OG/Schema; resta dependência de execução de JS (§4.2) |
| `title`/`description` únicos por URL | 15 | 13 | 4 PDPs com `<title>`/`<meta description>` únicos e sincronizados via `updateProductMetaTags()` (§4.2); -2 por ainda partirem de um estado genérico pré-JS |
| Conteúdo inicial renderizado (SSR/snapshot) | 15 | 5 | Client-side rendering; depende de execução de JS (roadmap #14) |
| **Total** | **100** | **82** | |

### Nota SEO técnica: **82/100** (antes: 66/100, +16)

---

## 8. Readiness para indexação

| Grupo de páginas | Readiness | Justificativa |
|---|---|---|
| `index.html`, `collection.html`, páginas institucionais (`pages/*.html`) | 🟢 **Prontas** | Title, description, canonical, meta robots e conteúdo no HTML inicial — todos corretos. Podem ser submetidas/indexadas sem ressalvas. |
| `404.html` | 🟢 **Correto** | `noindex, nofollow`, fora do sitemap — comportamento esperado. |
| `sitemap.xml` / `sitemap-products.xml` | 🟢 **Prontos para submissão** | XML válido, sem URLs problemáticas. |
| PDPs (`product.html?slug=...`) | 🟢 **Prontas, com monitoramento recomendado** | `meta robots: index, follow`; canonical, `<title>`, `<meta description>`, Open Graph e Product Schema agora sincronizados e únicos por produto via `updateProductMetaTags()`. Risco de consolidação indevida reduzido de "alto" para "baixo" — resta a dependência inerente de execução de JS (CSR), monitorável via Inspeção de URL. |

**Veredito geral:** o site está **pronto** para submissão completa no
Search Console — as 7 páginas estáticas, os 2 sitemaps e as 4 PDPs. As PDPs
devem ser acompanhadas via "Inspeção de URL" (ver checklist §9) nas
primeiras semanas para confirmar que o "Canonical selecionado pelo Google"
coincide com o canonical declarado (`?slug=...`), mas não há mais um
bloqueio estrutural conhecido impedindo a indexação individual.

---

## 9. Checklist de submissão no Search Console

### 9.1 Antes de submeter
- [ ] Confirmar que `sitemap.xml` e `sitemap-products.xml` estão publicados
      em `https://tramatto.com/sitemap.xml` e
      `https://tramatto.com/sitemap-products.xml` (responder 200, `Content-Type: application/xml`).
- [ ] Confirmar `https://tramatto.com/robots.txt` acessível e com as duas
      diretivas `Sitemap:`.
- [x] `<title>`/`<meta description>` dinâmicos por produto implementados
      e sincronizados com canonical/OG/Schema (`updateProductMetaTags()`
      em `script.js` — ver §4.2). Validar em produção abrindo cada
      `product.html?slug=X` e inspecionando `document.title` e
      `meta[name=description]` (ver §6 desta seção).

### 9.2 Configuração da propriedade
- [ ] Criar/verificar propriedade no Search Console — preferir
      **domínio** (`tramatto.com`, via registro DNS TXT) em vez de
      prefixo de URL, para cobrir `http`/`https` e `www`/non-`www`
      automaticamente.
- [ ] Confirmar que não há propriedades duplicadas/conflitantes
      (ex.: `https://www.tramatto.com` vs `https://tramatto.com`) — se
      houver redirecionamento, registrar ambas e configurar o domínio
      preferido.

### 9.3 Sitemaps
- [ ] Search Console → **Sitemaps** → adicionar `sitemap.xml`.
- [ ] Search Console → **Sitemaps** → adicionar `sitemap-products.xml`.
- [ ] Aguardar processamento (pode levar de horas a dias) e confirmar
      "Sucesso" — verificar contagem de URLs descobertas (11 e 4,
      respectivamente).

### 9.4 robots.txt
- [ ] Search Console → **Configurações** → testar/visualizar `robots.txt`
      (relatório de rastreabilidade) — confirmar que nenhuma URL
      relevante está bloqueada.

### 9.5 Inspeção de URL (uma a uma)
Para cada uma das 4 PDPs (prioridade alta, devido ao §4.2):
- [ ] `https://tramatto.com/product.html?slug=linho-anatoliano`
- [ ] `https://tramatto.com/product.html?slug=borda-dourada`
- [ ] `https://tramatto.com/product.html?slug=listrado-classico`
- [ ] `https://tramatto.com/product.html?slug=jacquard-ottomano`

Para cada uma, usar **Inspeção de URL** e verificar:
- [ ] "URL está no Google" (após indexação) ou solicitar indexação
      manualmente ("Solicitar indexação").
- [ ] **"Canonical declarado pelo usuário"** = `product.html?slug=X`.
- [ ] **"Canonical selecionado pelo Google"** = mesmo valor (se divergir
      para `product.html` sem slug, confirma o risco do §4.2 — priorizar
      a mitigação).
- [ ] Aba "Captura de tela"/HTML renderizado mostra o produto correto
      (título, preço, imagem) — confirma que a renderização JS está
      funcionando para o Googlebot.

Para as 7 páginas estáticas:
- [ ] Inspecionar `https://tramatto.com/` e `https://tramatto.com/collection.html`
      (maior prioridade) e solicitar indexação se ainda não indexadas.
- [ ] Inspecionar as 5 páginas de `pages/` conforme prioridade (menor urgência).

### 9.6 Relatórios de monitoramento (pós-submissão)
- [ ] **Cobertura/Páginas** — acompanhar por 1–2 semanas: confirmar que as
      4 PDPs aparecem como "Indexada" (não como "Duplicada, o Google
      escolheu outro canonical" — esse status confirmaria o risco do §4.2).
- [ ] **Usabilidade em dispositivos móveis** — sem erros.
- [ ] **Core Web Vitals (Experiência)** — monitorar especialmente
      `product.html` (renderização client-side pode impactar LCP/CLS).
- [ ] **Melhorias → Produtos** (rich results de `Product` / `Offer`) —
      validar que o Product Schema (JSON-LD) de
      [merchant-center-phase1.md](merchant-center-phase1.md) é reconhecido
      sem erros/avisos para as 4 PDPs.
- [ ] **Links** — confirmar que `collection.html` e `index.html` linkam
      para as 4 PDPs com `?slug=...` (necessário para Googlebot descobrir
      essas URLs também via rastreamento, não só via sitemap).

---

## 10. Riscos remanescentes

> ✅ O bloqueio crítico anterior (#1, conflito de canonical pré-JS por
> `<title>`/`<meta description>` idênticos entre as 4 PDPs) foi **resolvido**
> nesta iteração via `updateProductMetaTags()` — ver §4.2. Nenhum bloqueio
> classificado como 🔴 crítico permanece.

1. 🟡 **Dependência de execução de JS (CSR) para o estado final de
   title/description/canonical/OG/Schema (§4.2, limitação residual)** —
   entre o primeiro fetch e a execução do JS, as 4 PDPs ainda compartilham
   um `<title>`/`<meta description>`/canonical genéricos. Como o pós-JS
   agora é único e consistente com o canonical declarado, o risco de
   consolidação indevida é considerado **baixo**, mas deve ser confirmado
   via Inspeção de URL (§9.5) nas primeiras semanas após a submissão.
   - Eliminação completa: pré-renderização/SSR do `<head>` por produto
     (item #14 do roadmap, esforço Alto).

2. 🟡 **`sitemap.xml` sem `<lastmod>` nas páginas estáticas** — não bloqueia
   indexação, mas reduz sinais de frescor de conteúdo. Baixa prioridade.

3. 🟡 **Geração manual dos sitemaps e dos textos de title/description** —
   qualquer produto novo/removido/renomeado em `catalog-data.js` propaga
   automaticamente para `<title>`/`<meta description>`/OG/Schema (via
   `updateProductMetaTags()`), mas o sitemap (`sitemap.xml` e
   `sitemap-products.xml`) ainda exige atualização manual (já sinalizado em
   [sitemap-products.md §6](sitemap-products.md#6-próximos-passos-recomendados)).
   Risco de desalinhamento futuro entre catálogo e sitemap.

4. 🟢 Nenhum outro bloqueio crítico identificado — `robots.txt`,
   `meta robots` e canonical das páginas estáticas estão 100% corretos.
