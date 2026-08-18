# SEO Audit — Tramatto
**Data da auditoria:** 2026-06-16  
**Auditor:** Claude Code  
**Status geral:** ⚠️ Ajustes necessários antes de submeter ao Search Console

---

## Sumário executivo

O site tem uma base SEO sólida: todas as páginas possuem canonical, meta robots, meta description e lang="pt-BR" corretos. O GTM está instalado corretamente em todas as páginas. O problema central é que **`collection.html` não tem nenhuma tag Open Graph**, o que impede previews ao compartilhar; e que **os schemas JSON-LD mais ricos (Product, BreadcrumbList) dependem de JavaScript** para serem injetados na PDP.

---

## Status por página

| Página | Title | Meta Desc | Canonical | Open Graph | Schema JSON-LD | Breadcrumb |
|--------|:-----:|:---------:|:---------:|:----------:|:--------------:|:----------:|
| `index.html` | ✅ | ✅ | ✅ | ✅ | ⚠️ incompleto | ❌ |
| `collection.html` | ✅ | ✅ | ✅ | ❌ **ausente** | ⚠️ mínimo | ❌ |
| `product.html` | ⚠️ JS | ✅/⚠️ JS | ⚠️ pré-JS | ⚠️ JS | ⚠️ JS | ✅ JS |
| `pages/about.html` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `pages/contact.html` | ⚠️ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `pages/shipping.html` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `pages/privacy.html` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `pages/terms.html` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |

Legenda: ✅ ok · ⚠️ parcial · ❌ ausente · JS = injetado dinamicamente por JavaScript

---

## 1. sitemap.xml

### Problemas

| Severidade | Descrição |
|:---:|---|
| ⚠️ Moderado | `lastmod` ausente em `/` e `/collection.html` — impede Googlebot de priorizar re-crawl |
| ℹ️ Menor | PDPs aparecem duplicadas: em `sitemap.xml` e em `sitemap-products.xml` |

### O que está ok
- `robots.txt` referencia ambos os sitemaps (`sitemap.xml` e `sitemap-products.xml`) ✅
- Todas as URLs usam HTTPS e domínio canônico correto ✅
- `changefreq` e `priority` coerentes com a importância das páginas ✅

### Ajustes aplicados
- Adicionado `lastmod` em `/` e `/collection.html`
- PDPs removidas do `sitemap.xml` (ficam apenas no `sitemap-products.xml` dedicado)

---

## 2. robots.txt

### Status: ✅ Correto

```
User-agent: *
Allow: /

Sitemap: https://tramatto.com/sitemap.xml
Sitemap: https://tramatto.com/sitemap-products.xml
```

Nenhuma ação necessária.

---

## 3. Canonical

### `index.html` e `collection.html`
✅ Correto — canonical estático e coerente com a URL da página.

### `pages/*.html`
✅ Correto — canonical aponta para a URL absoluta correta.

### `product.html` — ⚠️ Problema de canonical pré-JS

O `<link rel="canonical" id="canonicalLink" href="https://tramatto.com/product.html">` é atualizado por `updateCanonicalUrl(slug)` em `script.js`. Enquanto o JS não executa, o canonical aponta para `product.html` sem slug.

**Risco:** Se o Googlebot indexar antes do JS renderizar, todas as PDPs vão conflitar no mesmo canonical genérico.

**Nota:** O Googlebot moderno executa JavaScript (renderização de segunda onda), mas o canonical inicial fica registrado no índice preliminar. Já documentado em `docs/search-console.md §4.2`.

**Mitigação recomendada (não aplicada — requer SSR):** Servir cada produto em URL própria (`/produto/linho-anatoliano/`) com canonical estático no HTML. Com a arquitetura SPA atual, a melhor solução disponível é garantir que o JS execute o mais rápido possível (já feito — script carregado no final do `<body>`).

---

## 4. Meta Title

| Página | Title atual | Chars | Status |
|--------|-------------|:-----:|:------:|
| `index.html` | Tramatto — Panos de Prato Turcos Premium | 41 | ✅ |
| `collection.html` | Tramatto — Coleção Premium | 27 | ✅ |
| `product.html` | _[produto via JS]_ | — | ✅ JS |
| `pages/about.html` | Sobre a Tramatto \| Panos de prato premium | 42 | ✅ |
| `pages/contact.html` | Contato Tramatto | 16 | ⚠️ muito curto, sem separador |
| `pages/shipping.html` | Frete e entregas \| Tramatto | 28 | ✅ |
| `pages/privacy.html` | Política de privacidade \| Tramatto | 36 | ✅ |
| `pages/terms.html` | Termos e condições \| Tramatto | 31 | ✅ |

