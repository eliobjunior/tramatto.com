# Blog Implementation Report — Tramatto
**Data:** 16 de junho de 2026  
**Versão:** 1.0

---

## Resumo executivo

Implementação integral da arquitetura de blog definida em `docs/blog-architecture.md`. O blog da Tramatto está operacional com 4 artigos completos (1.500+ palavras cada), todos os schemas Schema.org necessários, navegação global atualizada e integração completa com os sistemas de SEO/GEO existentes.

---

## Arquivos criados

| Arquivo | Tipo | Status |
|---------|------|--------|
| `blog/como-lavar-pano-de-prato.html` | Artigo (Cuidados) | ✅ Criado |
| `blog/como-tirar-manchas-pano-de-prato.html` | Artigo (Cuidados) | ✅ Criado |
| `blog/algodao-vs-linho-vs-microfibra.html` | Artigo (Materiais) | ✅ Criado |
| `blog/presente-cha-de-cozinha.html` | Artigo (Presentes) | ✅ Criado |
| `blog/assets/.gitkeep` | Placeholder de diretório | ✅ Criado |
| `sitemap-blog.xml` | Sitemap do blog | ✅ Criado |
| `docs/blog-implementation-report.md` | Este documento | ✅ Criado |

---

## Arquivos atualizados

| Arquivo | Alteração | Status |
|---------|-----------|--------|
| `blog/index.html` | Corrigido slug do card A3 (`algodao-vs-linho-vs-microfibra.html`) | ✅ Atualizado |
| `blog/blog.css` | Adicionados estilos `.article-table-wrap` e `.article-table` | ✅ Atualizado |
| `robots.txt` | Adicionado `Sitemap: https://tramatto.com/sitemap-blog.xml` | ✅ Atualizado |
| `llms.txt` | Adicionada seção `## Blog` com 4 artigos; atualizada seção `Dados estruturados` e `Sitemaps` | ✅ Atualizado |
| `index.html` | Adicionado link "Blog" na nav desktop e mobile | ✅ Atualizado |
| `collection.html` | Adicionado link "Blog" na nav desktop e mobile | ✅ Atualizado |
| `pages/about.html` | Adicionado link "Blog" na nav desktop e mobile | ✅ Atualizado |
| `pages/shipping.html` | Adicionado link "Blog" na nav desktop e mobile | ✅ Atualizado |
| `pages/contact.html` | Adicionado link "Blog" na nav desktop e mobile | ✅ Atualizado |

---

## Detalhes dos artigos

### Artigo 1: Como lavar pano de prato
- **URL:** `/blog/como-lavar-pano-de-prato.html`
- **Cluster:** Cuidados
- **Keyword primária:** "como lavar pano de prato" (~15k/mês)
- **Palavras estimadas:** 1.700+
- **Seções:** Temperatura · Máquina ou à mão · O mito do amaciante · Como secar · Cuidados jacquard · Quando trocar
- **FAQ:** 5 Q&As (temperatura, amaciante, máquina, secagem, frequência)
- **Produto mencionado:** Linho Anatoliano (R$ 120)
- **IDs de h2:** `a-temperatura-certa-muda-tudo`, `maquina-de-lavar-ou-a-mao`, `o-mito-do-amaciante`, `como-secar`, `cuidados-jacquard`, `quando-trocar`

### Artigo 2: Como tirar manchas de pano de prato
- **URL:** `/blog/como-tirar-manchas-pano-de-prato.html`
- **Cluster:** Cuidados
- **Keyword primária:** "como tirar manchas de pano de prato" (~6k/mês)
- **Palavras estimadas:** 1.600+
- **Seções:** Regra de ouro (temperatura + tempo) · Óleo · Café/chá · Amarelamento · Frutas · Molho de tomate · Encardido · O que nunca fazer · Jacquard
- **FAQ:** 5 Q&As (óleo, café, amarelamento, água sanitária, jacquard)
- **Produto mencionado:** Listrado Clássico (R$ 120)
- **IDs de h2:** `regra-de-ouro`, `mancha-de-oleo`, `mancha-de-cafe`, `pano-amarelado`, `manchas-de-frutas`, `molho-de-tomate`, `pano-encardido`, `o-que-nunca-fazer`, `manchas-jacquard`

