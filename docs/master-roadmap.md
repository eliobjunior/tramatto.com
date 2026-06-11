# Master Roadmap — Tramatto Storefront

**Data:** 2026-06-10
**Fontes:** [docs/technical-audit.md](technical-audit.md) (auditoria técnica) + [docs/business-audit.md](business-audit.md) (auditoria de negócio)
**Objetivo:** consolidar os achados das duas auditorias em um plano único, priorizado por ROI, com estimativas de esforço/impacto e horizontes de 30/90/360 dias.

> Este documento não altera código — é um plano de execução. Cada item referencia o achado de origem (ex.: `B1`, `S1`, `TR1`, `🔴#1`) das auditorias técnica e de negócio.

---

## 1. Como ler este documento

- **Esforço**: Baixo (horas, sem dependências), Médio (dias, pode envolver decisão de produto), Alto (semanas, depende de infraestrutura/API externa ou retrabalho estrutural).
- **Impacto**: Baixo (qualidade/manutenibilidade), Médio (afeta conversão/SEO de forma indireta ou parcial), Alto (afeta diretamente receita, indexação ou capacidade de vender).
- **ROI** = Impacto ÷ Esforço. Itens **Alto Impacto / Baixo-Médio Esforço** vêm primeiro, sempre.
- **Categorias**: SEO, GEO, Conversão (CRO), UX, Integração Nuvemshop, Débito Técnico. Um item pode aparecer em mais de uma categoria — nesse caso ele é listado na categoria primária e referenciado nas demais.

---

## 2. Tabela mestre de priorização (ROI)

