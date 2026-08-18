# GEO Readiness — Tramatto
**Generative Engine Optimization Audit**  
**Data:** 2026-06-16  
**Motores analisados:** ChatGPT Search · Google AI Overview · Gemini · Perplexity · Claude Search · Bing Copilot  
**Documentos relacionados:** [ai-search-readiness.md](ai-search-readiness.md) · [content-strategy.md](content-strategy.md) · [master-roadmap.md](master-roadmap.md)

---

## GEO ≠ SEO ≠ AI Search Readiness

Esses três conceitos são frequentemente confundidos. Para efeitos deste audit:

| Conceito | Pergunta que responde | Score da Tramatto |
|---|---|:---:|
| **SEO** | O Google consegue rastrear, indexar e ranquear as páginas? | 84/100 |
| **AI Search Readiness** | A infraestrutura técnica está preparada para AI? (schemas, robots.txt, llms.txt) | 97/100 |
| **GEO** | Os motores de AI *efetivamente* citarão a Tramatto em respostas geradas? | **52/100** |

O GEO score é deliberadamente mais baixo porque mede **resultado**, não infraestrutura. Um site pode ter toda a infraestrutura técnica perfeita e ainda não ser citado por AI porque:
- Nenhuma fonte externa corrobora a existência da marca
- Não há conteúdo factual suficiente para o modelo sintetizar uma resposta
- A entidade da marca não está nos grafos de conhecimento
- Não existe volume de conteúdo no nicho para estabelecer autoridade topical

---

## Score GEO Global: 52 / 100

### Metodologia de pontuação

Cada dimensão pontuada reflete a probabilidade de **ser citado**, não de ser tecnicamente acessível.

| Dimensão | Peso | Score | Nota |
|---|:---:|:---:|---|
| Infraestrutura de citação (llms.txt, robots.txt, sitemaps, acesso AI) | 15 | 13 | llms.txt e robots.txt completos; sem citações externas |
| Arquitetura de entidade (Organization @id, sameAs, Person, KG links) | 20 | 10 | Schema interno OK; 1 único sameAs; sem Person, sem foundingDate, sem endereço |
| Cobertura de dados estruturados (types de schema em uso) | 15 | 11 | FAQPage, Org, WebSite, AboutPage, Breadcrumb, Product (JS); faltam Article, HowTo, AggregateRating, Review |
| Densidade de conteúdo factual (fatos verificáveis acessíveis a crawlers de AI) | 20 | 9 | Home + about com facts técnicos; produto é CSR; zero blog |
| Autoridade topical (cobertura do nicho, E-E-A-T) | 15 | 4 | Ausência total de conteúdo editorial; nenhum sinal externo de autoridade |
| Presença no Knowledge Graph (Google KG, Wikidata, entidade verificável) | 10 | 2 | @id IRIs definidos localmente; sem corroboração externa; sem KG entry |
| Sinais de confiança (CNPJ, endereço, reviews, imprensa, perfis verificados) | 5 | 3 | Ausentes ou incompletos — maior risco de não-citação em queries de confiança |
| **Total** | **100** | **52** | |

### Interpretação do score

```
0 ─────── 30 ──────── 52 ──────── 70 ──────── 85 ──────── 100
          BAIXO       ▲          BOM         MUITO BOM   EXCELENTE
                   Tramatto
                    hoje
```

**52 é o score esperado de uma marca nova com excelente infraestrutura técnica mas sem presença editorial ou externa.** O problema não é técnico — é de substância (conteúdo) e corroboração (menções externas). Ambos são resolúveis em 6 meses.

---

## Análise por motor

### 1. Google AI Overview

**Como funciona:** usa o índice Google (Googlebot + Google-Extended) + Google Knowledge Graph + dados de treinamento do Gemini. Executa JavaScript (renderização completa), processa FAQPage e HowTo para "boxes" de resposta, e prioriza fontes com E-E-A-T forte.

**Tramatto hoje:**

| Critério | Status | Observação |
|---|:---:|---|
| Páginas indexáveis | ✅ | 7 URLs no sitemap + 4 PDPs |
| Google-Extended permitido | ✅ | robots.txt explícito |
| FAQPage schema | ✅ | 2 páginas (about + shipping) |
| Product schema | ⚠️ | JS-renderizado — Google renderiza, mas com delay |
| E-E-A-T | ⚠️ | Conteúdo de qualidade, mas sem sinais externos |
| Conteúdo para queries informacionais | ❌ | Nenhum blog/artigo |
| Google Business Profile | ❌ | Ausente |
| Reviews/aggregateRating | ❌ | Ausente |
| Imprensa e backlinks | ❌ | Ausente |

**Score Google AI Overview: 48/100**

**Queries em que pode aparecer hoje:**
- "tramatto panos de prato" → provável citação na home
- "panos de prato turcos brasil" → possível, mas fraco
- "o que é tear jacquard" → possível via about.html (fraco)
- "frete grátis pano de prato tramatto" → possível via shipping FAQ

