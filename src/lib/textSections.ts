import fs from "node:fs";
import path from "node:path";

export type TextSections = Record<string, string[]>;

export function getTextSections(): TextSections {
  const markdown = fs.readFileSync(path.join(process.cwd(), "content", "muha-texts.md"), "utf8");
  const sections: TextSections = {};
  let current = "main";

  for (const rawLine of markdown.split(/\r?\n/)) {
    const line = rawLine.trim();
    const heading = line.match(/^#([a-z-]+)$/i);

    if (heading) {
      current = heading[1];
      sections[current] = [];
      continue;
    }

    if (line.length > 0) {
      sections[current] ??= [];
      sections[current].push(line);
    }
  }

  return sections;
}
