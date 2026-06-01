from __future__ import annotations

import argparse
import io
import json
import re
import shutil
import sys
import unicodedata
import zipfile
from pathlib import Path

try:
    import fitz
    from PIL import Image, ImageChops
except ImportError as error:
    missing = error.name or "pymupdf/pillow"
    print(
        f"Missing Python dependency: {missing}. Install with: python -m pip install --user pymupdf pillow",
        file=sys.stderr,
    )
    raise SystemExit(1) from error


ROOT_DIR = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT_DIR / "site_sources" / "user_provided" / "bar-cards-source"
EXTRACTED_DIR = SOURCE_DIR / "extracted"
PUBLIC_DIR = ROOT_DIR / "public" / "bar-cards"
CONTENT_FILE = ROOT_DIR / "content" / "bar-cards.json"
MAX_SIZE = (1000, 1600)
WEBP_QUALITY = 84
RENDER_DPI = 220
IMAGE_EXTENSIONS = {".webp", ".jpg", ".jpeg", ".png", ".avif"}
ACCENTS = ["#8f2432", "#2e6f68", "#6d4f82", "#ae7d3d"]
BACK_FILE_NAME = "back.webp"


def normalize_text(value: str) -> str:
    normalized = unicodedata.normalize("NFKC", value).casefold().replace("ё", "е")
    normalized = re.sub(r"[-_\s]+", " ", normalized).strip()
    return normalized


def natural_key(value: Path | str) -> list[str | int]:
    text = normalize_text(str(value).replace("\\", "/"))
    return [int(part) if part.isdigit() else part for part in re.split(r"(\d+)", text)]


def is_card_back_pdf(path: Path) -> bool:
    return "рубашка" in normalize_text(path.stem).split()


def ensure_inside(path: Path, parent: Path) -> Path:
    resolved = path.resolve()
    resolved_parent = parent.resolve()

    if resolved != resolved_parent and resolved_parent not in resolved.parents:
        raise RuntimeError(f"Refusing to touch path outside {resolved_parent}: {resolved}")

    return resolved


def clean_directory(path: Path, parent: Path) -> None:
    resolved = ensure_inside(path, parent)

    if resolved.exists():
        shutil.rmtree(resolved)

    resolved.mkdir(parents=True, exist_ok=True)


def copy_archive(archive_path: Path) -> Path:
    SOURCE_DIR.mkdir(parents=True, exist_ok=True)
    destination = SOURCE_DIR / archive_path.name
    shutil.copy2(archive_path, destination)
    return destination


def extract_archive(archive_path: Path) -> None:
    clean_directory(EXTRACTED_DIR, SOURCE_DIR)

    with zipfile.ZipFile(archive_path) as archive:
        for member in archive.infolist():
            target = (EXTRACTED_DIR / member.filename).resolve()

            if EXTRACTED_DIR.resolve() != target and EXTRACTED_DIR.resolve() not in target.parents:
                raise RuntimeError(f"Unsafe zip entry: {member.filename}")

        archive.extractall(EXTRACTED_DIR)


def find_pdfs() -> list[Path]:
    return sorted(EXTRACTED_DIR.rglob("*.pdf"), key=natural_key)


def crop_near_white_margin(image: Image.Image) -> Image.Image:
    rgb = image.convert("RGB")
    white = Image.new("RGB", rgb.size, (255, 255, 255))
    diff = ImageChops.difference(rgb, white).convert("L")
    mask = diff.point(lambda value: 255 if value > 14 else 0)
    bbox = mask.getbbox()

    if not bbox:
        return image

    left, top, right, bottom = bbox
    pad = max(2, int(min(image.size) * 0.0015))
    box = (
        max(0, left - pad),
        max(0, top - pad),
        min(image.width, right + pad),
        min(image.height, bottom + pad),
    )
    original_area = image.width * image.height
    cropped_area = (box[2] - box[0]) * (box[3] - box[1])

    if cropped_area < original_area * 0.35:
        return image

    if original_area - cropped_area < original_area * 0.005:
        return image

    return image.crop(box)