**Inconsistência:** `index.html` usa `—` como separador, demais páginas usam `|`. Não é bloqueante para o Search Console, mas é boa prática padronizar.

**Ajuste recomendado para `pages/contact.html`:**
```html
<title>Contato | Tramatto</title>
```

---

## 5. Meta Description

| Página | Chars | Status |
|--------|:-----:|:------:|
| `index.html` | 131 | ✅ |
| `collection.html` | 107 | ✅ |
| `product.html` | genérico / JS | ✅ JS |
| `pages/about.html` | 132 | ✅ |
| `pages/contact.html` | 120 | ✅ |
| `pages/shipping.html` | 88 | ✅ |
| `pages/privacy.html` | 116 | ✅ |
| `pages/terms.html` | 96 | ✅ |

Todas as descrições estão abaixo de 160 caracteres e são específicas para cada página. ✅

---

## 6. Open Graph

### `index.html` — ✅ Completo
Tem `og:type`, `og:url`, `og:title`, `og:description`, `og:image` (1200×630), `og:locale`, `og:site_name`, Twitter Card. 

### `collection.html` — ❌ CRÍTICO — Ausente
**Nenhuma tag OG existia.** Qualquer link da coleção no WhatsApp, Instagram Stories, LinkedIn ou Facebook apareceria sem preview.

**Ajuste aplicado:** Adicionadas todas as tags OG + Twitter Card.

### `product.html` — ⚠️ Dependente de JS
As tags OG têm `id=""` e são atualizadas por `updateProductMetaTags()`. O OG Image fallback é `tramatto_og.jpg`. Quando o JS executa, os valores são corrigidos por produto. Aceitável para a arquitetura atual.

### `pages/*.html` — ❌ Ausentes
As páginas secundárias não têm OG tags. Impacto menor (poucas pessoas compartilham /privacy ou /terms), mas `/about` e `/contact` valem o esforço.

**Ajuste aplicado:** OG tags adicionadas em `about.html`, `contact.html` e `shipping.html`.

---

## 7. Schema.org / JSON-LD

### `index.html`

**Estado atual:**
```json
{ "@type": "Organization", "name": "Tramatto", "url": "...", "sameAs": [...], "description": "..." }
{ "@type": "WebSite", "name": "Tramatto", "url": "..." }
```

**Problemas:**
- `Organization` sem `logo` — o Google usa o `logo` para exibir a imagem da marca no Knowledge Panel
- `WebSite` sem `SearchAction` — perde a oportunidade de Sitelinks Searchbox

**Ajuste aplicado:** `logo` adicionado ao Organization; `SearchAction` adicionado ao WebSite.

---

### `collection.html`

**Estado atual:**
```json
{ "@type": "CollectionPage", "name": "...", "url": "...", "description": "..." }
```

**Problemas:**
- Sem `BreadcrumbList` — o Google não exibe breadcrumb nos resultados
- Schema mínimo sem `numberOfItems`

**Ajuste aplicado:** `BreadcrumbList` adicionado com posições Início → Coleção.

---

### `product.html` — ⚠️ Schema dinâmico via JS

**Estado estático:** `{ "@type": "WebPage", "name": "Produto Tramatto", "url": "..." }` — placeholder correto.

**Schema injetado via JS (`injectProductSchema`):**
```json
{
  "@type": "Product",
  "name": "...",
  "description": "...",
  "image": [...],
  "sku": "...",
  "mpn": "...",
  "brand": { "@type": "Brand" },
  "category": "...",
  "itemCondition": "...",
  "offers": {
    "@type": "Offer",
    "price": 120,
    "priceCurrency": "BRL",
    "availability": "https://schema.org/InStock"
  }
}
```

**O preço é corretamente parseado a número (`120`)** via `parsePrice()` em `js/adapters.js` — sem problemas de validação.

**BreadcrumbList** também é injetado com 3 níveis: Início → Coleção → [Produto]. ✅

