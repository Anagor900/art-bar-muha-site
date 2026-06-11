import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { strFromU8, unzipSync } from "fflate";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = path.join(rootDir, "content", "banquet", "MUHA_Banquet_Menu.xlsx");
const outputPath = path.join(rootDir, "src", "generated", "banquet-menu.json");
const downloadHref = "/downloads/MUHA_Banquet_Menu.xlsx";
const downloadFileName = "banketnoe-menu-art-bar-muha.xlsx";

const extraLabels = ["Обслуживание", "Тарелка", "Стакан", "Фужер"];

const workbook = await readWorkbook(sourcePath);
const menu = parseBanquetMenu(workbook);

await writeFile(outputPath, `${JSON.stringify(menu, null, 2)}\n`, "utf8");
console.log(`Generated ${path.relative(rootDir, outputPath)}`);

async function readWorkbook(filePath) {
  const bytes = new Uint8Array(await readFile(filePath));
  const zip = unzipSync(bytes);
  const workbookXml = readZipText(zip, "xl/workbook.xml");
  const relsXml = readZipText(zip, "xl/_rels/workbook.xml.rels");
  const sharedStringsXml = readOptionalZipText(zip, "xl/sharedStrings.xml");
  const sheetPath = resolveFirstSheetPath(workbookXml, relsXml);
  const sheetXml = readZipText(zip, sheetPath);

  return {
    rows: parseSheetRows(sheetXml, parseSharedStrings(sharedStringsXml)),
  };
}

function parseBanquetMenu({ rows }) {
  const maxRow = Math.max(...rows.keys());
  const titleRow = findTitleRow(rows);
  const priceHeader = formatValue(getCell(rows, titleRow, "E"));
  const priceYear = priceHeader.match(/\d{4}/)?.[0] ?? "2026";
  const sections = [];
  let currentSection = null;

  for (let rowIndex = titleRow + 1; rowIndex <= maxRow; rowIndex += 1) {
    const name = formatValue(getCell(rows, rowIndex, "A"));

    if (!name) {
      continue;
    }

    let weight = formatValue(getCell(rows, rowIndex, "B"));
    const minimumCount = formatValue(getCell(rows, rowIndex, "C"));
    let minimumUnit = formatValue(getCell(rows, rowIndex, "D"));
    let price = formatPrice(getCell(rows, rowIndex, "E"));

    if (!price && !minimumCount && minimumUnit && looksNumeric(minimumUnit)) {
      price = formatPrice(minimumUnit);
      minimumUnit = "";
    }

    if (!price && !minimumCount && !minimumUnit && weight && looksNumeric(weight)) {
      price = formatPrice(weight);
      weight = "";
    }

    if (!weight && !minimumCount && !minimumUnit && !price) {
      currentSection = {
        title: name,
        items: [],
      };
      sections.push(currentSection);
      continue;
    }

    if (!currentSection) {
      currentSection = {
        title: "Банкетное меню",
        items: [],
      };
      sections.push(currentSection);
    }

    currentSection.items.push({
      name,
      weight,
      minimum: [minimumCount, minimumUnit].filter(Boolean).join(" "),
      price,
    });
  }

  return {
    title: "Банкетное меню",
    subtitle: "Арт-Ресто-Бар «МУХА»",
    sourceFile: downloadHref,
    downloadFileName,
    priceYear,
    columns: {
      name: "Блюдо",
      weight: "Вес",
      minimum: "Минимум",
      price: `Цена ${priceYear}`,
    },
    sections: sections.filter((section) => section.items.length > 0),
    extras: parseExtras(rows, maxRow),
  };
}

function parseExtras(rows, maxRow) {
  const extras = [];

  for (let rowIndex = 1; rowIndex <= maxRow; rowIndex += 1) {
    const rawLabel = formatValue(getCell(rows, rowIndex, "E"));

    if (!rawLabel) {
      continue;
    }

    const label = extraLabels.find((expected) => rawLabel.toLowerCase().startsWith(expected.toLowerCase()));

    if (!label) {
      continue;
    }

    const rawValue = getCell(rows, rowIndex, "F");
    const value = formatExtraValue(label, rawLabel, rawValue);

    if (value) {
      extras.push({ label, value });
    }
  }

  return extras;
}

function formatExtraValue(label, rawLabel, rawValue) {
  if (rawValue === null || rawValue === undefined || rawValue === "") {
    return "";
  }

  if (label === "Обслуживание" && typeof rawValue === "number" && rawValue > 0 && rawValue < 1) {
    return `${formatNumber(rawValue * 100)}%`;
  }

  if (rawLabel.includes("₽/шт")) {
    return `${formatNumber(rawValue)} ₽/шт`;
  }

  return formatValue(rawValue);
}

