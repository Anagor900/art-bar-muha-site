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

- Hero image: положить файл в `public/hero-facade.jpg` и проверить путь `heroImage` в `content/site-meta.json`.
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

## Ограничения первой версии

- Нет форм заявок.
- Реквизиты показываются без налогового номера.
- Нет внешних изображений и скачивания из Google Drive.
- Нет сценариев проживания, номеров или гостиничного бронирования.
- Документы остаются disabled, пока реальные файлы не будут добавлены в `public/downloads/`.
