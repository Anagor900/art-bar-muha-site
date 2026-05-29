"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import { SectionTitle } from "@/components/SectionTitle/SectionTitle";
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

  return (
    <section className={styles.section} id="menu" aria-labelledby="menu-title">
      <div className={`container ${styles.grid}`}>
        <div className={styles.copy}>
          <SectionTitle eyebrow="Меню" id="menu-title" title="Завтраки, обеды, ужины" description={text} />
        </div>
        <div className={styles.carousel} aria-label="Страницы меню">
          {active ? (
            <>
              <div className={styles.frame}>
                {activeLoadState ? (
                  <img alt={active.title} src={imageUrl(active)} />
                ) : (
                  <MenuPageCard page={active} index={activeIndex} />
                )}
              </div>
              <div className={styles.controls}>
                <button aria-label="Предыдущая страница меню" onClick={showPrevious} type="button">
                  ←
                </button>
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
                <button aria-label="Следующая страница меню" onClick={showNext} type="button">
                  →
                </button>
              </div>
            </>
          ) : (
            <div className={styles.empty}>Меню временно недоступно.</div>
          )}
        </div>
      </div>
    </section>
  );
}

function MenuPageCard({ page, index }: { page: MenuPage; index: number }) {
  return (
    <article className={styles.menuPage}>
      <span>{String(index + 1).padStart(2, "0")}</span>
      <strong>{page.title}</strong>
      <i />
      <i />
      <i />
      <i />
    </article>
  );
}
