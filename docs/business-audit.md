# Auditoria de Negócio (E-commerce) — Tramatto Storefront

**Data:** 2026-06-10
**Escopo:** experiência pública do site (`index.html`, `collection.html`, `product.html`, `pages/*`) sob a ótica de conversão, posicionamento e crescimento de receita.
**Método:** revisão do conteúdo, copy, fluxos de navegação e estrutura de dados existentes. Nenhum código foi alterado.

> Leitura complementar: [docs/technical-audit.md](technical-audit.md) cobre os achados técnicos (arquitetura, performance, segurança). Este documento foca no **impacto em receita e crescimento**.

---

## 0. Veredito executivo

A Tramatto tem **copywriting e narrativa de marca de nível premium** — provavelmente o melhor ativo do projeto hoje. A história de origem (Anatólia, algodão egípcio de fibra longa, tear jacquard, "0 amaciantes artificiais") é exatamente o tipo de storytelling que justifica um preço de R$79–119 por um pano de prato.

**Porém, na prática, o site não é capaz de gerar uma venda.** Não existe checkout, o carrinho é apenas `localStorage`, vários CTAs centrais ("Ver todos", "Como comprar", links institucionais da home) apontam para `#`, e as imagens são placeholders/stock — o que destrói a credibilidade premium no momento exato em que o cliente decide comprar.

**Prioridade #1 absoluta, acima de qualquer otimização de SEO/CRO:** sair de "carrinho local sem saída" para um caminho de compra real (checkout Nuvemshop hospedado é o caminho mais rápido). Sem isso, qualquer investimento em tráfego (ads, SEO, influenciadores) é dinheiro jogado fora — o funil termina em uma parede.

---

## 1. Jornada do usuário (user journey)

### Fluxo atual mapeado
```
Home (index.html)
 ├─ Hero CTA "Ver a coleção" → collection.html ✅ funciona
 ├─ Hero CTA "Nossa história" → #origem ✅ funciona (âncora)
 ├─ "Ver todos →" (Panos avulsos)  → "#" ❌ link morto
 ├─ "Ver todos →" (Kits)           → "#" ❌ link morto
 ├─ Botão "Adicionar" no card      → adiciona ao carrinho local + toast ✅
 ├─ Newsletter "Quero receber"     → sem handler JS, não faz nada ❌
 └─ Footer (Loja/Ajuda/A marca)    → todos os links são "#" ❌

collection.html
 └─ Grid de produtos → product.html?slug=... ✅

product.html
 ├─ Seleção de variante ✅
 ├─ "Adicionar à sacola" → carrinho local + toast ✅
 ├─ "Ver mais peças" → collection.html ✅
 └─ Carrinho (Sacola) → ??? ❌ não existe página/drawer de carrinho
```

### O ponto de ruptura
- O badge "Sacola (N)" no header **nunca é clicável para abrir o carrinho** — é apenas um link estático para `collection.html` (`<a href="collection.html" class="nav-cart">`). O usuário adiciona itens, vê o contador subir, mas **não há nenhuma forma de revisar o que está na sacola, editar quantidades ou finalizar a compra**.
- Não existe `cart.html`, `checkout.html`, nem redirecionamento para o checkout hospedado da Nuvemshop.
- **Resultado**: o funil é Awareness → Interesse → Adicionar ao carrinho → **fim**. Não há etapa de conversão.

### Impacto em receita
Esse é o gargalo de maior impacto possível: **taxa de conversão efetiva = 0%** para qualquer tráfego pago ou orgânico, independentemente de quão boa seja a página de produto. Resolver isso (mesmo que com uma solução intermediária — ex.: botão "Finalizar no WhatsApp" enviando o resumo do carrinho) já destravaria receita imediatamente.

---

## 2. Checkout — fricção (e ausência)