### Artigo 3: Algodão vs. linho vs. microfibra
- **URL:** `/blog/algodao-vs-linho-vs-microfibra.html`
- **Cluster:** Materiais
- **Keyword primária:** "algodão vs microfibra pano de prato" (~4k/mês estimado)
- **Palavras estimadas:** 1.900+
- **Seções:** Por que o material importa · Algodão convencional · Algodão egípcio ELS · Linho · Microfibra (mito) · Tabela comparativa · Veredito
- **FAQ:** 5 Q&As (absorção, durabilidade, microfibra cozinha, custo ELS, linho vs algodão)
- **Componente especial:** Tabela comparativa responsiva com 9 critérios × 4 materiais
- **Produto mencionado:** Jacquard Ottomano (R$ 120)
- **IDs de h2:** `por-que-o-material-importa`, `algodao-convencional`, `algodao-egipcio`, `linho`, `microfibra`, `comparativo`, `qual-escolher`

### Artigo 4: Presente para chá de cozinha
- **URL:** `/blog/presente-cha-de-cozinha.html`
- **Cluster:** Presentes e enxoval
- **Keyword primária:** "presente para chá de cozinha" (~8k/mês)
- **Palavras estimadas:** 1.700+
- **Seções:** Por que panos são o presente perfeito · O que considerar (estilo, uso) · Até R$100 · R$100–200 · Acima de R$200 · Como montar um kit · O que evitar
- **FAQ:** 5 Q&As (quanto gastar, pano como presente, como montar kit, o que não dar, chá de cozinha vs chá de panela)
- **Produto mencionado:** Linho Anatoliano + Kit Presente Especial
- **IDs de h2:** `por-que-panos-sao-o-presente-perfeito`, `o-que-considerar-antes-de-escolher`, `ate-r100`, `r100-200`, `acima-de-r200`, `como-montar-kit`, `o-que-evitar`

---

## Schemas implementados por artigo

Todos os 4 artigos implementam os seguintes schemas JSON-LD:

| Schema | Campos | Validação |
|--------|--------|-----------|
| `BreadcrumbList` | 4 níveis: Início → Blog → Cluster → Artigo | Completo |
| `Article` | headline, description, image (1200×630), datePublished, dateModified, author (Organization @id), publisher (@id), inLanguage, keywords, articleSection | Completo |
| `FAQPage` | 5 Q&As com Question + Answer por artigo | Completo |

**Author:** `Organization` com `@id: https://tramatto.com/#organization` (referência ao schema definido em `index.html`). Migrar para `Person` quando o fundador for nomeado publicamente.

---

## Meta tags por artigo

Todos os artigos incluem:

- `<title>` com keyword primária no início (max 60 chars)
- `<meta name="description">` (max 160 chars)
- `<meta name="robots" content="index, follow">`
- `<link rel="canonical">`
- Open Graph: `og:type=article`, `og:url`, `og:title`, `og:description`, `og:image` (1200×630), `og:locale=pt_BR`, `og:site_name`, `article:published_time`, `article:modified_time`, `article:section`, `article:tag` (2-3 tags)
- Twitter Card: `summary_large_image`
- GTM-W7NZMTL7 (head + noscript body)

---

## Componentes HTML implementados por artigo

| Componente | Status |
|-----------|--------|
| Barra de progresso de leitura | ✅ |
| Skip link acessível | ✅ |
| Navegação com Blog ativo (`class="blog-active"`) | ✅ |
| Menu mobile com Blog | ✅ |
| Breadcrumb visual (4 níveis) | ✅ |
| `<article>` com itemscope Article | ✅ |
| Header: category tag, h1 com `<em>` italic, summary destacado, meta (tempo leitura, data, autor) | ✅ |
| Placeholder de imagem destaque | ✅ |
| Layout artigo: corpo + sidebar | ✅ |
| Corpo: h2 com IDs, h3, p, ul/ol, callout, blockquote, CTA produto inline | ✅ |
| Tabela comparativa (artigo 3 com `.article-table-wrap` responsivo) | ✅ |
| FAQ accordion acessível (aria-expanded) | ✅ |
| CTA final (`.article-end-cta`) | ✅ |
| Sidebar: TOC sticky com links de seção, product card, 3 artigos relacionados | ✅ |
| Botões de compartilhamento (WhatsApp, Instagram) | ✅ |
| Artigos relacionados (grid 3 colunas) | ✅ |
| Footer com colunas Loja / Conteúdo / Institucional | ✅ |
| WhatsApp float button | ✅ |
| JS: progress bar, FAQ accordion, TOC highlight, hamburger menu | ✅ |

---

## Integração com sistemas existentes

### sitemap-blog.xml
```xml
blog/ → 2026-06-16 (weekly, priority 0.8)
como-lavar-pano-de-prato.html → 2026-06-16 (monthly, priority 0.7)
como-tirar-manchas-pano-de-prato.html → 2026-06-16
algodao-vs-linho-vs-microfibra.html → 2026-06-16
presente-cha-de-cozinha.html → 2026-06-16
```
Declarado em `robots.txt` como terceiro sitemap.

