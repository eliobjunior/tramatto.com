# Estratégia de Conteúdo — Tramatto
**Data:** 2026-06-16  
**Mercados-alvo:** Cozinha premium · Decoração de interiores · Mesa posta · Enxoval e presentes  
**Documentos relacionados:** [ai-search-readiness.md](ai-search-readiness.md) · [search-console-readiness.md](search-console-readiness.md) · [master-roadmap.md](master-roadmap.md) (Roadmap #23)

---

## 1. Diagnóstico de conteúdo atual

### O que existe hoje

| Página | Tipo | Palavras úteis | Status SEO |
|---|---|:---:|---|
| `index.html` | Home / Landing | ~600 | Bom — facts técnicos no HTML estático |
| `collection.html` | Catálogo | ~80 | Fraco — quase sem texto indexável |
| `pages/about.html` | Institucional | ~450 | Bom pós-auditoria AI — expandido |
| `pages/shipping.html` | Política | ~120 | Adequado — FAQPage implementado |
| `pages/contact.html` | Contato | ~40 | OK |
| `product.html` | PDP ×4 | ~200/produto | Parcial — conteúdo depende de JS |

**Blog / conteúdo editorial:** ❌ Inexistente

**Diagnóstico síntese:** a Tramatto tem uma home com bons signals técnicos e uma about enriquecida, mas **zero presença em queries informacionais e de intenção mista** — que representam 85% do volume de busca nos nichos de cozinha, decoração e enxoval no Brasil. Todo o tráfego orgânico potencial está sendo deixado na mesa.

---

## 2. Análise de mercado e oportunidade

### O que o mercado busca (Brasil, nicho têxtil/cozinha/decoração)

```
TOPO DO FUNIL — informacional / educacional
────────────────────────────────────────────────────────
como lavar pano de prato               ~15.000/mês
como tirar manchas de pano de prato    ~8.000/mês
mesa posta cafe da manha               ~40.000/mês
decoração cozinha minimalista          ~20.000/mês
mesa de brunch                         ~15.000/mês
o que é algodão egípcio                ~5.000/mês
como dobrar pano de prato              ~4.000/mês
cozinha decoração ideias               ~30.000/mês

MEIO DO FUNIL — comparação / escolha
────────────────────────────────────────────────────────
como escolher pano de prato            ~2.500/mês
pano de prato algodão ou linho         ~1.200/mês
pano de prato que não desbota          ~800/mês
qual o melhor pano de prato            ~600/mês
pano de prato tamanho ideal            ~500/mês

FUNDO DO FUNIL — transacional / compra
────────────────────────────────────────────────────────
presente para chá de cozinha           ~8.000/mês
enxoval de cozinha                     ~6.000/mês
presente de casamento para cozinha     ~3.500/mês
kit panos de prato                     ~1.500/mês
pano de prato premium                  ~800/mês
pano de prato turco                    ~400/mês
```

### Gap de oportunidade

A Tramatto compete em um nicho onde **os concorrentes diretos não produzem conteúdo editorial.** Marcas como Camesa, Karsten, Döhler e Buddemeyer vendem volume; nenhuma educa sobre o produto. A Tramatto pode se tornar a referência de conteúdo do nicho **sem enfrentar concorrência editorial** — apenas concorrência de sites de decoração generalistas (Casa e Jardim, Veja Casa, Westwing) que não têm profundidade sobre panos de prato especificamente.

**Janela de oportunidade:** 12-18 meses antes que um concorrente perceba o gap.

---

## 3. Clusters de conteúdo (mapa temático)

O conteúdo da Tramatto se organiza em 6 clusters. Cada cluster tem uma **pillar page** (artigo longo e abrangente) e várias **supporting pages** (artigos menores que linkam para a pillar). Esse modelo de "hub and spoke" é o que constrói autoridade topical.

```
                        ┌─────────────────┐
                        │    TRAMATTO.COM  │
                        │    (home/raiz)   │
                        └────────┬────────┘
                                 │
          ┌──────────────────────┼──────────────────────┐
          │                      │                      │
    ┌─────┴──────┐         ┌─────┴──────┐        ┌──────┴──────┐
    │  CLUSTER 1 │         │  CLUSTER 2 │        │  CLUSTER 3  │
    │ Materiais  │         │  Cuidados  │        │Escolha/Compra│
    │  (pillar)  │         │  (pillar)  │        │   (pillar)  │
    └─────┬──────┘         └─────┬──────┘        └──────┬──────┘
          │ ×3 supporting        │ ×4 supporting         │ ×3 supporting

          ┌─────────────────────────────────────────────────────┐
          │                                                     │
    ┌─────┴──────┐         ┌─────┴──────┐        ┌──────┴──────┐
    │  CLUSTER 4 │         │  CLUSTER 5 │        │  CLUSTER 6  │
    │ Presentes/ │         │Mesa Posta/ │        │  Origem e   │
    │  Enxoval   │         │  Lifestyle │        │ Proveniência│
    └────────────┘         └────────────┘        └─────────────┘
          ×4 supporting         ×4 supporting         ×2 supporting
```

### Cluster 1 — Materiais e Qualidade
**Por que existe:** a Tramatto tem uma história técnica de produto única (algodão egípcio, jacquard, Anatólia). Esse é o cluster de autoridade máxima — ninguém no Brasil produz conteúdo educacional profundo sobre esses materiais no contexto de têxteis de cozinha.

**Pillar page:** "Guia completo dos materiais para panos de prato"  
**Supporting:** algodão egípcio, tear jacquard, comparativo de materiais

### Cluster 2 — Cuidados e Manutenção
**Por que existe:** "como lavar pano de prato" e "como tirar manchas" têm volumes altíssimos (~23.000/mês combinados) com dificuldade baixa. São queries frequentemente respondidas por AI Overview — e a Tramatto pode ser a fonte citada.

**Pillar page:** "Como cuidar dos seus panos de prato para durar anos"  
**Supporting:** manchas, pano branco, frequência de troca, dobrar

### Cluster 3 — Como Escolher
**Por que existe:** queries de "como escolher" e "qual o melhor" são de alta intenção de compra com AI Overview ativo. Posicionar a Tramatto como a fonte dessas respostas = tráfego qualificado.

**Pillar page:** "Como escolher panos de prato: guia definitivo"  
**Supporting:** tamanhos, comparativo de tecidos, quando vale investir em premium

### Cluster 4 — Presentes e Enxoval
**Por que existe:** "presente para chá de cozinha" (8.000/mês) e "enxoval de cozinha" (6.000/mês) são as queries de maior potencial de conversão — intenção de compra altíssima. Panos de prato premium são o presente perfeito nesse contexto.

**Pillar page:** "Lista de enxoval de cozinha: tudo que você precisa"  
**Supporting:** chá de cozinha, presente de casamento, kit de presente, chá de panela

### Cluster 5 — Mesa Posta e Lifestyle
**Por que existe:** "mesa posta café da manhã" (40.000/mês) é uma das maiores oportunidades de topo de funil. O nicho de decoração/lifestyle é o ponto de entrada para consumidoras que ainda não sabem que querem um pano de prato premium — mas querem uma cozinha bem decorada.

**Pillar page:** "Mesa posta em casa: guia de têxteis, decoração e organização"  
**Supporting:** café da manhã, brunch, cozinha minimalista, como decorar com panos

### Cluster 6 — Origem e Proveniência
**Por que existe:** a história turca da Tramatto é diferenciadora única. Nenhum concorrente direto tem isso. Criar autoridade sobre "têxteis turcos" e "Anatólia" posiciona a Tramatto como a única referência brasileira no assunto — e captura buscas de quem valoriza proveniência.

**Pillar page:** "Têxteis da Anatólia: por que a Turquia é referência mundial"  
**Supporting:** panos artesanais vs. industriais

---

## 4. Autoridade topical — o que a Tramatto pode "possuir"

A autoridade topical ocorre quando um site responde **todas as perguntas relevantes de um nicho** — e os motores de busca (e de AI) passam a tratá-lo como a fonte principal. Para a Tramatto, o objetivo é possuir:

### Tema 1: "Panos de prato de qualidade" — 100% ownership
Queries sobre escolha, cuidado, qualidade, materiais e comparativos de panos de prato. **Ninguém mais está fazendo isso no Brasil.** ROI máximo, concorrência mínima.

### Tema 2: "Algodão egípcio" — shared ownership (no nicho de cozinha)
O termo "algodão egípcio" tem concorrência de marcas de roupas de cama. A Tramatto pode se tornar a referência específica para o contexto **cozinha/têxteis de uso** — diferenciando-se dos players de colchões e lençóis.

### Tema 3: "Tear jacquard" — potential ownership (muito nichado)
Virtualmente nenhum conteúdo em português sobre tear jacquard no contexto de têxteis do lar. Alta probabilidade de ranquear na posição 1 e ser a fonte padrão de AI Overview.

### Tema 4: "Mesa posta" — contributing authority (não ownership)
Volume enorme (40k+/mês), concorrência altíssima (Casa e Jardim, Westwing, Pinterest). A Tramatto não vai "possuir" mesa posta — mas pode capturar fatias ao focar em ângulos específicos: "mesa posta com panos de prato", "como dobrar pano de prato para mesa posta", etc.

### Tema 5: "Presentes de cozinha / enxoval" — contributing authority
Idem mesa posta: volume alto, concorrência alta. A Tramatto contribui com a perspectiva de panos de prato premium como presente, e pode ranquear para long-tails menos competitivas.

---

## 5. Análise por canal de distribuição de conteúdo

| Canal | Potencial | Tipo de conteúdo | Janela |
|---|---|---|---|
| **Google orgânico** | Alto | Artigos, guias, comparativos | 3-9 meses |
| **Google AI Overview** | Muito alto | FAQ, How-to, comparativos com respostas diretas | 1-3 meses |
| **ChatGPT / Perplexity** | Alto | llms.txt + artigos com facts verificáveis | 1-6 meses |
| **Google Discover** | Médio | Artigos de lifestyle, mesa posta, decoração | 3-6 meses após indexação |
| **Pinterest** | Muito alto | Mesa posta, decoração, dobrar panos — imagens linkando para artigos | 1-3 meses (efeito rápido) |
| **Instagram** | Alto | Repurposing de conteúdo dos artigos em carrosséis | Imediato |
| **WhatsApp** | Médio | Artigos de cuidado para enviar pós-venda | Imediato |

---

## 6. Os 20 artigos prioritários

### Legenda de scores
- **Dificuldade SEO:** 1 (fácil) → 5 (muito difícil) — baseado em DA dos competidores e profundidade de conteúdo necessária
- **Tráfego potencial:** ★ (~200/mês) → ★★★★★ (10.000+/mês)
- **AI Overview:** ★ (baixo) → ★★★★★ (quase certo de aparecer)
- **Conversão:** ★ (baixo) → ★★★★★ (compra direta esperada)
- **Prioridade:** calculada considerando dificuldade baixa + tráfego + conversão + AI

---

### CLUSTER 1 — Materiais e Qualidade

#### A1 · Pillar · O que é algodão egípcio de fibra longa: guia completo para têxteis de cozinha

| Atributo | Valor |
|---|---|
| **URL sugerida** | `/blog/algodao-egipcio-fibra-longa` |
| **Meta title** | O que é algodão egípcio de fibra longa — e por que faz diferença nos seus panos |
| **Keyword primária** | o que é algodão egípcio |
| **Keywords secundárias** | algodão egípcio fibra longa, algodão egípcio têxtil, diferença algodão egípcio convencional, algodão egípcio pano de prato |
| **Volume estimado** | ~5.000/mês (keyword primária) |
| **Dificuldade SEO** | 2/5 — competição de marcas de cama/colchão, mas sem foco em cozinha |
| **Tráfego potencial** | ★★★★ |
| **AI Overview** | ★★★★★ — query factual, definição clara esperada |
| **Conversão** | ★★★ — topo de funil, mas educa para compra premium |
| **Prioridade** | 🔴 Alta — pilar de autoridade do produto |

**Estrutura de conteúdo:**
- O que é algodão egípcio (definição, origem no Vale do Nilo)
- Por que a fibra longa (38mm+) muda tudo (durabilidade, maciez, absorção)
- Comparação: algodão egípcio vs. algodão convencional vs. algodão supima
- Aplicações: hotelaria, enxoval, panos de prato
- Como identificar na etiqueta ou na descrição do produto
- CTA: "Conheça os panos de prato Tramatto feitos com algodão egípcio"

---

#### A2 · O que é tear jacquard: a tecnologia que faz o padrão durar para sempre

| Atributo | Valor |
|---|---|
| **URL sugerida** | `/blog/tear-jacquard-o-que-e` |
| **Meta title** | O que é tear jacquard: como a tecnologia define a qualidade de têxteis |
| **Keyword primária** | o que é tear jacquard |
| **Keywords secundárias** | tear jacquard tecido, jacquard estampado diferença, tecido jacquard pano, jacquard ou estampado qual melhor |
| **Volume estimado** | ~1.500/mês |
| **Dificuldade SEO** | 1/5 — concorrência quase inexistente em português para têxteis do lar |
| **Tráfego potencial** | ★★ |
| **AI Overview** | ★★★★★ — definição técnica com resposta direta, quase garantia de featured snippet |
| **Conversão** | ★★★ — quem busca "jacquard" já tem critério de qualidade |
| **Prioridade** | 🔴 Alta — posição 1 praticamente garantida |

**Estrutura de conteúdo:**
- O que é o tear jacquard (Joseph-Marie Jacquard, 1804, contexto histórico)
- Como funciona: o padrão é tecido, não impresso
- Jacquard vs. estamparia: por que o padrão jacquard não desbota
- Tear jacquard artesanal vs. industrial: o que muda na qualidade final
- Por que a Tramatto usa jacquard (permanência, não descasca, durabilidade)
- CTA: "Veja os padrões jacquard da coleção Tramatto"

---

#### A3 · Pano de prato: algodão, linho ou microfibra — qual é melhor?

| Atributo | Valor |
|---|---|
| **URL sugerida** | `/blog/pano-de-prato-algodao-linho-ou-microfibra` |
| **Meta title** | Pano de prato de algodão, linho ou microfibra: qual é melhor para sua cozinha? |
| **Keyword primária** | pano de prato algodão linho microfibra |
| **Keywords secundárias** | melhor material pano de prato, pano de prato de linho, pano de prato absorvente, pano de prato que não solta fiapo |
| **Volume estimado** | ~2.000/mês (soma de variações) |
| **Dificuldade SEO** | 2/5 |
| **Tráfego potencial** | ★★★ |
| **AI Overview** | ★★★★★ — comparativo direto = resposta ideal para AI |
| **Conversão** | ★★★★ — intenção de compra clara |
| **Prioridade** | 🔴 Alta — captura meio de funil e responde à objeção de quem ainda pensa em microfibra |

**Estrutura de conteúdo:**
- Tabela comparativa (maciez, durabilidade, absorção, cuidado, preço)
- Algodão: vantagens (absorção, lavável, durável) e desvantagens (amassado)
- Algodão egípcio: posição acima do algodão convencional, por quê
- Linho: secagem rápida, estrutura, menos absorção, ideal para uso decorativo
- Microfibra: absorção inicial alta, mas libera microplásticos, se desgasta rápido, não recomendado
- Veredito: para uso diário de cozinha, algodão egípcio > linho > algodão convencional > microfibra
- CTA: "Os panos Tramatto usam algodão egípcio — veja a diferença"

---

### CLUSTER 2 — Cuidados e Manutenção

#### B1 · Pillar · Como lavar pano de prato do jeito certo para durar anos

| Atributo | Valor |
|---|---|
| **URL sugerida** | `/blog/como-lavar-pano-de-prato` |
| **Meta title** | Como lavar pano de prato do jeito certo: guia completo de lavagem e conservação |
| **Keyword primária** | como lavar pano de prato |
| **Keywords secundárias** | lavar pano de prato maquina, temperatura lavar pano, pano de prato na maquina de lavar, como conservar pano de prato |
| **Volume estimado** | ~15.000/mês |
| **Dificuldade SEO** | 2/5 — competição de sites de limpeza doméstica, mas sem autoridade específica |
| **Tráfego potencial** | ★★★★★ |
| **AI Overview** | ★★★★★ — How-to claro, um dos tipos de conteúdo favoritos do AI Overview |
| **Conversão** | ★★ — topo de funil, mas retém clientes e gera backlinks naturais |
| **Prioridade** | 🔴 Alta — maior volume do portfólio, ganho de autoridade de domínio |

**Estrutura de conteúdo:**
- Temperatura ideal (40°C para algodão egípcio, nunca acima de 60°C)
- Ciclo de lavagem (delicado ou algodão, centrifugação moderada)
- Separar por cor ou lavar tudo junto? (depende do tecido)
- Alvejante: quando usar e quando nunca usar (jacquard: nunca)
- Amaciante: mito vs. realidade (amaciante reduz absorção — não usar em panos de prato de qualidade)
- Secagem: à sombra preserva cor e fibra; máquina de secar no máximo temperatura baixa
- Como tirar o amido/rigidez da primeira lavagem
- Sinal de que o pano precisa ser trocado
- FAQ embutida: 5 perguntas comuns sobre lavagem

---

#### B2 · Como tirar manchas de pano de prato sem estragar o tecido

| Atributo | Valor |
|---|---|
| **URL sugerida** | `/blog/como-tirar-manchas-pano-de-prato` |
| **Meta title** | Como tirar manchas de pano de prato: 8 métodos que funcionam sem estragar o tecido |
| **Keyword primária** | como tirar manchas de pano de prato |
| **Keywords secundárias** | mancha pano de prato óleo, mancha de café pano, pano de prato amarelado, como limpar pano de prato encardido |
| **Volume estimado** | ~8.000/mês |
| **Dificuldade SEO** | 1/5 — alta oportunidade, pouca concorrência especializada |
| **Tráfego potencial** | ★★★★★ |
| **AI Overview** | ★★★★★ — How-to com lista = formato perfeito para AI |
| **Conversão** | ★★ |
| **Prioridade** | 🔴 Alta — volume e dificuldade tornam esse artigo um ganho rápido |

**Estrutura de conteúdo:**
- Mancha de óleo/gordura (sabão neutro + água morna antes de lavar)
- Mancha de café (água fria imediata, bicarbonato de sódio)
- Pano amarelado (limão + sol, sem alvejante — com ressalva para padrões)
- Mancha de fruta/suco (sal + água fria imediatamente)
- Pano encardido (bicarbonato + vinagre branco na lavagem)
- O que NÃO fazer: água quente em mancha de proteína, alvejante em coloridos, esfregar com força
- Diferença no cuidado de panos com padrão jacquard vs. lisos
- FAQ: meu pano branco virou cinza, o que faço?

---

#### B3 · Como manter pano de prato branco: métodos naturais sem alvejante agressivo

| Atributo | Valor |
|---|---|
| **URL sugerida** | `/blog/como-manter-pano-de-prato-branco` |
| **Meta title** | Como manter pano de prato branco sem usar alvejante: métodos naturais que funcionam |
| **Keyword primária** | como manter pano de prato branco |
| **Keywords secundárias** | pano de prato branco amarelado, branquear pano de prato naturalmente, pano branco sem alvejante, como clarear pano de prato |
| **Volume estimado** | ~3.000/mês |
| **Dificuldade SEO** | 1/5 |
| **Tráfego potencial** | ★★★ |
| **AI Overview** | ★★★★★ |
| **Conversão** | ★★ — mas captura o público que valoriza branco natural (buyer persona da Tramatto) |
| **Prioridade** | 🟡 Média-Alta |

**Estrutura de conteúdo:**
- Por que alvejante destrói fibras de algodão egípcio (e reduz vida útil)
- Método 1: limão + sol (ácido cítrico natural + UV)
- Método 2: bicarbonato + vinagre na lavagem (sem misturar ao mesmo tempo)
- Método 3: água oxigenada 10V diluída (para ocasiões específicas)
- Prevenção: lavar imediatamente após uso, separar de cores
- Frequência de "lavagem de manutenção" para brancos
- CTA: "Os panos Tramatto em branco natural: por que o algodão egípcio envelhece melhor"

---

#### B4 · Com que frequência trocar os panos de prato da cozinha

| Atributo | Valor |
|---|---|
| **URL sugerida** | `/blog/com-que-frequencia-trocar-pano-de-prato` |
| **Meta title** | Com que frequência trocar os panos de prato? Higiene e sinais de renovação |
| **Keyword primária** | quando trocar pano de prato |
| **Keywords secundárias** | vida útil pano de prato, pano de prato higiênico, quantos panos de prato ter em casa, quanto tempo dura pano de prato |
| **Volume estimado** | ~1.500/mês |
| **Dificuldade SEO** | 1/5 — praticamente sem concorrência de qualidade |
| **Tráfego potencial** | ★★ |
| **AI Overview** | ★★★★ — pergunta direta com resposta esperada |
| **Conversão** | ★★★ — leva à compra de renovação |
| **Prioridade** | 🟡 Média |

**Estrutura de conteúdo:**
- Consenso da higiene doméstica: 1×/ano no mínimo (vs. reality: 3-5 anos com panos de qualidade)
- 5 sinais de que está na hora de trocar (fiapos excessivos, odor permanente, cor fosca, textura áspera, bordas desfazendo)
- Sinais de que o pano ainda tem vida (panos de algodão egípcio ficam mais macios com lavagens)
- Quantos panos de prato ter em casa (7-10 para rotatividade sem uso de sujo)
- Panos premium vs. panos descartáveis: qual o custo por uso
- CTA: "Renove com qualidade — kit Tramatto para substituição completa"

---

### CLUSTER 3 — Como Escolher e Comprar

#### C1 · Pillar · Como escolher pano de prato: guia definitivo de tamanho, material e qualidade

| Atributo | Valor |
|---|---|
| **URL sugerida** | `/blog/como-escolher-pano-de-prato` |
| **Meta title** | Como escolher pano de prato: guia completo de material, tamanho e qualidade |
| **Keyword primária** | como escolher pano de prato |
| **Keywords secundárias** | melhor pano de prato, pano de prato qualidade, qual pano de prato comprar, pano de prato durável |
| **Volume estimado** | ~2.500/mês |
| **Dificuldade SEO** | 2/5 |
| **Tráfego potencial** | ★★★ |
| **AI Overview** | ★★★★★ — guia de compra = formato ideal para AI Overview |
| **Conversão** | ★★★★★ — intenção de compra explícita |
| **Prioridade** | 🔴 Alta — pillar comercial mais importante |

**Estrutura de conteúdo:**
- Material: algodão egípcio > algodão convencional > linho > microfibra (com razões)
- Tamanho: 45×70cm (padrão, uso cotidiano), 60×90cm (multifuncional, bancada e forno)
- Gramatura: quanto mais pesado, mais absorvente — não confundir com espessura artificial
- Padrão: jacquard (permanente) vs. estampado (desbota com lavagens)
- Acabamento: bordas costuradas vs. bainhadas, linha reforçada
- Quantidade mínima por cozinha (7-10 para rotação semanal)
- Preço justo: quanto custa um bom pano? (acima de R$ 80-120 por unidade)
- Red flags: panos que prometem "super absorção" com microfibra
- CTA natural para os produtos Tramatto ao longo do texto

---

#### C2 · Pano de prato premium: quando vale o investimento e o que você recebe

| Atributo | Valor |
|---|---|
| **URL sugerida** | `/blog/pano-de-prato-premium-vale-a-pena` |
| **Meta title** | Pano de prato premium: o que diferencia e quando vale o investimento |
| **Keyword primária** | pano de prato premium |
| **Keywords secundárias** | pano de prato caro vale a pena, pano de prato qualidade superior, pano de prato algodão egípcio preço, pano de prato de luxo |
| **Volume estimado** | ~800/mês |
| **Dificuldade SEO** | 1/5 — nicho sem concorrência editorial |
| **Tráfego potencial** | ★★ |
| **AI Overview** | ★★★★ |
| **Conversão** | ★★★★★ — quem busca "premium" já está pronto para comprar |
| **Prioridade** | 🔴 Alta — custo por click zero, alta taxa de conversão esperada |

**Estrutura de conteúdo:**
- O que diferencia um pano de prato premium de um convencional (5 critérios objetivos)
- Análise de custo por uso: pano de R$ 15 que dura 6 meses vs. pano de R$ 120 que dura 5 anos
- O que a hotelaria de luxo usa e por quê (mesmo padrão dos grandes hotéis europeus)
- Padrão de qualidade de algodão egípcio (fio ELS — extra long staple)
- Por que panos premium ficam melhores com o uso (ao contrário dos convencionais)
- Quem deveria comprar pano de prato premium (cozinha com uso diário, presenteadores)
- CTA: "Conheça a coleção Tramatto — panos de prato com padrão de hotelaria"

---

#### C3 · Tamanhos de pano de prato: qual é o ideal para cada uso

| Atributo | Valor |
|---|---|
| **URL sugerida** | `/blog/tamanhos-pano-de-prato` |
| **Meta title** | Tamanhos de pano de prato: qual o ideal para cada uso na sua cozinha |
| **Keyword primária** | tamanho pano de prato |
| **Keywords secundárias** | pano de prato 45x70, pano de prato 60x90, medida pano de prato padrão, pano de prato grande |
| **Volume estimado** | ~600/mês |
| **Dificuldade SEO** | 1/5 |
| **Tráfego potencial** | ★★ |
| **AI Overview** | ★★★★ — pergunta técnica com resposta direta |
| **Conversão** | ★★★ — resolve objeção de tamanho antes da compra |
| **Prioridade** | 🟡 Média |

**Estrutura de conteúdo:**
- 30×50cm: uso decorativo/ornamental (desvantagem em uso funcional)
- 45×70cm: padrão brasileiro para uso diário, cobre a maioria dos pratos e panelas
- 50×80cm: tamanho intermediário, comum em marcas europeias
- 60×90cm: multifuncional — funciona como pano de copa, proteção de forno, bancada
- 70×50cm vs. 50×70cm: a mesma dimensão, só importa a orientação
- Qual tamanho comprar se você só pode escolher um: 45×70cm (e as razões)
- CTA: "Tramatto disponível em 45×70cm e 60×90cm — veja qual se encaixa na sua cozinha"

---

### CLUSTER 4 — Presentes e Enxoval

#### D1 · Pillar · Lista de enxoval de cozinha: o guia completo de panos, toalhas e têxteis

| Atributo | Valor |
|---|---|
| **URL sugerida** | `/blog/lista-enxoval-de-cozinha` |
| **Meta title** | Lista de enxoval de cozinha: tudo que você precisa em panos e têxteis |
| **Keyword primária** | enxoval de cozinha |
| **Keywords secundárias** | lista enxoval cozinha, o que ter no enxoval de cozinha, enxoval mínimo cozinha, quantidade panos de prato enxoval |
| **Volume estimado** | ~6.000/mês |
| **Dificuldade SEO** | 3/5 — concorrência de blogs de casa e casamento |
| **Tráfego potencial** | ★★★★ |
| **AI Overview** | ★★★★ — lista clara = AI Overview |
| **Conversão** | ★★★★★ — intenção de compra / presentear direta |
| **Prioridade** | 🔴 Alta |

**Estrutura de conteúdo:**
- Panos de prato (mínimo 7-10, quantidade e tipos por uso)
- Panos de copa / panos de mão
- Avental (menção rápida)
- Luvas e protetores de forno
- Suportes e organizadores de panos
- Lista consolidada com quantidades recomendadas
- Como montar um kit de presente a partir do enxoval
- CTA: "Monte o enxoval perfeito com os kits Tramatto — já curados para você"

---

#### D2 · Presente para chá de cozinha: 12 ideias para quem quer presentear com estilo

| Atributo | Valor |
|---|---|
| **URL sugerida** | `/blog/presente-cha-de-cozinha` |
| **Meta title** | Presente para chá de cozinha: 12 ideias de qualidade para todos os orçamentos |
| **Keyword primária** | presente para chá de cozinha |
| **Keywords secundárias** | presente cha de cozinha criativo, presente cha de panela, kit presente cozinha, presente para noiva cozinha |
| **Volume estimado** | ~8.000/mês |
| **Dificuldade SEO** | 3/5 — concorrência de guias de presente generalistas |
| **Tráfego potencial** | ★★★★★ |
| **AI Overview** | ★★★★ |
| **Conversão** | ★★★★★ — intenção de compra altíssima, prazo curto (evento próximo) |
| **Prioridade** | 🔴 Alta — maior conversão esperada do portfólio |

**Estrutura de conteúdo:**
- 12 ideias organizadas por faixa de preço (até R$100, R$100-200, acima de R$200)
- Por que panos de prato premium são o presente ideal para chá de cozinha (explicação não-óbvia: é o item mais usado e menos comprado com qualidade)
- Como montar um kit de presente: combinação de panos + caixa + cartão
- O que evitar: presentes "muito pessoais", itens que duplicam o que a pessoa já tem
- Dica de personalização: monograma, cores da cozinha da noiva
- CTA: "Kit Presente Especial Tramatto — 4 panos em embalagem presente com cartão"

---

#### D3 · Presente de casamento para cozinha: como escolher algo que vai ser usado de verdade

| Atributo | Valor |
|---|---|
| **URL sugerida** | `/blog/presente-casamento-cozinha` |
| **Meta title** | Presente de casamento para cozinha: guia completo para escolher com estilo |
| **Keyword primária** | presente de casamento para cozinha |
| **Keywords secundárias** | presente casamento cozinha útil, lista de casamento cozinha, presente casamento lista de casamento, presente casal cozinha |
| **Volume estimado** | ~3.500/mês |
| **Dificuldade SEO** | 3/5 |
| **Tráfego potencial** | ★★★★ |
| **AI Overview** | ★★★ |
| **Conversão** | ★★★★★ |
| **Prioridade** | 🔴 Alta |

**Estrutura de conteúdo:**
- O problema com listas de casamento: as pessoas colocam itens caros e esquecem o cotidiano
- Por que panos de prato de qualidade são o presente que vai ser usado 365 dias por ano
- Quanto gastar (faixas para convidado, familiar, melhor amigo)
- O kit de casamento perfeito: panos premium + avental + porta-guardanapos
- Momento de usar: panos de prato como presente na caixinha de presente na festa vs. entrega posterior
- CTA: "Kit Tramatto para presente de casamento — embalagem e cartão incluídos"

---

#### D4 · Como montar um kit de panos de prato para presente: curadoria e embalagem

| Atributo | Valor |
|---|---|
| **URL sugerida** | `/blog/kit-panos-de-prato-presente` |
| **Meta title** | Como montar um kit de panos de prato para presente: curadoria, cores e embalagem |
| **Keyword primária** | kit panos de prato presente |
| **Keywords secundárias** | kit panos de prato, montar kit presente cozinha, kit têxtil cozinha, panos de prato para presentear |
| **Volume estimado** | ~1.500/mês |
| **Dificuldade SEO** | 1/5 |
| **Tráfego potencial** | ★★ |
| **AI Overview** | ★★★ |
| **Conversão** | ★★★★★ — quem busca isso já quer comprar |
| **Prioridade** | 🟡 Média-Alta |

**Estrutura de conteúdo:**
- Quantos panos por kit (3, 4 ou 6: por que cada número faz sentido)
- Como combinar cores: monocromático, cores complementares, variação de padrão
- Embalagem: caixa vs. sacola de presente vs. papel craft
- Personalização: monograma, bilhete, cartão escrito à mão
- Quando a curadoria é mais importante que a quantidade
- Os kits Tramatto: já curados, preço fixo, embalagem inclusa
- CTA direta para os 4 kits disponíveis

---

### CLUSTER 5 — Mesa Posta e Lifestyle

#### E1 · Pillar · Mesa posta para café da manhã: guia de decoração com têxteis e organização

| Atributo | Valor |
|---|---|
| **URL sugerida** | `/blog/mesa-posta-cafe-da-manha` |
| **Meta title** | Mesa posta para café da manhã: decoração com panos, têxteis e organização |
| **Keyword primária** | mesa posta cafe da manha |
| **Keywords secundárias** | decoração mesa cafe da manha, como decorar mesa cafe manha, mesa café da manhã bonita, mesa posta simples e bonita |
| **Volume estimado** | ~40.000/mês |
| **Dificuldade SEO** | 4/5 — Casa e Jardim, Westwing e Pinterest dominam |
| **Tráfego potencial** | ★★★★★ |
| **AI Overview** | ★★★ — concorrência alta nessa query específica |
| **Conversão** | ★★★ — topo de funil, mas captura volume enorme |
| **Prioridade** | 🟡 Média — esforço maior, mas volume justifica |

**Estratégia de diferenciação:** não concorrer com "ideias de café da manhã" generalistas, mas possuir "panos de prato e têxteis para mesa de café da manhã" — ângulo específico onde Westwing e Casa e Jardim não têm profundidade.

**Estrutura de conteúdo:**
- A importância do pano de prato na composição da mesa (elemento funcional-decorativo)
- Paleta de cores para diferentes estilos (minimalista, rústico, escandinavo, provençal)
- Como dobrar o pano de prato para a mesa (3 dobraduras diferentes com fotos/ilustrações)
- Combinações de cores: pano × louça × porta-guardanapos
- Mesa para 2 vs. mesa para família (quantidade e disposição de panos)
- Sazonalidade: café da manhã de domingo relaxado vs. brunch com visitas
- CTA: "Panos Tramatto em tons neutros: combinam com tudo e elevam qualquer mesa"

---

#### E2 · Mesa de brunch em casa: decoração, organização e têxteis certos

| Atributo | Valor |
|---|---|
| **URL sugerida** | `/blog/mesa-brunch-em-casa` |
| **Meta title** | Mesa de brunch em casa: têxteis, decoração e como organizar sem estresse |
| **Keyword primária** | mesa brunch em casa |
| **Keywords secundárias** | como fazer brunch em casa, decoração brunch, mesa posta brunch, brunch decoração mesa |
| **Volume estimado** | ~10.000/mês |
| **Dificuldade SEO** | 3/5 |
| **Tráfego potencial** | ★★★★ |
| **AI Overview** | ★★★ |
| **Conversão** | ★★★★ — quem faz brunch em casa investe em têxteis de qualidade |
| **Prioridade** | 🟡 Média-Alta |

**Estrutura de conteúdo:**
- O que é brunch vs. café da manhã normal (e como a mesa reflete isso)
- A lista de têxteis para um brunch: panos de mão, panos de prato, guardanapos de tecido
- Como fazer o "styling" da mesa sem gastar muito (foco em qualidade dos têxteis, não em enfeites)
- Cardápio e mesa coordenados: paleta de cores que combina com a comida
- Kit Tramatto Mesa de Brunch como item de destaque
- CTA direta para o kit

---

#### E3 · Como decorar a cozinha com panos de prato: 8 combinações elegantes

| Atributo | Valor |
|---|---|
| **URL sugerida** | `/blog/como-decorar-cozinha-panos-de-prato` |
| **Meta title** | Como decorar a cozinha com panos de prato: 8 combinações elegantes e fáceis |
| **Keyword primária** | como decorar cozinha com panos de prato |
| **Keywords secundárias** | panos de prato decoração, dobrar pano de prato para decorar, pano de prato como decoração, cozinha decorada panos |
| **Volume estimado** | ~4.000/mês |
| **Dificuldade SEO** | 2/5 |
| **Tráfego potencial** | ★★★ |
| **AI Overview** | ★★★ |
| **Conversão** | ★★★★ — quem quer decorar compra os panos |
| **Prioridade** | 🟡 Média-Alta |

**Estrutura de conteúdo:**
- 8 formas de usar pano de prato como elemento decorativo (porta de forno, suporte de bancada, cesta, alça de armário, gancho de parede, dobrado em camadas na prateleira, pendurado, mesa)
- Cores que funcionam: neutros e naturais (a paleta Tramatto funciona aqui)
- O erro mais comum: panos decorativos que não são práticos
- Pano de prato de qualidade como investimento em decoração (dura mais, continua bonito)
- CTA: "Veja as cores e padrões disponíveis na coleção Tramatto"

---

#### E4 · Cozinha minimalista: os têxteis que fazem a diferença sem exagerar

| Atributo | Valor |
|---|---|
| **URL sugerida** | `/blog/cozinha-minimalista-texteis` |
| **Meta title** | Cozinha minimalista: têxteis e panos que elevam sem poluir o espaço |
| **Keyword primária** | cozinha minimalista decoração |
| **Keywords secundárias** | cozinha minimalista branca, cozinha minimalista têxtil, panos cozinha minimalista, decoração cozinha clean |
| **Volume estimado** | ~20.000/mês (ampla concorrência) |
| **Dificuldade SEO** | 4/5 — concorrência de arquitetura e design de interiores |
| **Tráfego potencial** | ★★★★★ |
| **AI Overview** | ★★★ |
| **Conversão** | ★★★ — topo de funil, mas persona é perfeita para a Tramatto |
| **Prioridade** | 🟡 Média — alto esforço, ângulo específico (têxteis) facilita ranking |

**Estrutura de conteúdo:**
- Princípio minimalista aplicado à cozinha: menos itens, mais qualidade
- Os 3 têxteis essenciais da cozinha minimalista (pano de prato, avental, guardanapo de tecido)
- Paleta de cores: branco natural, areia, linho, terracota — por que neutros funcionam
- Qualidade como estética: panos premium ficam mais bonitos quanto mais são usados
- O contrário do minimalismo: coleção de panos de prato diferentes para cada humor (Tramatto tem isso também)
- CTA: "Coleção Essentials Tramatto — branco natural, areia e linho para a cozinha limpa"

---

### CLUSTER 6 — Origem e Proveniência

#### F1 · Pillar · Têxteis da Anatólia: por que a Turquia é a referência mundial em panos de algodão

| Atributo | Valor |
|---|---|
| **URL sugerida** | `/blog/texteis-da-anatolia-turquia` |
| **Meta title** | Têxteis da Anatólia: por que a Turquia é referência mundial em panos de algodão |
| **Keyword primária** | têxtil turco algodão |
| **Keywords secundárias** | pano de prato turco, algodão turco, tecelagem turca, Anatólia têxtil, toalha turca hamam |
| **Volume estimado** | ~1.200/mês |
| **Dificuldade SEO** | 1/5 — praticamente sem concorrência em português para esse ângulo |
| **Tráfego potencial** | ★★ |
| **AI Overview** | ★★★★★ — factual, histórico, resposta definitiva esperada |
| **Conversão** | ★★★ — quem busca "turco" já tem algum nível de interesse em qualidade |
| **Prioridade** | 🟡 Média-Alta — constrói autoridade única da Tramatto |

**Estrutura de conteúdo:**
- A Anatólia como berço da tecelagem: 500+ anos de tradição
- Por que o algodão turco é diferente (clima, solo, práticas de cultivo da região)
- As cidades têxteis: Bursa, Denizli, Gaziantep — cada uma com especialidade
- Como a Turquia se tornou fornecedora de têxteis para hotéis e marcas de luxo europeias
- O conceito de "pestemal" e "hammam towel" e a tradição de têxteis funcionais-decorativos
- A Tramatto como ponto de acesso direto a essa tradição para o Brasil
- CTA: "Conheça os panos de prato Tramatto — importados diretamente da Anatólia"

---

#### F2 · Pano de prato artesanal vs. industrial: o que muda e como identificar a diferença

| Atributo | Valor |
|---|---|
| **URL sugerida** | `/blog/pano-de-prato-artesanal-vs-industrial` |
| **Meta title** | Pano de prato artesanal vs. industrial: diferenças reais e como identificar |
| **Keyword primária** | pano de prato artesanal |
| **Keywords secundárias** | pano de prato feito à mão, diferença pano artesanal industrial, pano de prato bordado, pano de prato tecelagem |
| **Volume estimado** | ~800/mês |
| **Dificuldade SEO** | 1/5 |
| **Tráfego potencial** | ★★ |
| **AI Overview** | ★★★★ |
| **Conversão** | ★★★ |
| **Prioridade** | 🟡 Média |

**Estrutura de conteúdo:**
- O que é "artesanal" no contexto têxtil: tear manual vs. semi-automatizado vs. industrial
- Onde a diferença é visível: densidad do fio, uniformidade, acabamento de borda
- Como identificar: peso, textura, irregularidade natural (sinal de qualidade, não de defeito)
- O mito do "artesanal perfeito": boa parte do "artesanal" brasileiro é industrial com selo manual
- O modelo Tramatto: tear jacquard artesanal na Anatólia + revisão e acabamento à mão
- CTA: "Cada pano Tramatto passa por revisão individual antes do envio"

---

## 7. Tabela consolidada de priorização

| # | Artigo | Cluster | Tráfego | Dif. | AI Ov. | Conv. | Prioridade |
|:-:|---|:---:|:---:|:---:|:---:|:---:|:---:|
| B1 | Como lavar pano de prato | Cuidados | ★★★★★ | 2 | ★★★★★ | ★★ | 🔴 1 |
| B2 | Como tirar manchas de pano de prato | Cuidados | ★★★★★ | 1 | ★★★★★ | ★★ | 🔴 2 |
| D2 | Presente para chá de cozinha | Presentes | ★★★★★ | 3 | ★★★★ | ★★★★★ | 🔴 3 |
| A3 | Algodão vs. linho vs. microfibra | Materiais | ★★★ | 2 | ★★★★★ | ★★★★ | 🔴 4 |
| C1 | Como escolher pano de prato | Escolha | ★★★ | 2 | ★★★★★ | ★★★★★ | 🔴 5 |
| A1 | O que é algodão egípcio | Materiais | ★★★★ | 2 | ★★★★★ | ★★★ | 🔴 6 |
| D1 | Lista enxoval de cozinha | Presentes | ★★★★ | 3 | ★★★★ | ★★★★★ | 🔴 7 |
| D3 | Presente de casamento cozinha | Presentes | ★★★★ | 3 | ★★★ | ★★★★★ | 🔴 8 |
| C2 | Pano de prato premium vale a pena | Escolha | ★★ | 1 | ★★★★ | ★★★★★ | 🔴 9 |
| A2 | O que é tear jacquard | Materiais | ★★ | 1 | ★★★★★ | ★★★ | 🔴 10 |
| E1 | Mesa posta café da manhã | Lifestyle | ★★★★★ | 4 | ★★★ | ★★★ | 🟡 11 |
| B3 | Como manter pano branco | Cuidados | ★★★ | 1 | ★★★★★ | ★★ | 🟡 12 |
| E2 | Mesa brunch em casa | Lifestyle | ★★★★ | 3 | ★★★ | ★★★★ | 🟡 13 |
| F1 | Têxteis da Anatólia / Turquia | Origem | ★★ | 1 | ★★★★★ | ★★★ | 🟡 14 |
| E3 | Como decorar cozinha com panos | Lifestyle | ★★★ | 2 | ★★★ | ★★★★ | 🟡 15 |
| D4 | Kit panos de prato presente | Presentes | ★★ | 1 | ★★★ | ★★★★★ | 🟡 16 |
| B4 | Com que frequência trocar | Cuidados | ★★ | 1 | ★★★★ | ★★★ | 🟡 17 |
| C3 | Tamanhos de pano de prato | Escolha | ★★ | 1 | ★★★★ | ★★★ | 🟡 18 |
| E4 | Cozinha minimalista têxteis | Lifestyle | ★★★★★ | 4 | ★★★ | ★★★ | 🟡 19 |
| F2 | Artesanal vs. industrial | Origem | ★★ | 1 | ★★★★ | ★★★ | 🟡 20 |

---

## 8. FAQ global — perguntas que a Tramatto deve responder em algum artigo

Essas são as perguntas mais buscadas no nicho. Cada uma deve ser respondida em ao menos um artigo ou em um bloco FAQPage dedicado.

### Perguntas de produto
- Qual o melhor pano de prato? → C1 + C2
- Pano de prato de algodão ou microfibra: qual é melhor? → A3
- Pano de prato que não solta fiapo: o que procurar? → A1 + C1
- Qual o tamanho certo de pano de prato? → C3
- Pano de prato premium vale a pena? → C2
- O que é pano de copa? Diferença de pano de prato? → C1

### Perguntas de cuidado
- Como lavar pano de prato para não desbotir? → B1
- Quantas vezes por semana lavar o pano de prato? → B1
- Como tirar cheiro ruim do pano de prato? → B2
- Como tirar mancha de óleo do pano de prato? → B2
- Como manter pano branco sem usar água sanitária? → B3
- Quando jogar fora o pano de prato? → B4
- Pode lavar pano de prato na máquina? → B1
- Amaciante no pano de prato: pode ou não? → B1

### Perguntas de presente/enxoval
- O que dar de presente no chá de cozinha? → D2
- Quanto gastar no presente de chá de cozinha? → D2
- O que colocar na lista de casamento para a cozinha? → D1 + D3
- Como montar um kit de presente de cozinha? → D4
- Quantos panos de prato preciso para o enxoval? → D1

### Perguntas de decoração/lifestyle
- Como dobrar pano de prato para decorar? → E3
- Como montar uma mesa de café da manhã bonita? → E1
- O que usar na mesa de brunch? → E2
- Como decorar cozinha branca? → E4

---

## 9. Arquitetura de conteúdo recomendada

### Estrutura de URL
```
tramatto.com/
├── blog/                      ← diretório principal (novo)
│   ├── como-lavar-pano-de-prato/
│   ├── algodao-egipcio-fibra-longa/
│   ├── como-escolher-pano-de-prato/
│   ├── presente-cha-de-cozinha/
│   └── ... (mais 16 artigos)
└── colecoes/                  ← futura (Roadmap #24)
    ├── essentials/
    └── signature/
```

### Linkagem interna obrigatória
Cada artigo deve linkar para:
1. A pillar page do cluster a que pertence
2. A página da coleção (`/collection.html`)
3. 1-2 produtos relevantes (`/product.html?slug=X`)
4. 1-2 artigos supporting do mesmo cluster

As páginas de produto devem linkar de volta para os artigos mais relevantes (ex.: produto "Linho Anatoliano" → artigo "O que é algodão egípcio").

### Template de artigo (estrutura HTML recomendada)
```html
<article class="blog-post" itemscope itemtype="https://schema.org/Article">
  <header>
    <h1 itemprop="headline">Título do artigo</h1>
    <time itemprop="datePublished">YYYY-MM-DD</time>
  </header>
  <section class="blog-intro">          <!-- ~150 palavras, resposta direta -->
  <section class="blog-body">           <!-- conteúdo principal com h2/h3 -->
  <section class="blog-faq">            <!-- FAQPage embutida, 3-5 perguntas -->
  <section class="blog-cta">            <!-- CTA para produto ou kit relevante -->
</article>
```

Schema necessário em cada artigo:
- `Article` com `headline`, `author` (Organization), `datePublished`, `dateModified`
- `FAQPage` embutida (seção de perguntas frequentes no final)
- `BreadcrumbList` (Início → Blog → Título do artigo)

---

## 10. Calendário editorial (12 semanas, 20 artigos)

Assumindo 2 artigos por semana. Prioridade: menor dificuldade + maior tráfego + AI Overview.

| Semana | Artigo 1 | Artigo 2 | Foco |
|:---:|---|---|---|
| 1 | B1 — Como lavar pano de prato | B2 — Tirar manchas | Captura de volume rápido |
| 2 | A2 — Tear jacquard | C2 — Premium vale a pena | Posição 1 garantida |
| 3 | A3 — Algodão vs. linho vs. microfibra | C1 — Como escolher | Meio de funil |
| 4 | D2 — Presente para chá de cozinha | D3 — Presente de casamento | Conversão máxima |
| 5 | A1 — Algodão egípcio (pillar) | F1 — Têxteis da Anatólia | Autoridade técnica |
| 6 | B3 — Manter pano branco | B4 — Frequência de troca | Long-tail de cuidados |
| 7 | D1 — Lista enxoval de cozinha | D4 — Kit presente | Conversão enxoval |
| 8 | E3 — Decorar cozinha com panos | C3 — Tamanhos | Lifestyle + conversão |
| 9 | E2 — Mesa brunch | F2 — Artesanal vs. industrial | Lifestyle + origem |
| 10 | E1 — Mesa café da manhã (pillar) | E4 — Cozinha minimalista | Volume grande |
| 11-12 | Revisão, linkagem interna, sitemaps | + FAQPage e schemas em cada artigo | Consolidação |

---

## 11. Métricas e critérios de sucesso

### 30 dias após publicação
- Todos os artigos indexados (verificar no Search Console)
- Rich results de FAQPage ativos em ao menos 5 artigos
- Ao menos 1 aparição em AI Overview (verificar manualmente as queries-alvo)

### 90 dias após publicação
- Top 3 orgânico para: "o que é tear jacquard", "pano de prato premium", "algodão egípcio de fibra longa"
- Top 10 para: "como lavar pano de prato", "como tirar manchas de pano de prato"
- Tráfego orgânico do blog: 500-1.500 visitas/mês
- Taxa de conversão blog → produto: 1-3% (benchmark DTC têxtil)

### 12 meses após publicação
- Top 5 para queries de enxoval e presente de chá de cozinha
- Blog gerando 20-50% do tráfego orgânico total do site
- Ao menos 5 artigos citados em respostas de AI (ChatGPT, Perplexity, Gemini)
- Backlinks naturais: ao menos 10 domínios referenciando o conteúdo

### KPIs de acompanhamento
```
Google Search Console:
  → Impressões por artigo
  → CTR médio por cluster
  → Posição média para keyword primária

GA4:
  → Sessões de blog → collection.html (funil)
  → Sessões de blog → product.html (conversão direta)
  → Taxa de engajamento (tempo na página > 2min)

Manual (mensal):
  → Queries-alvo no AI Overview do Google
  → Perplexity: "tramatto pano de prato", "pano de prato premium brasil"
  → ChatGPT Browse: "melhor marca de pano de prato no brasil"
```

---

## 12. O que este plano não cobre (dependências externas)

| Dependência | Impacto no plano | Quando resolve |
|---|---|---|
| Fotografia própria (Roadmap #16) | Artigos de lifestyle precisam de imagens reais para ter impacto máximo (Pinterest, Google Discover) | Q2-Q3 |
| Blog section no HTML (estrutura de URL) | Os 20 artigos precisam de uma pasta `/blog/` com template de página HTML estática | Semana 1 |
| SSR do catálogo (Roadmap #14) | Links dos artigos para PDPs funcionam, mas conteúdo de produto não é totalmente indexável | Q2 |
| CNPJ/razão social (Roadmap #4) | Aumenta E-E-A-T geral, melhora ranking dos artigos mais competitivos | Imediato |
| Schema Article nos artigos | Requer atualização do template conforme cada artigo for publicado | Contínuo |
| llms.txt atualizado com blog | Artigos devem ser listados no llms.txt para AI Browse | A cada publicação |
