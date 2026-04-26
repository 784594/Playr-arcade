#!/usr/bin/env node

import { promises as fs } from 'node:fs';
import path from 'node:path';

const DEFAULTS = {
  source: 'icgg',
  mode: 'chunk',
  output: 'data/wiki-recipes-extra.json',
  checkpoint: 'data/wiki-recipes-fetch-checkpoint.json',
  startId: 1,
  endId: 195932,
  startChunk: 0,
  endChunk: null,
  targetNew: 1000000,
  delayMs: 250,
  maxRetries: 8,
  retryBaseMs: 1200,
  statusEveryIds: 100,
  statusEveryRecipes: 5000,
  statusEveryChunks: 25,
  maxPagesPerItem: 500,
  apiBase: 'https://infinibrowser.wiki/api',
  dataPrefix: 'https://infinite-craft.gg/recipes/data',
  itemMaxRetries: 2,
};

const BASE64_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-=';
const CHUNK_FIELD_SEPARATOR = ':3';
const LIST_SEPARATOR = ':2';
const VALUE_SEPARATOR = ':1';

function parseArgs(argv) {
  const args = { existing: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;
    const eqIdx = token.indexOf('=');
    const key = eqIdx >= 0 ? token.slice(2, eqIdx) : token.slice(2);
    const value = eqIdx >= 0 ? token.slice(eqIdx + 1) : argv[i + 1];
    const consumeNext = eqIdx < 0;

    switch (key) {
      case 'source':
      case 'mode':
      case 'output':
      case 'checkpoint':
      case 'api-base':
      case 'data-prefix':
        args[toCamel(key)] = value;
        if (consumeNext) i += 1;
        break;
      case 'existing':
        args.existing.push(value);
        if (consumeNext) i += 1;
        break;
      case 'start-id':
      case 'end-id':
      case 'start-chunk':
      case 'end-chunk':
      case 'target-new':
      case 'delay-ms':
      case 'max-retries':
      case 'retry-base-ms':
      case 'status-every-ids':
      case 'status-every-recipes':
      case 'status-every-chunks':
      case 'max-pages-per-item':
      case 'item-max-retries':
        args[toCamel(key)] = Number(value);
        if (consumeNext) i += 1;
        break;
      case 'help':
        args.help = true;
        break;
      default:
        throw new Error(`Unknown argument: --${key}`);
    }
  }
  return args;
}