| # | Item | Categoria(s) | Esforço | Impacto | ROI | Origem |
|---|---|---|---|---|---|---|
| 1 | **Substituir WhatsApp placeholder por número real** (ou remover) | Conversão, UX | Baixo | Alto | ⭐⭐⭐⭐⭐ | TR4 |
| 2 | **Corrigir todos os links `#`** (footer home, "Ver todos", newsletter, redes sociais) | Conversão, UX | Baixo | Alto | ⭐⭐⭐⭐⭐ | 🔴#4, S5 |
| 3 | **Carrinho/drawer visível + "Finalizar pelo WhatsApp"** (ponte até checkout real) | Conversão, Nuvemshop Integration | Médio | Alto | ⭐⭐⭐⭐⭐ | 🔴#1 |
| 4 | **Adicionar CNPJ, razão social e endereço** no rodapé/políticas | Conversão (Trust), Débito Técnico | Baixo | Alto | ⭐⭐⭐⭐⭐ | TR1 |
| 5 | **Unificar `styles.css` e `css/styles.css`** (corrige skip-link em `index.html`) | Débito Técnico, UX | Baixo | Médio-Alto | ⭐⭐⭐⭐ | D1, AC1 |
| 6 | **Remover 666 linhas de CSS morto em `index.html`** | Débito Técnico, Performance | Baixo | Médio | ⭐⭐⭐⭐ | B1, P5 |
| 7 | **Substituir hero `<img>` base64 (~225KB) por arquivo otimizado** | Performance, UX, Conversão | Baixo | Alto | ⭐⭐⭐⭐⭐ | M2 |
| 8 | **Expor Kits na `collection.html`** (ou seção "Presentes" dedicada) | Conversão, SEO | Médio | Alto | ⭐⭐⭐⭐ | CP2 |
| 9 | **Seletor de quantidade + cross-sell de Kits no `product.html`** | Conversão | Médio | Alto | ⭐⭐⭐⭐ | PP2, PP3 |
| 10 | **Adicionar `defer` em todos os `<script>`** | Performance, Débito Técnico | Baixo | Médio | ⭐⭐⭐⭐ | P3 |
| 11 | **Remover `integrations/nuvemshop.js` legado** + atualizar docs | Débito Técnico, Nuvemshop Integration | Baixo | Médio | ⭐⭐⭐ | A1, D2 |
| 12 | **`aria-expanded`/`aria-controls` no menu mobile + `aria-live` no toast** | UX (Acessibilidade) | Baixo | Médio | ⭐⭐⭐ | AC2, AC5 |
| 13 | **FAQ visível + `FAQPage` schema** (reaproveitar conteúdo de frete/trocas/origem) | SEO, GEO | Médio | Alto | ⭐⭐⭐⭐ | GEO1 |
| 14 | **Conteúdo do catálogo no HTML inicial** (SSR/snapshot, não só pós-JS) | SEO, GEO | Alto | Alto | ⭐⭐⭐ | S2, GEO4 |
| 15 | **`<title>`/canonical dinâmicos por produto + sitemap por slug** | SEO | Médio-Alto | Alto | ⭐⭐⭐ | S1, S3, SEO1 |
| 16 | **Sessão de fotos própria** (produto + lifestyle) | Conversão, UX, Posicionamento | Alto | Alto | ⭐⭐⭐ | seção 3 (audit. negócio) |
| 17 | **`package.json` + CI básico (`node --test`)** | Débito Técnico | Baixo | Médio | ⭐⭐⭐⭐ | B3, D6 |
| 18 | **Modelar Kits como entidade própria no domínio** | Débito Técnico, Conversão | Médio | Médio | ⭐⭐ | B6 |
| 19 | **Implementar `client.js` real da Nuvemshop** (auth, endpoints, paginação) | Nuvemshop Integration | Alto | Alto | ⭐⭐⭐ | B2, D4, seção 9 (técnico) |
| 20 | **Reescrever `mapper.js` conforme schema real Nuvemshop** | Nuvemshop Integration | Alto | Alto | ⭐⭐⭐ | seção 9.2 (técnico) |
| 21 | **Estratégia de checkout real** (hospedado Nuvemshop vs. próprio) | Nuvemshop Integration, Conversão | Alto | Alto | ⭐⭐⭐ | seção 9.3 (técnico) |
| 22 | **Programa de prova social** (depoimentos, embed Instagram, reviews) | Conversão, GEO | Médio | Alto | ⭐⭐⭐ | TR3, GEO2 |
| 23 | **Conteúdo educacional/blog** (cuidados, guias de presente, comparativos) | SEO, GEO | Alto | Alto | ⭐⭐⭐ | SEO2, GEO3 |
| 24 | **Páginas de coleção temáticas indexáveis** (`/colecoes/essentials`, etc.) | SEO | Médio-Alto | Médio | ⭐⭐ | SEO5 |
| 25 | **Otimização de imagens de produto** (resolução adaptativa, lazy load, próprias) | Performance, SEO, UX | Alto | Alto | ⭐⭐⭐ | P1, D3, M3 |
| 26 | **CSP + SRI** | Segurança | Baixo | Baixo | ⭐⭐ | SEC3, SEC4 |
| 27 | **Página "Sobre" com sinais E-E-A-T** (fundadores, ano, processo) | GEO, Conversão | Médio | Médio | ⭐⭐⭐ | GEO2 |
| 28 | **`role="radiogroup"`/`aria-pressed` em variantes** | UX (Acessibilidade) | Baixo | Baixo-Médio | ⭐⭐ | AC4 |
| 29 | **Bundler/build (Vite/esbuild)** para resolver carregamento de scripts | Débito Técnico, Performance | Alto | Médio | ⭐⭐ | A2, SC2, SC4 |
| 30 | **Internacionalização (i18n)** | Débito Técnico, Escalabilidade | Alto | Baixo (no momento) | ⭐ | SC5 |

---

## 3. Roadmap de 30 dias — "Destravar a venda"

**Tema:** parar de perder dinheiro. Foco total em remover bloqueadores de conversão e limpar dívidas técnicas de baixo esforço/alto impacto que afetam confiança e performance.

| Semana | Itens | Categoria | Esforço | Impacto |
|---|---|---|---|---|
| 1 | #1 WhatsApp real, #2 corrigir links `#`, #4 CNPJ/endereço/razão social | Conversão, UX | Baixo | Alto |
| 1 | #5 Unificar CSS, #6 remover CSS morto, #10 `defer` nos scripts | Débito Técnico, Performance | Baixo | Médio-Alto |
| 2 | #7 Substituir hero base64 por imagem otimizada | Performance, Conversão | Baixo | Alto |
| 2 | #11 Remover `integrations/nuvemshop.js` legado + atualizar docs | Débito Técnico | Baixo | Médio |
| 2-3 | #3 Carrinho visível + "Finalizar pelo WhatsApp" (MVP de checkout-ponte) | Conversão, Nuvemshop Integration | Médio | **Alto** |
| 3 | #12 `aria-expanded`/`aria-controls`/`aria-live` | UX | Baixo | Médio |
| 4 | #17 `package.json` + CI (`node --test`) | Débito Técnico | Baixo | Médio |
| 4 | #8 Expor Kits na `collection.html` | Conversão, SEO | Médio | Alto |