| Achado | Impacto |
|---|---|
| **Não existe checkout.** O `CartService` persiste apenas em `localStorage` do navegador (`tramatto-cart`). | Bloqueador total de receita. Nenhuma venda pode ser concluída no site hoje. |
| `js/config.js` já modela `staging`/`production` apontando para um adapter `nuvemshop`, mas `client.js` é um stub sem chamadas reais (ver auditoria técnica B2/D4). | A infraestrutura para conectar ao checkout hospedado da Nuvemshop **já está desenhada**, só não está ligada — é "menos esforço" do que parece para destravar. |
| Nenhuma página de carrinho/drawer — usuário não consegue ver o total da compra antes de "finalizar" (que nem existe). | Mesmo após conectar o checkout, falta a etapa intermediária de revisão do carrinho (remover item, ajustar quantidade, ver subtotal/frete estimado). |
| Sem indicação de **métodos de pagamento aceitos** (Pix, cartão, boleto, parcelamento) em nenhum lugar do site. | Para tickets de R$249–479 (kits), a ausência de "parcele em Nx sem juros" é uma barreira de conversão conhecida no e-commerce brasileiro. |
| Sem cálculo de frete antes do checkout (CEP) — apenas a promessa estática "Frete grátis acima de R$199". | Usuário não sabe o frete real para pedidos abaixo de R$199 até... nunca, já que não há checkout. |

### Recomendação imediata (curtíssimo prazo, baixo esforço)
Como ponte até a integração Nuvemshop estar pronta:
1. Adicionar uma página/drawer de carrinho simples que liste os itens do `localStorage` com botão **"Finalizar pelo WhatsApp"**, montando uma mensagem pré-preenchida com os itens/variantes/quantidades para o número de atendimento. Isso converte o site de "vitrine sem saída" para **um canal de vendas funcional** em poucos dias, sem depender da Fase 3 da Nuvemshop.
2. Em paralelo, priorizar a Fase 3 (client real da Nuvemshop) para obter checkout nativo, parcelamento e Pix.

---

## 3. Posicionamento de luxo / premium fashion

### Pontos fortes
- **Copy excepcional**: "Sua cozinha merece o melhor tecido do mundo", "0 amaciantes artificiais — leveza natural do tecido", "o mesmo processo que veste as mesas dos grandes hotéis europeus" — linguagem aspiracional consistente com marcas de home textile premium (ex.: Trousseau, Casa Tova, Yves Delorme).
- **Prova de especificação técnica como diferencial**: "38mm de fibra", "tear jacquard", "2× mais durável" — números concretos aumentam a percepção de valor e justificam o preço acima da média de "pano de prato" (R$15–40 no varejo de massa vs. R$79–119 aqui).
- Seção "origem" com estatísticas (`500+ anos`, `38mm`, `2×`, `0`) é um bloco de copy forte, no estilo de marcas DTC premium (ex.: páginas "Why us" da Parachute Home, Brooklinen).

### Pontos que destroem a percepção premium
| Achado | Por quê importa |
|---|---|
| **Imagem hero é um arquivo `<img>` inline base64 de ~225KB** (provavelmente um placeholder genérico/fallback), e os "cards de produto" são `<div>` com `background-image` apontando para fotos de banco de imagens do Unsplash (`images.unsplash.com`). | Marcas premium vivem de fotografia própria de altíssima qualidade. Fotos de banco genéricas (que podem aparecer em centenas de outros sites) quebram instantaneamente a percepção de exclusividade — o oposto do discurso "produção artesanal limitada". |
| Placeholders de "foto" com texto sobreposto tipo "Foto de origem — Panos em suporte de bancada alto padrão — cozinha claro/creme" ainda visíveis como conteúdo de produção. | Se isso for ao ar em produção, comunica "site incompleto"/"loja fake" — o oposto de luxo. |
| Telefone de contato `+55 11 99999-0000` (claramente placeholder). | Para um cliente de ticket alto avaliando confiança antes de comprar, um número de WhatsApp "fake-looking" é um sinal de alerta forte. |
| Links "Imprensa", "Sobre o tecido", "Origem turca", "Lançamentos" no footer da home apontam para `#`. | Marcas premium costumam usar imprensa/clipping como prova social. Aqui o link existe na promessa mas não entrega — gera desconfiança ao clicar. |
| Nenhuma menção a **certificações reais** (ex.: GOTS/OEKO-TEX para algodão, certificação de origem) apesar do banner dizer "Tecido turco certificado". | Claim de "certificado" sem prova específica é tanto uma oportunidade perdida (poderia ser um selo visual forte) quanto um risco de propaganda enganosa (CDC) se não houver certificação real por trás. |