function toCamel(kebab) {
  return kebab.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

function printUsage() {
  console.log([
    'Usage:',
    '  node scripts/fetch-infinite-craft-recipes.mjs [options]',
    '',
    'Options:',
    '  --source icgg|infinibrowser       Recipe source (default: icgg)',
    '  --mode chunk|full                 Fetch mode (default: chunk)',
    '  --existing <path>                 Existing recipe JSON to skip duplicates (repeatable)',
    '  --output <path>                   Output JSON path',
    '  --checkpoint <path>               Resume checkpoint path',
    '  --target-new <n>                  Number of NEW recipes to collect',
    '  --status-every-recipes <n>        Status print interval by new recipes',
    '',
    'ICGG source options:',
    '  --data-prefix <url>               Base path for index.json / metadata.json / chunks',
    '  --start-chunk <n>                 First chunk number to process',
    '  --end-chunk <n>                   Last chunk number to process',
    '  --status-every-chunks <n>         Status print interval by processed chunks',
    '',
    'Infinibrowser source options:',
    '  --start-id <n>                    First element id to scan',
    '  --end-id <n>                      Last element id to scan',
    '  --delay-ms <n>                    Delay between successful requests',
    '  --max-retries <n>                 Max retries for transient failures',
    '  --retry-base-ms <n>               Base backoff for retries',
    '  --status-every-ids <n>            Status print interval by scanned ids',
    '  --max-pages-per-item <n>          Guardrail for uses pagination',
    '  --item-max-retries <n>            Max retries for a single item lookup',
    '  --api-base <url>                  API base URL',
    '',
    'Examples:',
    '  node scripts/fetch-infinite-craft-recipes.mjs --source icgg --mode chunk --target-new 2300000 --existing utils/single-player/infinite-craft-clone/data/wiki-recipes-lite.json --output data/wiki-recipes-part-2.json --checkpoint data/wiki-recipes-part-2.checkpoint.json',
    '  node scripts/fetch-infinite-craft-recipes.mjs --source icgg --mode full --target-new 3470353 --output data/wiki-recipes-full.json --checkpoint data/wiki-recipes-full.checkpoint.json',
    '  node scripts/fetch-infinite-craft-recipes.mjs --source infinibrowser --mode chunk --target-new 1000000 --existing utils/single-player/infinite-craft-clone/data/wiki-recipes-part-1.json --output data/wiki-recipes-part-2.json --checkpoint data/wiki-recipes-part-2.checkpoint.json',
  ].join('\n'));
}

function normalizeName(value) {
  return String(value || '')
    .normalize('NFKC')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

function pairKey(a, b) {
  const left = normalizeName(a);
  const right = normalizeName(b);
  if (!left || !right) return '';
  return left < right ? `${left}::${right}` : `${right}::${left}`;
}

async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readJsonIfExists(filePath) {
  if (!await pathExists(filePath)) return null;
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw);
}

async function writeJsonAtomic(filePath, data) {
  const outDir = path.dirname(filePath);
  await fs.mkdir(outDir, { recursive: true });
  const tempPath = `${filePath}.tmp`;
  await fs.writeFile(tempPath, `${JSON.stringify(data)}\n`, 'utf8');
  await fs.rename(tempPath, filePath);
}

async function sleep(ms) {
  if (ms <= 0) return;
  await new Promise((resolve) => setTimeout(resolve, ms));
}

function jitter(ms) {
  return ms + Math.floor(Math.random() * 300);
}

function buildRequestHeaders(baseUrl) {
  const base = String(baseUrl || '');
  if (base.includes('infinibrowser.wiki')) {
    return {
      Accept: 'application/json,text/plain,*/*',
      'Accept-Language': 'en-US,en;q=0.9',
      Origin: 'https://infinibrowser.wiki',
      Referer: 'https://infinibrowser.wiki/',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    };
  }

  if (base.includes('infinite-craft.gg')) {
    return {
      Accept: 'application/json,text/plain,*/*',
      'Accept-Language': 'en-US,en;q=0.9',
      Referer: 'https://infinite-craft.gg/recipes/',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    };
  }

  return {
    Accept: 'application/json',
    'User-Agent': 'playr-recipe-fetcher/2.0',
  };
}

async function fetchJsonWithRetry(url, options) {
  const {
    maxRetries,
    retryBaseMs,
    delayMs,
    requestHeaders,
    nullOnStatus = new Set([400, 404]),
  } = options;
  let lastError = null;

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: requestHeaders,
      });

      if (response.ok) {
        const payload = await response.json();
        await sleep(delayMs);
        return payload;
      }

      if (nullOnStatus.has(response.status)) {
        return null;
      }

      if (response.status === 429 || response.status >= 500) {
        const backoff = jitter(retryBaseMs * Math.pow(2, attempt));
        console.warn(`Retryable HTTP ${response.status} for ${url}; waiting ${backoff}ms`);
        await sleep(backoff);
        continue;
      }

      const body = await response.text();
      throw new Error(`HTTP ${response.status} for ${url}: ${body.slice(0, 240)}`);
    } catch (error) {
      lastError = error;
      if (attempt >= maxRetries) break;
      const backoff = jitter(retryBaseMs * Math.pow(2, attempt));
      console.warn(`Network retry ${attempt + 1}/${maxRetries} for ${url}; waiting ${backoff}ms`);
      await sleep(backoff);
    }
  }

  if (lastError) throw lastError;
  throw new Error(`Failed request with no error object: ${url}`);
}

function isRecipePayload(payload) {
  return !!payload && typeof payload === 'object' && payload.recipes && typeof payload.recipes === 'object';
}

async function loadExistingKeys(existingFiles) {
  const keySet = new Set();
  for (const file of existingFiles) {
    const payload = await readJsonIfExists(file);
    if (!isRecipePayload(payload)) continue;
    const keys = Object.keys(payload.recipes);
    for (const key of keys) {
      if (key) keySet.add(key);
    }
    console.log(`Loaded ${keys.length} keys from ${file}`);
  }
  return keySet;
}

