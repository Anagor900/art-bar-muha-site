"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState } from "react";
import type { PointerEvent } from "react";
import { SectionTitle } from "@/components/SectionTitle/SectionTitle";
import { ZoomableImageViewer } from "@/components/ZoomableImageViewer/ZoomableImageViewer";
import styles from "./MenuSection.module.css";

type MenuPage = {
  id: string;
  title: string;
  image: string;
};

type MenuSectionProps = {
  pages: MenuPage[];
  text: string;
};

function imageUrl(page: MenuPage) {
  return `/menu/${page.image}`;
}

export function MenuSection({ pages, text }: MenuSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [loaded, setLoaded] = useState<Record<string, boolean>>({});
  const [viewerOpen, setViewerOpen] = useState(false);
  const swipeStartRef = useRef<{ pointerId: number; x: number; y: number } | null>(null);
  const suppressViewerClickRef = useRef(false);
  const active = pages[activeIndex] ?? pages[0];
  const activeLoadState = active ? loaded[active.id] : undefined;

  useEffect(() => {
    if (!active || activeLoadState !== undefined) {
      return;
    }

    let mounted = true;
    const image = new Image();

    image.onload = () => {
      if (mounted) {
        setLoaded((state) => ({ ...state, [active.id]: true }));
      }
    };
    image.onerror = () => {
      if (mounted) {
        setLoaded((state) => ({ ...state, [active.id]: false }));
      }
    };
    image.src = imageUrl(active);

    return () => {
      mounted = false;
    };
  }, [active, activeLoadState]);

  function showPrevious() {
    setActiveIndex((index) => (index - 1 + pages.length) % pages.length);
  }

  function showNext() {
    setActiveIndex((index) => (index + 1) % pages.length);
  }

  function showPage(index: number) {
    setActiveIndex(index);
  }

  function isMobileSwipeViewport() {
    return typeof window !== "undefined" && window.matchMedia("(max-width: 900px)").matches;
  }

  function handleSwipeStart(event: PointerEvent<HTMLDivElement>) {
    if (pages.length < 2 || !isMobileSwipeViewport()) {
      return;
    }

    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    swipeStartRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
    };
  }

  function handleSwipeEnd(event: PointerEvent<HTMLDivElement>) {
    const start = swipeStartRef.current;

    if (!start || start.pointerId !== event.pointerId) {
      return;
    }

    swipeStartRef.current = null;

    if (!isMobileSwipeViewport()) {
      return;
    }

    const deltaX = event.clientX - start.x;
    const deltaY = event.clientY - start.y;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    const swipeThreshold = 48;

    if (absX <= swipeThreshold || absX <= absY * 1.2) {
      return;
    }

    suppressViewerClickRef.current = true;
    window.setTimeout(() => {
      suppressViewerClickRef.current = false;
    }, 120);

    if (deltaX < 0) {
      showNext();
      return;
    }

    showPrevious();
  }

  function handleSwipeCancel() {
    swipeStartRef.current = null;
  }

  function handleImageClick() {
    if (suppressViewerClickRef.current) {
      return;
    }

    setViewerOpen(true);
  }

  return (
    <section className={styles.section} id="menu" aria-labelledby="menu-title">
      <div className={`container ${styles.grid}`}>
        <div className={styles.copy}>
          <SectionTitle eyebrow="Меню" id="menu-title" title="Завтраки, обеды, ужины" description={text} />
        </div>
        <div className={styles.carousel} aria-label="Страницы меню">
          {active ? (
            <>
              <div
                className={styles.frame}
                onPointerCancel={handleSwipeCancel}
                onPointerDown={handleSwipeStart}
                onPointerUp={handleSwipeEnd}
              >
                {activeLoadState === true ? (
                  <button
                    aria-label={`Открыть ${active.title} на весь экран`}
                    className={styles.imageButton}
                    onClick={handleImageClick}
                    type="button"
                  >
                    <img alt={active.title} key={active.id} src={imageUrl(active)} />
                  </button>
                ) : activeLoadState === false ? (
                  <div className={styles.errorState}>Страница меню временно недоступна.</div>
                ) : (
                  <MenuLoader />
                )}
                <button
                  aria-label="Предыдущая страница меню"
                  className={`${styles.frameButton} ${styles.previousButton}`}
                  onClick={showPrevious}
                  type="button"
                >
                  ←
                </button>
                <button
                  aria-label="Следующая страница меню"
                  className={`${styles.frameButton} ${styles.nextButton}`}
                  onClick={showNext}
                  type="button"
                >
                  →
                </button>
              </div>
              <div className={styles.controls}>
                <div className={styles.dots}>
                  {pages.map((page, index) => (
                    <button
                      aria-label={`Показать ${page.title}`}
                      aria-pressed={index === activeIndex}
                      key={page.id}
                      onClick={() => showPage(index)}
                      type="button"
                    />
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className={styles.empty}>Меню временно недоступно.</div>
          )}
        </div>
      </div>

      {viewerOpen && active ? (
        <ZoomableImageViewer
          alt={active.title}
          eyebrow={`${activeIndex + 1} / ${pages.length}`}
          nextLabel="Следующая страница меню"
          onClose={() => setViewerOpen(false)}
          onNext={showNext}
          onPrevious={showPrevious}
          previousLabel="Предыдущая страница меню"
          showDownload={false}
          src={imageUrl(active)}
          subtitle="Арт-Ресто-Бар МУХА"
          title={active.title}
        />
      ) : null}
    </section>
  );
}

function MenuLoader() {
  return (
    <div className={styles.imageLoader} aria-label="Загрузка страницы меню" role="status">
      <span />
    </div>
  );
}
