#!/usr/bin/env node
/**
 * Sincroniza nuvemshop-mirror-data.js a partir da VITRINE PÚBLICA da loja
 * Nuvemshop da Tramatto (HTML já publicado) — sem login, sem access_token,
 * sem API privada, sem escrita remota. Só faz GET em páginas públicas de
 * listagem e de produto, e nunca toca em carrinho, checkout, clientes ou
 * pedidos.
 *
 * Fontes usadas (públicas, confirmadas manualmente antes de escrever este
 * script):
 *  - JSON-LD "WebPage" (schema.org) embutido em cada página de produto:
 *    .mainEntity (nome, descrição, marca, preço, disponibilidade) e
 *    .breadcrumb (categoria real do produto).
 *  - `LS.variants = [...]` — array JSON válido embutido inline pelo tema,
 *    com o variant_id NUMÉRICO REAL, sku, price_number, stock por variante.
 *
 * Uso: node scripts/sync-nuvemshop-mirror.js
 */

const fs = require('fs');
const path = require('path');

const STORE_URL = 'https://tramatto.lojavirtualnuvem.com.br';
const OUTPUT_PATH = path.join(__dirname, '..', 'nuvemshop-mirror-data.js');
const USER_AGENT = 'TramattoMirrorSync/1.0 (+https://tramatto.com; contato@tramatto.com)';
const REQUEST_DELAY_MS = 400;
const MAX_LISTING_PAGES = 10;

// Campos curados por humano — o script NUNCA sobrescreve com default depois
// da primeira vez que o produto aparece no espelho (ver merge em main()).
const EDITORIAL_FIELDS = [
  'condition', 'productType', 'googleProductCategory',
  'badge', 'label', 'small', 'highlights', 'colors', 'sizes'
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchText(url) {
  const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!response.ok) {
    throw new Error(`GET ${url} -> ${response.status}`);
  }
  return response.text();
}

function extractJsonLdBlocks(html) {
  const re = /<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g;
  const blocks = [];
  let match = re.exec(html);
  while (match) {
    try {
      blocks.push(JSON.parse(match[1]));
    } catch (error) {
      // bloco malformado/inesperado — ignorado, não é fonte que usamos direto
    }
    match = re.exec(html);
  }
  return blocks;
}

// LS.variants é um array JSON válido, mas contém strings com colchetes
// dentro (installments_data), então usamos contagem de profundidade em vez
// de regex para achar o fim do array com segurança.
function extractVariants(html) {
  const marker = 'LS.variants = ';
  const start = html.indexOf(marker);
  if (start === -1) return [];

  const arrayStart = start + marker.length;
  let depth = 0;
  let end = -1;
  for (let i = arrayStart; i < html.length; i += 1) {
    const char = html[i];
    if (char === '[') depth += 1;
    if (char === ']') {
      depth -= 1;
      if (depth === 0) {
        end = i + 1;
        break;
      }
    }
  }
  if (end === -1) return [];

  try {
    return JSON.parse(html.slice(arrayStart, end));
  } catch (error) {
    return [];
  }
}

function extractProductUrls(html) {
  const re = /href="(https:\/\/tramatto\.lojavirtualnuvem\.com\.br\/produtos\/[a-z0-9-]+\/)"/g;
  const urls = new Set();
  let match = re.exec(html);
  while (match) {
    urls.add(match[1]);
    match = re.exec(html);
  }
  return urls;
}

async function collectAllProductUrls() {
  const urls = new Set();

  for (let page = 1; page <= MAX_LISTING_PAGES; page += 1) {
    const pageUrl = page === 1 ? `${STORE_URL}/produtos/` : `${STORE_URL}/produtos/?page=${page}`;

    let html;
    try {
      html = await fetchText(pageUrl);
    } catch (error) {
      if (page === 1) throw error;
      break; // páginas seguintes não existem — fim natural da paginação
    }

    const beforeSize = urls.size;
    extractProductUrls(html).forEach((url) => urls.add(url));
    if (urls.size === beforeSize) break;

    await sleep(REQUEST_DELAY_MS);
  }

  return [...urls];
}

function slugFromUrl(url) {
  const match = url.match(/\/produtos\/([a-z0-9-]+)\/?$/);
  return match ? match[1] : null;
}

function normalizeImageUrl(url) {
  if (!url) return null;
  return url.startsWith('//') ? `https:${url}` : url;
}

