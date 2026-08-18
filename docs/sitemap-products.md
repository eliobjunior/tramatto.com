# Sitemap de Produtos — `sitemap-products.xml`

**Data:** 2026-06-15
**Relacionado:** [merchant-center.md](merchant-center.md) (Seção 6, Fase 2, item 7) ·
[merchant-center-phase1.md](merchant-center-phase1.md) ·
[master-roadmap.md](master-roadmap.md) (item #15)

---

## 1. O que foi criado/alterado

| Arquivo | Ação | Descrição |
|---|---|---|
| `sitemap-products.xml` | **Novo** | Sitemap dedicado às 4 PDPs (`product.html?slug=...`), gerado a partir de `catalog-data.js`. |
| `sitemap.xml` | Atualizado | Removida a entrada genérica `product.html` (sem `?slug`) e adicionadas as 4 URLs canônicas de produto. |
| `robots.txt` | Atualizado | Adicionada uma segunda diretiva `Sitemap:` apontando para `sitemap-products.xml`. |

Esta mudança resolve a pendência registrada em
[merchant-center-phase1.md, Seção 5](merchant-center-phase1.md#5-próximos-passos-fase-2-sugerida):
*"adicionar URLs `product.html?slug=...` ao `sitemap.xml`"*.

---

## 2. `sitemap-products.xml`

Sitemap independente, contendo **apenas** as PDPs (4 produtos ativos do
catálogo):

| `<loc>` | `<lastmod>` | `<changefreq>` | `<priority>` |
|---|---|---|---|
| `https://tramatto.com/product.html?slug=linho-anatoliano` | 2026-06-15 | weekly | 0.8 |
| `https://tramatto.com/product.html?slug=borda-dourada` | 2026-06-15 | weekly | 0.8 |
| `https://tramatto.com/product.html?slug=listrado-classico` | 2026-06-15 | weekly | 0.8 |
| `https://tramatto.com/product.html?slug=jacquard-ottomano` | 2026-06-15 | weekly | 0.8 |

Cada `<loc>` corresponde **exatamente** à URL canônica gerada
dinamicamente por `updateCanonicalUrl(slug)` em `script.js`
(`https://tramatto.com/product.html?slug={slug}`), garantindo consistência
entre `<link rel="canonical">`, Open Graph (`og:url`), `offers.url` no
Product Schema e o sitemap.

### Por que um sitemap separado (e não só adicionar ao `sitemap.xml`)?

- Permite **submeter/monitorar separadamente** no Google Search Console
  ("Sitemaps" → adicionar `sitemap-products.xml`), facilitando o
  acompanhamento da indexação específica das páginas de produto.
- Facilita a manutenção: ao adicionar/remover produtos em `catalog-data.js`,
  basta atualizar este arquivo (4 entradas), sem tocar no sitemap principal
  de páginas institucionais.
- É referenciado também a partir do `sitemap.xml` principal (via `robots.txt`
  com múltiplas diretivas `Sitemap:`), então nada fica "escondido" dos
  crawlers que só leem o sitemap raiz.

---

## 3. `sitemap.xml` (principal) — diff

```diff
   <url>
     <loc>https://tramatto.com/collection.html</loc>
     <changefreq>weekly</changefreq>
     <priority>0.9</priority>
   </url>
-  <url>
-    <loc>https://tramatto.com/product.html</loc>
-    <changefreq>weekly</changefreq>
-    <priority>0.8</priority>
-  </url>
+  <!-- PDPs individuais (ver também sitemap-products.xml, dedicado a produtos) -->
+  <url>
+    <loc>https://tramatto.com/product.html?slug=linho-anatoliano</loc>
+    <lastmod>2026-06-15</lastmod>
+    <changefreq>weekly</changefreq>
+    <priority>0.8</priority>
+  </url>
+  <url>
+    <loc>https://tramatto.com/product.html?slug=borda-dourada</loc>
+    <lastmod>2026-06-15</lastmod>
+    <changefreq>weekly</changefreq>
+    <priority>0.8</priority>
+  </url>
+  <url>
+    <loc>https://tramatto.com/product.html?slug=listrado-classico</loc>
+    <lastmod>2026-06-15</lastmod>
+    <changefreq>weekly</changefreq>
+    <priority>0.8</priority>
+  </url>
+  <url>
+    <loc>https://tramatto.com/product.html?slug=jacquard-ottomano</loc>
+    <lastmod>2026-06-15</lastmod>
+    <changefreq>weekly</changefreq>
+    <priority>0.8</priority>
+  </url>
   <url>
     <loc>https://tramatto.com/pages/about.html</loc>
```

**Motivo da remoção da entrada genérica:** `https://tramatto.com/product.html`
(sem `?slug`) renderiza a página em estado vazio/genérico (nenhum produto
selecionado) e **não é uma URL canônica de nenhum produto** — mantê-la no
sitemap apenas confundia o Google sobre qual era "a" página de produto.

---

## 4. `robots.txt` — diff

```diff
 User-agent: *
 Allow: /

 Sitemap: https://tramatto.com/sitemap.xml
+Sitemap: https://tramatto.com/sitemap-products.xml
```

`robots.txt` permite múltiplas diretivas `Sitemap:` — ambos os arquivos serão
descobertos por qualquer crawler que leia `robots.txt` primeiro.

---

## 5. Validação contra os requisitos do Merchant Center

| Requisito | Status | Observação |
|---|---|---|
| URL do sitemap **igual** ao `link`/`offers.url` do feed e ao `<link rel="canonical">` | ✅ | Todas usam `https://tramatto.com/product.html?slug={slug}`, mesmo padrão do Product Schema (`offers.url`) e Open Graph (`og:url`) — ver [merchant-center-phase1.md](merchant-center-phase1.md). |
| Cada produto do catálogo tem uma entrada própria no sitemap | ✅ | 4/4 produtos de `catalog-data.js` representados. |
| Sitemap acessível e referenciado em `robots.txt` | ✅ | `sitemap.xml` e `sitemap-products.xml` listados. |
| XML bem formado (`<urlset>` válido, schema `sitemaps.org/schemas/sitemap/0.9`) | ✅ | Validado via parser XML (`[xml]` no PowerShell) — ambos os arquivos passam. |
| `<lastmod>` presente e plausível | ✅ | `2026-06-15` em todas as novas entradas (data desta implementação). **Atenção:** deve ser atualizado manualmente sempre que o produto correspondente mudar em `catalog-data.js`. |
| Nenhuma URL "vazia"/não-canônica no sitemap | ✅ | Entrada genérica `product.html` (sem slug) removida do `sitemap.xml`. |
| Sitemap não lista produtos inexistentes/`out of stock` removidos do catálogo | ✅ | `jacquard-ottomano` está `inStock: false` mas **permanece no sitemap** — Google recomenda manter produtos esgotados indexados (com `availability: out of stock` no feed/Schema) em vez de removê-los, evitando perda de histórico de indexação. |
| Tamanho do sitemap dentro dos limites (≤ 50.000 URLs / 50MB) | ✅ | 4 URLs — muito abaixo do limite. |
| Geração consistente com a fonte de verdade do catálogo | ⚠️ Manual | Este sitemap é **gerado manualmente** a partir de `catalog-data.js`. Ao adicionar/remover/renomear produtos, atualizar `sitemap-products.xml` (e a seção correspondente em `sitemap.xml`) na mesma alteração. Ver Seção 6 (automação futura). |

### Impacto na nota Merchant Center

No breakdown de [merchant-center-phase1.md, Seção 4](merchant-center-phase1.md#4-impacto-estimado-na-nota-merchant-center),
a categoria **"URLs indexáveis/sitemap por produto"** estava em **2/10**.
Com este sitemap dedicado + atualização do sitemap principal + `robots.txt`,
essa categoria passa para **9/10** (-1 por ainda depender de atualização
manual, sem geração automatizada a partir do catálogo).

| Categoria | Antes (Fase 1) | Depois (este passo) |
|---|---|---|
| URLs indexáveis/sitemap por produto | 2/10 | 9/10 |
| **Total geral** | 78/100 | **≈ 85/100** |

---

## 6. Próximos passos recomendados

1. **Submeter `sitemap-products.xml`** no Google Search Console (Sitemaps →
   adicionar nova entrada), além do `sitemap.xml` já existente.
2. **Automatizar a geração**: criar um script Node simples
   (`scripts/generate-sitemap.js`) que leia `catalog-data.js` e escreva
   `sitemap-products.xml` + a seção de produtos de `sitemap.xml`
   automaticamente, com `<lastmod>` derivado da data do build/commit —
   elimina a dependência manual apontada na Seção 5.
3. Ao publicar o feed do Merchant Center (Fase 4 de
   [merchant-center.md](merchant-center.md)), garantir que o campo `link` de
   cada item do feed seja **idêntico** à URL correspondente neste sitemap.