def clean_public_cards() -> None:
    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)

    for file_path in PUBLIC_DIR.iterdir():
        if not file_path.is_file() or file_path.suffix.lower() not in IMAGE_EXTENSIONS:
            continue

        if file_path.stem.startswith("cocktail-") or file_path.name == BACK_FILE_NAME:
            file_path.unlink()


def render_pdf_page(page: fitz.Page) -> Image.Image:
    scale = RENDER_DPI / 72
    pixmap = page.get_pixmap(matrix=fitz.Matrix(scale, scale), alpha=False)
    image = Image.open(io.BytesIO(pixmap.tobytes("png"))).convert("RGB")
    image = crop_near_white_margin(image)
    image.thumbnail(MAX_SIZE, Image.Resampling.LANCZOS)
    return image


def render_back(pdf_path: Path) -> bool:
    with fitz.open(pdf_path) as document:
        if document.page_count == 0:
            return False

        image = render_pdf_page(document.load_page(0))
        image.save(PUBLIC_DIR / BACK_FILE_NAME, "WEBP", quality=WEBP_QUALITY, method=6)
        return True


def render_cards(pdfs: list[Path]) -> tuple[list[dict[str, object]], bool]:
    clean_public_cards()
    back_pdf = next((pdf for pdf in pdfs if is_card_back_pdf(pdf)), None)
    front_pdfs = [pdf for pdf in pdfs if pdf != back_pdf]
    cards: list[dict[str, object]] = []
    card_number = 0
    back_created = render_back(back_pdf) if back_pdf else False

    for pdf_path in front_pdfs:
        with fitz.open(pdf_path) as document:
            for page_index in range(document.page_count):
                card_number += 1
                card_id = f"cocktail-{card_number:02d}"
                file_name = f"{card_id}.webp"
                image = render_pdf_page(document.load_page(page_index))
                image.save(PUBLIC_DIR / file_name, "WEBP", quality=WEBP_QUALITY, method=6)
                cards.append(
                    {
                        "id": card_id,
                        "title": f"Коктейль {card_number}",
                        "subtitle": "Карточка коктейля",
                        "image": file_name,
                        "description": "Карточка коктейля из барной карты Арт-Ресто-Бара «МУХА».",
                        "notes": ["коктейльная карта"],
                        "accent": ACCENTS[(card_number - 1) % len(ACCENTS)],
                    }
                )

    return cards, back_created


def write_content(cards: list[dict[str, object]]) -> None:
    CONTENT_FILE.write_text(json.dumps(cards, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description="Import cocktail card PDFs into public/bar-cards.")
    parser.add_argument("archive", help="Path to the zip archive with PDF cards.")
    args = parser.parse_args()

    archive_path = Path(args.archive).expanduser().resolve()

    if not archive_path.exists():
        raise SystemExit(f"Archive not found: {archive_path}")

    stored_archive = copy_archive(archive_path)
    extract_archive(stored_archive)
    pdfs = find_pdfs()

    if not pdfs:
        raise SystemExit(f"No PDF files found in {stored_archive}")

    cards, back_created = render_cards(pdfs)
    write_content(cards)

    print(f"Archive stored: {stored_archive.relative_to(ROOT_DIR)}")
    print(f"Extracted to: {EXTRACTED_DIR.relative_to(ROOT_DIR)}")
    print(f"PDF files found: {len(pdfs)}")
    print(f"Card back created: {'yes' if back_created else 'no'}")
    print(f"Cocktail cards created: {len(cards)}")
    print(f"Output directory: {PUBLIC_DIR.relative_to(ROOT_DIR)}")
    print(f"Content updated: {CONTENT_FILE.relative_to(ROOT_DIR)}")


if __name__ == "__main__":
    main()