async function loadOutputRecipes(outputPath) {
  const payload = await readJsonIfExists(outputPath);
  if (!isRecipePayload(payload)) {
    return { recipes: {}, count: 0 };
  }

  const recipes = {};
  let count = 0;
  for (const [key, value] of Object.entries(payload.recipes)) {
    if (!key || !value || typeof value !== 'object') continue;
    recipes[key] = value;
    count += 1;
  }

  if (count) {
    console.log(`Resuming with ${count} recipes already present in ${outputPath}`);
  }

  return { recipes, count };
}

function buildOutputDocument({
  recipes,
  scannedElements = 0,
  scannedPages = 0,
  processedChunks = 0,
  processedRows = 0,
  targetNew,
  baseExistingCount,
  mode,
  source,
  metadataRecipeCount = undefined,
}) {
  return {
    parsedLines: processedRows || scannedPages,
    version: 2,
    recipes,
    maxRecipes: targetNew,
    elementCount: scannedElements,
    recipeCount: Object.keys(recipes).length,
    processedChunks,
    processedRows,
    source,
    mode,
    metadataRecipeCount,
    basedOnExisting: baseExistingCount,
    generatedAt: new Date().toISOString(),
  };
}

function decodeToken(value) {
  let result = 0;
  for (const char of String(value || '')) {
    const idx = BASE64_ALPHABET.indexOf(char);
    if (idx < 0) {
      throw new Error(`Unexpected token character "${char}" in ${value}`);
    }
    result = (result * 64) + idx;
  }
  return result;
}

function getChunkId(token) {
  return Math.floor(decodeToken(token) / 100);
}

function parseChunkPairs(segment) {
  if (!segment) return [];
  return segment
    .split(LIST_SEPARATOR)
    .map((entry) => entry.split(VALUE_SEPARATOR))
    .filter((entry) => entry.length >= 2 && entry[0] && entry[1]);
}

function parseChunkRecord(value) {
  const [from = '', to = '', hiddenFrom = '', hiddenTo = ''] = String(value || '').split(CHUNK_FIELD_SEPARATOR);
  return {
    from: parseChunkPairs(from),
    to: parseChunkPairs(to),
    hiddenFrom: parseChunkPairs(hiddenFrom),
    hiddenTo: parseChunkPairs(hiddenTo),
  };
}

function createRecipeRecord(indexEntry, token) {
  const emoji = String(indexEntry?.[0] || '✨').trim() || '✨';
  const name = String(indexEntry?.[1] || '').trim();
  if (!name) return null;
  return {
    emoji,
    id: decodeToken(token),
    name,
  };
}

function addRecipe(recipes, key, value) {
  if (!key || !value || typeof value !== 'object') return false;
  if (Object.prototype.hasOwnProperty.call(recipes, key)) return false;
  recipes[key] = value;
  return true;
}

function getTargetNew(parsed, mode, fallback) {
  if (Number.isFinite(parsed.targetNew)) return parsed.targetNew;
  if (mode === 'full' && Number.isFinite(fallback)) return fallback;
  return DEFAULTS.targetNew;
}

function getResumeChunkIndex(checkpointData, chunkIds, startChunk) {
  if (Number.isFinite(checkpointData?.nextChunkIndex)) {
    return checkpointData.nextChunkIndex;
  }

  if (Number.isFinite(checkpointData?.currentChunk)) {
    const nextIndex = chunkIds.findIndex((chunkId) => chunkId > checkpointData.currentChunk);
    if (nextIndex >= 0) return nextIndex;
    return chunkIds.length;
  }

  const startIndex = chunkIds.findIndex((chunkId) => chunkId >= startChunk);
  return startIndex >= 0 ? startIndex : 0;
}

