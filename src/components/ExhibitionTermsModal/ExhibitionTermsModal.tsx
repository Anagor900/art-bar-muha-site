"use client";

import { useEffect, useRef } from "react";
import terms from "../../../content/exhibition-terms.json";
import styles from "./ExhibitionTermsModal.module.css";

type ExhibitionTermsModalProps = {
  onClose: () => void;
};

export function ExhibitionTermsModal({ onClose }: ExhibitionTermsModalProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

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
    };
  }, [onClose]);

  return (
    <div
      aria-labelledby="exhibition-terms-modal-title"
      aria-modal="true"
      className={styles.overlay}
      onClick={onClose}
      role="dialog"
    >
      <div className={styles.panel} onClick={(event) => event.stopPropagation()} ref={panelRef} tabIndex={-1}>
        <header className={styles.header}>
          <div className={styles.headingGroup}>
            <span>Выставки</span>
            <h2 id="exhibition-terms-modal-title">{terms.title}</h2>
            <p>{terms.subtitle}</p>
          </div>
          <button aria-label="Закрыть условия выставки" onClick={onClose} type="button">
            Закрыть
          </button>
        </header>

        <article className={styles.document}>
          <div className={styles.documentInner}>
            <div className={styles.intro}>
              {terms.intro.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            <section className={styles.termsBlock}>
              <h3>Условия</h3>
              <ul>
                {terms.terms.map((term) => (
                  <li key={term}>{term}</li>
                ))}
              </ul>
            </section>

            <p className={styles.note}>{terms.note}</p>
          </div>
        </article>
      </div>
    </div>
  );
}