function collectionFromBreadcrumb(breadcrumb) {
  const items = breadcrumb?.itemListElement || [];
  // posição 1 é "Início", última posição é o próprio produto — a categoria
  // real fica no penúltimo item.
  const categoryItem = items.length >= 3 ? items[items.length - 2] : null;
  if (!categoryItem) return null;

  const match = categoryItem.item?.match(/\/([a-z0-9-]+)\/?$/);
  return {
    id: match ? match[1] : categoryItem.name,
    name: categoryItem.name
  };
}

// Nunca inventa id: variante sem id numérico real é descartada, não vira
// variante fictícia com id gerado (regra crítica do projeto).
function mapVariant(raw) {
  if (raw.id === undefined || raw.id === null) return null;

  return {
    id: raw.id,
    sku: raw.sku || null,
    price: typeof raw.price_number === 'number' ? raw.price_number : null,
    promotionalPrice: raw.has_promotional_price && typeof raw.promotional_price_number === 'number'
      ? raw.promotional_price_number
      : null,
    stock: typeof raw.stock === 'number' ? raw.stock : (raw.available ? null : 0),
    // Nenhum produto atual da loja tem mais de uma variante publicamente
    // (option0/1/2 sempre null), então não há como validar um mapeamento
    // confiável de nome de atributo -> cor/tamanho a partir de dados
    // públicos. Guardamos os valores brutos e deixamos color/size nulos até
    // existir um produto real multi-variante para validar contra.
    color: null,
    size: null,
    attributes: {
      option1: raw.option0 ?? null,
      option2: raw.option1 ?? null,
      option3: raw.option2 ?? null
    },
    image: normalizeImageUrl(raw.image_url)
  };
}

function defaultEditorialFields() {
  return {
    condition: 'new',
    productType: '',
    googleProductCategory: '',
    badge: '',
    label: 'Peça premium',
    small: '',
    highlights: [],
    colors: [],
    sizes: []
  };
}

async function scrapeProduct(url) {
  const html = await fetchText(url);
  const jsonLdBlocks = extractJsonLdBlocks(html);
  const webPageBlock = jsonLdBlocks.find((block) => block['@type'] === 'WebPage');
  const mainEntity = webPageBlock?.mainEntity;

  if (!mainEntity || mainEntity['@type'] !== 'Product') {
    return { warning: `sem dados de produto (mainEntity) em ${url} — pulado` };
  }

  const rawVariants = extractVariants(html);
  const variants = rawVariants.map(mapVariant).filter(Boolean);
  const nuvemshopProductId = rawVariants[0]?.product_id ?? null;

  const collection = collectionFromBreadcrumb(webPageBlock.breadcrumb);
  const offer = mainEntity.offers || {};
  const stockTotal = variants.reduce((sum, v) => sum + (typeof v.stock === 'number' ? v.stock : 0), 0);
  const promotionalPriceFromVariants = variants.find((v) => v.promotionalPrice)?.promotionalPrice ?? null;

  const product = {
    nuvemshopProductId,
    title: mainEntity.name,
    slug: slugFromUrl(url),
    description: mainEntity.description || '',
    price: offer.price !== undefined ? Number(offer.price) : (variants[0]?.price ?? null),
    promotionalPrice: promotionalPriceFromVariants,
    currency: offer.priceCurrency || 'BRL',
    brand: mainEntity.brand?.name || 'Tramatto',
    inStock: typeof offer.availability === 'string' ? offer.availability.includes('InStock') : stockTotal > 0,
    stock: stockTotal,
    collectionId: collection?.id || null,
    collectionName: collection?.name || null,
    gallery: [normalizeImageUrl(mainEntity.image)].filter(Boolean),
    variants,
    syncedAt: new Date().toISOString()
  };

  const warnings = [];
  if (!variants.length) warnings.push(`sem variante com id real: ${url}`);
  if (product.gallery.every((src) => src.includes('no-photo'))) warnings.push(`sem foto real cadastrada: ${url}`);

  return { product, warnings };
}

function loadExistingProducts() {
  if (!fs.existsSync(OUTPUT_PATH)) return new Map();
  try {
    delete require.cache[require.resolve(OUTPUT_PATH)];
    const existing = require(OUTPUT_PATH);
    const map = new Map();
    (existing.products || []).forEach((product) => {
      if (product.nuvemshopProductId !== undefined && product.nuvemshopProductId !== null) {
        map.set(product.nuvemshopProductId, product);
      }
    });
    return map;
  } catch (error) {
    console.warn(`Aviso: não consegui ler o espelho existente (${error.message}) — tratando como primeira execução.`);
    return new Map();
  }
}