**Critério de saída do mês 1:** o site consegue gerar uma venda de ponta a ponta (mesmo que via WhatsApp), os links principais funcionam, a home carrega rápido em mobile, e a base de governança (CI + CSS único) está pronta para suportar o crescimento dos meses seguintes.

---

## 4. Roadmap de 90 dias — "Converter melhor e aparecer mais"

**Tema:** com o funil destravado, investir em conversão na página de produto/coleção e em fundamentos de SEO/GEO que dependem de mudanças estruturais maiores.

| Mês | Itens | Categoria | Esforço | Impacto |
|---|---|---|---|---|
| 2 | #9 Seletor de quantidade + cross-sell de Kits | Conversão | Médio | Alto |
| 2 | #13 FAQ visível + `FAQPage` schema | SEO, GEO | Médio | Alto |
| 2 | #18 Modelar Kits como entidade própria | Débito Técnico, Conversão | Médio | Médio |
| 2-3 | #15 `<title>`/canonical dinâmicos por produto + sitemap por slug | SEO | Médio-Alto | Alto |
| 3 | #22 Programa de prova social (depoimentos/Instagram embed) | Conversão, GEO | Médio | Alto |
| 3 | #27 Página "Sobre" com sinais E-E-A-T | GEO, Conversão | Médio | Médio |
| 3 (início) | #19 Início do `client.js` real Nuvemshop (descoberta de API/credenciais) | Nuvemshop Integration | Alto (início) | Alto |

**Critério de saída do mês 3:** páginas de produto convertem melhor (qty seletor, cross-sell, FAQ, prova social), produtos individuais começam a ser indexáveis, e a integração Nuvemshop real está em desenvolvimento ativo (não mais "stub").

---

## 5. Roadmap de 12 meses — "Escalar com infraestrutura real"

**Tema:** migrar de "vitrine + ponte manual" para loja real conectada à Nuvemshop, com catálogo, fotografia e conteúdo escaláveis.

| Trimestre | Itens | Categoria | Esforço | Impacto |
|---|---|---|---|---|
| Q2 (meses 4-6) | #19 `client.js` real + #20 `mapper.js` real + #21 estratégia de checkout (Nuvemshop hospedado) | Nuvemshop Integration | Alto | Alto |
| Q2 | #14 Catálogo renderizado no HTML inicial (SSR/snapshot) — coordenar com #19/#20 | SEO, GEO, Nuvemshop Integration | Alto | Alto |
| Q2-Q3 | #16 Sessão de fotos própria (produto + lifestyle) | Conversão, Posicionamento | Alto | Alto |
| Q3 (meses 7-9) | #25 Otimização de imagens (CDN/responsivo/lazy load) — depende de #16 | Performance, SEO | Alto | Alto |
| Q3 | #23 Conteúdo educacional/blog (cuidados, guias de presente, comparativos) | SEO, GEO | Alto | Alto |
| Q3 | #24 Páginas de coleção temáticas indexáveis | SEO | Médio-Alto | Médio |
| Q4 (meses 10-12) | #29 Avaliar bundler (Vite/esbuild) à luz do catálogo real e do volume de scripts | Débito Técnico, Performance | Alto | Médio |
| Q4 | #26 CSP + SRI, #28 ARIA em variantes (polimento de segurança/acessibilidade) | Segurança, UX | Baixo | Baixo-Médio |
| Q4 (condicional) | #30 Internacionalização — **somente se houver decisão de expansão internacional** | Débito Técnico | Alto | Baixo→Alto (condicional) |

**Critério de saída do ano 1:** loja totalmente integrada à Nuvemshop (catálogo real, checkout nativo, Pix/parcelamento), fotografia própria em produção, conteúdo educacional gerando tráfego orgânico recorrente, e arquitetura técnica pronta para crescer (CI, bundler avaliado, schema validado).

---

## 6. Visão por categoria

### 6.1 SEO

