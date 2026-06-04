"use client";

/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { SectionTitle } from "@/components/SectionTitle/SectionTitle";
import { ZoomableImageViewer } from "@/components/ZoomableImageViewer/ZoomableImageViewer";
import { usePreloadImages } from "@/hooks/usePreloadImages";
import type { ExhibitionContent, ExhibitionPainting } from "@/lib/exhibition";
import type { PreloadImageResult } from "@/lib/preloadImages";
import contacts from "../../../content/contacts.json";
import styles from "./ExhibitionSection.module.css";

type ExhibitionSectionProps = {
  exhibition: ExhibitionContent;
};

const SWIPE_THRESHOLD = 48;

export function ExhibitionSection({ exhibition }: ExhibitionSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [loaded, setLoaded] = useState<Record<string, boolean>>({});
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const swipeClickLock = useRef(false);
  const swipeUnlockTimeout = useRef<number | null>(null);
  const active = exhibition.items[activeIndex];
  const deliveryLines = splitDeliveryText(exhibition.delivery);
  const imageSources = useMemo(
    () => exhibition.items.map((item) => item.imageSrc).filter((src): src is string => Boolean(src)),
    [exhibition.items],
  );
  const imageIdBySrc = useMemo(() => {
    const map = new Map<string, string>();

    exhibition.items.forEach((item) => {
      if (item.imageSrc) {
        map.set(item.imageSrc, item.id);
      }
    });

    return map;
  }, [exhibition.items]);
  const handlePreloadResult = useCallback(
    ({ status, url }: PreloadImageResult) => {
      const id = imageIdBySrc.get(url);

      if (!id) {
        return;
      }

      setLoaded((state) => {
        const loadedState = status === "loaded";

        if (state[id] === loadedState) {
          return state;
        }

        return { ...state, [id]: loadedState };
      });
    },
    [imageIdBySrc],
  );

  usePreloadImages(imageSources, handlePreloadResult);

  useEffect(() => {
    return () => {
      if (swipeUnlockTimeout.current !== null) {
        window.clearTimeout(swipeUnlockTimeout.current);
      }
    };
  }, []);

  function lockClickAfterSwipe() {
    swipeClickLock.current = true;

    if (swipeUnlockTimeout.current !== null) {
      window.clearTimeout(swipeUnlockTimeout.current);
    }

    swipeUnlockTimeout.current = window.setTimeout(() => {
      swipeClickLock.current = false;
      swipeUnlockTimeout.current = null;
    }, 180);
  }

  function showNext() {
    setActiveIndex((index) => (index + 1) % exhibition.items.length);
  }

  function showPrevious() {
    setActiveIndex((index) => (index - 1 + exhibition.items.length) % exhibition.items.length);
  }

  function openLightbox() {
    if (swipeClickLock.current || !active?.imageSrc || loaded[active.id] !== true) {
      return;
    }

    setLightboxOpen(true);
  }

  function closeLightbox() {
    setLightboxOpen(false);
  }

  const carouselSwipeHandlers = useSwipeNavigation({
    onNext: showNext,
    onPrevious: showPrevious,
    onSwipe: lockClickAfterSwipe,
  });

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
            <PaintingFrame
              loaded={loaded[active.id]}
              onNext={showNext}
              onOpen={openLightbox}
              onPrevious={showPrevious}
              painting={active}
              swipeHandlers={carouselSwipeHandlers}
            />
          </div>
          <article className={styles.details}>
            <div className={styles.detailsContent}>
              {active.title ? <h3 className={styles.paintingTitle}>{active.title}</h3> : null}
              {active.artist ? <p className={styles.artist}>{active.artist}</p> : null}
              {active.technique ? <p className={styles.technique}>{active.technique}</p> : null}
              {active.description ? <p className={styles.description}>{active.description}</p> : null}
            </div>
            <div className={styles.contactBlock}>
              <p className={styles.delivery}>
                {deliveryLines.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </p>
              <a href={contacts.phones[0].href}>{active.contactLabel}</a>
            </div>
          </article>
        </div>
      </div>

      {lightboxOpen && active.imageSrc ? (
        <ZoomableImageViewer
          alt={getPaintingLabel(active)}
          eyebrow={`${activeIndex + 1} / ${exhibition.items.length}`}
          onClose={closeLightbox}
          onNext={showNext}
          onPrevious={showPrevious}
          nextLabel="Следующая картина"
          previousLabel="Предыдущая картина"
          showDownload={false}
          src={active.imageSrc}
          subtitle={active.artist}
          title={getPaintingLabel(active)}
        />
      ) : null}
    </section>
  );
}