function mergeEditorialFields(freshProduct, existingProductsById) {
  const previous = existingProductsById.get(freshProduct.nuvemshopProductId);
  const editorial = previous
    ? Object.fromEntries(EDITORIAL_FIELDS.map((key) => [key, previous[key]]))
    : defaultEditorialFields();

  return {
    nuvemshopProductId: freshProduct.nuvemshopProductId,
    title: freshProduct.title,
    slug: freshProduct.slug,
    description: freshProduct.description,
    price: freshProduct.price,
    promotionalPrice: freshProduct.promotionalPrice,
    currency: freshProduct.currency,
    brand: freshProduct.brand,
    inStock: freshProduct.inStock,
    stock: freshProduct.stock,
    collectionId: freshProduct.collectionId,
    gallery: freshProduct.gallery,
    variants: freshProduct.variants,
    syncedAt: freshProduct.syncedAt,
    condition: editorial.condition,
    productType: editorial.productType,
    googleProductCategory: editorial.googleProductCategory,
    badge: editorial.badge,
    label: editorial.label,
    small: editorial.small,
    highlights: editorial.highlights,
    colors: editorial.colors,
    sizes: editorial.sizes,
    needsEditorialReview: previous ? Boolean(previous.needsEditorialReview) : true
  };
}

function writeMirrorFile(data) {
  const header = '// Gerado automaticamente por scripts/sync-nuvemshop-mirror.js — NÃO editar\n'
    + '// campos automáticos manualmente sem rodar o script de novo depois (ele\n'
    + `// preserva os campos editoriais: ${EDITORIAL_FIELDS.join(', ')}).\n`
    + '// Independente de catalog-data.js (usado pelo MockAdapter) — este script\n'
    + '// nunca lê nem escreve catalog-data.js.\n'
    + `// Última sincronização: ${data.generatedAt}\n`;

  const body = '(function (global) {\n'
    + '  const root = globalThis;\n\n'
    + `  root.nuvemshopMirrorData = ${JSON.stringify(data, null, 2)};\n\n`
    + "  if (typeof module !== 'undefined' && module.exports) {\n"
    + '    module.exports = root.nuvemshopMirrorData;\n'
    + '  }\n'
    + "})(typeof window !== 'undefined' ? window : globalThis);\n";

  fs.writeFileSync(OUTPUT_PATH, header + body);
}

async function main() {
  console.log(`Buscando produtos publicados em ${STORE_URL} ...`);
  const productUrls = await collectAllProductUrls();
  console.log(`Encontrados ${productUrls.length} produtos publicados.\n`);

  const existingProductsById = loadExistingProducts();
  const products = [];
  const collectionsById = new Map();
  const warnings = [];

  for (const url of productUrls) {
    console.log(`  lendo ${url}`);
    try {
      const result = await scrapeProduct(url);
      if (result.warning) {
        warnings.push(result.warning);
      } else {
        const merged = mergeEditorialFields(result.product, existingProductsById);
        products.push({ ...merged, collectionName: result.product.collectionName });
        warnings.push(...(result.warnings || []));
        if (merged.collectionId) {
          collectionsById.set(merged.collectionId, {
            id: merged.collectionId,
            name: result.product.collectionName || merged.collectionId,
            slug: merged.collectionId,
            description: '',
            image: null
          });
        }
      }
    } catch (error) {
      warnings.push(`falha ao ler ${url}: ${error.message}`);
    }
    await sleep(REQUEST_DELAY_MS);
  }

  products.sort((a, b) => a.slug.localeCompare(b.slug));
  const finalProducts = products.map(({ collectionName, ...rest }) => rest);
  const collections = [...collectionsById.values()].sort((a, b) => a.id.localeCompare(b.id));

  const output = {
    generatedAt: new Date().toISOString(),
    sourceStoreUrl: STORE_URL,
    collections,
    products: finalProducts
  };

  writeMirrorFile(output);

  console.log(`\nConcluído: ${finalProducts.length} produtos, ${collections.length} coleções.`);
  console.log(`Gravado em ${OUTPUT_PATH}`);
  if (warnings.length) {
    console.log(`\nAvisos (${warnings.length}):`);
    warnings.forEach((warning) => console.log(`  - ${warning}`));
  }
}

main().catch((error) => {
  console.error('Falha na sincronização:', error);
  process.exitCode = 1;
});
