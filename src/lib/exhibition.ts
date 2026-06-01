import fs from "fs";
import path from "path";
import gallery from "../../content/gallery.json";

export type ExhibitionPainting = {
  id: string;
  title: string;
  artist: string;
  technique: string;
  description: string;
  imageSrc: string | null;
  contactLabel: string;
};

export type ExhibitionContent = {
  intro: string;
  delivery: string;
  items: ExhibitionPainting[];
};

const TXT_PATH = path.join(process.cwd(), "content", "exhibition-paintings.txt");
const GALLERY_PATH = path.join(process.cwd(), "public", "gallery");
const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);
const CONTACT_LABEL = "Связаться для приобретения";

const fallbackItems: ExhibitionPainting[] = [1, 2, 3, 4].map((index) => ({
  id: `painting-fallback-${index}`,
  title: `Картина ${index}`,
  artist: "Автор экспозиции",
  technique: "Живопись, смешанная техника",
  description: "Работа из текущей экспозиции арт-ресто-бара «МУХА».",
  imageSrc: null,
  contactLabel: CONTACT_LABEL,
}));

export function getExhibitionContent(): ExhibitionContent {
  const items = readPaintingsFromTxt();

  return {
    intro: gallery.intro,
    delivery: gallery.delivery,
    items: items.length > 0 ? items : fallbackItems,
  };
}

function readPaintingsFromTxt(): ExhibitionPainting[] {
  let content: string;

  try {
    content = fs.readFileSync(TXT_PATH, "utf8");
  } catch {
    return [];
  }

  const galleryFiles = getGalleryFiles();

  return content
    .split(/\r?\n/)
    .map((line, index) => parseLine(line, index + 1, galleryFiles))
    .filter((painting): painting is ExhibitionPainting => Boolean(painting));
}

function parseLine(line: string, lineNumber: number, galleryFiles: string[]): ExhibitionPainting | null {
  const trimmed = line.trim();

  if (!trimmed || trimmed.startsWith("#")) {
    return null;
  }

  const match = /^(.+?)\s*\{\s*(.+?)\s*\}\s*$/.exec(trimmed);

  if (!match) {
    warnBadLine(lineNumber, "не удалось разобрать строку");
    return null;
  }

  const title = match[1].trim();
  const fields = parseFields(match[2]);
  const artist = fields["художник"];
  const technique = fields["техника"];
  const description = fields["описание_картины"];

  if (!title || !artist || !technique || !description) {
    warnBadLine(lineNumber, "не заполнены обязательные поля");
    return null;
  }

  return {
    id: makePaintingId(title, lineNumber),
    title,
    artist,
    technique,
    description,
    imageSrc: findImageForTitle(title, galleryFiles),
    contactLabel: CONTACT_LABEL,
  };
}

function parseFields(body: string): Record<string, string> {
  return body.split(";").reduce<Record<string, string>>((fields, segment) => {
    const match = /^\s*([^:]+):\s*(.*?)\s*$/.exec(segment);

    if (!match) {
      return fields;
    }

    fields[match[1].trim().toLowerCase()] = match[2].trim();
    return fields;
  }, {});
}

function getGalleryFiles(): string[] {
  try {
    return fs
      .readdirSync(GALLERY_PATH)
      .filter((file) => IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase()));
  } catch {
    return [];
  }
}

function findImageForTitle(title: string, files: string[]): string | null {
  const normalizedTitle = normalizeImageName(title);
  const match = files.find((file) => normalizeImageName(path.parse(file).name) === normalizedTitle);

  return match ? `/gallery/${encodeURIComponent(match)}` : null;
}

function normalizeImageName(value: string): string {
  return value
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(/[-_\s]+/g, " ")
    .replace(/\s+/g, " ");
}

function makePaintingId(title: string, lineNumber: number): string {
  const base = title
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");

  return `${base || "painting"}-${lineNumber}`;
}

function warnBadLine(lineNumber: number, reason: string) {
  console.warn(`[exhibition-paintings.txt:${lineNumber}] ${reason}`);
}
