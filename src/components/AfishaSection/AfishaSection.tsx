"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import { SectionTitle } from "@/components/SectionTitle/SectionTitle";
import afisha from "../../../content/afisha.json";
import styles from "./AfishaSection.module.css";

export function AfishaSection() {
  const [imageReady, setImageReady] = useState(false);

  useEffect(() => {
    let active = true;
    const image = new Image();

    image.onload = () => {
      if (active) {
        setImageReady(true);
      }
    };
    image.onerror = () => {
      if (active) {
        setImageReady(false);
      }
    };
    image.src = afisha.image;

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className={styles.section} id="afisha" aria-labelledby="afisha-title">
      <div className={`container ${styles.grid}`}>
        <div className={styles.copy}>
          <SectionTitle
            eyebrow="Афиша"
            id="afisha-title"
            title={afisha.title}
            description={afisha.vkText}
          />
          <a className={styles.vkLink} href={afisha.vkHref}>
            Подробная афиша ВКонтакте
          </a>
        </div>
        <div className={styles.posterWrap}>
          {imageReady ? (
            <a className={styles.poster} href={afisha.image} target="_blank" rel="noreferrer">
              <img alt={afisha.title} src={afisha.image} />
            </a>
          ) : (
            <div className={styles.poster} aria-label={afisha.title}>
              <PosterPlaceholder />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function PosterPlaceholder() {
  return (
    <span className={styles.placeholder} aria-hidden="true">
      <i />
      <strong>Афиша месяца</strong>
      <em>Скоро</em>
    </span>
  );
}