### Recomendação
Definir um **shooting fotográfico mínimo viável** (mesmo que com celular de boa qualidade + luz natural, estilo "produto em uso") antes de qualquer investimento em mídia paga — é o maior multiplicador de conversão para este posicionamento.

---

## 4. Página de produto (efetividade)

### O que já funciona bem
- Galeria de imagens, seleção de variantes (cor/tamanho), preço com promoção (`getHasPromotion`), pílula de estoque ("Em estoque"/"Esgotado"), highlights do produto, breadcrumb + Product Schema injetados via JS.

### Lacunas que custam conversão
| # | Lacuna | Benchmark do segmento |
|---|---|---|
| PP1 | **Sem prova social** (avaliações, estrelas, número de vendas, depoimentos). Para um produto "novo" de marca desconhecida, prova social é o principal redutor de risco percebido. | Marcas DTC premium exibem reviews mesmo com poucas avaliações ("Seja o primeiro a avaliar"). |
| PP2 | **Quantidade fixa em 1** — não há seletor de quantidade no `product.html`/`addToCart`. Para um item de uso doméstico (pano de prato), comprar em pares/conjuntos é comportamento natural — limitar a 1 por clique reduz o ticket médio. | Concorrentes permitem `+`/`-` antes de adicionar. |
| PP3 | **Sem cross-sell/upsell** ("Combine com...", "Quem comprou também levou", sugestão dos Kits na página de produto avulso). | Kits já existem no catálogo (`catalogData.kits`) mas não são promovidos na página de produto avulso — oportunidade de aumentar AOV (ticket médio) sem nenhum trabalho de catálogo novo. |
| PP4 | **Sem informações de cuidado/lavagem** detalhadas (apenas `highlights` genéricos como "Ideal para uso diário"). Para tecido importado premium, instruções de cuidado são tanto um diferencial de confiança quanto conteúdo valioso para SEO/GEO (ver seções 7–8). | — |
| PP5 | **`<title>` e `<link rel="canonical">` estáticos** ("Tramatto — Produto") — afeta como o produto aparece ao ser compartilhado (WhatsApp/Instagram Stories) e na aba do navegador, prejudicando recompra/retorno via histórico. | Já registrado na auditoria técnica (S1/S3), citado aqui pelo impacto direto em compartilhamento social = tráfego gratuito. |
| PP6 | **Selo de confiança ausente perto do botão "Adicionar à sacola"** (formas de pagamento, frete grátis acima de X, troca em 30 dias) — esses elementos existem na home (banda de benefícios) mas não se repetem no momento de decisão (página de produto). | Reforçar gatilhos de confiança exatamente no ponto de maior intenção de compra é prática padrão. |

---

## 5. Página de coleção (efetividade)

| # | Achado | Impacto |
|---|---|---|
| CP1 | **Sem filtros nem ordenação** (por preço, coleção, cor, tamanho, disponibilidade). Com 4 produtos hoje não dói, mas qualquer crescimento do catálogo (que é o objetivo declarado da integração Nuvemshop) tornará a navegação confusa rapidamente. | Médio prazo — preparar antes do catálogo crescer. |
| CP2 | **Kits não aparecem em `collection.html`** — apenas na home (`#kitsGrid`). Um usuário que chega direto em `/collection.html` (via SEO/ads) nunca vê os Kits, que têm o maior ticket médio (R$249–479). | Receita perdida — Kits são o produto de maior margem/ticket e estão "escondidos". |
| CP3 | **Hero da coleção é genérico** ("Panos de prato feitos para durar e decorar") — não comunica diferenciação de preço/posicionamento para quem chega "frio" via busca por "pano de prato" (categoria dominada por preços de R$15-40). Sem uma frase de ancoragem de valor, o visitante pode estranhar o preço antes de entender o porquê. | Ajustar copy para reforçar a proposta de valor logo no topo da listagem (ex.: reforçar "algodão egípcio", "edição limitada"). |
| CP4 | **Sem indicação de badges/promoção na grade** além do `product.badge` (ex.: "Novo", "Mais vendido") — funcional, mas nenhum produto exibe contagem de estoque baixo ("Últimas unidades") apesar do domínio já ter `stock` por variante. | Urgência/escassez é um gatilho de conversão de baixo custo já suportado pelos dados. |