async function runIcggImport(context) {
  const {
    parsed,
    mode,
    output,
    checkpoint,
    checkpointData,
    existingKeys,
    baseExistingCount,
    newRecipes,
    initialRecipeCount,
  } = context;

  const dataPrefix = parsed.dataPrefix || DEFAULTS.dataPrefix;
  const maxRetries = Number.isFinite(parsed.maxRetries) ? parsed.maxRetries : DEFAULTS.maxRetries;
  const retryBaseMs = Number.isFinite(parsed.retryBaseMs) ? parsed.retryBaseMs : DEFAULTS.retryBaseMs;
  const delayMs = Number.isFinite(parsed.delayMs) ? parsed.delayMs : 0;
  const statusEveryRecipes = Number.isFinite(parsed.statusEveryRecipes) ? parsed.statusEveryRecipes : DEFAULTS.statusEveryRecipes;
  const statusEveryChunks = Number.isFinite(parsed.statusEveryChunks) ? parsed.statusEveryChunks : DEFAULTS.statusEveryChunks;
  const startChunk = Number.isFinite(parsed.startChunk) ? parsed.startChunk : DEFAULTS.startChunk;
  const requestHeaders = buildRequestHeaders(dataPrefix);

  const [metadata, index] = await Promise.all([
    fetchJsonWithRetry(`${dataPrefix}/metadata.json`, {
      maxRetries,
      retryBaseMs,
      delayMs,
      requestHeaders,
      nullOnStatus: new Set(),
    }),
    fetchJsonWithRetry(`${dataPrefix}/index.json`, {
      maxRetries,
      retryBaseMs,
      delayMs,
      requestHeaders,
      nullOnStatus: new Set(),
    }),
  ]);

  if (!index || typeof index !== 'object') {
    throw new Error(`Failed to load index.json from ${dataPrefix}`);
  }

  const metadataRecipeCount = Number(metadata?.recipeCount || 0) || undefined;
  const targetNew = getTargetNew(parsed, mode, metadataRecipeCount);
  const chunkIds = [...new Set(
    Object.keys(index)
      .filter(Boolean)
      .map((token) => getChunkId(token)),
  )].sort((a, b) => a - b);

  const filteredChunkIds = chunkIds.filter((chunkId) => {
    if (chunkId < startChunk) return false;
    if (Number.isFinite(parsed.endChunk) && chunkId > parsed.endChunk) return false;
    return true;
  });

  const resumeChunkIndex = getResumeChunkIndex(checkpointData, filteredChunkIds, startChunk);

  console.log('Starting recipe fetch');
  console.log('source=icgg');
  console.log(`mode=${mode}`);
  console.log(`dataPrefix=${dataPrefix}`);
  console.log(`chunks=${filteredChunkIds.length}, resumeChunkIndex=${resumeChunkIndex}`);
  console.log(`targetNew=${targetNew}, existingKeys=${baseExistingCount}, resumedOutput=${initialRecipeCount}`);
  console.log(`output=${output}`);
  console.log(`checkpoint=${checkpoint}`);

  let processedChunks = Number.isFinite(checkpointData?.processedChunks) ? checkpointData.processedChunks : 0;
  let processedRows = Number.isFinite(checkpointData?.processedRows) ? checkpointData.processedRows : 0;
  let missingElementRefs = Number.isFinite(checkpointData?.missingElementRefs) ? checkpointData.missingElementRefs : 0;
  let newRecipeCount = initialRecipeCount;
  let nextCheckpointAtRecipes = Math.floor(newRecipeCount / statusEveryRecipes) * statusEveryRecipes + statusEveryRecipes;

  for (let indexOffset = resumeChunkIndex; indexOffset < filteredChunkIds.length; indexOffset += 1) {
    if (newRecipeCount >= targetNew) break;

    const chunkId = filteredChunkIds[indexOffset];
    const chunkPayload = await fetchJsonWithRetry(`${dataPrefix}/chunks/chunk-${chunkId}.json`, {
      maxRetries,
      retryBaseMs,
      delayMs,
      requestHeaders,
      nullOnStatus: new Set([404]),
    });

    if (!chunkPayload || typeof chunkPayload !== 'object') {
      console.warn(`Skipping missing chunk ${chunkId}`);
      processedChunks += 1;
      await writeJsonAtomic(checkpoint, {
        nextChunkIndex: indexOffset + 1,
        currentChunk: chunkId,
        processedChunks,
        processedRows,
        missingElementRefs,
        uniqueRecipes: newRecipeCount,
        source: 'infinite-craft.gg',
        baseUrl: dataPrefix,
        updatedAtUtc: new Date().toISOString(),
      });
      continue;
    }

    processedChunks += 1;
    processedRows += Object.keys(chunkPayload).length;

    for (const [resultToken, encodedRecord] of Object.entries(chunkPayload)) {
      const resultEntry = index[resultToken];
      if (!resultEntry) {
        missingElementRefs += 1;
        continue;
      }

      const recipeRecord = createRecipeRecord(resultEntry, resultToken);
      if (!recipeRecord) continue;

      const parsedRecord = parseChunkRecord(encodedRecord);
      const sourcePairs = [...parsedRecord.from, ...parsedRecord.hiddenFrom];

      for (const [leftToken, rightToken] of sourcePairs) {
        const leftEntry = index[leftToken];
        const rightEntry = index[rightToken];
        if (!leftEntry || !rightEntry) {
          missingElementRefs += 1;
          continue;
        }

        const leftName = String(leftEntry[1] || '').trim();
        const rightName = String(rightEntry[1] || '').trim();
        const key = pairKey(leftName, rightName);
        if (!key) continue;
        if (existingKeys.has(key)) continue;
        if (!addRecipe(newRecipes, key, recipeRecord)) continue;

        newRecipeCount += 1;
        if (newRecipeCount % statusEveryRecipes === 0) {
          console.log(`Collected new recipes: ${newRecipeCount}`);
        }
        if (newRecipeCount >= targetNew) break;
      }

      if (newRecipeCount >= targetNew) break;
    }

    if (processedChunks % statusEveryChunks === 0) {
      console.log(`Progress: processedChunks=${processedChunks}, processedRows=${processedRows}, newRecipes=${newRecipeCount}`);
    }

    if (newRecipeCount >= nextCheckpointAtRecipes || processedChunks % statusEveryChunks === 0) {
      const outputDoc = buildOutputDocument({
        recipes: newRecipes,
        scannedElements: Math.max(Object.keys(index).length - 1, 0),
        processedChunks,
        processedRows,
        targetNew,
        baseExistingCount,
        mode,
        source: 'infinite-craft.gg',
        metadataRecipeCount,
      });
      await writeJsonAtomic(output, outputDoc);
      await writeJsonAtomic(checkpoint, {
        nextChunkIndex: indexOffset + 1,
        currentChunk: chunkId,
        processedChunks,
        processedRows,
        missingElementRefs,
        uniqueRecipes: newRecipeCount,
        metadataRecipeCount,
        source: 'infinite-craft.gg',
        baseUrl: dataPrefix,
        updatedAtUtc: new Date().toISOString(),
      });
      while (newRecipeCount >= nextCheckpointAtRecipes) {
        nextCheckpointAtRecipes += statusEveryRecipes;
      }
    }
  }

  const outputDoc = buildOutputDocument({
    recipes: newRecipes,
    scannedElements: Math.max(Object.keys(index).length - 1, 0),
    processedChunks,
    processedRows,
    targetNew,
    baseExistingCount,
    mode,
    source: 'infinite-craft.gg',
    metadataRecipeCount,
  });

  await writeJsonAtomic(output, outputDoc);
  await writeJsonAtomic(checkpoint, {
    nextChunkIndex: filteredChunkIds.length,
    currentChunk: filteredChunkIds[filteredChunkIds.length - 1] ?? null,
    processedChunks,
    processedRows,
    missingElementRefs,
    uniqueRecipes: newRecipeCount,
    metadataRecipeCount,
    source: 'infinite-craft.gg',
    baseUrl: dataPrefix,
    completed: newRecipeCount >= targetNew || resumeChunkIndex >= filteredChunkIds.length,
    completedAt: new Date().toISOString(),
    updatedAtUtc: new Date().toISOString(),
  });

  console.log('Done.');
  console.log(`Wrote ${newRecipeCount} recipes to ${output}`);
  console.log(`Existing keys skipped: ${baseExistingCount}`);
  console.log(`Processed chunks: ${processedChunks}`);
}

