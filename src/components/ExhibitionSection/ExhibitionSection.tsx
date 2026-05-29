"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import { SectionTitle } from "@/components/SectionTitle/SectionTitle";
import contacts from "../../../content/contacts.json";
import exhibition from "../../../content/gallery.json";
import styles from "./ExhibitionSection.module.css";

type Painting = (typeof exhibition.items)[number];

export function ExhibitionSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [loaded, setLoaded] = useState<Record<string, boolean>>({});
  const active = exhibition.items[activeIndex];

  useEffect(() => {
    if (!active || loaded[active.id]) {
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
    image.src = `/gallery/${active.image}`;

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
                <dd>{active.author}</dd>
              </div>
              <div>
                <dt>Техника</dt>
                <dd>{active.technique}</dd>
              </div>
              <div>
                <dt>Материалы</dt>
                <dd>{active.materials}</dd>
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

function PaintingFrame({ painting, loaded }: { painting: Painting; loaded?: boolean }) {
  return (
    <div className={styles.frame}>
      {loaded ? (
        <img alt={painting.title} src={`/gallery/${painting.image}`} />
      ) : (
        <div className={styles.paintingPlaceholder} aria-label={painting.title}>
          <span />
          <strong>{painting.title}</strong>
        </div>
      )}
    </div>
  );
}