function findTitleRow(rows) {
  for (const [rowIndex, cells] of rows) {
    if (Object.values(cells).some((value) => formatValue(value).toUpperCase().includes("БАНКЕТНОЕ МЕНЮ"))) {
      return rowIndex;
    }
  }

  throw new Error("Cannot find banquet menu title row");
}

function resolveFirstSheetPath(workbookXml, relsXml) {
  const sheetMatch = workbookXml.match(/<sheet\b[^>]*\br:id="([^"]+)"/);

  if (!sheetMatch) {
    return "xl/worksheets/sheet1.xml";
  }

  const relationshipId = sheetMatch[1];
  const relRegex = new RegExp(`<Relationship\\b[^>]*\\bId="${escapeRegExp(relationshipId)}"[^>]*\\bTarget="([^"]+)"`);
  const relMatch = relsXml.match(relRegex);
  const target = relMatch?.[1] ?? "worksheets/sheet1.xml";

  return target.startsWith("/") ? target.slice(1) : path.posix.join("xl", target);
}

function parseSharedStrings(xml) {
  if (!xml) {
    return [];
  }

  return [...xml.matchAll(/<si\b[^>]*>([\s\S]*?)<\/si>/g)].map((match) => extractText(match[1]));
}

function parseSheetRows(xml, sharedStrings) {
  const rows = new Map();

  for (const rowMatch of xml.matchAll(/<row\b[^>]*>([\s\S]*?)<\/row>/g)) {
    const rowXml = rowMatch[1].replace(/<c\b[^>]*\/>/g, "");

    for (const cellMatch of rowXml.matchAll(/<c\b([^>]*)>([\s\S]*?)<\/c>/g)) {
      const attrs = cellMatch[1];
      const inner = cellMatch[2];
      const reference = getAttribute(attrs, "r");

      if (!reference) {
        continue;
      }

      const { column, row } = splitCellReference(reference);
      const type = getAttribute(attrs, "t");
      const value = parseCellValue(inner, type, sharedStrings);

      if (value === null || value === undefined || value === "") {
        continue;
      }

      const cells = rows.get(row) ?? {};
      cells[column] = value;
      rows.set(row, cells);
    }
  }

  return rows;
}

function parseCellValue(inner, type, sharedStrings) {
  if (type === "inlineStr") {
    return extractText(inner);
  }

  const valueMatch = inner.match(/<v>([\s\S]*?)<\/v>/);

  if (!valueMatch) {
    return "";
  }

  const rawValue = decodeXml(valueMatch[1]);

  if (type === "s") {
    return sharedStrings[Number(rawValue)] ?? "";
  }

  if (/^-?\d+(?:\.\d+)?$/.test(rawValue)) {
    return Number(rawValue);
  }

  return rawValue;
}

function extractText(xml) {
  return [...xml.matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/g)].map((match) => decodeXml(match[1])).join("");
}

function getCell(rows, row, column) {
  return rows.get(row)?.[column] ?? "";
}

function formatValue(value) {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "number") {
    return formatNumber(value);
  }

  return String(value).replace(/\s+/g, " ").trim();
}

function formatPrice(value) {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  return `${formatNumber(value)} ₽`;
}

function formatNumber(value) {
  if (typeof value !== "number") {
    return formatValue(value);
  }

  const rounded = Number.isInteger(value) ? String(value) : String(Number(value.toFixed(2))).replace(".", ",");

  return rounded.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function looksNumeric(value) {
  return /^-?\d+(?:[\s,.]\d+)?$/.test(String(value).replace(/\s/g, ""));
}

function splitCellReference(reference) {
  const match = reference.match(/^([A-Z]+)(\d+)$/);

  if (!match) {
    throw new Error(`Unsupported cell reference: ${reference}`);
  }

  return {
    column: match[1],
    row: Number(match[2]),
  };
}

function getAttribute(source, name) {
  return source.match(new RegExp(`(?:^|\\s)${name}="([^"]*)"`))?.[1] ?? "";
}

function readZipText(zip, filePath) {
  const bytes = zip[filePath];

  if (!bytes) {
    throw new Error(`Missing ${filePath} in workbook`);
  }

  return strFromU8(bytes);
}

function readOptionalZipText(zip, filePath) {
  const bytes = zip[filePath];

  return bytes ? strFromU8(bytes) : "";
}

function decodeXml(value) {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
