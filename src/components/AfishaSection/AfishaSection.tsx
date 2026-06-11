"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import { ExternalLink } from "@/components/ExternalLink/ExternalLink";
import { SectionTitle } from "@/components/SectionTitle/SectionTitle";
import { ZoomableImageViewer } from "@/components/ZoomableImageViewer/ZoomableImageViewer";
import afisha from "../../../content/afisha.json";
import styles from "./AfishaSection.module.css";

export function AfishaSection() {
  const [imageState, setImageState] = useState<"loading" | "loaded" | "error">("loading");
  const [viewerOpen, setViewerOpen] = useState(false);

  useEffect(() => {
    let active = true;
    const image = new Image();

    image.onload = () => {
      if (active) {
        setImageState("loaded");
      }
    };
    image.onerror = () => {
      if (active) {
        setImageState("error");
      }
    };
    setImageState("loading");
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
          <ExternalLink className={styles.vkLink} href={afisha.vkHref}>
            Подробная афиша ВКонтакте
          </ExternalLink>
        </div>
        <div className={styles.posterWrap}>
          {imageState === "loaded" ? (
            <button
              aria-label="Открыть афишу на весь экран"
              className={styles.poster}
              onClick={() => setViewerOpen(true)}
              type="button"
            >
              <img alt={afisha.title} src={afisha.image} />
            </button>
          ) : imageState === "loading" ? (
            <div className={styles.poster} aria-label="Загрузка афиши" role="status">
              <PosterLoader />
            </div>
          ) : (
            <div className={styles.poster} aria-label={afisha.title}>
              <PosterPlaceholder />
            </div>
          )}
        </div>
      </div>

      {viewerOpen ? (
        <ZoomableImageViewer
          alt={afisha.title}
          eyebrow="Афиша"
          onClose={() => setViewerOpen(false)}
          showDownload={false}
          src={afisha.image}
          subtitle="Арт-Ресто-Бар МУХА"
          title={afisha.title}
        />
      ) : null}
    </section>
  );
}

function PosterLoader() {
  return (
    <span className={styles.loader} aria-hidden="true">
      <i />
    </span>
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