### llms.txt
Seção `## Blog` adicionada com 4 artigos e descrição de 1 linha cada.  
Seção `## Dados estruturados` atualizada para incluir `Article`, `BreadcrumbList` (4 níveis) e `FAQPage` nos artigos.  
Seção `## Sitemaps` atualizada para incluir `sitemap-blog.xml`.

### Navegação global
Link "Blog" adicionado no menu desktop e mobile de todas as 5 páginas:
- `/index.html` → `blog/`
- `/collection.html` → `blog/`
- `/pages/about.html` → `../blog/`
- `/pages/shipping.html` → `../blog/`
- `/pages/contact.html` → `../blog/`

---

## Validação de links internos

| Link | Destino | Status |
|------|---------|--------|
| Nav "Blog" em index.html | `blog/` | ✅ |
| Nav "Blog" em collection.html | `blog/` | ✅ |
| Nav "Blog" em pages/*.html | `../blog/` | ✅ |
| blog/index.html card A1 | `como-lavar-pano-de-prato.html` | ✅ |
| blog/index.html card B2 | `como-tirar-manchas-pano-de-prato.html` | ✅ |
| blog/index.html card A3 | `algodao-vs-linho-vs-microfibra.html` | ✅ (corrigido de slug errado) |
| blog/index.html card D2 | `presente-cha-de-cozinha.html` | ✅ |
| Artigos → relacionados entre si | 4 links cruzados por artigo | ✅ |
| Artigos → produtos | `../product.html?slug=...` | ✅ |
| Artigos → coleção | `../collection.html` | ✅ |
| Artigos → blog index | `./index.html` | ✅ |
| robots.txt → sitemap-blog.xml | `https://tramatto.com/sitemap-blog.xml` | ✅ |

---

## Links de artigos não ainda criados (futuros)

Os cards do `blog/index.html` incluem links para artigos planejados mas ainda não criados. Esses links resultarão em 404 até os artigos serem publicados:

- `algodao-egipcio-fibra-longa.html`
- `tear-jacquard-o-que-e.html`
- `pano-de-prato-premium-vale-a-pena.html`
- `como-escolher-pano-de-prato.html`
- `lista-enxoval-de-cozinha.html`

**Ação recomendada:** manter os links (constroem expectativa de conteúdo futuro) ou redirecionar para `index.html?cat=cluster` até publicação.

---

## Próximos passos recomendados

### Imediatos (antes de indexar)
1. **Adicionar imagem OG real** para cada artigo (`/blog/assets/[slug]-og.jpg`, 1200×630px) — atualmente usando `tramatto_og.jpg` genérico
2. **Submeter sitemap-blog.xml** no Google Search Console
3. **Solicitar indexação** das 4 URLs de artigos + `/blog/` no Search Console
4. **Verificar template-article.html** — o template ainda existe com campos FIELD:; considerar marcar claramente como "template não-indexável" adicionando `<meta name="robots" content="noindex">` ao template

### Próximas publicações (editorial calendar — semanas 3-4)
- `algodao-egipcio-fibra-longa.html` — "O que é algodão egípcio de fibra longa"
- `tear-jacquard-o-que-e.html` — "O que é tear jacquard"
- `como-escolher-pano-de-prato.html` — "Como escolher pano de prato"
- `mesa-posta-cafe-da-manha.html` — "Como montar uma mesa de café da manhã"

### GEO (90 dias)
Cada artigo publicado contribui para o score GEO da Tramatto ao adicionar conteúdo factual citável. Com 4 artigos ao vivo, estima-se evolução do score GEO de 52/100 para 58–62/100 nas primeiras 4–6 semanas de indexação.

---

## Checklist de publicação

- [x] 4 artigos criados com 1.500+ palavras
- [x] 3 schemas JSON-LD por artigo (BreadcrumbList + Article + FAQPage)
- [x] Meta tags completas (title, description, canonical, OG, Twitter Card)
- [x] GTM-W7NZMTL7 em todos os artigos
- [x] IDs nos h2 para TOC funcional
- [x] FAQ accordion com aria-expanded
- [x] TOC sidebar com scroll highlight
- [x] Barra de progresso de leitura
- [x] Links de artigos cruzados (todos apontam corretamente para os 4 artigos criados)
- [x] Links para produtos (`../product.html?slug=...`)
- [x] sitemap-blog.xml com 5 URLs
- [x] robots.txt declarando sitemap-blog.xml
- [x] llms.txt com seção Blog e 4 artigos
- [x] Navegação global atualizada em 5 páginas
- [x] CSS da tabela comparativa adicionado ao blog.css
- [x] Slug do card A3 no blog/index.html corrigido
- [x] blog/assets/.gitkeep criado

---

*Gerado automaticamente em 2026-06-16. Atualizar a cada novo artigo publicado.*
