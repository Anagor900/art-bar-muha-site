import { mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cardsDir = path.join(rootDir, "public", "bar-cards");
const outFile = path.join(rootDir, "src", "generated", "bar-card-manifest.json");
const imageExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".svg"]);

async function readOptionalDirectory(dir) {
  try {
    return await readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }
}

const manifest = {};
const cardFolders = await readOptionalDirectory(cardsDir);

for (const entry of cardFolders) {
  if (entry.isFile() && imageExtensions.has(path.extname(entry.name).toLowerCase())) {
    const id = path.basename(entry.name, path.extname(entry.name));
    manifest[id] = [`/bar-cards/${entry.name}`];
    continue;
  }

  if (!entry.isDirectory()) {
    continue;
  }

  const files = await readdir(path.join(cardsDir, entry.name));
  manifest[entry.name] = files
    .filter((fileName) => imageExtensions.has(path.extname(fileName).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, "ru"))
    .map((fileName) => `/bar-cards/${entry.name}/${fileName}`);
}

await mkdir(path.dirname(outFile), { recursive: true });
await writeFile(outFile, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(`Generated ${path.relative(rootDir, outFile)}`);
