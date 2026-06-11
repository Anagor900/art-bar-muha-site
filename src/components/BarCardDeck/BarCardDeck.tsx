"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, PointerEvent } from "react";
import { SectionTitle } from "@/components/SectionTitle/SectionTitle";
import styles from "./BarCardDeck.module.css";

export type BarCard = {
  id: string;
  title: string;
  image: string;
  subtitle?: string;
  description: string;
  notes: string[];
  accent?: string;
};

type BarCardDeckProps = {
  cards: BarCard[];
  manifest: BarCardManifest;
  intro: string;
};

type MotionState = "idle" | "nextLeaving" | "nextEntering" | "prevLeaving" | "prevEntering";
type MobileMotionState = "idle" | "next" | "previous";
type BarCardManifest = {
  cardBack?: string | null;
  cards?: Record<string, string[]>;
};

const animationMs = 680;
const swapMs = 330;

function cardImages(manifest: BarCardManifest) {
  return manifest.cards ?? {};
}

function imageUrl(card: BarCard, manifest: BarCardManifest) {
  return cardImages(manifest)[card.id]?.[0] ?? (card.image ? `/bar-cards/${card.image}` : "");
}

function cardBackUrl(manifest: BarCardManifest) {
  return manifest.cardBack ?? "";
}

export function BarCardDeck({ cards, manifest, intro }: BarCardDeckProps) {
  const cardMap = useMemo(() => new Map(cards.map((card) => [card.id, card])), [cards]);
  const [leftPile, setLeftPile] = useState(() => cards.slice(1).map((card) => card.id));
  const [rightPile, setRightPile] = useState<string[]>([]);
  const [activeId, setActiveId] = useState(cards[0]?.id ?? "");
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const [cardBackReady, setCardBackReady] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [motion, setMotion] = useState<MotionState>("idle");
  const [mobileActiveIndex, setMobileActiveIndex] = useState(0);
  const [mobileMotion, setMobileMotion] = useState<MobileMotionState>("idle");
  const timers = useRef<number[]>([]);
  const mobileClickLock = useRef(false);
  const mobileSwipeStart = useRef<{ x: number; y: number } | null>(null);
  const activeCard = activeId ? cardMap.get(activeId) : undefined;
  const backSrc = cardBackUrl(manifest);

  useEffect(() => {
    let mounted = true;

    if (backSrc) {
      const backImage = new Image();
      backImage.onload = () => {
        if (mounted) {
          setCardBackReady(true);
        }
      };
      backImage.onerror = () => {
        if (mounted) {
          setCardBackReady(false);
        }
      };
      backImage.src = backSrc;
    } else {
      setCardBackReady(false);
    }

    cards.forEach((card) => {
      const image = new Image();
      const src = imageUrl(card, manifest);

      if (!src) {
        setLoadedImages((state) => ({ ...state, [card.id]: false }));
        return;
      }

      image.onload = () => {
        if (mounted) {
          setLoadedImages((state) => ({ ...state, [card.id]: true }));
        }
      };
      image.onerror = () => {
        if (mounted) {
          setLoadedImages((state) => ({ ...state, [card.id]: false }));
        }
      };
      image.src = src;
    });

    return () => {
      mounted = false;
    };
  }, [backSrc, cards, manifest]);

  useEffect(() => {
    const queuedTimers = timers.current;

    return () => {
      queuedTimers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  useEffect(() => {
    setMobileActiveIndex((index) => (cards.length > 0 ? Math.min(index, cards.length - 1) : 0));
  }, [cards.length]);

  function queueTimer(callback: () => void, delay: number) {
    const timer = window.setTimeout(callback, delay);
    timers.current.push(timer);
  }

  function openNextCocktail() {
    if (isMoving || leftPile.length === 0 || !activeCard) {
      return;
    }

    const [nextCard, ...restLeft] = leftPile;
    const previousCard = activeCard.id;

    setIsMoving(true);
    setMotion("nextLeaving");

    queueTimer(() => {
      setRightPile((currentRight) => [previousCard, ...currentRight]);
      setLeftPile(restLeft);
      setActiveId(nextCard);
      setMotion("nextEntering");
    }, swapMs);

    queueTimer(() => {
      setMotion("idle");
      setIsMoving(false);
    }, animationMs);
  }

  function openPreviousCocktail() {
    if (isMoving || rightPile.length === 0 || !activeCard) {
      return;
    }

    const [previousCard, ...restRight] = rightPile;
    const currentCard = activeCard.id;

    setIsMoving(true);
    setMotion("prevLeaving");

    queueTimer(() => {
      setLeftPile((currentLeft) => [currentCard, ...currentLeft]);
      setRightPile(restRight);
      setActiveId(previousCard);
      setMotion("prevEntering");
    }, swapMs);

    queueTimer(() => {
      setMotion("idle");
      setIsMoving(false);
    }, animationMs);
  }

  function showMobileNext() {
    showMobileCard("next");
  }

  function showMobilePrevious() {
    showMobileCard("previous");
  }

  function handleMobileCardClick() {
    if (mobileClickLock.current) {
      mobileClickLock.current = false;
      return;
    }

    showMobileNext();
  }

  function showMobileCard(direction: Exclude<MobileMotionState, "idle">) {
    if (cards.length <= 1) {
      return;
    }

    setMobileMotion(direction);
    setMobileActiveIndex((index) =>
      direction === "next" ? (index + 1) % cards.length : (index - 1 + cards.length) % cards.length,
    );
    queueTimer(() => {
      setMobileMotion("idle");
    }, 240);
  }

  function handleMobilePointerDown(event: PointerEvent<HTMLElement>) {
    if (!event.isPrimary || (event.pointerType === "mouse" && event.button !== 0)) {
      return;
    }

    mobileSwipeStart.current = {
      x: event.clientX,
      y: event.clientY,
    };
  }

  function handleMobilePointerUp(event: PointerEvent<HTMLElement>) {
    const start = mobileSwipeStart.current;

    if (!start) {
      return;
    }

    mobileSwipeStart.current = null;

    const deltaX = event.clientX - start.x;
    const deltaY = event.clientY - start.y;

    if (Math.abs(deltaX) < 46 || Math.abs(deltaX) < Math.abs(deltaY) * 1.25) {
      return;
    }

    if (deltaX < 0) {
      lockMobileClick();
      showMobileNext();
      return;
    }

    lockMobileClick();
    showMobilePrevious();
  }

  function handleMobilePointerCancel() {
    mobileSwipeStart.current = null;
  }

  function lockMobileClick() {
    mobileClickLock.current = true;
    queueTimer(() => {
      mobileClickLock.current = false;
    }, 260);
  }

  return (
    <section className={styles.section} id="bar-card" aria-labelledby="bar-card-title">
      <div className="container">
        <SectionTitle
          eyebrow="Барная карта"
          id="bar-card-title"
          title="Карточки коктейлей"
          description={intro}
        />
        <div className={styles.board}>
          <CardPile
            ariaLabel="Открыть следующую карточку коктейля"
            cards={leftPile}
            cardMap={cardMap}
            cardBackReady={cardBackReady}
            cardBackSrc={backSrc}
            disabled={leftPile.length === 0 || isMoving}
            isBack
            loadedImages={loadedImages}
            manifest={manifest}
            onClick={openNextCocktail}
          />
          <article className={styles.center} data-motion={motion} aria-live="polite">
            {activeCard ? (
              <>
                <CocktailCard
                  card={activeCard}
                  imageReady={loadedImages[activeCard.id]}
                  imageSrc={imageUrl(activeCard, manifest)}
                  large
                />
                <div className={styles.description}>
                  <h3>{activeCard.title}</h3>
                  <p>{activeCard.description}</p>
                  <ul>
                    {activeCard.notes.map((note) => (
                      <li key={note}>{note}</li>
                    ))}
                  </ul>
                </div>
              </>
            ) : (
              <div className={styles.emptyState}>
                <strong>Барная карта скоро появится.</strong>
              </div>
            )}
          </article>
          <CardPile
            ariaLabel="Вернуть предыдущую карточку коктейля"
            cards={rightPile}
            cardMap={cardMap}
            cardBackReady={cardBackReady}
            cardBackSrc={backSrc}
            disabled={rightPile.length === 0 || isMoving}
            loadedImages={loadedImages}
            manifest={manifest}
            onClick={openPreviousCocktail}
          />
        </div>
        <MobileCardCarousel
          activeIndex={mobileActiveIndex}
          cardBackReady={cardBackReady}
          cardBackSrc={backSrc}
          cards={cards}
          loadedImages={loadedImages}
          manifest={manifest}
          motion={mobileMotion}
          onCardClick={handleMobileCardClick}
          onNext={showMobileNext}
          onPointerCancel={handleMobilePointerCancel}
          onPointerDown={handleMobilePointerDown}
          onPointerUp={handleMobilePointerUp}
          onPrevious={showMobilePrevious}
        />
      </div>
    </section>
  );
}

function MobileCardCarousel({
  activeIndex,
  cardBackReady,
  cardBackSrc,
  cards,
  loadedImages,
  manifest,
  motion,
  onCardClick,
  onNext,
  onPointerCancel,
  onPointerDown,
  onPointerUp,
  onPrevious,
}: {
  activeIndex: number;
  cardBackReady: boolean;
  cardBackSrc: string;
  cards: BarCard[];
  loadedImages: Record<string, boolean>;
  manifest: BarCardManifest;
  motion: MobileMotionState;
  onCardClick: () => void;
  onNext: () => void;
  onPointerCancel: () => void;
  onPointerDown: (event: PointerEvent<HTMLElement>) => void;
  onPointerUp: (event: PointerEvent<HTMLElement>) => void;
  onPrevious: () => void;
}) {
  const activeCard = cards[activeIndex];

  if (!activeCard) {
    return (
      <div className={styles.mobileCarousel}>
        <div className={styles.emptyState}>
          <strong>Барная карта скоро появится.</strong>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.mobileCarousel} aria-label="Мобильная карусель коктейльных карточек">
      <div
        className={styles.mobileStack}
        data-motion={motion}
        onPointerCancel={onPointerCancel}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        <CardBack imageReady={cardBackReady} imageSrc={cardBackSrc} stackIndex={1} />
        <button
          aria-label="Показать следующую карточку"
          className={styles.mobileCardButton}
          onClick={onCardClick}
          type="button"
        >
          <CocktailCard
            card={activeCard}
            imageReady={loadedImages[activeCard.id]}
            imageSrc={imageUrl(activeCard, manifest)}
            large
          />
        </button>
      </div>
      <div className={styles.mobileControls}>
        <button aria-label="Предыдущая карточка" onClick={onPrevious} type="button">
          ←
        </button>
        <span aria-live="polite">
          {activeIndex + 1} / {cards.length}
        </span>
        <button aria-label="Следующая карточка" onClick={onNext} type="button">
          →
        </button>
      </div>
      <article className={styles.mobileDescription} aria-live="polite">
        <h3>{activeCard.title}</h3>
        <p>{activeCard.description}</p>
        <ul>
          {activeCard.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </article>
    </div>
  );
}

function CardPile({
  ariaLabel,
  cards,
  cardMap,
  cardBackReady,
  cardBackSrc,
  disabled,
  isBack = false,
  loadedImages,
  manifest,
  onClick,
}: {
  ariaLabel: string;
  cards: string[];
  cardMap: Map<string, BarCard>;
  cardBackReady: boolean;
  cardBackSrc: string;
  disabled: boolean;
  isBack?: boolean;
  loadedImages: Record<string, boolean>;
  manifest: BarCardManifest;
  onClick?: () => void;
}) {
  const content = cards.slice(0, 5).map((cardId, index) => {
    const card = cardMap.get(cardId);

    if (!card) {
      return null;
    }

    return isBack ? (
      <CardBack imageReady={cardBackReady} imageSrc={cardBackSrc} key={card.id} stackIndex={index} />
    ) : (
      <CocktailCard
        card={card}
        imageReady={loadedImages[card.id]}
        imageSrc={imageUrl(card, manifest)}
        key={card.id}
        stackIndex={index}
      />
    );
  });

  if (!onClick) {
    return (
      <div aria-label={ariaLabel} className={styles.pile} data-empty={cards.length === 0}>
        {content}
      </div>
    );
  }

  return (
    <button
      aria-label={ariaLabel}
      className={styles.pile}
      data-empty={cards.length === 0}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {content}
    </button>
  );
}

function CardBack({
  imageReady,
  imageSrc,
  stackIndex,
}: {
  imageReady: boolean;
  imageSrc: string;
  stackIndex: number;
}) {
  const hasImage = Boolean(imageReady && imageSrc);

  return (
    <span
      aria-hidden="true"
      className={styles.cardBack}
      data-has-image={hasImage}
      style={{ "--i": stackIndex } as CSSProperties}
    >
      {hasImage ? <img alt="" src={imageSrc} /> : <i />}
    </span>
  );
}

function CocktailCard({
  card,
  imageReady,
  imageSrc,
  large = false,
  stackIndex = 0,
}: {
  card: BarCard;
  imageReady?: boolean;
  imageSrc: string;
  large?: boolean;
  stackIndex?: number;
}) {
  return (
    <span
      className={`${styles.cocktailCard} ${large ? styles.largeCard : ""}`}
      style={{ "--i": stackIndex } as CSSProperties}
    >
      {imageReady ? <img alt={card.title} src={imageSrc} /> : <CocktailPlaceholder title={card.title} />}
    </span>
  );
}

function CocktailPlaceholder({ title }: { title: string }) {
  return (
    <span className={styles.cardPlaceholder}>
      <i />
      <strong>{title}</strong>
    </span>
  );
}
