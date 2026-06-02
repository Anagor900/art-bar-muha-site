import fs from "fs";
import path from "path";
import gallery from "../../content/gallery.json";

export type PaintingOrientation = "landscape" | "portrait" | "square" | "unknown";

export type ExhibitionPainting = {
  id: string;
  title: string;
  artist: string;
  technique: string;
  description: string;
  imageSrc: string | null;
  orientation: PaintingOrientation;
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

type GalleryFile = {
  id: string;
  name: string;
  src: string;
  orientation: PaintingOrientation;
};

type ParsedPainting = {
  id: string;
  title: string;
  artist: string;
  technique: string;
  description: string;
  imageSrc: string | null;
  orientation: PaintingOrientation;
  contactLabel: string;
};

const fallbackItems: ExhibitionPainting[] = [1, 2, 3, 4].map((index) => ({
  id: `painting-fallback-${index}`,
  title: `Картина ${index}`,
  artist: "Автор экспозиции",
  technique: "Живопись, смешанная техника",
  description: "Работа из текущей экспозиции арт-ресто-бара «МУХА».",
  imageSrc: null,
  orientation: "portrait",
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
  const parsed = content
    .split(/\r?\n/)
    .map((line, index) => parseLine(line, index + 1, galleryFiles))
    .filter((painting): painting is ParsedPainting => Boolean(painting));

  const seen = new Set(parsed.map((painting) => normalizeImageName(painting.id)));
  const imagesWithoutRows = galleryFiles
    .filter((file) => !seen.has(normalizeImageName(file.id)))
    .map((file) => makePaintingFromGalleryFile(file));

  return [...parsed, ...imagesWithoutRows];
}

function parseLine(line: string, lineNumber: number, galleryFiles: GalleryFile[]): ParsedPainting | null {
  const trimmed = line.trim();

  if (!trimmed || trimmed.startsWith("#")) {
    return null;
  }

  const match = /^(.+?)\s*\{\s*(.*?)\s*\}\s*$/.exec(trimmed);

  if (!match) {
    warnBadLine(lineNumber, "не удалось разобрать строку");
    return null;
  }

  const id = match[1].trim();
  const fields = parseFields(match[2]);
  const image = findImageForId(id, galleryFiles);

  if (!id) {
    warnBadLine(lineNumber, "не указан идентификатор изображения");
    return null;
  }

  return {
    id,
    title: cleanEndingPunctuation(fields["название"] ?? ""),
    artist: cleanEndingPunctuation(fields["автор"] ?? fields["художник"] ?? ""),
    technique: fields["техника"] ?? "",
    description: fields["описание"] ?? fields["описание_картины"] ?? "",
    imageSrc: image?.src ?? null,
    orientation: image?.orientation ?? "unknown",
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

function getGalleryFiles(): GalleryFile[] {
  try {
    return fs
      .readdirSync(GALLERY_PATH)
      .filter((file) => IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase()))
      .map((file) => {
        const fullPath = path.join(GALLERY_PATH, file);

        return {
          id: path.parse(file).name,
          name: file,
          src: `/gallery/${encodeURIComponent(file)}`,
          orientation: getImageOrientation(fullPath),
        };
      });
  } catch {
    return [];
  }
}

function findImageForId(id: string, files: GalleryFile[]): GalleryFile | null {
  const normalizedId = normalizeImageName(id);
  const match = files.find((file) => normalizeImageName(file.id) === normalizedId);

  return match ?? null;
}

function makePaintingFromGalleryFile(file: GalleryFile): ExhibitionPainting {
  return {
    id: file.id,
    title: "",
    artist: "",
    technique: "",
    description: "",
    imageSrc: file.src,
    orientation: file.orientation,
    contactLabel: CONTACT_LABEL,
  };
}

function normalizeImageName(value: string): string {
  return value
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(/[-_\s]+/g, " ")
    .replace(/\s+/g, " ");
}

function cleanEndingPunctuation(value: string): string {
  return value.trim().replace(/[\s.,:;!?…]+$/u, "");
}

function getImageOrientation(filePath: string): PaintingOrientation {
  const dimensions = getImageDimensions(filePath);

  if (!dimensions) {
    return "unknown";
  }

  if (dimensions.width === dimensions.height) {
    return "square";
  }

  return dimensions.width > dimensions.height ? "landscape" : "portrait";
}

function getImageDimensions(filePath: string): { width: number; height: number } | null {
  const buffer = fs.readFileSync(filePath);
  const ext = path.extname(filePath).toLowerCase();

  if (ext === ".png" && buffer.length >= 24) {
    return {
      width: buffer.readUInt32BE(16),
      height: buffer.readUInt32BE(20),
    };
  }

  if ((ext === ".jpg" || ext === ".jpeg") && buffer.length >= 4) {
    return getJpegDimensions(buffer);
  }

  return null;
}

function getJpegDimensions(buffer: Buffer): { width: number; height: number } | null {
  let offset = 2;

  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) {
      return null;
    }

    const marker = buffer[offset + 1];
    const length = buffer.readUInt16BE(offset + 2);
    const isStartOfFrame =
      (marker >= 0xc0 && marker <= 0xc3) ||
      (marker >= 0xc5 && marker <= 0xc7) ||
      (marker >= 0xc9 && marker <= 0xcb) ||
      (marker >= 0xcd && marker <= 0xcf);

    if (isStartOfFrame) {
      return {
        height: buffer.readUInt16BE(offset + 5),
        width: buffer.readUInt16BE(offset + 7),
      };
    }

    offset += 2 + length;
  }

  return null;
}

function warnBadLine(lineNumber: number, reason: string) {
  console.warn(`[exhibition-paintings.txt:${lineNumber}] ${reason}`);
}