**Queries em que não aparece mas deveria:**
- "como lavar pano de prato" → zero conteúdo
- "melhor pano de prato premium brasil" → sem autoridade
- "presente para chá de cozinha" → zero conteúdo

---

### 2. ChatGPT Search / OpenAI Search

**Como funciona:** combina dados de treinamento (até corte de conhecimento) com busca em tempo real via Bing. GPTBot rastreia HTML estático — não executa JavaScript. A resposta mistura dados de treinamento com resultados de browse em tempo real.

**Tramatto hoje:**

| Critério | Status | Observação |
|---|:---:|---|
| GPTBot permitido | ✅ | robots.txt explícito |
| llms.txt presente | ✅ | Descrição completa da marca e produtos |
| Conteúdo HTML estático indexável | ⚠️ | Home e about — produtos invisíveis (CSR) |
| Produto no dado de treinamento do ChatGPT | ❌ | Marca nova, não está nos dados de treinamento |
| Referências externas que ChatGPT possa ter processado | ❌ | Nenhuma |
| Bing index (base para ChatGPT Search) | ❌ | Bing Webmaster Tools não configurado |

**Score ChatGPT Search: 38/100**

**Limitação crítica para ChatGPT:** a base de dados de treinamento do GPT-4 não inclui a Tramatto (marca lançada após o corte). Para queries sem Browse, o modelo simplesmente não sabe que a Tramatto existe. Com Browse ativado, o llms.txt e a home são acessíveis — mas sem o Bing Webmaster Tools configurado, a descoberta é aleatória.

---

### 3. Gemini

**Como funciona:** Google-Extended é o crawler do Gemini — separado do Googlebot, mas também renderiza JS. Alimentado pelo índice Google + Knowledge Graph do Google. No modo AI Studio/Gemini Advanced, pode acessar URLs em tempo real. Para queries de produto, usa Merchant Center.

**Tramatto hoje:**

| Critério | Status | Observação |
|---|:---:|---|
| Google-Extended permitido | ✅ | robots.txt explícito |
| Organization @id (entidade no grafo) | ✅ | @id IRI definido |
| FAQPage para extração | ✅ | 2 páginas |
| Merchant Center (produto no índice de compras) | ❌ | Feed não publicado |
| Google Business Profile | ❌ | Ausente |
| Google Knowledge Panel | ❌ | Ausente (marca nova) |
| Backlinks e menções externas | ❌ | Ausente |

**Score Gemini: 54/100**

**Vantagem sobre ChatGPT:** o Gemini usa o mesmo índice do Google, que já tem o site indexado. A inferência de entidade funciona melhor para o Gemini do que para modelos cujo treinamento predatou a marca.

---

### 4. Perplexity

**Como funciona:** PerplexityBot rastreia HTML estático (sem JS). Usa busca em tempo real via múltiplos índices (Google, Bing, Common Crawl). Prioriza fontes com dados verificáveis, FAQPage schema e conteúdo técnico bem estruturado. Cita fontes explicitamente — o que torna a qualidade das URLs crítica.

**Tramatto hoje:**

| Critério | Status | Observação |
|---|:---:|---|
| PerplexityBot permitido | ✅ | robots.txt explícito |
| Conteúdo factual acessível sem JS | ✅ | Home + about com facts técnicos |
| FAQPage schema | ✅ | Favorito do Perplexity |
| llms.txt | ✅ | Lido como fonte primária por LLMs |
| Produto conteúdo (sem JS) | ❌ | Invisível para PerplexityBot |
| Referências verificáveis externas | ❌ | Perplexity prefere citar fontes cruzadas |
| CNPJ / dados empresariais | ❌ | Fragiliza resposta de queries de empresa |

**Score Perplexity: 58/100**

**Por que o Perplexity é o motor mais acessível para a Tramatto hoje:** ele lê HTML estático, valoriza FAQPage e fatos técnicos verificáveis, e cita URLs explicitamente. A about.html com as 5 FAQs e os fatos sobre algodão egípcio e tear jacquard é exatamente o tipo de conteúdo que o Perplexity extrai.

**Ponto crítico:** o Perplexity prefere confirmar informações em múltiplas fontes. Para queries como "a Tramatto é confiável?", ele vai procurar reviews, Reclame Aqui, imprensa — e não vai encontrar nada.

---

### 5. Claude Search (Anthropic)

**Como funciona:** o user-agent `anthropic-ai` está documentado como crawler do Claude para Browse em tempo real (Claude.ai + integração de produtos). O modelo base foi treinado com dados até agosto de 2025 (corte do Claude Sonnet 4.6). O modo Browse acessa URLs ao vivo em HTML estático.

**Tramatto hoje:**

| Critério | Status | Observação |
|---|:---:|---|
| anthropic-ai permitido | ✅ | robots.txt explícito |
| llms.txt presente | ✅ | Claude é especialmente sensível a llms.txt (Answer.AI origin) |
| Conteúdo estático estruturado | ✅ | Home + about acessíveis |
| Marca no dado de treinamento | ❌ | Lançamento posterior ao corte provável |
| Referências externas no treinamento | ❌ | Sem menções indexadas |