async function runInfinibrowserImport(context) {
  const {
    parsed,
    mode,
    output,
    checkpoint,
    checkpointData,
    existingKeys,
    baseExistingCount,
    newRecipes,
    initialRecipeCount,
  } = context;

  const apiBase = parsed.apiBase || DEFAULTS.apiBase;
  const startId = Number.isFinite(parsed.startId) ? parsed.startId : DEFAULTS.startId;
  const endId = Number.isFinite(parsed.endId) ? parsed.endId : DEFAULTS.endId;
  const targetNew = getTargetNew(parsed, mode, mode === 'full' ? 3470353 : undefined);
  const delayMs = Number.isFinite(parsed.delayMs) ? parsed.delayMs : DEFAULTS.delayMs;
  const maxRetries = Number.isFinite(parsed.maxRetries) ? parsed.maxRetries : DEFAULTS.maxRetries;
  const retryBaseMs = Number.isFinite(parsed.retryBaseMs) ? parsed.retryBaseMs : DEFAULTS.retryBaseMs;
  const statusEveryIds = Number.isFinite(parsed.statusEveryIds) ? parsed.statusEveryIds : DEFAULTS.statusEveryIds;
  const statusEveryRecipes = Number.isFinite(parsed.statusEveryRecipes) ? parsed.statusEveryRecipes : DEFAULTS.statusEveryRecipes;
  const maxPagesPerItem = Number.isFinite(parsed.maxPagesPerItem) ? parsed.maxPagesPerItem : DEFAULTS.maxPagesPerItem;
  const itemMaxRetries = Number.isFinite(parsed.itemMaxRetries) ? parsed.itemMaxRetries : DEFAULTS.itemMaxRetries;
  const requestHeaders = buildRequestHeaders(apiBase);

  const resumeId = Number.isFinite(checkpointData?.nextId) ? checkpointData.nextId : startId;

  console.log('Starting recipe fetch');
  console.log('source=infinibrowser');
  console.log(`mode=${mode}`);
  console.log(`startId=${resumeId}, endId=${endId}`);
  console.log(`targetNew=${targetNew}, existingKeys=${baseExistingCount}, resumedOutput=${initialRecipeCount}`);
  console.log(`output=${output}`);
  console.log(`checkpoint=${checkpoint}`);
  console.log(`itemMaxRetries=${itemMaxRetries}`);

  let scannedElements = Number.isFinite(checkpointData?.scannedElements) ? checkpointData.scannedElements : 0;
  let scannedPages = Number.isFinite(checkpointData?.scannedPages) ? checkpointData.scannedPages : 0;
  let scannedIds = Number.isFinite(checkpointData?.scannedIds) ? checkpointData.scannedIds : 0;
  let newRecipeCount = initialRecipeCount;
  let nextCheckpointAtRecipes = Math.floor(newRecipeCount / statusEveryRecipes) * statusEveryRecipes + statusEveryRecipes;

  for (let id = resumeId; id <= endId; id += 1) {
    if (newRecipeCount >= targetNew) break;

    scannedIds += 1;
    let item = null;

    try {
      item = await fetchJsonWithRetry(`${apiBase}/item?id=${encodeURIComponent(id)}`, {
        maxRetries: itemMaxRetries,
        retryBaseMs,
        delayMs,
        requestHeaders,
      });
    } catch (error) {
      console.warn(`Skipping item id=${id} after repeated failures: ${error?.message || error}`);
      await writeJsonAtomic(checkpoint, {
        nextId: id + 1,
        scannedIds,
        scannedElements,
        scannedPages,
        newRecipes: newRecipeCount,
        skippedId: id,
        source: 'infinibrowser.wiki',
        updatedAt: new Date().toISOString(),
      });
      continue;
    }

    if (!item || typeof item !== 'object') {
      await writeJsonAtomic(checkpoint, {
        nextId: id + 1,
        scannedIds,
        scannedElements,
        scannedPages,
        newRecipes: newRecipeCount,
        skippedId: id,
        source: 'infinibrowser.wiki',
        updatedAt: new Date().toISOString(),
      });
      if (scannedIds % statusEveryIds === 0) {
        console.log(`id=${id}: no item (new=${newRecipeCount})`);
      }
      continue;
    }

    const itemName = String(item.text || item.id || '').trim();
    if (!itemName) continue;
    scannedElements += 1;

    let offset = 0;
    let pageCount = 0;

    while (newRecipeCount < targetNew) {
      if (pageCount >= maxPagesPerItem) {
        console.warn(`Reached max pages (${maxPagesPerItem}) for item ${itemName}; moving on.`);
        break;
      }

      let usesPayload = null;
      try {
        usesPayload = await fetchJsonWithRetry(
          `${apiBase}/uses?id=${encodeURIComponent(itemName)}&offset=${offset}`,
          { maxRetries, retryBaseMs, delayMs, requestHeaders },
        );
      } catch (error) {
        console.warn(`Skipping uses page for ${itemName} at offset ${offset}: ${error?.message || error}`);
        break;
      }

      scannedPages += 1;
      pageCount += 1;

      const uses = Array.isArray(usesPayload?.uses) ? usesPayload.uses : [];
      if (!uses.length) break;

      for (const entry of uses) {
        const pairName = String(entry?.pair?.id || '').trim();
        const resultName = String(entry?.result?.id || '').trim();
        const resultEmoji = String(entry?.result?.emoji || '✨').trim() || '✨';

        const key = pairKey(itemName, pairName);
        if (!key || !resultName) continue;
        if (existingKeys.has(key)) continue;
        if (!addRecipe(newRecipes, key, { emoji: resultEmoji, id: 0, name: resultName })) continue;

        newRecipeCount += 1;
        if (newRecipeCount % statusEveryRecipes === 0) {
          console.log(`Collected new recipes: ${newRecipeCount}`);
        }
        if (newRecipeCount >= targetNew) break;
      }

      offset += uses.length;
      const total = Number(usesPayload?.total || 0);
      if (!total || offset >= total) break;

      if (newRecipeCount >= nextCheckpointAtRecipes) {
        const outputDoc = buildOutputDocument({
          recipes: newRecipes,
          scannedElements,
          scannedPages,
          targetNew,
          baseExistingCount,
          mode,
          source: mode === 'full' ? 'infinibrowser_full_scan' : 'infinibrowser_chunk_scan',
        });
        await writeJsonAtomic(output, outputDoc);
        await writeJsonAtomic(checkpoint, {
          nextId: id,
          scannedIds,
          scannedElements,
          scannedPages,
          newRecipes: newRecipeCount,
          source: 'infinibrowser.wiki',
          updatedAt: new Date().toISOString(),
        });
        while (newRecipeCount >= nextCheckpointAtRecipes) {
          nextCheckpointAtRecipes += statusEveryRecipes;
        }
      }
    }

    if (scannedIds % statusEveryIds === 0) {
      console.log(`Progress: scannedIds=${scannedIds}, scannedElements=${scannedElements}, newRecipes=${newRecipeCount}`);
    }

    await writeJsonAtomic(checkpoint, {
      nextId: id + 1,
      scannedIds,
      scannedElements,
      scannedPages,
      newRecipes: newRecipeCount,
      source: 'infinibrowser.wiki',
      updatedAt: new Date().toISOString(),
    });
  }

  const outputDoc = buildOutputDocument({
    recipes: newRecipes,
    scannedElements,
    scannedPages,
    targetNew,
    baseExistingCount,
    mode,
    source: mode === 'full' ? 'infinibrowser_full_scan' : 'infinibrowser_chunk_scan',
  });

  await writeJsonAtomic(output, outputDoc);
  await writeJsonAtomic(checkpoint, {
    nextId: endId + 1,
    scannedIds,
    scannedElements,
    scannedPages,
    newRecipes: newRecipeCount,
    completed: newRecipeCount >= targetNew,
    source: 'infinibrowser.wiki',
    completedAt: new Date().toISOString(),
  });

  console.log('Done.');
  console.log(`Wrote ${newRecipeCount} recipes to ${output}`);
  console.log(`Existing keys skipped: ${baseExistingCount}`);
}

