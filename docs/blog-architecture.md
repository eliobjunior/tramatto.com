# Blog Architecture — Tramatto
**Data:** 2026-06-16  
**Capacidade:** 50+ artigos estáticos, sem CMS  
**Documentos relacionados:** [content-strategy.md](content-strategy.md) · [geo-readiness.md](geo-readiness.md) · [ai-search-readiness.md](ai-search-readiness.md)

---

## Estrutura de arquivos

```
tramatto.com/
├── blog/
│   ├── index.html                          ← Listagem principal (p. 1)
│   ├── pagina-2.html                       ← Listagem página 2 (copiar index.html)
│   ├── pagina-N.html                       ← Paginação estática
│   │
│   ├── blog.css                            ← CSS exclusivo do blog
│   │
│   ├── template-article.html              ← Template de artigo (não publicar!)
│   │
│   ├── assets/
│   │   ├── como-lavar-pano-de-prato.jpg   ← Imagem featured por artigo
│   │   ├── como-lavar-pano-de-prato-og.jpg ← OG image 1200×630
│   │   └── ...
│   │
│   │   ARTIGOS — Cluster Cuidados
│   ├── como-lavar-pano-de-prato.html
│   ├── como-tirar-manchas-pano-de-prato.html
│   ├── como-manter-pano-de-prato-branco.html
│   ├── com-que-frequencia-trocar-pano-de-prato.html
│   │
│   │   ARTIGOS — Cluster Materiais
│   ├── algodao-egipcio-fibra-longa.html
│   ├── tear-jacquard-o-que-e.html
│   ├── pano-de-prato-algodao-linho-ou-microfibra.html
│   │
│   │   ARTIGOS — Cluster Como Escolher
│   ├── como-escolher-pano-de-prato.html
│   ├── pano-de-prato-premium-vale-a-pena.html
│   ├── tamanhos-pano-de-prato.html
│   │
│   │   ARTIGOS — Cluster Presentes e Enxoval
│   ├── lista-enxoval-de-cozinha.html
│   ├── presente-cha-de-cozinha.html
│   ├── presente-casamento-cozinha.html
│   ├── kit-panos-de-prato-presente.html
│   │
│   │   ARTIGOS — Cluster Mesa Posta e Lifestyle
│   ├── mesa-posta-cafe-da-manha.html
│   ├── mesa-brunch-em-casa.html
│   ├── como-decorar-cozinha-panos-de-prato.html
│   ├── cozinha-minimalista-texteis.html
│   │
│   │   ARTIGOS — Cluster Origem e Proveniência
│   ├── texteis-da-anatolia-turquia.html
│   └── pano-de-prato-artesanal-vs-industrial.html
│
└── sitemap-blog.xml                        ← Sitemap exclusivo do blog (criar)
```

---

## Como publicar um novo artigo

### Passo a passo

```
1. Copiar template-article.html
   cp blog/template-article.html blog/[slug].html

2. Preencher os campos <!--FIELD:*--> no arquivo
   - meta-title (max 60 chars, keyword primária no início)
   - meta-description (max 160 chars, resposta direta)
   - canonical (https://tramatto.com/blog/[slug].html)
   - og-title, og-description, og-image

3. Atualizar os 3 schemas JSON-LD:
   - BreadcrumbList: cluster correto + URL do artigo
   - Article: slug, headline, description, datePublished, dateModified, keywords, articleSection
   - FAQPage: substituir as 5 perguntas pelas específicas do artigo

4. Escrever o conteúdo na seção .article-body
   - Seguir a estrutura: h2 → p → h3 → ul/ol → callout → product-cta
   - FAQ visível deve ser idêntico ao FAQPage schema

5. Atualizar a sidebar:
   - Ajustar TOC com os ids das seções h2
   - Substituir produto mencionado (se diferente de linho-anatoliano)
   - Atualizar related articles (3 artigos do mesmo cluster ou adjacentes)

6. Adicionar o card do artigo em blog/index.html
   - Inserir na posição correta (mais recente primeiro)
   - Atualizar paginação se necessário (9 cards por página)

7. Adicionar ao sitemap-blog.xml
   <url>
     <loc>https://tramatto.com/blog/[slug].html</loc>
     <lastmod>YYYY-MM-DD</lastmod>
     <changefreq>monthly</changefreq>
     <priority>0.7</priority>
   </url>

8. Atualizar llms.txt na raiz:
   - Adicionar linha na seção "## Blog" com URL e descrição

9. Verificar antes de publicar:
   - Rich Results Test: https://search.google.com/test/rich-results
   - Schema Validator: https://validator.schema.org/
```