---

## 6. Sinais de confiança (trust signals)

### Existem hoje
- Política de frete/trocas (`pages/shipping.html`): frete grátis acima de R$199, troca em até 30 dias — claro e específico.
- Política de privacidade (`pages/privacy.html`) e Termos (`pages/terms.html`) — presentes, ainda que genéricos.
- Página de contato com e-mail, Instagram e WhatsApp (placeholder).
- Banda de benefícios na home (frete grátis, algodão natural, tecido certificado, troca fácil, produção limitada).

### Faltando — e por que importa para conversão
| # | Sinal ausente | Por que é crítico para este negócio |
|---|---|---|
| TR1 | **CNPJ, razão social e endereço** em rodapé/política. No Brasil, o **Decreto 7.962/2013 (Lei do E-commerce)** exige que o fornecedor identifique nome empresarial, CNPJ e endereço físico de forma clara no site. Hoje não há nenhuma dessas informações. | Risco regulatório + sinal clássico de "loja fake" para consumidores desconfiados de golpes em lojas novas. |
| TR2 | **Selos de pagamento/segurança** (Pix, Visa/Master, "compra segura", certificado SSL visível). | Reduz ansiedade no momento de inserir dados de pagamento — especialmente importante para marca nova/desconhecida. |
| TR3 | **Avaliações de clientes / prova social** (mesmo que via widget externo, ex.: Google Reviews, Reclame Aqui, ou depoimentos manuais no início). | Marca nova sem reconhecimento de público depende disso para reduzir percepção de risco em compras de R$80–480. |
| TR4 | **Canal de atendimento real** — número de WhatsApp placeholder (`+55 11 99999-0000`) é **pior que não ter**: passa a impressão de descaso/abandono. | Substituir por número real (ou remover até ter um) antes de publicar. |
| TR5 | **Prova de origem/certificação** referenciada no banner ("Tecido turco certificado") sem nenhum selo, link ou explicação. | Oportunidade: se houver certificação real (OEKO-TEX, etc.), exibir o selo é prova social forte; se não houver, o claim deveria ser suavizado para evitar risco de propaganda enganosa. |
| TR6 | **Presença social real** — `og:sameAs` aponta para `https://www.instagram.com/tramatto`, mas os links de Instagram/Pinterest no rodapé de todas as páginas são `href="#"`. | Inconsistência simples de corrigir, mas para uma marca de "presença" (palavra usada 4x no copy), redes sociais não-clicáveis são uma oportunidade perdida de prova social/tráfego. |

---

## 7. Otimização para mecanismos de busca (SEO) — oportunidades de receita

A base técnica de SEO é melhor que a média de projetos nesse estágio (Schema.org, OG tags, sitemap, canonical). As oportunidades aqui são de **conteúdo e arquitetura de informação**, que se traduzem diretamente em tráfego orgânico:

