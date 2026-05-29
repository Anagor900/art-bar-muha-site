"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { SectionTitle } from "@/components/SectionTitle/SectionTitle";
import styles from "./BarCardDeck.module.css";

export type BarCard = {
  id: string;
  title: string;
  image: string;
  description: string;
  notes: string[];
};

type BarCardDeckProps = {
  cards: BarCard[];
  manifest: Record<string, string[]>;
  intro: string;
};

type MotionState = "idle" | "nextLeaving" | "nextEntering" | "prevLeaving" | "prevEntering";

const animationMs = 680;
const swapMs = 330;

function imageUrl(card: BarCard, manifest: Record<string, string[]>) {
  return manifest[card.id]?.[0] ?? `/bar-cards/${card.image}`;
}

export function BarCardDeck({ cards, manifest, intro }: BarCardDeckProps) {
  const cardMap = useMemo(() => new Map(cards.map((card) => [card.id, card])), [cards]);
  const [leftPile, setLeftPile] = useState(() => cards.slice(1).map((card) => card.id));
  const [rightPile, setRightPile] = useState<string[]>([]);
  const [activeId, setActiveId] = useState(cards[0]?.id ?? "");
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const [isMoving, setIsMoving] = useState(false);
  const [motion, setMotion] = useState<MotionState>("idle");
  const timers = useRef<number[]>([]);
  const activeCard = activeId ? cardMap.get(activeId) : undefined;

  useEffect(() => {
    let mounted = true;

    cards.forEach((card) => {
      const image = new Image();
      const src = imageUrl(card, manifest);

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
  }, [cards, manifest]);

  useEffect(() => {
    const queuedTimers = timers.current;

    return () => {
      queuedTimers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

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
            disabled={rightPile.length === 0 || isMoving}
            loadedImages={loadedImages}
            manifest={manifest}
            onClick={openPreviousCocktail}
          />
        </div>
      </div>
    </section>
  );
}

function CardPile({
  ariaLabel,
  cards,
  cardMap,
  disabled,
  isBack = false,
  loadedImages,
  manifest,
  onClick,
}: {
  ariaLabel: string;
  cards: string[];
  cardMap: Map<string, BarCard>;
  disabled: boolean;
  isBack?: boolean;
  loadedImages: Record<string, boolean>;
  manifest: Record<string, string[]>;
  onClick?: () => void;
}) {
  const content = cards.slice(0, 5).map((cardId, index) => {
    const card = cardMap.get(cardId);

    if (!card) {
      return null;
    }

    return isBack ? (
      <span
        aria-hidden="true"
        className={styles.cardBack}
        key={card.id}
        style={{ "--i": index } as CSSProperties}
      >
        <i />
      </span>
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