| Item | Esforço | Impacto | Janela |
|---|---|---|---|
| #13 FAQ + `FAQPage` schema | Médio | Alto | 90 dias |
| #15 Title/canonical dinâmicos por produto + sitemap por slug | Médio-Alto | Alto | 90 dias |
| #14 Catálogo no HTML inicial (SSR/snapshot) | Alto | Alto | 12 meses (Q2) |
| #23 Conteúdo educacional/blog | Alto | Alto | 12 meses (Q3) |
| #24 Páginas de coleção temáticas | Médio-Alto | Médio | 12 meses (Q3) |
| Limpeza de `<meta name="keywords">` (obsoleto) | Baixo | Baixo | Oportunista (junto com #6) |

**Resumo:** a base técnica de SEO (Schema.org, sitemap, robots) já é boa; o gargalo é **indexabilidade de produto individual** (#15, #14) e **volume de conteúdo** (#23). Sem #14, qualquer outro esforço de SEO de produto tem retorno limitado — priorizar nessa ordem.

---

### 6.2 GEO (Generative Engine Optimization)

| Item | Esforço | Impacto | Janela |
|---|---|---|---|
| #13 FAQ + `FAQPage` schema | Médio | Alto | 90 dias |
| #14 Catálogo no HTML inicial | Alto | Alto | 12 meses (Q2) |
| #27 Página "Sobre" com E-E-A-T | Médio | Médio | 90 dias |
| #22 Prova social (alimenta sinais de confiança para LLMs) | Médio | Alto | 90 dias |
| #23 Conteúdo comparativo/educacional | Alto | Alto | 12 meses (Q3) |

**Resumo:** os dados estruturados já existentes (Organization, WebSite, Product, Breadcrumb) são um ativo raro nesse estágio de projeto — o trabalho de GEO é principalmente **tornar esse conteúdo visível sem JS** (#14) e **adicionar formatos que LLMs preferem citar** (FAQ, comparativos, fatos verificáveis sobre a marca).

---

### 6.3 Conversão (CRO)

| Item | Esforço | Impacto | Janela |
|---|---|---|---|
| #1 WhatsApp real | Baixo | Alto | 30 dias |
| #2 Corrigir links `#` | Baixo | Alto | 30 dias |
| #3 Carrinho visível + checkout-ponte WhatsApp | Médio | **Alto (bloqueador)** | 30 dias |
| #4 CNPJ/endereço/razão social | Baixo | Alto | 30 dias |
| #8 Expor Kits na coleção | Médio | Alto | 30 dias |
| #9 Seletor de quantidade + cross-sell | Médio | Alto | 90 dias |
| #22 Prova social | Médio | Alto | 90 dias |
| #16 Fotografia própria | Alto | Alto | 12 meses (Q2-Q3) |
| #21 Checkout real (Nuvemshop hospedado) | Alto | Alto | 12 meses (Q2) |

**Resumo:** esta é a categoria com **maior concentração de itens "Alto Impacto / Baixo-Médio Esforço"** — por isso domina o roadmap de 30 dias. O item #3 é o único classificado como bloqueador absoluto: nenhuma outra otimização de conversão tem efeito prático até existir um caminho de compra.

---

### 6.4 UX

| Item | Esforço | Impacto | Janela |
|---|---|---|---|
| #5 Unificar CSS (corrige skip-link) | Baixo | Médio-Alto | 30 dias |
| #7 Hero sem base64 (perf percebida) | Baixo | Alto | 30 dias |
| #12 ARIA no menu/toast | Baixo | Médio | 30 dias |
| #28 ARIA em variantes | Baixo | Baixo-Médio | 12 meses (Q4) |
| Sticky add-to-cart mobile (M5, audit. negócio) | Médio | Médio | 90 dias (junto com #9) |

**Resumo:** maioria dos itens de UX são **baixo esforço e podem ser resolvidos no mês 1** — a exceção é o trabalho de fotografia/sticky CTA, que se conecta diretamente à categoria Conversão.

---

### 6.5 Integração Nuvemshop

| Item | Esforço | Impacto | Janela |
|---|---|---|---|
| #11 Remover `integrations/nuvemshop.js` legado | Baixo | Médio | 30 dias |
| #3 Carrinho + ponte WhatsApp (provisório, até #19-21) | Médio | Alto | 30 dias |
| #19 `client.js` real (auth, endpoints, paginação) | Alto | Alto | 12 meses (Q2) |
| #20 `mapper.js` conforme schema real | Alto | Alto | 12 meses (Q2) |
| #21 Estratégia de checkout (hospedado vs. próprio) | Alto | Alto | 12 meses (Q2) |
| #14 Catálogo no HTML inicial (depende de #19/#20) | Alto | Alto | 12 meses (Q2) |

**Resumo:** a arquitetura de adapters (`MockAdapter`/`NuvemshopAdapter`, `js/config.js`) já está pronta para receber a implementação real — o trabalho dos meses 4-6 é **substituir o stub por chamadas reais**, não redesenhar a base. Antes disso (mês 1), a "ponte WhatsApp" (#3) cobre a lacuna de checkout sem depender da API.

---

### 6.6 Débito Técnico

| Item | Esforço | Impacto | Janela |
|---|---|---|---|
| #5 Unificar CSS | Baixo | Médio-Alto | 30 dias |
| #6 Remover CSS morto | Baixo | Médio | 30 dias |
| #10 `defer` nos scripts | Baixo | Médio | 30 dias |
| #11 Remover integração legada | Baixo | Médio | 30 dias |
| #17 `package.json` + CI | Baixo | Médio | 30 dias |
| #18 Kits como entidade de domínio | Médio | Médio | 90 dias |
| #26 CSP + SRI | Baixo | Baixo | 12 meses (Q4) |
| #29 Avaliar bundler | Alto | Médio | 12 meses (Q4) |
| #30 i18n | Alto | Baixo (condicional) | 12 meses (Q4, condicional) |

**Resumo:** quase todo o débito técnico de **alto ROI é baixo esforço** e cabe inteiramente no mês 1 — tratá-lo cedo evita que a dívida (CSS duplicado, CSS morto, scripts sem `defer`, integração legada) se propague enquanto o catálogo e o checkout real são desenvolvidos.

---

## 7. Matriz Esforço × Impacto (visão consolidada)

```
                 IMPACTO
            Baixo      Médio              Alto
        ┌──────────┬──────────────┬──────────────────────────────┐
 Baixo  │ #26 CSP/ │ #6 CSS morto │ #1 WhatsApp  #2 Links #4 CNPJ │
        │ SRI      │ #10 defer    │ #5 CSS único #7 Hero base64   │
ESFORÇO │          │ #11 legado   │ #17 CI                        │
        │          │ #12 ARIA     │                                │
        ├──────────┼──────────────┼──────────────────────────────┤
 Médio  │          │ #18 Kits     │ #3 Carrinho+WhatsApp #8 Kits  │
        │          │ domínio      │ na coleção #9 Qty+cross-sell  │
        │          │              │ #13 FAQ #22 Prova social      │
        │          │              │ #27 Sobre/E-E-A-T              │
        ├──────────┼──────────────┼──────────────────────────────┤
 Alto   │ #30 i18n │ #24 Coleções │ #14 SSR catálogo #15 SEO produto│
        │ (cond.)  │ temáticas    │ #16 Fotografia #19/#20/#21     │
        │          │ #29 Bundler  │ Nuvemshop real #23 Conteúdo    │
        │          │              │ #25 Imagens otimizadas         │
        └──────────┴──────────────┴──────────────────────────────┘
```

**Leitura:** o quadrante **Baixo Esforço / Alto Impacto** (canto superior direito) concentra praticamente todos os itens do roadmap de 30 dias — é onde está o ROI mais imediato. O quadrante **Alto Esforço / Alto Impacto** (canto inferior direito) define o roadmap de 12 meses e depende de decisões de produto (fotografia, checkout) e de infraestrutura externa (API Nuvemshop).

---

## 8. Riscos e dependências entre itens

- **#3 (carrinho + WhatsApp) é pré-requisito de fato** para qualquer investimento em tráfego pago/SEO — sem ele, #8, #9, #13, #15, #22, #23 geram visitas mas não vendas.
- **#19/#20/#21 (Nuvemshop real) são um bloco único** — não faz sentido implementar `client.js` sem decidir a estratégia de checkout (#21) primeiro, pois isso define o contrato de dados do carrinho.
- **#14 (SSR/snapshot do catálogo) depende de #19/#20** se o objetivo final é renderizar dados reais da Nuvemshop; pode ser feito antes apenas para o catálogo mock atual, como prova de conceito de arquitetura.
- **#16 (fotografia própria) é pré-requisito de #25 (otimização de imagens)** — não há o que otimizar enquanto as imagens forem do Unsplash.
- **#5/#6 (unificação/limpeza de CSS) devem ser feitos antes de qualquer nova feature de UI** (#8, #9, #12) para evitar que o trabalho novo seja feito em cima de duas folhas de estilo divergentes.
- **#11 (remover integração legada) deve ser feito antes de #19/#20** para evitar ambiguidade sobre "qual client é o real" durante o desenvolvimento da Fase 3.