async function main() {
  if (typeof fetch !== 'function') {
    throw new Error('This script needs Node.js 18+ (global fetch is required).');
  }

  const parsed = parseArgs(process.argv.slice(2));
  if (parsed.help) {
    printUsage();
    return;
  }

  const source = parsed.source || DEFAULTS.source;
  const mode = parsed.mode || DEFAULTS.mode;
  const output = parsed.output || DEFAULTS.output;
  const checkpoint = parsed.checkpoint || DEFAULTS.checkpoint;

  const checkpointData = await readJsonIfExists(checkpoint);
  const existingFiles = [...new Set(parsed.existing || [])];
  const existingKeys = await loadExistingKeys(existingFiles);
  const baseExistingCount = existingKeys.size;
  const { recipes: newRecipes, count: initialRecipeCount } = await loadOutputRecipes(output);

  const context = {
    parsed,
    source,
    mode,
    output,
    checkpoint,
    checkpointData,
    existingKeys,
    baseExistingCount,
    newRecipes,
    initialRecipeCount,
  };

  if (source === 'icgg') {
    await runIcggImport(context);
    return;
  }

  if (source === 'infinibrowser') {
    await runInfinibrowserImport(context);
    return;
  }

  throw new Error(`Unsupported source "${source}". Expected "icgg" or "infinibrowser".`);
}

main().catch((error) => {
  console.error(error?.stack || String(error));
  process.exitCode = 1;
});