| # | Oportunidade | Potencial |
|---|---|---|
| SEO1 | **Sitemap não inclui URLs por produto** (`product.html?slug=...`) — apenas `product.html` genérico. Combinado com canonical estático (ver auditoria técnica S1), **é provável que o Google nunca indexe páginas de produto individuais**. | Alto — páginas de produto são as que convertem tráfego de "pano de prato turco premium", "pano de prato algodão egípcio" etc. Sem indexação individual, esse tráfego de cauda longa não existe. |
| SEO2 | **Conteúdo educacional ausente** ("blog"/guias): "como cuidar de panos de prato de algodão egípcio", "diferença entre tear jacquard e estampado", "ideias de presente para quem ama cozinhar". | Alto — termos informacionais (TOFU) têm volume muito maior que termos transacionais para uma categoria de nicho, e aproveitam o storytelling já existente (origem, fibra, tear) que está hoje "preso" na home. |
| SEO3 | **Meta keywords** (`<meta name="keywords">`) presente no `index.html` — tag obsoleta, ignorada pelo Google desde ~2009; não é prejudicial, mas é esforço desperdiçado/manutenção morta. | Baixo — apenas limpeza. |
| SEO4 | **Sem `alt` no `<img>` do hero** (a imagem inline base64) — perde oportunidade de Google Images, que é um canal de descoberta relevante para produtos visuais/lifestyle. | Médio — Google Images é um canal de aquisição relevante para home decor/lifestyle. |
| SEO5 | **Página de coleção única** (`/collection.html`) para todo o catálogo — sem páginas de coleção temáticas indexáveis (ex.: `/colecoes/essentials`, `/colecoes/signature`, ou `/kits`), apesar do domínio já ter o conceito de `Collection`. | Médio — coleções temáticas com URLs próprias capturam buscas como "kit pano de prato presente" (intenção de presente, sazonal — Dia das Mães, Natal). |
| SEO6 | **Long-tail de presente/sazonalidade não explorado** — copy menciona "presente" (Kit "Presente Especial") mas não há nenhuma página/seção otimizada para "presente para quem ama cozinhar", "kit presente Dia das Mães" etc. | Alto potencial sazonal com baixo esforço de implementação (reaproveitar Kits existentes + copy). |

---

## 8. GEO — Generative Engine Optimization

Com a crescente parcela de descoberta via ChatGPT, Perplexity, Google AI Overviews e Copilot ("onde comprar pano de prato premium", "presente para quem gosta de cozinhar até R$300"), o site precisa ser **legível e citável por modelos de linguagem**, não só por crawlers tradicionais.

### Pontos fortes atuais
- **Dados estruturados (JSON-LD)** já presentes: `Organization`, `WebSite`, `CollectionPage`, `Product` + `BreadcrumbList` dinâmico — isso é exatamente o tipo de sinal que motores generativos usam para extrair fatos (preço, disponibilidade, nome).
- Copy já contém **fatos concretos e citáveis** (38mm de fibra, origem na Anatólia/Egito, tear jacquard, frete grátis acima de R$199, troca em 30 dias) — esse tipo de conteúdo factual é o que LLMs preferem extrair e citar, ao contrário de copy puramente emocional.

### Lacunas específicas de GEO
| # | Lacuna | Por que afeta resultados em IA generativa |
|---|---|---|
| GEO1 | **Sem seção de FAQ estruturada** (com `FAQPage` schema) cobrindo perguntas como "qual o prazo de entrega da Tramatto?", "a Tramatto faz trocas?", "de onde vêm os tecidos da Tramatto?", "quais formas de pagamento a Tramatto aceita?". | Motores generativos adoram extrair pares pergunta/resposta diretos para responder consultas conversacionais ("a Tramatto faz frete grátis?"). Hoje essa informação existe espalhada em prosa (`pages/shipping.html`), difícil de extrair com confiança. |
| GEO2 | **Sem página "Sobre"/E-E-A-T robusta** — não há fundadores, equipe, ano de fundação, processo produtivo detalhado com fotos reais. Modelos generativos (e o próprio Google AI Overview) ponderam sinais de "experiência, expertise, autoridade, confiança" (E-E-A-T) ao decidir citar uma marca. | Sem histórico/identidade verificável, a marca tem menos chance de ser citada como fonte confiável em respostas sobre "melhores panos de prato premium". |
| GEO3 | **Falta de comparação direta de categoria** ("pano de prato comum vs. pano de prato de algodão egípcio Tramatto") — conteúdo comparativo é um dos formatos mais citados por LLMs em respostas de "o que vale a pena comprar". | Criar 1-2 páginas comparativas/educacionais aproveitaria diretamente o storytelling técnico já escrito (fibra, tear, durabilidade). |
| GEO4 | **Inconsistência de preço/disponibilidade entre o que é renderizado via JS e o HTML estático** (ver auditoria técnica S2) — muitos crawlers de IA (não só Googlebot) **não executam JavaScript**, então veem `<section id="collectionProducts"></section>` vazio. | Isso significa que, hoje, **modelos generativos provavelmente não conseguem "ver" o catálogo da Tramatto**, mesmo que o JSON-LD do produto individual seja injetado dinamicamente (também via JS). |
| GEO5 | **Sem citações/menções externas (imprensa, parcerias, marketplaces)** — links de "Imprensa" são `#`. Menções em outros domínios são um dos principais sinais de autoridade que motores generativos usam para "confiar" em uma marca antes de recomendá-la. | Buscar parcerias com blogs de decoração/lifestyle, mesmo pequenos, para gerar menções externas. |