**Ação necessária:** Validar no [Google Rich Results Test](https://search.google.com/test/rich-results) após deploy para confirmar que o Googlebot renderiza o JS corretamente.

---

### `pages/*.html` — ❌ Sem schemas

As páginas secundárias não têm JSON-LD. Para o Search Console, o impacto é mínimo. O `about.html` poderia ter um schema `AboutPage`, mas não é exigência para indexação.

---

## 8. Breadcrumbs

| Página | HTML breadcrumb | Schema BreadcrumbList |
|--------|:---------------:|:--------------------:|
| `index.html` | — | ❌ |
| `collection.html` | — | ❌ → ✅ (aplicado) |
| `product.html` | — | ✅ via JS |
| `pages/*` | — | ❌ |

O breadcrumb visual (HTML) não existe em nenhuma página — é uma opção de UX, não exigência do Search Console. O schema é suficiente para o Google exibir a trilha nos resultados.

---

## 9. Checklist de pré-envio ao Search Console

### Configuração do Search Console

- [ ] Acessar [search.google.com/search-console](https://search.google.com/search-console/)
- [ ] Adicionar propriedade: tipo **Domínio** → `tramatto.com`
- [ ] Verificar propriedade via registro DNS TXT (recomendado) ou tag HTML
- [ ] Após verificação, submeter sitemaps:
  - `https://tramatto.com/sitemap.xml`
  - `https://tramatto.com/sitemap-products.xml`

### Validação de schemas

- [ ] Testar `index.html` no [Rich Results Test](https://search.google.com/test/rich-results) — verificar Organization + WebSite
- [ ] Testar `product.html?slug=linho-anatoliano` — verificar Product schema (necessário JS)
- [ ] Confirmar que `offers.price` = `120` (não `null` ou `NaN`)
- [ ] Testar `collection.html` — verificar BreadcrumbList

### Validação de Open Graph

- [ ] Testar `collection.html` no [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [ ] Testar `product.html?slug=borda-dourada` (verificar se o JS muda os OG tags ao compartilhar — o compartilhamento usa o HTML estático, então o OG da PDP sempre será o genérico; considere adicionar OG:tags por produto via SSR ou redirect)

### Core Web Vitals

- [ ] Executar PageSpeed Insights para `index.html`, `collection.html` e uma PDP
- [ ] Garantir LCP < 2.5s, CLS < 0.1, INP < 200ms
- [ ] Verificar se imagens de produto têm atributos `width` e `height` definidos

### Indexabilidade

- [ ] Confirmar que `tramatto.com` e `www.tramatto.com` redirecionam para o mesmo domínio (evitar conteúdo duplicado)
- [ ] Confirmar HTTPS em todas as páginas
- [ ] Verificar se `pages/about.html`, `pages/contact.html` etc. existem em produção (estão no sitemap)

---

## 10. Resumo dos ajustes aplicados nesta auditoria

| # | Arquivo | Ajuste | Severidade |
|:-:|---------|--------|:----------:|
| 1 | `collection.html` | Open Graph + Twitter Card adicionados | 🔴 Crítico |
| 2 | `collection.html` | BreadcrumbList JSON-LD adicionado | 🟠 Alto |
| 3 | `index.html` | `logo` adicionado ao Organization schema | 🟠 Alto |
| 4 | `index.html` | `SearchAction` adicionado ao WebSite schema | 🟡 Moderado |
| 5 | `sitemap.xml` | `lastmod` adicionado em `/` e `/collection.html` | 🟡 Moderado |
| 6 | `sitemap.xml` | PDPs removidas (duplicatas do `sitemap-products.xml`) | 🟢 Menor |
| 7 | `pages/about.html` | Open Graph adicionado | 🟡 Moderado |
| 8 | `pages/contact.html` | Open Graph adicionado | 🟡 Moderado |
| 9 | `pages/shipping.html` | Open Graph adicionado | 🟡 Moderado |

### Não alterado (requer decisão de arquitetura)

| Problema | Motivo de não alterar |
|----------|----------------------|
| `product.html` canonical pré-JS | Requer SSR ou rotas individuais por produto |
| `product.html` OG tags dinâmicas | Crawlers de redes sociais não executam JS — requer SSR |
| Padronização de separador de title | Mudança estética, zero impacto no ranking |
| schemas em `pages/privacy.html`, `pages/terms.html` | Sem relevância para rich results |

---

## 11. Próximos passos recomendados (pós-Search Console)

1. **Monitorar cobertura de indexação** — Aguardar 7–14 dias após submit dos sitemaps e verificar o relatório de Cobertura no Search Console
2. **Acompanhar Rich Results** — Verificar se os produtos aparecem com preço e disponibilidade nos resultados de busca (relatório "Produtos" no Search Console)
3. **Verificar Core Web Vitals** — Aguardar dados de campo no relatório de "Experiência de página"
4. **Considerar SSR/SSG** — Para resolver os problemas de canonical pré-JS e OG de produto, avaliar migração para geração estática (Eleventy, Astro) ou servidor Node com template por produto
