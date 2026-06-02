"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState, type PointerEvent, type WheelEvent } from "react";
import { SectionTitle } from "@/components/SectionTitle/SectionTitle";
import type { ExhibitionContent, ExhibitionPainting } from "@/lib/exhibition";
import contacts from "../../../content/contacts.json";
import styles from "./ExhibitionSection.module.css";

type ExhibitionSectionProps = {
  exhibition: ExhibitionContent;
};

const MIN_LIGHTBOX_ZOOM = 1;
const MAX_LIGHTBOX_ZOOM = 3;
const LIGHTBOX_ZOOM_STEP = 0.25;
const SWIPE_THRESHOLD = 48;

type PanPoint = {
  x: number;
  y: number;
};

export function ExhibitionSection({ exhibition }: ExhibitionSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [loaded, setLoaded] = useState<Record<string, boolean>>({});
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const swipeClickLock = useRef(false);
  const swipeUnlockTimeout = useRef<number | null>(null);
  const active = exhibition.items[activeIndex];
  const deliveryLines = splitDeliveryText(exhibition.delivery);

  useEffect(() => {
    return () => {
      if (swipeUnlockTimeout.current !== null) {
        window.clearTimeout(swipeUnlockTimeout.current);
      }
    };
  }, []);

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

  useEffect(() => {
    if (!lightboxOpen) {
      return;
    }

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setLightboxOpen(false);
      }
    }

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [lightboxOpen]);

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
    if (swipeClickLock.current || !active?.imageSrc) {
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
        <PaintingLightbox
          activeIndex={activeIndex}
          onClose={closeLightbox}
          onNext={showNext}
          onPrevious={showPrevious}
          painting={active}
          total={exhibition.items.length}
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
  const shouldShowImage = Boolean(painting.imageSrc && loaded);
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

function PaintingLightbox({
  activeIndex,
  onClose,
  onNext,
  onPrevious,
  painting,
  total,
}: {
  activeIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
  painting: ExhibitionPainting;
  total: number;
}) {
  const label = getPaintingLabel(painting);
  const [zoom, setZoom] = useState(MIN_LIGHTBOX_ZOOM);
  const [pan, setPan] = useState<PanPoint>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const isPanningRef = useRef(false);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const pointerState = useRef({
    panStart: { x: 0, y: 0 },
    pinchStartDistance: 0,
    pinchStartZoom: MIN_LIGHTBOX_ZOOM,
    pointerStart: { x: 0, y: 0 },
    pointers: new Map<number, PanPoint>(),
  });

  useEffect(() => {
    pointerState.current.pointers.clear();
    isPanningRef.current = false;
    setIsPanning(false);
    setZoom(MIN_LIGHTBOX_ZOOM);
    setPan({ x: 0, y: 0 });
  }, [painting.id]);

  useEffect(() => {
    function handleResize() {
      setPan((currentPan) => {
        const viewport = viewportRef.current;
        const image = imageRef.current;

        if (!viewport || !image || zoom <= MIN_LIGHTBOX_ZOOM) {
          return { x: 0, y: 0 };
        }

        const bounds = {
          x: Math.max(0, (image.offsetWidth * zoom - viewport.clientWidth) / 2),
          y: Math.max(0, (image.offsetHeight * zoom - viewport.clientHeight) / 2),
        };

        return {
          x: clamp(currentPan.x, -bounds.x, bounds.x),
          y: clamp(currentPan.y, -bounds.y, bounds.y),
        };
      });
    }

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [zoom]);

  function resetViewer() {
    pointerState.current.pointers.clear();
    setViewerPanning(false);
    setZoom(MIN_LIGHTBOX_ZOOM);
    setPan({ x: 0, y: 0 });
  }

  function setViewerPanning(value: boolean) {
    isPanningRef.current = value;
    setIsPanning(value);
  }

  function computePanBounds(nextZoom: number) {
    const viewport = viewportRef.current;
    const image = imageRef.current;

    if (!viewport || !image || nextZoom <= MIN_LIGHTBOX_ZOOM) {
      return { x: 0, y: 0 };
    }

    const scaledWidth = image.offsetWidth * nextZoom;
    const scaledHeight = image.offsetHeight * nextZoom;

    return {
      x: Math.max(0, (scaledWidth - viewport.clientWidth) / 2),
      y: Math.max(0, (scaledHeight - viewport.clientHeight) / 2),
    };
  }

  function clampPan(nextPan: PanPoint, nextZoom: number) {
    const bounds = computePanBounds(nextZoom);

    return {
      x: clamp(nextPan.x, -bounds.x, bounds.x),
      y: clamp(nextPan.y, -bounds.y, bounds.y),
    };
  }

  function setViewerZoom(nextZoom: number, nextPan = pan) {
    const safeZoom = clampZoom(nextZoom);

    setZoom(safeZoom);
    setPan(safeZoom === MIN_LIGHTBOX_ZOOM ? { x: 0, y: 0 } : clampPan(nextPan, safeZoom));
  }

  function handleZoomIn() {
    setViewerZoom(zoom + LIGHTBOX_ZOOM_STEP);
  }

  function handleZoomOut() {
    setViewerZoom(zoom - LIGHTBOX_ZOOM_STEP);
  }

  function handleResetZoom() {
    resetViewer();
  }

  function handleWheel(event: WheelEvent<HTMLDivElement>) {
    event.preventDefault();
    const direction = event.deltaY < 0 ? 1 : -1;

    setViewerZoom(zoom + direction * LIGHTBOX_ZOOM_STEP);
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    const viewport = viewportRef.current;

    if (!viewport || (event.pointerType === "mouse" && event.button !== 0)) {
      return;
    }

    try {
      viewport.setPointerCapture(event.pointerId);
    } catch {
      // Some synthetic/mobile pointer streams are not capturable, but pan/zoom can still work.
    }
    pointerState.current.pointers.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });

    if (pointerState.current.pointers.size === 1 && zoom > MIN_LIGHTBOX_ZOOM) {
      pointerState.current.pointerStart = {
        x: event.clientX,
        y: event.clientY,
      };
      pointerState.current.panStart = pan;
      setViewerPanning(true);
      return;
    }

    if (pointerState.current.pointers.size === 2) {
      pointerState.current.pinchStartDistance = getPointerDistance(pointerState.current.pointers);
      pointerState.current.pinchStartZoom = zoom;
      pointerState.current.panStart = pan;
      setViewerPanning(false);
    }
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!pointerState.current.pointers.has(event.pointerId)) {
      return;
    }

    pointerState.current.pointers.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });

    if (pointerState.current.pointers.size >= 2 && pointerState.current.pinchStartDistance > 0) {
      event.preventDefault();
      const distance = getPointerDistance(pointerState.current.pointers);
      const nextZoom = clampZoom(
        pointerState.current.pinchStartZoom * (distance / pointerState.current.pinchStartDistance),
      );

      setZoom(nextZoom);
      setPan((currentPan) => (nextZoom === MIN_LIGHTBOX_ZOOM ? { x: 0, y: 0 } : clampPan(currentPan, nextZoom)));
      return;
    }

    if (!isPanningRef.current || zoom <= MIN_LIGHTBOX_ZOOM) {
      return;
    }

    event.preventDefault();
    const delta = {
      x: event.clientX - pointerState.current.pointerStart.x,
      y: event.clientY - pointerState.current.pointerStart.y,
    };

    setPan(clampPan({ x: pointerState.current.panStart.x + delta.x, y: pointerState.current.panStart.y + delta.y }, zoom));
  }

  function endPointer(event: PointerEvent<HTMLDivElement>) {
    const viewport = viewportRef.current;

    if (viewport?.hasPointerCapture(event.pointerId)) {
      try {
        viewport.releasePointerCapture(event.pointerId);
      } catch {
        // The pointer may already be released by the browser.
      }
    }

    pointerState.current.pointers.delete(event.pointerId);

    if (pointerState.current.pointers.size < 2) {
      pointerState.current.pinchStartDistance = 0;
    }

    if (pointerState.current.pointers.size === 1 && zoom > MIN_LIGHTBOX_ZOOM) {
      const remainingPointer = [...pointerState.current.pointers.values()][0];
      pointerState.current.pointerStart = remainingPointer;
      pointerState.current.panStart = pan;
      setViewerPanning(true);
      return;
    }

    setViewerPanning(false);
  }

  function navigatePrevious() {
    resetViewer();
    onPrevious();
  }

  function navigateNext() {
    resetViewer();
    onNext();
  }

  return (
    <div
      aria-label={`Просмотр картины: ${label}`}
      aria-modal="true"
      className={styles.lightbox}
      onClick={onClose}
      role="dialog"
    >
      <div className={styles.lightboxPanel} onClick={(event) => event.stopPropagation()}>
        <div className={styles.lightboxTopbar}>
          <div className={styles.lightboxTitle}>
            <span>
              {activeIndex + 1} / {total}
            </span>
            <strong>{label}</strong>
            {painting.artist ? <em>{painting.artist}</em> : null}
          </div>
          <div className={styles.lightboxTools} aria-label="Масштаб изображения">
            <button
              aria-label="Уменьшить изображение"
              disabled={zoom <= MIN_LIGHTBOX_ZOOM}
              onClick={handleZoomOut}
              type="button"
            >
              −
            </button>
            <button aria-label="Сбросить масштаб" onClick={handleResetZoom} type="button">
              {Math.round(zoom * 100)}%
            </button>
            <button
              aria-label="Увеличить изображение"
              disabled={zoom >= MAX_LIGHTBOX_ZOOM}
              onClick={handleZoomIn}
              type="button"
            >
              +
            </button>
            <button aria-label="Закрыть просмотр" className={styles.lightboxClose} onClick={onClose} type="button">
              ×
            </button>
          </div>
        </div>
        <button
          aria-label="Предыдущая картина"
          className={`${styles.lightboxArrow} ${styles.lightboxPrevious}`}
          onClick={navigatePrevious}
          type="button"
        >
          ←
        </button>
        <div
          className={styles.lightboxViewport}
          data-can-pan={zoom > MIN_LIGHTBOX_ZOOM}
          data-panning={isPanning}
          onPointerCancel={endPointer}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endPointer}
          onWheel={handleWheel}
          ref={viewportRef}
        >
          <img
            alt={label}
            className={styles.lightboxImage}
            data-zoomed={zoom > MIN_LIGHTBOX_ZOOM}
            draggable={false}
            ref={imageRef}
            src={painting.imageSrc ?? ""}
            style={{
              transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
            }}
          />
        </div>
        <button
          aria-label="Следующая картина"
          className={`${styles.lightboxArrow} ${styles.lightboxNext}`}
          onClick={navigateNext}
          type="button"
        >
          →
        </button>
      </div>
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

function clampZoom(value: number) {
  return Math.min(MAX_LIGHTBOX_ZOOM, Math.max(MIN_LIGHTBOX_ZOOM, Number(value.toFixed(2))));
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getPointerDistance(pointers: Map<number, PanPoint>) {
  const values = [...pointers.values()];

  if (values.length < 2) {
    return 0;
  }

  return Math.hypot(values[0].x - values[1].x, values[0].y - values[1].y);
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