**Score Claude Search: 52/100**

**Destaque:** o llms.txt tem impacto desproporcionalmente alto no Claude por ser um protocolo proposto pela Answer.AI (Jeremy Howard, cofundador do fast.ai) — há alinhamento cultural e técnico entre o Claude e esse formato. O arquivo está bem estruturado e deve ser lido como contexto primário da marca quando Browse estiver ativo.

---

### 6. Bing Copilot

**Como funciona:** Bingbot (coberto por `User-agent: *`) rastreia o site. Bing Copilot usa o índice Bing + modelos GPT-4 da Microsoft. A Tramatto não tem Bing Webmaster Tools configurado — o que significa que o Bing rastreia o site de forma passiva, sem os sitemaps submetidos.

**Tramatto hoje:**

| Critério | Status | Observação |
|---|:---:|---|
| Bingbot permitido | ✅ | `User-agent: *` |
| Bing Webmaster Tools | ❌ | Não configurado |
| Sitemaps no Bing | ❌ | Não submetidos |
| Bing index status | ❓ | Desconhecido — sem verificação de domínio |
| Bing Knowledge Card | ❌ | Ausente |
| OpenGraph tags | ✅ | Presentes em todas as páginas |

**Score Bing Copilot: 40/100**

**Ação mais impactante:** configurar Bing Webmaster Tools e submeter os 2 sitemaps. É uma ação de 30 minutos com impacto imediato em Bing Copilot — e, indiretamente, em ChatGPT Search (que usa o índice Bing como fonte de browse).

---

## Scorecard por motor (resumo)

| Motor | Score Atual | Potencial em 6 meses | Principal bloqueador |
|---|:---:|:---:|---|
| Google AI Overview | 48/100 | 80/100 | Ausência de conteúdo editorial (blog) |
| ChatGPT Search | 38/100 | 72/100 | Bing não indexado + sem dados de treinamento |
| Gemini | 54/100 | 82/100 | Merchant Center + sem Knowledge Panel |
| Perplexity | 58/100 | 78/100 | Sem fontes externas cruzadas para verificação |
| Claude Search | 52/100 | 76/100 | Sem dados de treinamento; Browse depende de crawl |
| Bing Copilot | 40/100 | 70/100 | Bing Webmaster não configurado |
| **Média GEO** | **52/100** | **76/100** | |

---

## Gap 1 — Entidade (Entity Gap)

### O que é o gap de entidade
Um motor de AI cita uma marca com confiança quando consegue construir uma **entidade completa** sobre ela: quem é, o que faz, onde está, quando foi fundada, quem a fundou, e onde ela aparece em outras fontes. Atualmente, a entidade "Tramatto" existe apenas no schema.org do próprio site — sem corroboração externa.

### Auditoria de entidade

```
ENTIDADE: Tramatto
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ATRIBUTO               ESTADO          ONDE DECLARADO
──────────────────────────────────────────────────────
name                   ✅ "Tramatto"   Organization schema (index.html)
alternateName          ✅ "Tramatto Brasil"  Organization schema
url                    ✅              Organization schema
description            ✅              Organization schema + meta
logo                   ✅ SVG          Organization schema
areaServed             ✅ Brasil       Organization schema
knowsAbout             ✅ 6 tópicos    Organization schema
contactPoint           ✅ WhatsApp     Organization schema
sameAs [Instagram]     ✅              Organization schema
──────────────────────────────────────────────────────
foundingDate           ❌              Ausente
foundingLocation       ❌              Ausente
address                ❌              Ausente (Roadmap #4)
telephone              ❌              Ausente
legalName / CNPJ       ❌              Ausente (Roadmap #4)
numberOfEmployees      ❌              Ausente
founder (Person)       ❌              Ausente
sameAs [LinkedIn]      ❌              LinkedIn inexistente
sameAs [Pinterest]     ❌              Pinterest inexistente
sameAs [Wikidata]      ❌              Wikidata inexistente
sameAs [Google Maps]   ❌              Google Business inexistente
──────────────────────────────────────────────────────
Entidade no Google KG  ❌              Sem Knowledge Panel
Entidade no Wikidata   ❌              Sem Q-item
Entidade na Wikipedia  ❌              Sem artigo
```

### Impacto prático do gap de entidade

Quando um usuário pergunta ao Gemini "o que é a Tramatto?", o modelo tem apenas uma fonte: o próprio site da Tramatto. **Isso é circular** — o modelo não consegue verificar se a informação é confiável porque a única fonte é a própria marca dizendo isso. Motores de AI sérios como o Gemini e o Perplexity reduzem a confiança em respostas sem corroboração.

### Ações para fechar o gap de entidade

