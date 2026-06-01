import { mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cardsDir = path.join(rootDir, "public", "bar-cards");
const outFile = path.join(rootDir, "src", "generated", "bar-card-manifest.json");
const imageExtensions = new Set([".webp", ".jpg", ".jpeg", ".png", ".avif"]);
const collator = new Intl.Collator("ru", { numeric: true, sensitivity: "base" });

function sortByName(a, b) {
  return collator.compare(a, b);
}

async function readOptionalDirectory(dir) {
  try {
    return await readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }
}

const manifest = {
  cardBack: null,
  cards: {},
};
const cardEntries = (await readOptionalDirectory(cardsDir)).sort((a, b) => sortByName(a.name, b.name));

for (const entry of cardEntries) {
  const extension = path.extname(entry.name).toLowerCase();
  const id = path.basename(entry.name, extension);

  if (entry.isFile() && imageExtensions.has(extension)) {
    if (id === "back") {
      manifest.cardBack = `/bar-cards/${entry.name}`;
      continue;
    }

    if (id.startsWith("cocktail-")) {
      manifest.cards[id] = [`/bar-cards/${entry.name}`];
    }

    continue;
  }

  if (!entry.isDirectory() || entry.name === "back") {
    continue;
  }

  const files = await readdir(path.join(cardsDir, entry.name));
  const images = files
    .filter((fileName) => imageExtensions.has(path.extname(fileName).toLowerCase()))
    .sort(sortByName)
    .map((fileName) => `/bar-cards/${entry.name}/${fileName}`);

  if (images.length > 0) {
    manifest.cards[entry.name] = images;
  }
}

await mkdir(path.dirname(outFile), { recursive: true });
await writeFile(outFile, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(`Generated ${path.relative(rootDir, outFile)}`);
