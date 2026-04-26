#!/usr/bin/env node

import { promises as fs } from 'node:fs';
import path from 'node:path';

function parseArgs(argv) {
  const args = {
    input: [],
    chunks: 4,
    outDir: 'data/infinite-craft-recipes',
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;
    const eqIdx = token.indexOf('=');
    const key = eqIdx >= 0 ? token.slice(2, eqIdx) : token.slice(2);
    const value = eqIdx >= 0 ? token.slice(eqIdx + 1) : argv[i + 1];
    const consumeNext = eqIdx < 0;

    switch (key) {
      case 'input':
        args.input.push(value);
        if (consumeNext) i += 1;
        break;
      case 'chunks':
        args.chunks = Number(value);
        if (consumeNext) i += 1;
        break;
      case 'out-dir':
        args.outDir = value;
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

function printUsage() {
  console.log([
    'Usage:',
    '  node scripts/split-infinite-craft-recipes.mjs [options]',
    '',
    'Options:',
    '  --input <path>            Recipe JSON input file (repeatable)',
    '  --chunks <n>              Number of output chunks (default: 4)',
    '  --out-dir <path>          Output directory (default: data/infinite-craft-recipes)',
    '  --help                    Show help',
    '',
    'Example:',
    '  node scripts/split-infinite-craft-recipes.mjs --input utils/single-player/infinite-craft-clone/data/wiki-recipes-lite.json --input data/wiki-recipes-part-2.json --chunks 4 --out-dir data/infinite-craft-recipes',
  ].join('\n'));
}

async function readRecipeFile(filePath) {
  const raw = await fs.readFile(filePath, 'utf8');
  const payload = JSON.parse(raw);
  const recipes = payload?.recipes;
  if (!recipes || typeof recipes !== 'object') {
    throw new Error(`File does not contain a recipes object: ${filePath}`);
  }
  return recipes;
}

async function writeJsonAtomic(filePath, data) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const tempPath = `${filePath}.tmp`;
  await fs.writeFile(tempPath, `${JSON.stringify(data)}\n`, 'utf8');
  await fs.rename(tempPath, filePath);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.input.length) {
    printUsage();
    return;
  }
  if (!Number.isInteger(args.chunks) || args.chunks <= 0) {
    throw new Error(`--chunks must be a positive integer. Received: ${args.chunks}`);
  }

  const merged = new Map();
  for (const inputPath of args.input) {
    const recipes = await readRecipeFile(inputPath);
    let added = 0;
    for (const [key, value] of Object.entries(recipes)) {
      if (!key || !value || typeof value !== 'object') continue;
      if (merged.has(key)) continue;
      merged.set(key, value);
      added += 1;
    }
    console.log(`Loaded ${Object.keys(recipes).length} from ${inputPath}; added ${added} unique keys`);
  }

  const entries = [...merged.entries()];
  const chunkSize = Math.ceil(entries.length / args.chunks);
  const manifest = {
    version: 1,
    recipeCount: entries.length,
    chunkCount: args.chunks,
    generatedAt: new Date().toISOString(),
    chunks: [],
    inputs: args.input,
  };

  for (let chunkIndex = 0; chunkIndex < args.chunks; chunkIndex += 1) {
    const start = chunkIndex * chunkSize;
    const end = Math.min(start + chunkSize, entries.length);
    const chunkEntries = entries.slice(start, end);
    const recipes = Object.fromEntries(chunkEntries);
    const filename = `chunk-${chunkIndex + 1}.json`;
    const outputPath = path.join(args.outDir, filename);
    const payload = {
      version: 2,
      recipeCount: chunkEntries.length,
      startIndex: start,
      endIndexExclusive: end,
      generatedAt: manifest.generatedAt,
      recipes,
    };
    await writeJsonAtomic(outputPath, payload);
    const stat = await fs.stat(outputPath);
    manifest.chunks.push({
      file: filename,
      recipeCount: chunkEntries.length,
      bytes: stat.size,
    });
    console.log(`Wrote ${chunkEntries.length} recipes to ${outputPath} (${stat.size} bytes)`);
  }

  await writeJsonAtomic(path.join(args.outDir, 'manifest.json'), manifest);
  console.log(`Done. Wrote ${entries.length} merged recipes across ${args.chunks} chunks.`);
}

main().catch((error) => {
  console.error(error?.stack || String(error));
  process.exitCode = 1;
});
