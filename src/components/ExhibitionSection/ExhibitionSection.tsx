"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import { SectionTitle } from "@/components/SectionTitle/SectionTitle";
import type { ExhibitionContent, ExhibitionPainting } from "@/lib/exhibition";
import contacts from "../../../content/contacts.json";
import styles from "./ExhibitionSection.module.css";

type ExhibitionSectionProps = {
  exhibition: ExhibitionContent;
};

export function ExhibitionSection({ exhibition }: ExhibitionSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [loaded, setLoaded] = useState<Record<string, boolean>>({});
  const active = exhibition.items[activeIndex];

  useEffect(() => {
    if (!active?.imageSrc || loaded[active.id] !== undefined) {
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
    image.src = active.imageSrc;

    return () => {
      mounted = false;
    };
  }, [active, loaded]);

  function showNext() {
    setActiveIndex((index) => (index + 1) % exhibition.items.length);
  }

  function showPrevious() {
    setActiveIndex((index) => (index - 1 + exhibition.items.length) % exhibition.items.length);
  }

  if (!active) {
    return null;
  }

  return (
    <section className={styles.section} id="exhibition" aria-labelledby="exhibition-title">
      <div className="container">
        <SectionTitle
          eyebrow="Выставка"
          id="exhibition-title"
          title="Выставка-продажа картин"
          description={exhibition.intro}
        />
        <div className={styles.grid}>
          <div className={styles.carousel}>
            <PaintingFrame painting={active} loaded={loaded[active.id]} />
            <div className={styles.controls} aria-label="Переключение картин">
              <button aria-label="Предыдущая картина" onClick={showPrevious} type="button">
                ←
              </button>
              <div className={styles.dots}>
                {exhibition.items.map((item, index) => (
                  <button
                    aria-label={`Показать ${item.title}`}
                    aria-pressed={index === activeIndex}
                    key={item.id}
                    onClick={() => setActiveIndex(index)}
                    type="button"
                  />
                ))}
              </div>
              <button aria-label="Следующая картина" onClick={showNext} type="button">
                →
              </button>
            </div>
          </div>
          <article className={styles.details}>
            <span>
              {activeIndex + 1} / {exhibition.items.length}
            </span>
            <h3>{active.title}</h3>
            <dl>
              <div>
                <dt>Автор</dt>
                <dd>{active.artist}</dd>
              </div>
              <div>
                <dt>Техника</dt>
                <dd>{active.technique}</dd>
              </div>
            </dl>
            <p>{active.description}</p>
            <p className={styles.delivery}>{exhibition.delivery}</p>
            <a href={contacts.phones[0].href}>{active.contactLabel}</a>
          </article>
        </div>
      </div>
    </section>
  );
}

function PaintingFrame({ painting, loaded }: { painting: ExhibitionPainting; loaded?: boolean }) {
  const shouldShowImage = Boolean(painting.imageSrc && loaded);

  return (
    <div className={styles.frame}>
      {shouldShowImage ? (
        <img alt={painting.title} src={painting.imageSrc ?? ""} />
      ) : (
        <div className={styles.paintingPlaceholder} aria-label={painting.title}>
          <span />
          <strong>{painting.title}</strong>
        </div>
      )}
    </div>
  );
}
