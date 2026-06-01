# Арт-Ресто-Бар «МУХА»

Отдельный Next.js-проект для сайта Арт-Ресто-Бара «МУХА» у Летнего сада. Первая версия собрана без реальных изображений, внешних картинок, форм и Google Drive-загрузок: визуальные зоны работают через CSS/HTML-заглушки, а будущие файлы подключаются через `public/` и `content/`.

## Команды

```bash
npm run dev
npm run bar-card:manifest
npm run lint
npm run typecheck
npm run test
npm run build
```

`prebuild` автоматически запускает `scripts/generate-bar-card-manifest.mjs`.

## Где менять контент

- Основные тексты: `content/muha-texts.md`
- Телефоны, почта, VK, Telegram, MAX и карта: `content/contacts.json`
- SEO, тестовый домен и будущая hero-картинка: `content/site-meta.json`
- Проектные ссылки под hero: `content/projects.json`
- Страницы карусели меню: `content/menu.json`
- Афиша месяца: `content/afisha.json`
- Выставка-продажа картин: `content/gallery.json`
- Барные карточки коктейлей: `content/bar-cards.json`
- Услуги: `content/services.json`
- Документы-заглушки: `content/downloads.json`

## Будущие изображения и файлы

- Hero image: подготовленный файл хранится в `public/hero/muha-hero.webp`; путь задаётся в `heroImage` внутри `content/site-meta.json`.
- Страницы меню: положить изображения в `public/menu/`, например `public/menu/menu-01.jpg`.
- Афиша месяца: положить файл в `public/afisha-current.jpg`; путь редактируется в `content/afisha.json`.
- Коктейльные карточки: положить изображения в `public/bar-cards/`, например `public/bar-cards/cocktail-01.jpg`.
- Картины выставки: положить изображения в `public/gallery/`, например `public/gallery/painting-01.jpg`.
- PDF и документы для скачивания: положить в `public/downloads/` и прописать пути в `content/downloads.json`.

После добавления изображений барной карты:

```bash
npm run bar-card:manifest
```

Скрипт обновит `src/generated/bar-card-manifest.json`. Если изображений нет, сборка не падает: коктейльные карточки показывают оформленные заглушки.

## Как заменить hero-изображение

1. Сохраните пользовательский исходник в `site_sources/user_provided/hero/`.
2. Подготовьте web-версию без метаданных в формате `webp`, предпочтительно с качеством около `86`.
3. Положите готовый файл в `public/hero/muha-hero.webp`.
4. Проверьте, что `content/site-meta.json` содержит `"heroImage": "/hero/muha-hero.webp"`.
5. Hero подключает картинку через CSS-переменную `--hero-image` в `src/components/Hero/Hero.tsx`, а позиционирование задаётся в `src/components/Hero/Hero.module.css`.
6. Если нужно сместить кадр, меняйте `background-position` у `.stage`, отдельно проверяя desktop и mobile.

## Как заменить карточки коктейлей

1. Положите новый zip-архив с PDF-карточками в `site_sources/user_provided/bar-cards-source/` или передайте путь к архиву напрямую в команду импорта.
2. Если Python-библиотеки для импорта ещё не установлены, выполните:

```bash
python -m pip install --user pymupdf pillow
```

3. Запустите импорт:

```bash
npm run bar-card:import -- "C:\Users\Home\Downloads\таро-20260601T104004Z-3-001.zip"
```

4. Скрипт сохранит исходный архив и распакованные PDF в `site_sources/user_provided/bar-cards-source/`, а готовые изображения создаст в `public/bar-cards/` с именами `cocktail-01.webp`, `cocktail-02.webp` и далее.
5. PDF с именем `Рубашка таро.pdf` обрабатывается отдельно: он не попадает в `content/bar-cards.json`, а сохраняется как `public/bar-cards/back.webp` и используется для закрытых карт.
6. После импорта обновите manifest:

```bash
npm run bar-card:manifest
```

Manifest хранит рубашку и лицевые карты раздельно:

```json
{
  "cardBack": "/bar-cards/back.webp",
  "cards": {
    "cocktail-01": ["/bar-cards/cocktail-01.webp"]
  }
}
```

7. Названия, описания и заметки карточек редактируются в `content/bar-cards.json`. ID должен совпадать с именем изображения без расширения.
8. Перед публикацией проверьте проект:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## Ограничения первой версии

- Нет форм заявок.
- Реквизиты показываются без налогового номера.
- Нет внешних изображений и скачивания из Google Drive.
- Нет сценариев проживания, номеров или гостиничного бронирования.
- Документы остаются disabled, пока реальные файлы не будут добавлены в `public/downloads/`.