function PaintingFrame({
  loaded,
  onNext,
  onOpen,
  onPrevious,
  painting,
  swipeHandlers,
}: {
  loaded?: boolean;
  onNext: () => void;
  onOpen: () => void;
  onPrevious: () => void;
  painting: ExhibitionPainting;
  swipeHandlers: SwipeHandlers;
}) {
  const hasImage = Boolean(painting.imageSrc);
  const shouldShowImage = Boolean(hasImage && loaded === true);
  const shouldShowLoader = Boolean(hasImage && loaded === undefined);
  const label = getPaintingLabel(painting);

  return (
    <div className={styles.frame} data-orientation={painting.orientation} {...swipeHandlers}>
      {shouldShowImage ? (
        <button
          aria-label={`Открыть картину на весь экран: ${label}`}
          className={styles.imageButton}
          onClick={onOpen}
          type="button"
        >
          <img alt={label} src={painting.imageSrc ?? ""} />
        </button>
      ) : shouldShowLoader ? (
        <ImageLoader />
      ) : (
        <div className={styles.paintingPlaceholder} aria-label={label}>
          <span />
          <strong>{label}</strong>
        </div>
      )}
      <button
        aria-label="Предыдущая картина"
        className={`${styles.frameButton} ${styles.previousButton}`}
        onClick={onPrevious}
        type="button"
      >
        ←
      </button>
      <button
        aria-label="Следующая картина"
        className={`${styles.frameButton} ${styles.nextButton}`}
        onClick={onNext}
        type="button"
      >
        →
      </button>
    </div>
  );
}

function ImageLoader() {
  return (
    <div className={styles.imageLoader} aria-label="Загрузка изображения" role="status">
      <span />
    </div>
  );
}

function useSwipeNavigation({
  onNext,
  onPrevious,
  onSwipe,
}: {
  onNext: () => void;
  onPrevious: () => void;
  onSwipe?: () => void;
}): SwipeHandlers {
  const start = useRef<{ x: number; y: number } | null>(null);

  function handlePointerDown(event: PointerEvent<HTMLElement>) {
    if (!event.isPrimary || (event.pointerType === "mouse" && event.button !== 0)) {
      return;
    }

    start.current = {
      x: event.clientX,
      y: event.clientY,
    };
  }

  function handlePointerUp(event: PointerEvent<HTMLElement>) {
    if (!start.current) {
      return;
    }

    const deltaX = event.clientX - start.current.x;
    const deltaY = event.clientY - start.current.y;
    start.current = null;

    if (Math.abs(deltaX) < SWIPE_THRESHOLD || Math.abs(deltaX) < Math.abs(deltaY) * 1.2) {
      return;
    }

    event.preventDefault();

    if (deltaX < 0) {
      onNext();
    } else {
      onPrevious();
    }

    onSwipe?.();
  }

  function handlePointerCancel() {
    start.current = null;
  }

  return {
    onPointerCancel: handlePointerCancel,
    onPointerDown: handlePointerDown,
    onPointerUp: handlePointerUp,
  };
}

type SwipeHandlers = {
  onPointerCancel: () => void;
  onPointerDown: (event: PointerEvent<HTMLElement>) => void;
  onPointerUp: (event: PointerEvent<HTMLElement>) => void;
};

function getPaintingLabel(painting: ExhibitionPainting) {
  return painting.title || painting.artist || painting.id;
}

function splitDeliveryText(text: string) {
  return text
    .split(". ")
    .map((part, index, parts) => {
      const value = part.trim();

      if (!value) {
        return "";
      }

      return index < parts.length - 1 && !value.endsWith(".") ? `${value}.` : value;
    })
    .filter(Boolean);
}