| Ação | Impacto | Esforço | Janela |
|---|---|---|---|
| Criar Google Business Profile (loja on-line) | Alto — aparece no KG do Google | Baixo | 30 dias |
| Criar LinkedIn da empresa + adicionar ao sameAs | Médio-Alto | Baixo | 30 dias |
| Criar Pinterest Business + adicionar ao sameAs | Médio | Baixo | 30 dias |
| Adicionar `foundingDate` ao Organization schema | Médio | Baixo | 30 dias (quando confirmado) |
| Adicionar `address` e `legalName` (CNPJ) ao schema | Alto | Baixo (depende do Roadmap #4) | 30-90 dias |
| Criar Person schema para fundador(es) | Alto — E-E-A-T | Baixo | 30 dias (se nome for publicado) |
| Criar Wikidata Q-item para a Tramatto | Muito Alto — KG universal | Médio | 90-180 dias (requer notabilidade) |

---

## Gap 2 — Autoridade (Authority Gap)

### O que é o gap de autoridade
Autoridade em GEO é a capacidade de um modelo de AI de confirmar que a Tramatto é uma fonte confiável e relevante no nicho de têxteis de cozinha premium — com base em evidências externas, não declarações da própria marca.

### Auditoria de autoridade

```
DIMENSÃO DE AUTORIDADE        ESTADO   NOTAS
─────────────────────────────────────────────────────────
E-E-A-T intrínseco (site)    ⚠️        Conteúdo técnico presente; sem fundador
Menções em imprensa          ❌        Zero descoberto
Citações em blogs             ❌        Zero descoberto
Reviews em plataformas        ❌        Zero (Google, Reclame Aqui, Trustpilot)
aggregateRating schema        ❌        Ausente em todos os produtos
Backlinks de qualidade        ❌        Ausente (domínio novo)
Perfis de redes sociais       ⚠️        Só Instagram
Perfis verificados            ❌        Nenhuma rede verificada
Presença em diretórios        ❌        Ausente (CNPJ, endereço necessários)
Registro em GS1 Brasil        ❌        GTIN não registrado (docs/merchant-center)
```

### Porque autoridade zero é crítico para GEO

Modelos como o Perplexity e o Bing Copilot explicitamente preferem citar fontes que aparecem em múltiplos lugares na web. Quando o modelo não encontra nenhuma menção externa à "Tramatto", ele:

1. Não sabe se a marca existe de fato
2. Reduz o peso da citação ou a omite completamente
3. Substitui por concorrentes que ele já conhece (Camesa, Karsten, marcas com presença maior)

**O risco é invisível:** a Tramatto não recebe erro — simplesmente não é citada.

### Ações para fechar o gap de autoridade (por prioridade)

**Curto prazo — sem dependências externas:**
1. Publicar CNPJ e razão social no rodapé do site (Roadmap #4) — mínima verificabilidade
2. Criar Reclame Aqui (mesmo sem reclamações) — presença no diretório padrão BR
3. Criar Google Business Profile — o sinal de autoridade mais acessível no Brasil
4. Configurar Bing Webmaster Tools — base para Bing Copilot

**Médio prazo — requer esforço de relações:**
5. Primeiro review em plataforma pública (Google Maps, Reclame Aqui) — triangulação básica
6. Guest post em 1 blog de decoração/cozinha com menção à Tramatto — primeiro backlink editorial
7. Enviar produto para 2-3 food bloggers / criadores de conteúdo — gera menção espontânea
8. Press release simples para assessorias de imprensa de moda/casa

---

## Gap 3 — Citabilidade (Citability Gap)

### O que é o gap de citabilidade
Um modelo de AI cita uma fonte quando ela tem conteúdo factual, específico e verificável sobre o tópico da query. A Tramatto tem bom conteúdo técnico sobre si mesma, mas **zero conteúdo sobre o nicho** — que é o que as queries de AI perguntam.

### Mapeamento de citabilidade por tipo de query

```
TIPO DE QUERY                EXEMPLO                           CONTEÚDO DISPONÍVEL
──────────────────────────────────────────────────────────────────────────────────
"o que é [marca]"          "o que é tramatto"                 ✅ about.html + llms.txt
"produto da marca"          "pano tramatto linho anatoliano"   ⚠️ CSR-only (produto)
"frete e política"          "tramatto tem frete grátis"        ✅ shipping.html FAQ
"qualidade dos materiais"   "tramatto algodão egípcio"         ✅ home + about.html
──────────────────────────────────────────────────────────────────────────────────
"como fazer X"              "como lavar pano de prato"         ❌ zero conteúdo
"qual o melhor X"           "melhor pano de prato premium"     ❌ zero conteúdo
"X vs. Y"                   "algodão vs. microfibra pano"      ❌ zero conteúdo
"guia de compra"            "como escolher pano de prato"      ❌ zero conteúdo
"presente de X"             "presente chá de cozinha"          ❌ zero conteúdo
"decoração"                 "mesa posta com panos"             ❌ zero conteúdo
"cuidados"                  "como tirar mancha pano"           ❌ zero conteúdo
"o que é [material]"        "o que é algodão egípcio"          ⚠️ parcial (about.html)
"o que é [técnica]"         "o que é tear jacquard"            ⚠️ parcial (about.html)
```

### O problema do "conteúdo circular"
Todo conteúdo factual atual da Tramatto é sobre a Tramatto. Quando um modelo de AI recebe a query "como lavar pano de prato?", ele procura o **melhor artigo sobre lavagem de panos de prato** — não o site de uma marca de panos. A Tramatto não aparece porque não tem esse artigo. Se tivesse, seria citada como fonte de autoridade com link para os produtos.

### Blog como veículo primário de citabilidade

O gap de citabilidade é 100% resolvível com o plano de conteúdo (docs/content-strategy.md). Os 20 artigos planejados cobrem exatamente as queries onde a Tramatto deveria ser citada mas não é. Cada artigo publicado com FAQPage schema aumenta o score GEO em ~1-2 pontos.

**Impacto projetado de cada artigo no GEO:**
- "Como lavar pano de prato" → +3 pontos GEO (volume alto, AI Overview certo)
- "Como tirar manchas" → +2 pontos GEO
- "O que é algodão egípcio" → +2 pontos (posição 1, AI Overview, ChatGPT Browse)
- "Presente para chá de cozinha" → +1,5 pontos (conversão + AI cite)
- Cada artigo seguinte → +1-1,5 pontos GEO

**Com 10 artigos publicados: score GEO projetado ~67/100.**  
**Com 20 artigos publicados: score GEO projetado ~75/100.**

---

## Gap 4 — Conteúdo Factual (Factual Content Gap)

### O que é o gap de conteúdo factual
Motores de AI sintetizam respostas a partir de **fatos verificáveis** no conteúdo. Fato verificável = afirmação com número, comparação, data, processo ou fonte atribuída. A Tramatto tem alguns fatos técnicos excelentes, mas todos concentrados em 2 páginas — e invisíveis para crawlers que não executam JS.

### Inventário de fatos verificáveis por página

| Página | Fatos verificáveis no HTML | Acessível sem JS |
|---|:---:|:---:|
| `index.html` | 8 fatos técnicos (38mm, 500 anos, 2×, algodão egípcio, jacquard, etc.) | ✅ |
| `pages/about.html` | 12 fatos técnicos (fibra 38mm, hotelaria europeia, 2× durável, etc.) | ✅ |
| `pages/shipping.html` | 5 fatos (prazo, frete grátis R$199, 30 dias devolução) | ✅ |
| `collection.html` | 0 fatos relevantes para AI | ✅ (mas vazio) |
| `product.html` (×4) | ~8 fatos por produto (material, tamanho, preço, stock) | ❌ (CSR) |
| Blog | ❌ inexistente | — |

**Total de fatos verificáveis acessíveis a AI sem JS: ~25**  
**Benchmark para autoridade topical mínima em um nicho: ~200-300 fatos distribuídos por 15+ URLs**

### Fatos que a Tramatto tem mas não publicou em HTML estático

```
Material:
  × fibra ELS (Extra Long Staple) — não mencionado
  × gramatura dos produtos (g/m²) — ausente
  × composição exata de algodão (100%?) — ausente
  × temperatura de lavagem segura (40°C) — ausente no HTML
  × onde exatamente na Turquia são produzidos — vago ("Anatólia")

Produto:
  × SKUs específicos — apenas no JS
  × tamanhos disponíveis (45×70, 60×90) — apenas no JS
  × cores por produto — apenas no JS
  × preços — apenas no JS

Empresa:
  × ano de fundação — ausente em qualquer página
  × número de modelos no catálogo — ausente
  × número de países de entrega — implícito (Brasil), não declarado
  × prazo médio exato — no shipping, mas sem schema HowTo
```

### HowTo schema — oportunidade inexplorada

O conteúdo de cuidados de produto (lavagem, conservação) é ideal para `HowTo` schema. A Tramatto menciona "lavar até 40°C, sem alvejante, secar à sombra" no about.html, mas sem schema estruturado. Com HowTo:
- O Google pode exibir as etapas diretamente no AI Overview
- O Perplexity extrai as etapas como resposta numerada
- A Tramatto vira referência para "como lavar pano de prato jacquard"

---

## Gap 5 — Knowledge Graph (KG Gap)

### O que é o gap de Knowledge Graph
O Google Knowledge Graph (e correlatos como Wikidata, Freebase/DBpedia) é o grafo de entidades que alimenta a camada de raciocínio dos modelos de AI. Uma entidade no KG é tratada como "real" e "verificada" — uma entidade fora do KG é tratada como "afirmação não confirmada".

### Estado atual da Tramatto no Knowledge Graph

```
GRAFO DE CONHECIMENTO          ESTADO
────────────────────────────────────────────
Google Knowledge Graph         ❌ Sem entry
Google Business Profile        ❌ Ausente
Google Knowledge Panel         ❌ Ausente
Wikidata                       ❌ Sem Q-item
DBpedia / Freebase             ❌ Ausente
LinkedIn Knowledge Graph       ❌ Sem perfil
Crunchbase                     ❌ Ausente
Open Corporates                ❌ Ausente (requer CNPJ público)
Schema.org @id (próprio site)  ✅ https://tramatto.com/#organization
Instagram (sameAs)             ✅ Única referência externa
```

### Por que Knowledge Graph importa para GEO

Quando o Gemini recebe "comprar panos de prato premium no brasil", ele consulta o Google Shopping (Merchant Center) + o Google Knowledge Graph. Marcas sem entrada no KG são avaliadas apenas pelo conteúdo do site — sem o "boost" de confiança de uma entidade verificada.

**Analogia:** o @id da Organization é como um passaporte emitido pela própria pessoa. Funciona para provar identidade em contextos de baixa exigência. Uma entrada no Wikidata é como um passaporte emitido por um governo — amplamente aceito e verificado por terceiros.

### Caminho para o Knowledge Graph

```
FASE 1 (30-90 dias): fundações
  → Google Business Profile → alimenta KG do Google automaticamente
  → LinkedIn da empresa → KG do LinkedIn (usado pelo Bing e Claude)
  → Bing Webmaster + submeter sitemaps → KG do Bing/Microsoft

FASE 2 (90-180 dias): corroboração
  → Primeira menção de imprensa → sinal de notabilidade
  → Reclame Aqui + review inicial → sinal de operação real
  → Crunchbase (gratuito) → diretório de empresas

FASE 3 (180+ dias): Wikidata
  → Requer ao menos 1-2 menções em publicações notáveis
  → Criar Q-item no Wikidata com referências verificáveis
  → Google leva 2-6 meses para consumir Wikidata em seu KG
```

---

## Roadmap GEO

### Priorização por impacto × esforço

```
IMPACTO ALTO
    │
    │  ■ Blog artigos B1+B2     ■ Bing Webmaster
    │  ■ Google Business Profile ■ Fundador no schema
    │  ■ CNPJ no rodapé (Roadmap #4)
    │
    │         ■ LinkedIn empresa    ■ FAQPage na home
    │         ■ HowTo schema        ■ Pinterest biz
    │
    │                    ■ Guest post blog     ■ Reclame Aqui
    │                    ■ Influencer outreach
    │
    │                              ■ Wikidata     ■ Imprensa
IMPACTO BAIXO
    └────────────────────────────────────────────────────
      ESFORÇO BAIXO                              ESFORÇO ALTO
```

---

### 30 dias — "Fechar gaps técnicos e de entidade"

**Objetivo:** levar o score GEO de 52 para ~62/100 resolvendo gaps que não dependem de conteúdo ou menções externas.

| # | Ação | Tipo | Impacto GEO | Esforço | Motor mais beneficiado |
|:-:|---|---|:---:|---|---|
| 1 | **Configurar Bing Webmaster Tools** + submeter sitemap.xml e sitemap-products.xml | Técnico | Alto | 30 min | Bing Copilot, ChatGPT Search |
| 2 | **Criar Google Business Profile** (tipo: loja on-line) + adicionar ao sameAs do Organization schema | Entidade | Alto | 1h | Google AI Overview, Gemini |
| 3 | **Adicionar CNPJ e razão social** no rodapé de todas as páginas + `legalName` no Organization schema | Confiança | Alto | 1h (depende do Roadmap #4) | Todos |
| 4 | **Adicionar `foundingDate`** ao Organization schema (quando confirmado) | Entidade | Médio | 5 min | Gemini, Claude |
| 5 | **Publicar artigos B1 + B2** ("Como lavar pano de prato" + "Como tirar manchas") com FAQPage + Article schema | Conteúdo | Muito Alto | 2-3h | Google AI Overview, Perplexity |
| 6 | **Adicionar `HowTo` schema** às instruções de lavagem na shipping.html | Schema | Médio | 30 min | Google AI Overview |
| 7 | **Criar LinkedIn da empresa** + adicionar ao sameAs | Entidade | Médio | 1h | Bing Copilot, Claude Search |
| 8 | **Criar Reclame Aqui** (perfil básico, sem produto ainda) | Confiança | Médio | 30 min | Perplexity, Bing Copilot |
| 9 | **Criar template HTML de artigo** para `/blog/` com Article + FAQPage + BreadcrumbList + datePublished | Técnico | Alto (habilitador) | 2h | Todos |
| 10 | **Atualizar llms.txt** com URL do blog e novos artigos conforme publicados | Conteúdo | Médio | 5 min/artigo | ChatGPT, Claude |

**Score projetado ao final dos 30 dias: ~62/100**

---

### 90 dias — "Construir autoridade de conteúdo e presença externa"

**Objetivo:** levar o score GEO de ~62 para ~72/100 com conteúdo editorial publicado e primeiros sinais externos.

| # | Ação | Tipo | Impacto GEO | Esforço | Motor mais beneficiado |
|:-:|---|---|:---:|---|---|
| 11 | **Publicar 8 artigos** restantes do priority tier 🔴 (A1, A3, C1, C2, D1, D2, D3 da content strategy) | Conteúdo | Muito Alto | 12-16h | Todos |
| 12 | **Article schema** em todos os artigos com `author`, `datePublished`, `dateModified`, `publisher` | Schema | Alto | 30 min/artigo | Google AI Overview, Perplexity |
| 13 | **Person schema** para fundador(es) linkado ao Organization via `founder` | Entidade | Alto | 30 min (quando nome for publicado) | Gemini, Google AI Overview |
| 14 | **FAQPage na home** (index.html) com 5-6 perguntas sobre a marca e os produtos | Schema + Conteúdo | Alto | 1h | Google AI Overview |
| 15 | **Pinterest Business** + primeiro board de "mesa posta + panos Tramatto" + sameAs | Entidade | Médio | 2h | Google Discover, Bing Copilot |
| 16 | **Primeira menção externa** — guest post em blog de decoração/cozinha com link DoFollow | Autoridade | Muito Alto | 3-5h | Todos (sinal de corroboração) |
| 17 | **Enviar kit para 2-3 criadores de conteúdo** (micro-influencer home/decoração) — gerar menção espontânea | Autoridade | Alto | Requer produto físico | Perplexity, ChatGPT Search |
| 18 | **Submeter produto ao Google Merchant Center** (Roadmap Merchant Center Fase 2) | Produto | Alto para Shopping | Médio | Gemini (Shopping), Google |
| 19 | **ItemList schema** na collection.html com os 4 produtos + kits | Schema | Médio | 1h | Google AI Overview, Perplexity |
| 20 | **Criar sitemap de blog** (`sitemap-blog.xml`) + declarar em robots.txt e sitemap index | Técnico | Alto | 30 min | Todos |

**Score projetado ao final dos 90 dias: ~72/100**

---

### 180 dias — "Consolidar autoridade e entrar no Knowledge Graph"

**Objetivo:** levar o score GEO de ~72 para ~82/100 com autoridade topical estabelecida, entidade verificada externamente, e primeiros signals de Knowledge Graph.

| # | Ação | Tipo | Impacto GEO | Esforço | Motor mais beneficiado |
|:-:|---|---|:---:|---|---|
| 21 | **Publicar 20 artigos** (plano completo da content strategy) | Conteúdo | Muito Alto | 20-30h total | Todos |
| 22 | **aggregateRating** no Product schema quando tiver primeiros reviews | Schema | Muito Alto | 30 min (depende de vendas) | Google AI Overview, Perplexity |
| 23 | **Primeira menção em veículo de imprensa** (Casa e Jardim, Época Negócios, Veja SP, blog Westwing BR) | Autoridade | Muito Alto | 5-10h + relações | Todos (sinal mais forte) |
| 24 | **Crunchbase profile** (gratuito) | KG | Médio | 30 min | Claude Search, Bing Copilot |
| 25 | **Wikidata Q-item** para "Tramatto" com referências verificáveis | KG | Muito Alto | 2h (requer notabilidade provada) | Gemini, Google AI Overview |
| 26 | **VideoObject schema** se houver vídeos de produto / processo | Schema + Conteúdo | Médio | Depende de Roadmap #16 (foto) | Google AI Overview |
| 27 | **SSR do catálogo** (Roadmap #14) — conteúdo de produto visível sem JS | Técnico | Alto | Alto | ChatGPT, Perplexity, Claude |
| 28 | **Reescrever llms.txt** com blog completo, todos os artigos listados | Conteúdo | Médio | 1h | ChatGPT, Claude |
| 29 | **Menção em diretório de marcas premium brasileiras** (ex.: Think Olga, Etiqueta Única, revistas lifestyle) | Autoridade | Alto | 3-5h | Todos |
| 30 | **Avaliar Google Knowledge Panel** — verificar se o Business Profile gerou painel automático | KG | Muito Alto | Passivo (verificar no Search Console) | Gemini, Google AI Overview |

**Score projetado ao final dos 180 dias: ~82/100**

---

## Projeção de score GEO ao longo do tempo

```
Score GEO
    │
 82 │                                              ████████
    │                                         ███████
 72 │                                  ████████
    │                           ██████
 62 │                    ██████
    │             ██████
 52 │     ████████
    │
 40 │
    │
    └────┬────────┬────────┬────────┬────────┬────────┬───
        Hoje    +2sem    +30d    +60d    +90d   +120d  +180d

Marcos:
  → +30d: Google Business + Bing WT + 2 artigos + HowTo = 62
  → +90d: 10 artigos + 1ª menção externa + schemas completos = 72
  → +180d: 20 artigos + imprensa + Wikidata + SSR = 82+
```

---

## Ações imediatas (esta semana, sem reunião)

Ordenadas por impacto / esforço: cada ação abaixo pode ser executada por 1 pessoa em menos de 1 hora sem dependências externas.

1. **Bing Webmaster Tools** (`bing.com/webmasters`) — verificar domínio + submeter sitemap.xml e sitemap-products.xml. Impacto: Bing Copilot + ChatGPT Search.

2. **Google Business Profile** (`business.google.com`) — criar perfil tipo "Loja on-line", categoria "Loja de artigos para casa". Após criação, adicionar URL ao `sameAs` do Organization schema em `index.html`.

3. **HowTo schema** na `pages/shipping.html` ou `pages/about.html` — embutir nas instruções de lavagem ("lavar até 40°C, sem alvejante, secar à sombra") como `HowTo` com 3-4 etapas. Isso leva 30 minutos e é um dos schemas favoritos do Google AI Overview.

4. **FAQPage na home** — adicionar bloco `FAQPage` JSON-LD em `index.html` com 5 perguntas sobre a marca (o que é, de onde vem, como é feito, qual o preço, como comprar). Hoje o home tem Organization + WebSite mas nenhuma FAQ.

5. **Reclame Aqui** (`reclameaqui.com.br`) — criar perfil gratuito. Mesmo sem reclamações, a presença no diretório é um sinal de "empresa real" que o Perplexity e o Bing verificam.

---

## Métricas de acompanhamento GEO

### Verificações mensais (manuais)

```bash
# Queries para testar em cada motor (incógnito / sem login)

ChatGPT (com Browse):
  "o que é tramatto"
  "melhor pano de prato premium no brasil"
  "como lavar pano de prato" → verificar se Tramatto é citada

Perplexity:
  "tramatto panos de prato"
  "pano de prato turco brasil"
  "algodão egípcio fibra longa têxtil" → verificar citação

Google (AI Overview):
  "como lavar pano de prato"
  "pano de prato que não desbota"
  "presente para chá de cozinha"
  → verificar se aparece AI Overview e se Tramatto está citada

Gemini:
  "marca brasileira de panos de prato premium"
  "onde comprar pano de prato de algodão egípcio"

Claude (com Browse):
  "tramatto"
  "panos de prato premium importados turquia brasil"
```

### Métricas quantitativas

| Métrica | Fonte | Frequência | Target 90d | Target 180d |
|---|---|---|---|---|
| Citações de AI (manual spot check) | Manual | Mensal | 3/10 queries testadas | 6/10 queries testadas |
| Impressões no Bing (após Webmaster Tools) | Bing Webmaster | Semanal | 500+/mês | 2.000+/mês |
| Tráfego do blog (quando existir) | GA4 | Semanal | 500 sessões/mês | 3.000 sessões/mês |
| Featured snippets no Google | Search Console | Mensal | 2-3 snippets | 8-10 snippets |
| Reviews em plataformas externas | Manual | Mensal | 1ª review | 10+ reviews |
| Domínios referenciando (backlinks) | Search Console | Mensal | 2-3 domínios | 8-10 domínios |
| FAQPage impressions | Search Console > Rich Results | Mensal | 200+/mês | 1.000+/mês |

---

## Síntese executiva

### O que está funcionando
A infraestrutura técnica de GEO da Tramatto é **excepcional para uma marca nova**: llms.txt bem escrito, robots.txt com política explícita de AI bots, schemas Organization/WebSite/FAQPage/AboutPage linkados via @id, sitemap duplo (institucional + PDPs), e conteúdo técnico factual no HTML estático.

### O que está faltando
**Tudo que vem de fora.** A Tramatto faz um excelente trabalho de "se apresentar para AI" — mas não tem nenhuma fonte externa que confirme que ela existe. No universo GEO, uma marca que só fala de si mesma tem peso zero quando comparada com marcas que outras pessoas mencionam.

### A ordem de grandeza dos gaps

| Gap | Impacto no Score | Prazo para resolver |
|---|:---:|---|
| Sem blog / conteúdo informacional | -15 pontos | 30-90 dias (executar content strategy) |
| Sem corroboração externa (imprensa, reviews, links) | -12 pontos | 90-180 dias |
| Sem Knowledge Graph entry | -8 pontos | 90-180 dias (depende de notabilidade) |
| Sem Person (fundador) | -5 pontos | 30 dias (decisão interna) |
| Sem endereço/CNPJ no schema | -4 pontos | 30 dias (Roadmap #4) |
| Produto invisível sem JS | -4 pontos | 180 dias (SSR, Roadmap #14) |

### A alavanca principal
**Publicar conteúdo.** Os 20 artigos do `docs/content-strategy.md` são o investimento de maior retorno em GEO. Cada artigo publicado com FAQPage schema e fatos verificáveis aumenta a probabilidade de citação em 3-5% por motor. Com 20 artigos, a Tramatto passa de "invisível em queries informacionais" para "referência citável" em todo o nicho de têxteis de cozinha premium no Brasil.
