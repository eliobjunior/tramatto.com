# Google Search Console — Guia de Submissão
**Projeto:** Tramatto · `tramatto.com`  
**Hospedagem:** Hostinger  
**Data:** 2026-06-16  
**Pré-requisito:** site publicado e acessível em `https://tramatto.com`

**Tempo total estimado:** 30–45 minutos de configuração ativa + até 48h de propagação DNS.

---

## Visão geral do processo

```
1. Criar propriedade no Search Console
        ↓
2. Verificar domínio via registro DNS TXT na Hostinger
        ↓ (aguardar propagação: 15 min–48h)
3. Submeter sitemap.xml
        ↓
4. Submeter sitemap-products.xml
        ↓
5. Solicitar indexação das páginas principais
        ↓
6. Monitorar nos primeiros 7–14 dias
```

---

## Parte 1 — Criar a propriedade no Search Console

### Passo 1.1 — Acessar o Search Console

1. Acesse [search.google.com/search-console](https://search.google.com/search-console/) com a conta Google da Tramatto (a mesma que administra o GTM e o GA4)
2. Clique em **"+ Adicionar propriedade"** no menu lateral (ou botão "Começar" se for a primeira propriedade)

---

### Passo 1.2 — Escolher o tipo de propriedade

Aparecerão duas opções:

```
┌─────────────────────────────┐   ┌─────────────────────────────┐
│      Domínio                │   │    Prefixo de URL           │
│  tramatto.com               │   │  https://tramatto.com/      │
│                             │   │                             │
│  Cobre:                     │   │  Cobre:                     │
│  ✅ http + https            │   │  ✅ https://tramatto.com    │
│  ✅ www + non-www           │   │  ❌ http://                  │
│  ✅ todos os subdomínios    │   │  ❌ www.tramatto.com         │
│                             │   │                             │
│  Verificação: DNS TXT only  │   │  Verificação: várias opções │
└─────────────────────────────┘   └─────────────────────────────┘
         ← USE ESTE
```

**Selecione "Domínio"** e digite `tramatto.com` (sem `https://`, sem `www`).

Clique em **"Continuar"**.

---

### Passo 1.3 — Copiar o código TXT de verificação

O Google exibirá uma tela como esta:

```
Verificar a propriedade de domínio
─────────────────────────────────────────────────────
1. Faça login no provedor de domínio em: [Hostinger]
2. Copie o registro TXT abaixo para o DNS:

   google-site-verification=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

3. Pressione "Verificar" após adicionar o registro
─────────────────────────────────────────────────────
```

**Copie o valor completo** (começa com `google-site-verification=...`).

> ⚠️ NÃO feche esta janela. Você vai voltar a ela após configurar o DNS.

---

## Parte 2 — Adicionar o registro TXT na Hostinger

### Passo 2.1 — Acessar o painel da Hostinger

1. Acesse [hpanel.hostinger.com](https://hpanel.hostinger.com/)
2. Faça login com a conta da Tramatto

---

### Passo 2.2 — Localizar o gerenciador de DNS

**Caminho A — pelo menu Domínios (mais comum):**
```
Menu lateral → Domínios
  → Clique em "tramatto.com"
  → Aba "DNS / Nameservers"
  → Seção "Registros DNS"
```

**Caminho B — pela hospedagem:**
```
Menu lateral → Hospedagem
  → Clique em "Gerenciar" (ao lado do plano)
  → Role até "Avançado"
  → "Editor de Zona DNS"
```

Use o Caminho A se o DNS estiver gerenciado pelo próprio domínio na Hostinger. Use o Caminho B se o domínio usa os nameservers da hospedagem Hostinger.

> **Como saber qual usar?** Se ao acessar "tramatto.com" em "Domínios" você vê registros A, CNAME, MX — use o Caminho A. Se a aba de DNS estiver vazia ou ausente, use o Caminho B.

---

### Passo 2.3 — Adicionar o registro TXT

Clique em **"Adicionar registro"** (ou **"Add Record"**).

Preencha os campos exatamente assim:

| Campo | Valor |
|-------|-------|
| **Tipo** | `TXT` |
| **Nome** / **Host** | `@` |
| **Valor** / **Conteúdo** | `google-site-verification=XXXXXX...` (o código copiado no Passo 1.3) |
| **TTL** | `3600` (ou "Automático" / "Default") |

> **Campo "Nome":** use `@` para indicar o domínio raiz (`tramatto.com`). Algumas interfaces da Hostinger mostram o próprio domínio (`tramatto.com.`) automaticamente — se o campo estiver pré-preenchido, não altere.

Clique em **"Salvar"** (ou **"Add"**).

---

### Passo 2.4 — Aguardar a propagação DNS

| Tempo | O que esperar |
|-------|---------------|
| 5–15 min | Propagação interna da Hostinger (provável) |
| 30 min–2h | Propagação para a maioria dos servidores DNS globais |
| Até 48h | Propagação completa (raro; Hostinger geralmente é rápido) |

**Como verificar se já propagou** (opcional, antes de clicar em "Verificar"):

Acesse este endereço substituindo pelo seu domínio:
```
https://toolbox.googleapps.com/apps/dig/#TXT/tramatto.com
```

Se aparecer o valor `google-site-verification=...` nos resultados, o registro já propagou.

---

### Passo 2.5 — Verificar no Search Console

1. Volte à janela do Search Console que ficou aberta no Passo 1.3
2. Clique em **"Verificar"**

**Resultado esperado:**
```
✅ Propriedade verificada!
"tramatto.com" foi verificada com sucesso.
```

Se aparecer erro, aguarde mais 15–30 minutos e tente novamente. Não clique em "Verificar" mais de uma vez por minuto — o processo tem rate limit.

> **Se a verificação falhar após 2h:** confirme que o registro TXT está salvo na Hostinger (refaça o Passo 2.2 e 2.3 para checar). Às vezes a interface da Hostinger requer reload para mostrar o registro salvo.

---

## Parte 3 — Configuração inicial da propriedade

### Passo 3.1 — Confirmar o endereço preferido

Após a verificação, o Search Console abrirá o painel da propriedade `tramatto.com`.

Acesse **Configurações** (ícone de engrenagem no canto inferior esquerdo) e confirme:
- **Endereço do site:** `tramatto.com` ✅
- **Proprietário verificado:** sua conta Google ✅

O tipo "Domínio" já cobre automaticamente `www.tramatto.com` e `http://tramatto.com` — não é necessário configurar redirecionamento aqui.

---

### Passo 3.2 — Verificar o robots.txt

No painel do Search Console:

```
Menu lateral → Configurações → Rastreamento → robots.txt
```

O Google exibirá o conteúdo do `robots.txt`. Confirme que aparece:

```
User-agent: *
Allow: /

Sitemap: https://tramatto.com/sitemap.xml
Sitemap: https://tramatto.com/sitemap-products.xml
```

Se aparecer esse conteúdo, ✅ correto. Se estiver vazio ou diferente, verifique se o arquivo `robots.txt` está na raiz do site publicado.

---

## Parte 4 — Submeter os Sitemaps

### Passo 4.1 — Acessar a seção Sitemaps

No painel do Search Console:

```
Menu lateral → Indexação → Sitemaps
```

---

### Passo 4.2 — Submeter sitemap.xml (páginas principais)

No campo **"Adicionar um novo sitemap"**:

```
https://tramatto.com/ [sitemap.xml]
                       ↑ digite apenas isso
```

Digite `sitemap.xml` no campo de URL (o prefixo `https://tramatto.com/` já aparece fixo) e clique em **"Enviar"**.

**Resultado esperado:**

| Campo | Valor esperado |
|-------|---------------|
| Status | Sucesso ✅ |
| Tipo | Sitemap |
| URLs descobertas | 7 |
| Última leitura | data de hoje |

> Se "URLs descobertas" mostrar 7, está correto: `/`, `/collection.html`, 5 páginas `pages/*.html`. Se mostrar 11, significa que as PDPs estão ainda no `sitemap.xml` — verifique se as edições da auditoria de SEO foram publicadas.

---

### Passo 4.3 — Submeter sitemap-products.xml (PDPs)

No mesmo campo **"Adicionar um novo sitemap"**:

Digite `sitemap-products.xml` e clique em **"Enviar"**.

**Resultado esperado:**

| Campo | Valor esperado |
|-------|---------------|
| Status | Sucesso ✅ |
| Tipo | Sitemap |
| URLs descobertas | 4 |
| Última leitura | data de hoje |

> As 4 URLs são:
> - `product.html?slug=linho-anatoliano`
> - `product.html?slug=borda-dourada`
> - `product.html?slug=listrado-classico`
> - `product.html?slug=jacquard-ottomano`

---

### Passo 4.4 — O que fazer se o sitemap retornar erro

| Erro | Causa mais provável | Solução |
|------|--------------------|----|
| "Não foi possível buscar" | Arquivo não publicado ou URL errada | Confirmar que `https://tramatto.com/sitemap.xml` retorna 200 no browser |
| "Nenhuma URL encontrada" | XML malformado ou encoding inválido | Abrir o arquivo no browser e checar erros de parse |
| "URL bloqueada pelo robots.txt" | Regra de Disallow atingindo a URL do sitemap | Revisar `robots.txt` (o atual não tem Disallow, portanto improvável) |
| "Sitemap excede tamanho máximo" | > 50.000 URLs ou > 50 MB | Não se aplica (< 15 URLs) |

---

## Parte 5 — Solicitar indexação das páginas principais

> **Por que fazer isso?** Após submeter o sitemap, o Google agenda o rastreamento — mas pode levar dias a semanas. Solicitar indexação manualmente coloca as URLs em uma fila de rastreamento mais rápida. Limite: 50 solicitações por dia, 500 por mês.

### Passo 5.1 — Acessar a Inspeção de URL

No painel do Search Console:

```
Barra de pesquisa superior → cole a URL → Enter
```

Ou clique em **"Inspeção de URL"** no menu lateral e cole a URL no campo.

---

### Passo 5.2 — Indexar as páginas por prioridade

Execute o processo abaixo para cada URL na ordem indicada.

Para cada URL:
1. Cole a URL na barra de inspeção
2. Aguarde o Google verificar o status (10–30 segundos)
3. Clique em **"Solicitar indexação"**
4. Aguarde a mensagem de confirmação e passe para a próxima URL

---

#### Prioridade 1 — Páginas críticas (fazer primeiro)

```
https://tramatto.com/
https://tramatto.com/collection.html
```

Essas são as duas páginas de maior valor de negócio. Indexação rápida garante que a marca e o catálogo apareçam em buscas por nome.

**O que verificar na Inspeção antes de solicitar:**
- "URL está no Google": pode aparecer "URL não está no Google" (normal no início)
- "Canonical declarado pelo usuário": deve mostrar a própria URL (ex.: `https://tramatto.com/`)
- "Indexação permitida por robots.txt": Sim ✅
- "meta robots": index, follow ✅

---

#### Prioridade 2 — Páginas de produto (PDPs)

```
https://tramatto.com/product.html?slug=linho-anatoliano
https://tramatto.com/product.html?slug=listrado-classico
https://tramatto.com/product.html?slug=borda-dourada
https://tramatto.com/product.html?slug=jacquard-ottomano
```

**Atenção especial às PDPs — verificação em duas etapas:**

Antes de clicar em "Solicitar indexação" em cada PDP, clique em **"Testar URL ao vivo"** e aguarde o Google renderizar a página. Depois, clique em **"Ver página testada"** e confirme:

| O que verificar | O que deve aparecer |
|----------------|-------------------|
| Título da aba (`<title>`) | Nome do produto (ex.: "Linho Anatoliano \| Panos de Prato Premium \| Tramatto") |
| `canonical` | `https://tramatto.com/product.html?slug=linho-anatoliano` |
| Conteúdo da página | Produto renderizado (nome, preço, descrição visíveis) |
| JSON-LD detectado | Tipo "Product" na seção "Rich results" |

Se o título ainda aparecer genérico ("Tramatto — Produto"), o JavaScript não renderizou. Veja a seção **Resolução de problemas** no final deste guia.

> **Produto sem estoque:** inclua `jacquard-ottomano` na solicitação — o Google recomenda manter PDPs de produtos fora de estoque indexadas para preservar autoridade de página e histórico.

---

#### Prioridade 3 — Páginas institucionais

```
https://tramatto.com/pages/about.html
https://tramatto.com/pages/shipping.html
https://tramatto.com/pages/contact.html
```

Essas páginas têm relevância para E-E-A-T (confiança da marca) e para o processo de aprovação do Merchant Center. Solicite a indexação logo após as Prioridades 1 e 2.

---

#### Não solicitar indexação

```
https://tramatto.com/pages/privacy.html   → deixar o Google descobrir via sitemap
https://tramatto.com/pages/terms.html     → idem
https://tramatto.com/404.html             → noindex — nunca solicitar
```

Políticas de privacidade e termos não têm valor de busca direto; o Google as indexa por conta própria via links do rodapé. Economize as cotas para páginas de maior impacto.

---

## Parte 6 — Verificações pós-submissão

### Passo 6.1 — Imediato (mesmo dia)

Confirme que os sitemaps foram processados sem erro no painel Sitemaps. Deve aparecer:

```
sitemap.xml           → Sucesso  → 7 URLs
sitemap-products.xml  → Sucesso  → 4 URLs
```

---

### Passo 6.2 — Após 24–72 horas

Retorne ao Search Console e verifique:

**Menu lateral → Indexação → Páginas**

```
Estado de indexação esperado (72h após submissão):
✅ Indexadas: 2–7 páginas (home e coleção geralmente são as primeiras)
⏳ Descobertas, não indexadas ainda: PDPs e páginas secundárias
```

O Google não indexa tudo de uma vez. É normal que as PDPs demorem mais por dependerem de renderização JavaScript.

---

### Passo 6.3 — Após 7–14 dias

Monitore os seguintes relatórios:

**1. Cobertura / Páginas**

```
Menu → Indexação → Páginas
```

Confirme que as 11 URLs do `sitemap.xml` + 4 do `sitemap-products.xml` aparecem como "Indexada" ou em processamento ativo.

**Alertas críticos a resolver imediatamente:**

| Status que exige ação | Significado | O que fazer |
|-----------------------|-------------|-------------|
| "Duplicada: Google escolheu canonical diferente" | Google ignorou o canonical declarado nas PDPs e escolheu `product.html` sem slug | Ver resolução de problemas §7.3 abaixo |
| "Bloqueada por robots.txt" | Algo no robots.txt impede o rastreamento | Verificar se o arquivo foi alterado no deploy |
| "Erro 404 (não encontrada)" | URL no sitemap não existe no servidor | Confirmar que a página está publicada |
| "Redirecionamento" | URL redireciona para outra | Confirmar se o redirect é intencional e atualizar o sitemap |

**2. Melhorias → Produtos (rich results)**

```
Menu → Experiência → Melhorias → Produtos
```

Confirme que as 4 PDPs aparecem sem erros de schema. Deve haver status **"Válido"** ou **"Válido com avisos"**. Se aparecer **"Erro"**, clicar no item para ver qual campo do Product Schema está incorreto.

**3. Experiência na página / Core Web Vitals**

```
Menu → Experiência → Core Web Vitals
```

Se aparecer dados, confirmar que as URLs em "Ruim" (LCP > 4s, CLS > 0.25, INP > 500ms) são priorizadas no roadmap de performance (#7 e #25).

---

## Parte 7 — Resolução de problemas

### 7.1 — Verificação DNS falhou

**Sintoma:** Search Console diz "Falha na verificação" mesmo após aguardar.

**Passos:**
1. Acesse o gerenciador DNS da Hostinger (Passo 2.2) e confirme que o registro TXT existe e tem o valor correto
2. Use `https://toolbox.googleapps.com/apps/dig/#TXT/tramatto.com` para confirmar a propagação
3. Certifique-se de que o registro foi salvo (algumas versões do hPanel exigem clicar em "Salvar" na zona inteira, não apenas no registro individual)
4. Aguarde mais 30 minutos e clique em "Verificar" novamente

**Alternativa — verificação via HTML tag** (se o DNS continuar falhando):

Se a verificação DNS demorar mais de 48h ou falhar repetidamente, use o método alternativo de HTML tag:

1. No Search Console, clique em **"Outra verificação"** → **"Tag HTML"**
2. Google fornecerá: `<meta name="google-site-verification" content="XXXXXX">`
3. Adicione esta tag no `<head>` de `index.html`, antes da tag `</head>`
4. Publique o arquivo e clique em "Verificar" no Search Console

> **Atenção:** a verificação via HTML tag só funciona enquanto a tag estiver no HTML. Se o arquivo for sobrescrito em um deploy sem a tag, a verificação cai. A verificação DNS é permanente enquanto o registro existir.

---

### 7.2 — Sitemap retorna "Não foi possível buscar"

**Verifique:**
1. `https://tramatto.com/sitemap.xml` abre corretamente no browser (deve mostrar XML)
2. `https://tramatto.com/sitemap-products.xml` idem
3. O servidor retorna `Content-Type: application/xml` ou `text/xml` (verificar nas DevTools → Network)
4. O arquivo não está protegido por senha ou por regra de `.htaccess`/Cloudflare

---

### 7.3 — PDPs indexadas com canonical errado

**Sintoma:** Inspeção de URL → "Canonical selecionado pelo Google" = `https://tramatto.com/product.html` (sem slug)

**O que isso significa:** o Googlebot rastreou a versão pré-JS da página e escolheu o canonical genérico.

**Ações:**
1. Clique em **"Testar URL ao vivo"** na Inspeção de URL para a PDP com problema
2. Verifique se o `<title>` e o canonical aparecem corretos na versão renderizada
3. Se a versão ao vivo mostrar o produto correto, clique em **"Solicitar indexação"** — isso força uma nova avaliação com renderização JS
4. Aguarde 7–14 dias e verifique novamente
5. Se o problema persistir, está relacionado à limitação de CSR documentada em `docs/search-console.md §4.2` — a solução definitiva é o item #14 do roadmap (SSR/snapshot)

---

### 7.4 — Product Schema com erros

**Sintoma:** Relatório "Produtos" mostra "Erro: campo obrigatório ausente"

**Campos obrigatórios para o tipo Produto (verificar):**

| Campo | Onde está | O que checar |
|-------|-----------|-------------|
| `name` | `product.title` em `catalog-data.js` | Não deve estar vazio |
| `description` | `product.description` | Não deve estar vazio |
| `image` | `product.gallery[0]` convertido para URL absoluta | Deve começar com `https://tramatto.com/` |
| `offers.price` | `parsePrice(product.price)` | Deve ser número (ex.: `120`, não `"R$ 120,00"`) |
| `offers.priceCurrency` | `"BRL"` | Fixo no código |
| `offers.availability` | `product.inStock` | `InStock` ou `OutOfStock` |

Use o [Rich Results Test](https://search.google.com/test/rich-results) para diagnosticar:
1. Acesse a ferramenta
2. Cole `https://tramatto.com/product.html?slug=linho-anatoliano`
3. Clique em "Testar URL"
4. Na aba "Resultados detectados", confirme que "Produto" aparece sem erros vermelhos

---

## Parte 8 — Vincular o Search Console ao GA4

Este passo não é obrigatório para a indexação, mas permite cruzar dados de busca orgânica com comportamento no site.

### Passo 8.1 — No Google Analytics (GA4)

```
analytics.google.com → propriedade G-13KSN16JDG
  → Admin (engrenagem inferior esquerda)
  → Produto → Vínculos do produto
  → Vincular ao Search Console
  → Adicionar vínculos
  → Selecionar "tramatto.com"
  → Salvar
```

### Passo 8.2 — O que isso desbloqueia

Após o vínculo (leva 1–3 dias para os dados aparecerem):

```
GA4 → Relatórios → Ciclo de vida → Aquisição → Aquisição de tráfego
                                                ↑ aparece "Pesquisa orgânica do Google"
                                                  com queries reais dos usuários
```

Também desbloqueia o relatório **"Páginas de destino"** no Search Console com métricas de engajamento.

---

## Resumo de verificações finais

```
Dia 0 (hoje)
  ✅ Propriedade "tramatto.com" verificada no Search Console
  ✅ robots.txt visível e correto no Search Console
  ✅ sitemap.xml submetido → Sucesso → 7 URLs
  ✅ sitemap-products.xml submetido → Sucesso → 4 URLs
  ✅ Indexação solicitada: / · /collection.html · 4 PDPs · 3 páginas institucionais

Dia 1–3
  ⏳ Homepage e /collection.html aparecem em Indexação → Páginas como "Indexada"
  ⏳ Primeiras impressões de busca por "Tramatto" começam a aparecer em Desempenho

Dia 7–14
  ⏳ PDPs indexadas (confirmar canonical correto via Inspeção de URL)
  ⏳ Product Schema sem erros em Melhorias → Produtos
  ⏳ Vínculo GA4 ↔ Search Console gerando dados de query em Aquisição

Dia 30+
  ⏳ Core Web Vitals com dados de campo (precisa de tráfego real suficiente)
  ⏳ Relatório de Links mostra PDPs sendo descobertas via rastreamento de links
```

---

## Referências

| Recurso | URL |
|---------|-----|
| Google Search Console | https://search.google.com/search-console/ |
| Hostinger hPanel | https://hpanel.hostinger.com/ |
| Verificação de DNS (Google) | https://toolbox.googleapps.com/apps/dig/#TXT/tramatto.com |
| Rich Results Test | https://search.google.com/test/rich-results |
| robots.txt Tester | disponível em Search Console → Configurações |
| Docs internos relacionados | [search-console.md](search-console.md) · [search-console-readiness.md](search-console-readiness.md) · [sitemap-products.md](sitemap-products.md) |
