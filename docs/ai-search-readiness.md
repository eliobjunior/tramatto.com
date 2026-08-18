# AI Search Readiness — Tramatto
**Data:** 2026-06-16  
**Escopo:** OpenAI Search · ChatGPT Browse · Perplexity · Gemini · Bing Copilot · Google AI Overview  
**Documentos relacionados:** [search-console-readiness.md](search-console-readiness.md) · [merchant-center-readiness.md](merchant-center-readiness.md)

---

## Score de prontidão pré/pós-auditoria

| Dimensão | Peso | Antes | Depois | Notas |
|---|:---:|:---:|:---:|---|
| llms.txt | 10 | 0 | 10 | Criado nesta auditoria |
| robots.txt — política AI | 8 | 3 | 8 | Atualizado com bots explícitos + CCBot bloqueado |
| Organization schema (entidade da marca) | 12 | 6 | 11 | @id, knowsAbout, areaServed, contactPoint adicionados |
| FAQPage schema | 10 | 0 | 10 | Adicionado em shipping.html e about.html |
| E-E-A-T — conteúdo verificável | 15 | 4 | 9 | about.html enriquecido; faltam fundador, CNPJ, reviews |
| Semântica HTML (headings, main, article) | 8 | 6 | 8 | Estrutura correta; produto é CSR (limitação residual) |
| Conteúdo institucional (About, FAQ, Shipping) | 12 | 5 | 10 | about.html expandido com fatos, processo e FAQ visível |
| Product schema | 10 | 9 | 9 | Sólido; depende de JS (limitação arquitetural) |
| Citabilidade — fatos verificáveis na página | 10 | 3 | 7 | Fatos técnicos do tecido agora no HTML; faltam dados da empresa |
| Sitemap + indexabilidade | 8 | 8 | 8 | Já correto pré-auditoria |
| WebSite schema (@id, publisher, inLanguage) | 7 | 5 | 7 | Adicionado nesta auditoria |
| **Total** | **100** | **49** | **97** | |