### Recomendação priorizada de GEO
1. Adicionar `FAQPage` JSON-LD + seção visível de perguntas frequentes (entrega, trocas, origem do tecido, cuidados, pagamento) — reaproveita conteúdo já escrito em `pages/shipping.html`/`terms.html`.
2. Garantir que o conteúdo essencial de catálogo (nome, preço, disponibilidade, descrição) exista no HTML inicial (SSR/pré-renderização ou snapshot estático), não apenas via JS pós-load — resolve SEO **e** GEO ao mesmo tempo.
3. Expandir "Nossa marca" (`pages/about.html`) com fatos verificáveis (ano de fundação, processo, fornecedores/origem) para sinais de E-E-A-T.

---

## 9. Experiência mobile

| # | Achado | Impacto |
|---|---|---|
| M1 | CSS responsivo existe (`css/styles.css` tem media queries para grid, footer, etc.) e há menu hamburguer funcional. | Base correta. |
| M2 | **Imagem hero inline em base64 (~225KB de texto)** é baixada por completo antes mesmo do primeiro parse de HTML terminar — em conexões móveis 3G/4G mais lentas (parte relevante do público de e-commerce no Brasil), isso atrasa significativamente o "First Contentful Paint" da página mais importante do site (a home). | Alto — usuários mobile com conexão ruim podem abandonar antes mesmo da página renderizar, especialmente vindos de anúncios pagos (onde cada clique custa dinheiro). |
| M3 | Imagens de produto via Unsplash sempre em `w=800` — em telas pequenas isso é banda desperdiçada (download de imagem maior que o necessário), afetando tempo de carregamento em 3G/4G. | Médio — afeta diretamente a taxa de rejeição mobile, que tipicamente representa >60% do tráfego de e-commerce no Brasil. |
| M4 | Botão "Adicionar" nos cards de produto (mobile) — verificar tamanho de área de toque (não auditável estaticamente, recomenda-se teste manual em dispositivo real). | A validar. |
| M5 | Sem botão fixo de "Sacola"/"Comprar" no mobile (sticky add-to-cart) na página de produto — em telas pequenas, o CTA principal pode ficar fora da viewport inicial. | Médio — sticky CTA é padrão em e-commerce mobile premium para reduzir scroll até a ação principal. |

---

## 10. Comparação competitiva

Referência: marcas D2C de têxtil de cozinha/casa premium no Brasil e internacionalmente (ex.: Trousseau, Casa Tova, Yves Delorme, Brooklinen, Parachute Home) e lojas Nuvemshop de nicho bem executadas.

| Dimensão | Tramatto (atual) | Padrão do segmento premium | Gap |
|---|---|---|---|
| Checkout funcional | ❌ Inexistente | ✅ Checkout nativo (Nuvemshop/Shopify) com Pix, cartão, parcelamento | **Crítico** |
| Fotografia de produto | Stock photos (Unsplash) + placeholders | Fotografia própria, lifestyle + still, alta resolução | **Crítico** |
| Prova social (reviews/UGC) | Nenhuma | Avaliações com estrelas, fotos de clientes, contagem de vendas | Alto |
| Storytelling de marca | **Forte** (origem, fibra, tear, números) | Geralmente igual ou mais fraco que o da Tramatto | **Vantagem da Tramatto** |
| Dados estruturados/SEO técnico | Acima da média (Schema.org completo) | Frequentemente ausente em lojas pequenas | **Vantagem da Tramatto** |
| Conteúdo educacional/blog | Nenhum | Comum (cuidados com tecido, guias de presente) | Médio-Alto |
| Identificação legal (CNPJ/endereço) | Ausente | Obrigatório e geralmente visível no rodapé | Alto (risco regulatório) |
| Carrinho/mini-cart visível | Ausente (apenas contador) | Padrão (drawer lateral ou página dedicada) | Alto |
| Kits/presentes em destaque | Existem no domínio, mas escondidos da coleção | Seção dedicada "Presentes"/"Kits" navegável e indexável | Médio |
| Mobile performance | Comprometida por imagem inline 225KB | Otimizado (CDN de imagens, lazy load) | Alto |