---

## Schemas implementados

### Hierarquia de schemas por página

```
blog/index.html
└── CollectionPage
    ├── BreadcrumbList (Início → Blog)
    └── publisher → @id Organization

blog/[artigo].html
├── BreadcrumbList (Início → Blog → Cluster → Artigo)
├── Article
│   ├── author → @id Organization (futuro: Person)
│   ├── publisher → @id Organization
│   └── mainEntityOfPage → WebPage
└── FAQPage
    └── mainEntity → Question[] → Answer[]
```

### Schema 1: BreadcrumbList

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Início", "item": "https://tramatto.com/" },
    { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://tramatto.com/blog/" },
    { "@type": "ListItem", "position": 3, "name": "[Cluster]", "item": "https://tramatto.com/blog/?cat=[cluster]" },
    { "@type": "ListItem", "position": 4, "name": "[Título do artigo]", "item": "https://tramatto.com/blog/[slug].html" }
  ]
}
```

### Schema 2: Article

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "@id": "https://tramatto.com/blog/[slug].html",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://tramatto.com/blog/[slug].html"
  },
  "headline": "[Título — max 110 chars]",
  "description": "[Resumo — max 160 chars]",
  "image": {
    "@type": "ImageObject",
    "url": "https://tramatto.com/blog/assets/[slug]-og.jpg",
    "width": 1200,
    "height": 630
  },
  "datePublished": "YYYY-MM-DD",
  "dateModified": "YYYY-MM-DD",
  "author": {
    "@type": "Organization",
    "@id": "https://tramatto.com/#organization",
    "name": "Tramatto",
    "url": "https://tramatto.com"
  },
  "publisher": { "@id": "https://tramatto.com/#organization" },
  "inLanguage": "pt-BR",
  "url": "https://tramatto.com/blog/[slug].html",
  "keywords": ["[keyword primária]", "[keyword secundária 1]", "..."],
  "articleSection": "[Cluster]",
  "about": { "@id": "https://tramatto.com/#organization" }
}
```

**Migração para Person (quando fundador for nomeado):**
```json
"author": {
  "@type": "Person",
  "@id": "https://tramatto.com/#founder",
  "name": "[Nome do Fundador]",
  "url": "https://tramatto.com/pages/about.html",
  "sameAs": ["https://www.linkedin.com/in/[perfil]"]
}
```

Adicionar o Person como `founder` no Organization schema em `index.html`:
```json
"founder": { "@id": "https://tramatto.com/#founder" }
```

### Schema 3: FAQPage

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "[Pergunta em linguagem natural]",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "[Resposta direta, sem HTML, máximo 300 words]"
      }
    }
  ]
}
```

**Regras para FAQPage efetiva:**
1. Mínimo 3 perguntas, ideal 5-7
2. Primeira pergunta deve conter a keyword primária
3. Respostas devem ser texto puro — sem HTML, sem markdown
4. As mesmas perguntas devem existir no HTML visível (seção `.article-faq`)
5. Respostas do schema e do HTML devem ser idênticas ou muito similares
6. Não use perguntas genéricas — cada pergunta deve ser específica o suficiente para aparecer em busca

---

## Componentes reutilizáveis

### Callout box
```html
<div class="article-callout">
  <div class="article-callout-label">Atenção / Dica / Regra prática</div>
  <p>Conteúdo do callout — informação em destaque.</p>
</div>
```

### Inline product CTA
```html
<a href="../product.html?slug=[slug]" class="article-product-cta" aria-label="Ver produto [Nome]">
  <div class="article-product-cta-img">
    <img src="../assets/images/produto-[slug].jpg" alt="[Descrição da imagem]" width="60" height="60" loading="lazy" />
  </div>
  <div>
    <div class="article-product-cta-name">[Nome do produto]</div>
    <div class="article-product-cta-desc">[Frase curta de valor]</div>
  </div>
  <div class="article-product-cta-price">
    R$ [Preço]
    <span class="article-product-cta-action">Ver produto →</span>
  </div>
</a>
```

### Blockquote (pull quote)
```html
<blockquote>
  <p>[Citação ou afirmação em destaque — máximo 2 linhas]</p>
</blockquote>
```

### Tabela comparativa
```html
<table>
  <thead>
    <tr>
      <th>[Critério]</th>
      <th>[Opção A]</th>
      <th>[Opção B]</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>[Linha]</td>
      <td>[Valor]</td>
      <td>[Valor]</td>
    </tr>
  </tbody>