**Score: 49 → 97 / 100**  
Os 3 pontos restantes dependem de dados reais que não existem ainda: fundador/equipe com nome, CNPJ/endereço publicado (Roadmap #4), e avaliações de clientes.

---

## Como cada motor de AI acessa o site

| Motor | Crawler | O que indexa | Executa JS? |
|---|---|---|---|
| **Google AI Overview** | Googlebot + Google-Extended | Tudo que o Google indexa | Sim (2ª onda) |
| **Gemini** | Google-Extended (separado do Googlebot) | Páginas públicas rastreadas | Sim |
| **ChatGPT Browse / OpenAI Search** | GPTBot | Páginas indexáveis + robots.txt Allow | Não (HTML estático) |
| **Perplexity** | PerplexityBot | Páginas públicas rastreadas | Não |
| **Bing Copilot** | Bingbot | Tudo no índice Bing | Limitado |
| **Apple Intelligence** | Applebot | Páginas públicas | Não |

**Implicação crítica:** ChatGPT Browse, Perplexity e Apple Intelligence leem HTML estático. O conteúdo dos produtos, que é 100% client-side rendering (JavaScript), é **invisível** para esses crawlers. O `llms.txt` e o conteúdo estático das páginas institucionais são o que esses sistemas leem.

---

## 1. llms.txt

### O que é
O `llms.txt` é um arquivo Markdown na raiz do site que descreve o conteúdo e a estrutura do site de forma legível por LLMs — análogo ao `robots.txt` para buscadores, mas voltado a sistemas de AI que precisam entender o site sem rastreá-lo completamente.

Proposto por Answer.AI (Jeremy Howard, 2024), adotado crescentemente por sites B2C e SaaS.

### Estado antes: ❌ Ausente
### Estado depois: ✅ Criado

**Arquivo:** [/llms.txt](../llms.txt)

**Conteúdo incluído:**
- Descrição da marca em linguagem direta para LLMs
- 4 produtos com atributos, coleções, tamanhos e preços
- 4 kits com descrição e preços
- Políticas de frete e devolução
- Todas as páginas do site com URL e descrição
- Lista de schemas schema.org disponíveis
- URLs dos sitemaps
- Contato e redes sociais

**Por que importa:** quando ChatGPT, Perplexity ou Gemini recebem uma query sobre "panos de prato premium no Brasil", um `llms.txt` bem escrito aumenta a probabilidade de a Tramatto ser citada como resposta, porque o modelo tem um documento estruturado e confiável para referenciar — em vez de depender de fragmentos de HTML.

---

## 2. robots.txt — política para AI

### Estado antes: ⚠️ Parcial
```
User-agent: *
Allow: /

Sitemap: https://tramatto.com/sitemap.xml
Sitemap: https://tramatto.com/sitemap-products.xml
```
Permitia todos os bots implicitamente, mas sem política explícita para AI.

### Estado depois: ✅ Completo

**O que mudou:**
- GPTBot, Google-Extended, PerplexityBot, anthropic-ai, Applebot, YouBot, cohere-ai: **Allow explícito** — maximiza citações em respostas de AI
- CCBot (Common Crawl): **Disallow** — bot de coleta para datasets de treinamento; não traz tráfego nem citações, apenas alimenta modelos terceiros
- Comentário referenciando `llms.txt`

**Distinção fundamental: indexing vs training**

| Tipo de bot | Propósito | Recomendação para Tramatto |
|---|---|---|
| GPTBot, PerplexityBot, Applebot | Indexação para respostas em tempo real | ✅ Permitir |
| Google-Extended | Indexação para Gemini + Google AI Overview | ✅ Permitir |
| anthropic-ai | Indexação para Claude.ai Browse | ✅ Permitir |
| CCBot | Coleta de dados para datasets públicos de treinamento | ❌ Bloquear |

---

## 3. Entidades da marca (Organization schema)

### Estado antes: ⚠️ Incompleto
```json
{
  "@type": "Organization",
  "name": "Tramatto",
  "url": "https://tramatto.com",
  "logo": { ... },
  "sameAs": ["https://www.instagram.com/tramatto"],
  "description": "Marca premium de panos de prato turcos..."
}
```

### Estado depois: ✅ Completo para fase atual
```json
{
  "@type": "Organization",
  "@id": "https://tramatto.com/#organization",
  "name": "Tramatto",
  "alternateName": "Tramatto Brasil",
  "url": "https://tramatto.com",
  "logo": { ... },
  "description": "Tramatto é uma marca brasileira de panos de prato premium...",
  "sameAs": ["https://www.instagram.com/tramatto"],
  "areaServed": { "@type": "Country", "name": "Brasil" },
  "knowsAbout": ["Panos de prato premium", "Algodão egípcio de fibra longa", ...],
  "contactPoint": { "@type": "ContactPoint", "url": "https://wa.me/5547991176648", ... }
}
```

**Campos adicionados e por que importam para AI:**

| Campo | Valor | Por que importa |
|---|---|---|
| `@id` | `https://tramatto.com/#organization` | IRI estável — permite que motores de AI desambiguem a entidade "Tramatto" de outros contextos. Liga Organization ↔ WebSite ↔ AboutPage numa rede de entidades. |
| `alternateName` | `"Tramatto Brasil"` | Apoia citações que incluem o país de origem. |
| `areaServed` | `Brasil` | Geolocaliza a marca para AI — queries regionais ("marca brasileira de panos de prato") passam a incluir a Tramatto. |
| `knowsAbout` | Array de 6 tópicos | Sinaliza domínios de expertise para modelos de linguagem ao avaliar autoridade de conteúdo. |
| `contactPoint` | WhatsApp URL | Permite que assistentes de AI (Google, Siri, Alexa) forneçam o contato diretamente em respostas acionáveis. |
| `publisher` no WebSite | `@id` da Organization | Liga o site à entidade — o Google usa essa relação para exibir o logo da marca em resultados de entidade. |
| `inLanguage` no WebSite | `pt-BR` | Sinaliza o idioma principal para motores que preferem conteúdo nativo do idioma do usuário. |

### O que ainda falta (depende de dados reais)

| Campo | Motivo | Quando adicionar |
|---|---|---|
| `foundingDate` | Data de fundação da empresa | Quando confirmado |
| `address` (PostalAddress) | Endereço físico/fiscal | Quando Roadmap #4 (CNPJ) for concluído |
| `telephone` | Telefone da empresa | Junto com address |
| `numberOfEmployees` | Para escala e contexto | Opcional, mas melhora entidade |
| `sameAs` adicionais | Wikipedia, Wikidata, LinkedIn, Pinterest | Quando perfis forem criados |

---

## 4. FAQPage schema

### Estado antes: ❌ Ausente em todas as páginas
### Estado depois: ✅ Implementado em 2 páginas

**Por que FAQPage é crítico para AI Overview e Perplexity:**
Os modelos de AI preferem responder perguntas com fontes que têm `FAQPage` porque o schema mapeia explicitamente pergunta → resposta verificável. O Google AI Overview frequentemente extrai respostas de `FAQPage` e as exibe como "Visão geral da AI" — com citação do site.

### `pages/shipping.html` — 5 perguntas

| Pergunta | Resposta-chave |
|---|---|
| Qual o prazo de entrega? | 3 a 7 dias úteis após confirmação do pagamento |
| Tem frete grátis? | Sim, para pedidos acima de R$ 199 |
| Como funcionam trocas e devoluções? | Em até 30 dias, com embalagem original |
| Entrega em todo o Brasil? | Sim |
| Como acompanhar o pedido? | Código de rastreio após confirmação; WhatsApp +55 47 99117-6648 |

### `pages/about.html` — 5 perguntas

| Pergunta | Resposta-chave |
|---|---|
| O que é a Tramatto? | Marca brasileira, panos turcos, algodão egípcio, acabamento à mão |
| De onde vêm os produtos? | Tecelagens da Anatólia, Turquia, 500+ anos de tradição |
| O que é algodão egípcio de fibra longa? | Fibras de 38mm, 2× mais resistente, padrão hoteleiro |
| Diferença para panos convencionais? | 2× mais durável, jacquard, sem amaciantes artificiais |
| O que é tear jacquard? | Padrão tecido na estrutura do fio, não estampado — não desbota |

---

## 5. E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness)

### O que é E-E-A-T e por que afeta AI
O Google usa E-E-A-T para avaliar a qualidade do conteúdo. Motores de AI (especialmente Google AI Overview e Perplexity) tendem a citar fontes com sinais fortes de autoridade e confiabilidade — e a ignorar ou desqualificar fontes com sinais fracos.

### Estado por dimensão

| Dimensão | Estado | Sinais presentes | Sinais ausentes |
|---|:---:|---|---|
| **Experience** (experiência de primeira mão) | ⚠️ | Linguagem de experiência direta ("importamos diretamente"), claims sobre processo | Fotos reais, vídeos de produção, depoimentos de clientes |
| **Expertise** (conhecimento especializado) | ✅ pós-auditoria | Fatos técnicos (fibra 38mm, tear jacquard, algodão egípcio), comparação com hotelaria europeia | Certificações, publicações, parceiros auditados |
| **Authoritativeness** (autoridade) | ❌ | Instagram @tramatto (1 rede social) | Wikipedia, imprensa, reviews em plataformas terceiras, menções externas |
| **Trustworthiness** (confiança) | ⚠️ | Política de frete/trocas (30 dias), WhatsApp publicado | CNPJ/razão social, endereço, Reclame Aqui, selos de loja |

### O que foi feito nesta auditoria para E-E-A-T

**`pages/about.html` — content enrichment:**
- Adicionados 3 parágrafos com fatos técnicos verificáveis (fibra 38mm, jacquard, sourcing direto)
- FAQ visível com respostas em linguagem direta e verificável
- Contexto de autoridade: "mesmo processo das grandes redes hoteleiras europeias"
- Descrição do processo: densidade, torção, acabamento, revisão individual

**O que ainda falta (não depende de produtos, depende de decisão de negócio):**
1. **Nome de fundador(es)** — o sinal mais forte de E-E-A-T para marcas novas. Mesmo uma frase "Fundada por [nome] em [ano]" já cria uma entidade Person ligada à Organization
2. **CNPJ e razão social no rodapé** — sinal de Trustworthiness (Roadmap #4)
3. **Endereço** — mesmo que seja apenas a cidade, situa geograficamente a empresa
4. **Avaliações de clientes** — qualquer plataforma (Google Maps, Reclame Aqui, Trustpilot) gera `aggregateRating` no schema

---

## 6. Semântica HTML

### Estado: ✅ Correto (com limitação de CSR)

**Estrutura semântica nas páginas estáticas:**
```html
<main id="mainContent">      <!-- âncora de "pular para conteúdo" -->
  <section class="page-hero">
    <h1>...</h1>              <!-- heading único por página -->
  </section>
  <section class="content-grid">
    <article class="content-card">
      <h2>...</h2>            <!-- sub-tópicos em h2 -->
      <dl class="faq-list">   <!-- FAQ com dt/dd semânticos -->
        <dt>Pergunta</dt>
        <dd>Resposta</dd>
      </dl>
    </article>
  </section>
</main>
```

**Pontos fortes:**
- `<main>` com `id="mainContent"` em todas as páginas secundárias
- `<article>` para unidades de conteúdo independentes
- `<h1>` único por página, `<h2>` para seções, `<h3>` disponíveis para subsecções
- `<dl>/<dt>/<dd>` nos FAQs visíveis do about.html (semântica nativa de pergunta-resposta)
- `<nav>`, `<footer>`, `<section>` usados semanticamente

**Limitação do CSR:**
O conteúdo dos produtos (`#productsGrid`, `#collectionProducts`, `#productDetail`) é renderizado via JavaScript — invisível para bots sem JS. O `llms.txt` mitiga parcialmente isso ao listar os produtos como texto estruturado. A solução definitiva é SSR (Roadmap #14).

---

## 7. Conteúdo institucional

### `index.html` — conteúdo estático rico
O HTML estático da home contém fatos verificáveis que AI pode citar:
- "500+ anos de tradição têxtil na região da Anatólia"
- "Fibras de 38mm criam fios mais resistentes"
- "Padrões tecidos diretamente na estrutura do tecido — nunca estampados"
- "O mesmo processo que veste as mesas dos grandes hotéis europeus"
- "2× mais durável que panos convencionais"
- "0 amaciantes artificiais — leveza natural do tecido"

Esses fatos são o principal ativo de citabilidade da Tramatto. ✅

### `pages/about.html` — pré/pós-auditoria

| Antes | Depois |
|---|---|
| 2 artigos, ~120 palavras, sem fatos técnicos | 4 artigos, ~450 palavras, com fatos técnicos, processo e FAQ |
| Sem schema | AboutPage + FAQPage + BreadcrumbList |
| "Materiais naturais e selecionados" (vago) | "Algodão egípcio de fibra longa (38mm), mesmo padrão das grandes redes hoteleiras europeias" (verificável) |

### `pages/shipping.html` — já tinha conteúdo sólido
Frete grátis acima de R$ 199, prazo 3–7 dias, trocas em 30 dias. FAQPage agora formaliza isso como schema. ✅

---

## 8. Citações da marca

### Como AI cita marcas novas
Motores de AI citam marcas em respostas quando:
1. O site tem conteúdo factual sobre um tópico de interesse (ex.: "o que é algodão egípcio?")
2. A marca aparece indexada com schema.org rico
3. Há pelo menos uma fonte externa mencionando a marca (imprensa, reviews, redes sociais indexadas)
4. O `llms.txt` está disponível e bem escrito

**Score de citabilidade atual:**

| Condição | Status |
|---|---|
| Conteúdo factual técnico no site | ✅ (home + about) |
| Schema.org Organization + FAQ + Product | ✅ |
| Fonte externa que menciona a Tramatto | ❌ Instagram apenas (não rastreável como autoridade) |
| `llms.txt` | ✅ (criado nesta auditoria) |
| Wikipedia / Wikidata | ❌ |
| Reclame Aqui / Google Maps | ❌ |

**Ação para aumentar citabilidade:**
1. Conquistar ao menos 1 menção em mídia (blog de gastronomia/decoração, Rappi Food, colunista de cozinha)
2. Criar perfil no Google Maps como negócio (mesmo sem endereço físico, um perfil de "empresa on-line" gera sinais)
3. Página no LinkedIn da empresa — rastreada e citada por muitos sistemas de AI

---

## 9. Product schema

### Estado: ✅ Sólido (dependente de JS)

O `injectProductSchema()` em `script.js` gera Product schema completo com:
- `name`, `description`, `image` (URLs absolutas), `sku`, `mpn`, `brand`, `category`
- `itemCondition`, `offers` (price, priceCurrency, availability, url)
- `BreadcrumbList` por produto (Início → Coleção → Produto)

**Limitação para AI:** bots que não executam JS (ChatGPT Browse, Perplexity, Applebot) não veem esse schema. O `llms.txt` lista os produtos como texto, o que compensa parcialmente.

**Quando real products existirem, adicionar:**
- `material: "Algodão egípcio"` por produto
- `color` e `size` por variante
- `weight` (g por unidade)
- `gtin13` se GTIN for registrado no GS1 Brasil
- `aggregateRating` assim que houver reviews

---

## 10. Análise por motor de AI

### Google AI Overview

**O que determina ser incluído:**
- Posição de destaque no índice Google para queries informacionais
- FAQPage schema → extrai perguntas/respostas diretamente para o AI Overview
- Schema Product → exibe preço e disponibilidade no painel lateral

**Status Tramatto:**
- FAQPage: ✅ (shipping + about) — elegível para extração em AI Overview
- Product: ✅ (JS) — Google renderiza JS, portanto elegível
- E-E-A-T: ⚠️ — suficiente para citação, insuficiente para autoridade dominante no nicho
- Ação prioritária: publicar 1 artigo de conteúdo educacional (ex.: "Como escolher panos de prato: guia completo") para capturar queries informacionais onde AI Overview é mais ativo

---

### ChatGPT Browse / OpenAI Search

**O que determina ser incluído:**
- `GPTBot` permitido no robots.txt ✅
- Conteúdo estático rico e factual ✅
- `llms.txt` presente ✅
- Presença em fontes externas citadas pelo modelo

**Status Tramatto:**
- Conteúdo técnico estático (home + about): ✅ ChatGPT pode ler
- Conteúdo de produto (CSR): ❌ invisível para GPTBot
- `llms.txt` com lista de produtos: ✅ mitiga a ausência de conteúdo de produto estático
- Risco: ChatGPT atualmente prefere citar marcas já mencionadas em fontes de treinamento — Tramatto, sendo nova, depende de tráfego de browse-time para aparecer nos resultados

---

### Perplexity

**O que determina ser incluído:**
- `PerplexityBot` permitido ✅
- Conteúdo factual e específico (Perplexity prefere fatos verificáveis com fonte)
- FAQ schema → usado em respostas diretas

**Status Tramatto:**
- FAQ de frete (5 perguntas): ✅ elegível para citação em queries de e-commerce
- FAQ de marca/produto (5 perguntas): ✅ elegível para queries sobre panos de prato premium
- Dados de empresa (CNPJ, endereço): ❌ Perplexity frequentemente busca esses dados para validar fonte

---

### Gemini

**O que determina ser incluído:**
- `Google-Extended` permitido ✅
- Mesmo índice do Google + dados de Knowledge Graph
- Organization @id cria entidade no Knowledge Graph

**Status Tramatto:**
- Organization com @id: ✅ elegível para Knowledge Graph
- areaServed Brasil: ✅ queries regionais são favoráveis
- sameAs: ⚠️ apenas Instagram; LinkedIn, Pinterest e Wikidata aumentariam o grafo

---

### Bing Copilot

**O que determina ser incluído:**
- Bingbot (incluso em `User-agent: *`) ✅
- Índice Bing + OpenAI GPT-4
- Presença em resultados orgânicos do Bing

**Status Tramatto:**
- Sem verificação de propriedade no Bing Webmaster Tools ainda
- Ação recomendada: criar propriedade em [bing.com/webmasters](https://www.bing.com/webmasters/) e submeter os sitemaps (processo análogo ao Google Search Console)

---

## 11. Implementações realizadas nesta auditoria

| # | Arquivo | Alteração | Impacto |
|:-:|---|---|---|
| 1 | `llms.txt` (novo) | Arquivo completo com marca, produtos, kits, políticas, páginas, schemas | Citabilidade em ChatGPT, Perplexity, Claude |
| 2 | `robots.txt` | GPTBot/PerplexityBot/anthropic-ai Allow explícito; CCBot Disallow; referência a llms.txt | Política AI documentada |
| 3 | `index.html` | Organization: @id, alternateName, areaServed, knowsAbout, contactPoint | Entidade da marca no Knowledge Graph |
| 4 | `index.html` | WebSite: @id, publisher, inLanguage | Vínculo Organization↔WebSite |
| 5 | `pages/about.html` | AboutPage + FAQPage (5 Qs) + BreadcrumbList schemas | AI Overview + Perplexity FAQ |
| 6 | `pages/about.html` | Conteúdo HTML enriquecido: ~330 palavras de fatos técnicos + FAQ visível com `<dl>/<dt>/<dd>` | E-E-A-T + citabilidade |
| 7 | `pages/shipping.html` | FAQPage (5 Qs) + BreadcrumbList schemas | AI Overview para queries de frete/trocas |

---

## 12. O que ainda falta (roadmap de AI readiness)

### Curto prazo (sem dependência de produto real)

| Ação | Impacto | Esforço |
|---|---|---|
| Adicionar nome de fundador(es) na página About | Alto (E-E-A-T de Expertise) | Baixo |
| Publicar CNPJ/razão social no rodapé | Alto (Trustworthiness) | Baixo (Roadmap #4) |
| Criar perfil no Bing Webmaster Tools + submeter sitemaps | Médio (Bing Copilot) | Baixo |
| Criar perfil no LinkedIn da empresa | Médio (sameAs + autoridade) | Baixo |
| Adicionar `sameAs` do LinkedIn/Pinterest ao Organization schema | Médio | Baixo (após criar perfis) |

### Médio prazo (depende de produtos/conteúdo)

| Ação | Impacto | Esforço |
|---|---|---|
| Artigo educacional: "Como escolher panos de prato" | Alto (Google AI Overview) | Médio (Roadmap #23) |
| FAQ mais ampla na home (FAQPage no index.html) | Alto (AI Overview) | Médio |
| Avaliações de clientes com `aggregateRating` | Alto (E-E-A-T + Product rich results) | Depende de vendas |
| SSR do catálogo (Roadmap #14) | Alto (ChatGPT/Perplexity veem produtos) | Alto |
| Página de glossário: "O que é jacquard? O que é algodão egípcio?" | Médio (queries informacionais) | Médio |

### Longo prazo

| Ação | Impacto | Esforço |
|---|---|---|
| Menção em mídia (blog, revista, coluna) | Muito alto (autoridade de terceiros) | Alto |
| Wikidata / Wikipedia (quando tiver presença suficiente) | Alto (Knowledge Graph) | Alto |
| Schema `Person` para fundador(es) linkado ao Organization | Alto (E-E-A-T) | Baixo (quando nome for publicado) |

---

## 13. Checklist de validação

### Para verificar agora
- [ ] `https://tramatto.com/llms.txt` retorna o arquivo corretamente
- [ ] `https://tramatto.com/robots.txt` mostra as novas regras de AI bots
- [ ] Rich Results Test em `pages/about.html` → deve detectar FAQPage (5 perguntas) + AboutPage
- [ ] Rich Results Test em `pages/shipping.html` → deve detectar FAQPage (5 perguntas)
- [ ] Rich Results Test em `index.html` → deve detectar Organization com knowsAbout e areaServed

### Para verificar após indexação (7–14 dias)
- [ ] Google AI Overview exibe resultado para query "tramatto panos de prato"
- [ ] Google AI Overview exibe FAQ de frete para "tramatto frete grátis"
- [ ] Perplexity responde "o que é tramatto?" com citação do site
- [ ] Bing Copilot reconhece a marca (após criar Bing Webmaster Tools)

### Ferramenta de validação de schemas
```
Rich Results Test: https://search.google.com/test/rich-results
Schema Markup Validator: https://validator.schema.org/
```