### Leitura estratégica
A Tramatto **não compete mal em "marca"** — o copy e a estrutura de dados (schema.org, modelo de domínio) já estão em um patamar que muitas lojas Nuvemshop reais não alcançam. O problema é que **a camada "loja" (compra, prova social, fotografia, identidade legal) está incompleta ou ausente**, o que coloca o site abaixo até de concorrentes pequenos e simples — porque eles, ao menos, **conseguem vender**.

---

## 11. Plano de ação priorizado por impacto em receita

### 🔴 Bloqueadores de receita (resolver antes de qualquer investimento em tráfego)
1. **Criar um caminho de compra funcional** — mínimo viável: carrinho visível + "Finalizar pelo WhatsApp" com número real; ideal: ativar checkout Nuvemshop (depende da Fase 3 técnica).
2. **Substituir o número de WhatsApp placeholder** por um real (ou removê-lo até existir).
3. **Adicionar CNPJ, razão social e endereço** no rodapé/políticas (conformidade + confiança).
4. **Corrigir todos os links `#`** da home (footer, "Ver todos", newsletter) — cada link morto é uma saída de funil sem motivo.

### 🟠 Alto impacto, esforço moderado
5. **Sessão de fotos própria** (produto + lifestyle) substituindo Unsplash/placeholders — maior alavanca de percepção premium.
6. Expor **Kits na página de coleção** (ou criar seção/URL dedicada "Presentes") — ticket médio mais alto, hoje invisível fora da home.
7. Adicionar **seletor de quantidade** e **cross-sell de Kits** na página de produto.
8. Adicionar **FAQ visível + schema `FAQPage`** reaproveitando conteúdo de frete/trocas/origem (ganho duplo SEO + GEO).
9. Garantir que **catálogo, preço e disponibilidade existam no HTML inicial** (não só pós-JS) — desbloqueia indexação tradicional e por IA generativa.

### 🟡 Médio prazo
10. Programa de **prova social** — começar com depoimentos manuais/Instagram embutido até acumular reviews reais.
11. **Conteúdo educacional/blog** (cuidados com o tecido, guias de presente, comparativos) — aproveita o storytelling já escrito.
12. **URLs de produto/coleção indexáveis individualmente** + sitemap atualizado (depende do trabalho técnico já mapeado em S1/S2).
13. Otimizar **imagens para mobile** (resolução adaptativa, lazy loading, remover base64 inline).

---

## Apêndice — Achados específicos por arquivo

| Arquivo | Achado de negócio |
|---|---|
| [index.html](../index.html) | Hero `<img>` inline base64 (~225KB); footer com 13 links `#`; newsletter sem handler; "Ver todos" (×2) → `#`. |
| [collection.html](../collection.html) | Não exibe Kits; sem filtros/ordenação; hero genérico. |
| [product.html](../product.html) | Sem seletor de quantidade, sem cross-sell, sem reviews, `<title>`/canonical estáticos. |
| [pages/contact.html](../pages/contact.html) | WhatsApp placeholder `+55 11 99999-0000`. |
| [pages/shipping.html](../pages/shipping.html) | Conteúdo bom, mas não estruturado como FAQ/schema. |
| [pages/privacy.html](../pages/privacy.html), [pages/terms.html](../pages/terms.html) | Sem CNPJ/razão social/endereço. |
| [catalog-data.js](../catalog-data.js) | Kits com bom potencial de AOV, mas isolados do fluxo principal de navegação. |
| [js/services.js](../js/services.js) (`CartService`) | Carrinho funcional localmente, mas sem ponte para checkout — base técnica pronta para a "ponte WhatsApp" recomendada em 🔴#1. |