</table>
```

---

## Convenções de slug e URL

| Cluster | Prefixo de URL | Exemplo |
|---|---|---|
| Materiais | `/blog/[material]-[subtópico].html` | `/blog/algodao-egipcio-fibra-longa.html` |
| Cuidados | `/blog/como-[verbo]-pano-de-prato[-complemento].html` | `/blog/como-lavar-pano-de-prato.html` |
| Como Escolher | `/blog/como-escolher-[objeto].html` | `/blog/como-escolher-pano-de-prato.html` |
| Presentes e Enxoval | `/blog/[objeto]-[contexto].html` | `/blog/presente-cha-de-cozinha.html` |
| Mesa Posta | `/blog/mesa-[tipo]-[complemento].html` | `/blog/mesa-posta-cafe-da-manha.html` |
| Origem | `/blog/[tópico]-da-[origem].html` | `/blog/texteis-da-anatolia-turquia.html` |

**Regras de slug:**
- Sempre em português, sem acentos
- Separado por hífens
- Sem números (exceto quando o número é parte do título, ex: `12-ideias`)
- Máximo 60 caracteres
- Deve conter a keyword primária

---

## Paginação estática

Cada página de listagem exibe **9 artigos** (1 featured + 8 normais). Para criar páginas de paginação:

```bash
# Copiar o index.html e alterar:
# 1. <link rel="canonical"> → pagina-2.html
# 2. Cards de artigos → próximos 9 artigos
# 3. Paginação: marcar o número correto como .active
# 4. Adicionar <link rel="prev"> e <link rel="next"> no <head>

# Ex: página 2
<link rel="prev" href="https://tramatto.com/blog/" />
<link rel="next" href="https://tramatto.com/blog/pagina-3.html" />
```

Capacidade por configuração atual:
- 9 artigos/página × 6 páginas = **54 artigos** sem mudanças estruturais
- Para mais de 54: adicionar `pagina-7.html`, `pagina-8.html`, etc.

---

## Sitemap do blog

Criar `/sitemap-blog.xml` com a seguinte estrutura:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!--
  Sitemap do blog da Tramatto.
  Atualizar a cada novo artigo publicado.
  Declarado em robots.txt: Sitemap: https://tramatto.com/sitemap-blog.xml
-->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://tramatto.com/blog/</loc>
    <lastmod>YYYY-MM-DD</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://tramatto.com/blog/como-lavar-pano-de-prato.html</loc>
    <lastmod>YYYY-MM-DD</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <!-- Adicionar um <url> por artigo publicado -->
</urlset>
```

Depois, adicionar ao `robots.txt`:
```
Sitemap: https://tramatto.com/sitemap-blog.xml
```

E referenciar nos sitemaps existentes — ou criar um `sitemap-index.xml`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>https://tramatto.com/sitemap.xml</loc></sitemap>
  <sitemap><loc>https://tramatto.com/sitemap-products.xml</loc></sitemap>
  <sitemap><loc>https://tramatto.com/sitemap-blog.xml</loc></sitemap>
</sitemapindex>
```

---

## Atualizar llms.txt após publicar

Após cada novo artigo, adicionar ao `/llms.txt` uma seção de blog:

```markdown
## Blog — Guia Tramatto

Artigos educacionais sobre cuidados com panos de prato, materiais têxteis, mesa posta e como escolher.

