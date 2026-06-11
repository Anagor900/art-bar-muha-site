"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState, type PointerEvent, type WheelEvent } from "react";
import styles from "./ZoomableImageViewer.module.css";

type PanPoint = {
  x: number;
  y: number;
};

type ZoomableImageViewerProps = {
  alt: string;
  downloadFileName?: string;
  downloadHref?: string;
  eyebrow?: string;
  nextLabel?: string;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  previousLabel?: string;
  showDownload?: boolean;
  src: string;
  subtitle?: string;
  title: string;
  variant?: "gallery" | "document";
};

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.25;

export function ZoomableImageViewer({
  alt,
  downloadFileName,
  downloadHref,
  eyebrow,
  nextLabel = "Следующее изображение",
  onClose,
  onNext,
  onPrevious,
  previousLabel = "Предыдущее изображение",
  showDownload = false,
  src,
  subtitle,
  title,
  variant = "gallery",
}: ZoomableImageViewerProps) {
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [pan, setPan] = useState<PanPoint>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [imageState, setImageState] = useState<"loading" | "loaded" | "error">("loading");
  const isPanningRef = useRef(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const pointerState = useRef({
    panStart: { x: 0, y: 0 },
    pinchStartDistance: 0,
    pinchStartZoom: MIN_ZOOM,
    pointerStart: { x: 0, y: 0 },
    pointers: new Map<number, PanPoint>(),
  });
  const downloadVisible = Boolean(showDownload && downloadHref);

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    panelRef.current?.focus();
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      previousFocus?.focus({ preventScroll: true });
    };
  }, [onClose]);

  useEffect(() => {
    let mounted = true;
    const image = new Image();

    pointerState.current.pointers.clear();
    isPanningRef.current = false;
    setIsPanning(false);
    setZoom(MIN_ZOOM);
    setPan({ x: 0, y: 0 });
    setImageState("loading");
    image.onload = () => {
      if (mounted) {
        setImageState("loaded");
      }
    };
    image.onerror = () => {
      if (mounted) {
        setImageState("error");
      }
    };
    image.src = src;

    return () => {
      mounted = false;
      image.onload = null;
      image.onerror = null;
    };
  }, [src]);

  useEffect(() => {
    function handleResize() {
      setPan((currentPan) => {
        if (zoom <= MIN_ZOOM) {
          return { x: 0, y: 0 };
        }

        const viewport = viewportRef.current;
        const image = imageRef.current;

        if (!viewport || !image) {
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
    setZoom(MIN_ZOOM);
    setPan({ x: 0, y: 0 });
  }

  function setViewerPanning(value: boolean) {
    isPanningRef.current = value;
    setIsPanning(value);
  }

  function computePanBounds(nextZoom: number) {
    const viewport = viewportRef.current;
    const image = imageRef.current;

    if (!viewport || !image || nextZoom <= MIN_ZOOM) {
      return { x: 0, y: 0 };
    }

    return {
      x: Math.max(0, (image.offsetWidth * nextZoom - viewport.clientWidth) / 2),
      y: Math.max(0, (image.offsetHeight * nextZoom - viewport.clientHeight) / 2),
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
    setPan(safeZoom === MIN_ZOOM ? { x: 0, y: 0 } : clampPan(nextPan, safeZoom));
  }

  function handleZoomIn() {
    setViewerZoom(zoom + ZOOM_STEP);
  }

  function handleZoomOut() {
    setViewerZoom(zoom - ZOOM_STEP);
  }

  function handleWheel(event: WheelEvent<HTMLDivElement>) {
    event.preventDefault();

    if (imageState !== "loaded") {
      return;
    }

    setViewerZoom(zoom + (event.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP));
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    const viewport = viewportRef.current;

    if (!viewport || imageState !== "loaded" || (event.pointerType === "mouse" && event.button !== 0)) {
      return;
    }

    try {
      viewport.setPointerCapture(event.pointerId);
    } catch {
      // Some mobile/synthetic pointer streams cannot be captured, but pan/zoom still works.
    }

    pointerState.current.pointers.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });

    if (pointerState.current.pointers.size === 1 && zoom > MIN_ZOOM) {
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
    if (!pointerState.current.pointers.has(event.pointerId) || imageState !== "loaded") {
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
      setPan((currentPan) => (nextZoom === MIN_ZOOM ? { x: 0, y: 0 } : clampPan(currentPan, nextZoom)));
      return;
    }

    if (!isPanningRef.current || zoom <= MIN_ZOOM) {
      return;
    }

    event.preventDefault();
    setPan(
      clampPan(
        {
          x: pointerState.current.panStart.x + event.clientX - pointerState.current.pointerStart.x,
          y: pointerState.current.panStart.y + event.clientY - pointerState.current.pointerStart.y,
        },
        zoom,
      ),
    );
  }

  function endPointer(event: PointerEvent<HTMLDivElement>) {
    const viewport = viewportRef.current;

    if (viewport?.hasPointerCapture(event.pointerId)) {
      try {
        viewport.releasePointerCapture(event.pointerId);
      } catch {
        // The browser may have already released this pointer.
      }
    }

    pointerState.current.pointers.delete(event.pointerId);

    if (pointerState.current.pointers.size < 2) {
      pointerState.current.pinchStartDistance = 0;
    }

    if (pointerState.current.pointers.size === 1 && zoom > MIN_ZOOM) {
      const remainingPointer = [...pointerState.current.pointers.values()][0];

      pointerState.current.pointerStart = remainingPointer;
      pointerState.current.panStart = pan;
      setViewerPanning(true);
      return;
    }

    setViewerPanning(false);
  }

  return (
    <div
      aria-label={title}
      aria-modal="true"
      className={styles.viewer}
      data-variant={variant}
      onClick={onClose}
      role="dialog"
    >
      <div className={styles.panel} onClick={(event) => event.stopPropagation()} ref={panelRef} tabIndex={-1}>
        <div className={styles.topbar}>
          <div className={styles.titleBlock}>
            {eyebrow ? <span>{eyebrow}</span> : null}
            <strong>{title}</strong>
            {subtitle ? <em>{subtitle}</em> : null}
          </div>
          <div className={styles.tools} aria-label="Управление просмотром">
            {downloadVisible ? (
              <a className={styles.downloadButton} download={downloadFileName} href={downloadHref}>
                Скачать
              </a>
            ) : null}
            <button aria-label="Уменьшить изображение" disabled={zoom <= MIN_ZOOM} onClick={handleZoomOut} type="button">
              −
            </button>
            <button aria-label="Сбросить масштаб" onClick={resetViewer} type="button">
              {Math.round(zoom * 100)}%
            </button>
            <button aria-label="Увеличить изображение" disabled={zoom >= MAX_ZOOM} onClick={handleZoomIn} type="button">
              +
            </button>
            <button aria-label="Закрыть просмотр" className={styles.closeButton} onClick={onClose} type="button">
              {variant === "document" ? "Закрыть" : "×"}
            </button>
          </div>
        </div>
        {onPrevious ? (
          <button
            aria-label={previousLabel}
            className={`${styles.arrow} ${styles.previous}`}
            onClick={onPrevious}
            type="button"
          >
            ←
          </button>
        ) : null}
        <div
          className={styles.viewport}
          data-can-pan={zoom > MIN_ZOOM && imageState === "loaded"}
          data-panning={isPanning}
          onPointerCancel={endPointer}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endPointer}
          onWheel={handleWheel}
          ref={viewportRef}
        >
          {imageState === "loading" ? <ViewerLoader /> : null}
          {imageState === "error" ? <div className={styles.errorState}>Изображение временно недоступно.</div> : null}
          {imageState === "loaded" ? (
            <img
              alt={alt}
              className={styles.image}
              data-zoomed={zoom > MIN_ZOOM}
              draggable={false}
              ref={imageRef}
              src={src}
              style={{
                transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
              }}
            />
          ) : null}
        </div>
        {onNext ? (
          <button aria-label={nextLabel} className={`${styles.arrow} ${styles.next}`} onClick={onNext} type="button">
            →
          </button>
        ) : null}
      </div>
    </div>
  );
}

function ViewerLoader() {
  return (
    <div className={styles.loader} aria-label="Загрузка изображения" role="status">
      <span />
    </div>
  );
}

function clampZoom(value: number) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Number(value.toFixed(2))));
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