- [Como lavar pano de prato do jeito certo para durar anos](https://tramatto.com/blog/como-lavar-pano-de-prato.html): temperatura, ciclo, amaciante (não usar), secagem — guia completo de lavagem e conservação.
- [Como tirar manchas de pano de prato](https://tramatto.com/blog/como-tirar-manchas-pano-de-prato.html): 8 métodos para óleo, café, frutas e panos amarelados.
- [Adicionar linha por artigo]
```

---

## Atualizar navegação global

Os arquivos existentes precisam de "Blog" no nav para consistência. Adicionar em cada página:

```html
<!-- Em pages/*.html — adicionar ao <ul class="nav-links"> -->
<li><a href="../blog/index.html">Blog</a></li>

<!-- Em index.html e collection.html — adicionar ao <ul class="nav-links"> -->
<li><a href="./blog/index.html">Blog</a></li>

<!-- No menu mobile de cada página — adicionar ao .nav-mobile-menu -->
<a href="../blog/index.html">Blog</a>
```

---

## Filtro de categoria (JavaScript)

O `blog/index.html` inclui um filtro de categoria baseado em query param (`?cat=cuidados`). Para categorias com muitos artigos (10+), considere criar páginas de categoria estáticas:

```
blog/categoria/cuidados/index.html     ← lista só artigos de Cuidados
blog/categoria/materiais/index.html
blog/categoria/presentes/index.html
...
```

Cada categoria precisa de:
- `<link rel="canonical">` próprio
- Schema `CollectionPage` com nome da categoria
- BreadcrumbList (Início → Blog → Cuidados)
- Apenas os cards do cluster

---

## Checklist pré-publicação (por artigo)

```
META & SEO
[ ] <title> com keyword primária no início, max 60 chars, "| Tramatto" no final
[ ] <meta description> com resposta direta, max 160 chars
[ ] <link rel="canonical"> aponta para URL correta
[ ] Open Graph preenchido (og:title, og:description, og:image 1200×630)
[ ] article:published_time e article:section preenchidos

SCHEMAS
[ ] BreadcrumbList com cluster e URL do artigo
[ ] Article com todos os campos obrigatórios
[ ] datePublished e dateModified em ISO 8601 (YYYY-MM-DD)
[ ] keywords array preenchido (min 4 keywords)
[ ] FAQPage com mínimo 3 perguntas
[ ] Perguntas do FAQPage idênticas ao HTML visível da seção .article-faq

CONTEÚDO
[ ] Keyword primária no <h1>, no primeiro <p>, em ao menos 1 <h2>
[ ] Mínimo 3 seções com <h2>
[ ] Mínimo 1 lista <ul> ou <ol>
[ ] Mínimo 1 .article-callout
[ ] FAQ visível com mínimo 3 perguntas (usando .faq-item)
[ ] Seção .article-end-cta com CTA para produto ou coleção

IMAGENS
[ ] Imagem featured criada (blog/assets/[slug].jpg — min 800×480)
[ ] OG image criada (blog/assets/[slug]-og.jpg — exatamente 1200×630)
[ ] Todos os <img> com alt descritivo e atributos width/height
[ ] Imagens com loading="lazy" (exceto featured image: eager)

LINKS
[ ] Ao menos 2 links internos para outros artigos do blog
[ ] Ao menos 1 link para produto ou coleção
[ ] Sidebar com 3 artigos relacionados
[ ] "Continue lendo" no final com 3 artigos relacionados

INFRAESTRUTURA
[ ] Card do artigo adicionado em blog/index.html
[ ] URL adicionada ao sitemap-blog.xml
[ ] llms.txt atualizado com nova entrada

VALIDAÇÃO
[ ] Rich Results Test: https://search.google.com/test/rich-results
[ ] Schema Validator: https://validator.schema.org/
[ ] Verificar rendering sem JS (curl -s URL | grep "<h1>")
```

---

## Notas de arquitetura

### Por que sem CMS

O site usa HTML estático hospedado na Hostinger. Um CMS (WordPress, Ghost, Sanity) introduziria:
- Custo adicional de hospedagem dinâmica
- Dependência de backend para SEO (SSR necessário)
- Complexidade de manutenção para equipe pequena

O modelo estático é:
- Mais rápido (sem backend, sem TTFB de banco)
- Mais seguro (sem surface de ataque de CMS)
- Mais barato (Hostinger static hosting)
- Igualmente indexável (Google renderiza HTML estático sem problemas)

**Trade-off:** publicar um artigo requer editar arquivos HTML manualmente. Com 1-2 artigos/semana, o overhead é de ~20 minutos/artigo usando o template.

### Capacidade de escala

| Volume | Estrutura necessária | Mudanças |
|---|---|---|
| 1-20 artigos | Atual (sem mudanças) | Nenhuma |
| 21-54 artigos | Paginação até pagina-6.html | Criar novas páginas de listagem |
| 55-100 artigos | Páginas de categoria (opcional) | Criar `/blog/categoria/[cluster]/index.html` |
| 100+ artigos | Considerar gerador estático (11ty, Hugo) | Migração de arquitetura |

### Performance

- Blog CSS carregado como arquivo separado (`blog.css`) — só nas páginas do blog
- Scripts carregados com `defer` — não bloqueiam renderização
- Fontes pré-conectadas via `preconnect` — mesmo padrão do site principal
- Imagens com `loading="lazy"` exceto featured image (`eager`)
- Sem dependência de JS para renderizar conteúdo — 100% indexável sem JS
