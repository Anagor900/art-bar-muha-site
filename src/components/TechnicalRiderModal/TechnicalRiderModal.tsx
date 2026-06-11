"use client";

import { useEffect, useRef } from "react";
import rider from "../../../content/technical-rider.json";
import styles from "./TechnicalRiderModal.module.css";

type TechnicalRiderModalProps = {
  downloadFileName: string;
  downloadHref: string;
  onClose: () => void;
};

export function TechnicalRiderModal({ downloadFileName, downloadHref, onClose }: TechnicalRiderModalProps) {
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
      aria-labelledby="technical-rider-modal-title"
      aria-modal="true"
      className={styles.overlay}
      onClick={onClose}
      role="dialog"
    >
      <div className={styles.panel} onClick={(event) => event.stopPropagation()} ref={panelRef} tabIndex={-1}>
        <header className={styles.header}>
          <div className={styles.headingGroup}>
            <span>Документы</span>
            <h2 id="technical-rider-modal-title">{rider.title}</h2>
            <p>{rider.subtitle}</p>
          </div>
          <div className={styles.actions}>
            <a download={downloadFileName} href={downloadHref}>
              Скачать
            </a>
            <button aria-label="Закрыть технический райдер" onClick={onClose} type="button">
              Закрыть
            </button>
          </div>
        </header>

        <article className={styles.document}>
          <div className={styles.documentInner}>
            <p className={styles.note}>{rider.note}</p>
            {rider.sections.map((section) => (
              <section className={styles.riderSection} key={section.title}>
                <h3>{section.title}</h3>
                <div className={styles.tableWrap}>
                  <table>
                    <thead>
                      <tr>
                        <th scope="col">Позиция</th>
                        <th scope="col">Количество</th>
                        <th scope="col">Характеристики</th>
                      </tr>
                    </thead>
                    <tbody>
                      {section.items.map((item) => (
                        <tr key={`${section.title}-${item.position}`}>
                          <td>{item.position}</td>
                          <td>{item.quantity}</td>
                          <td>{item.details}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className={styles.mobileCards}>
                  {section.items.map((item) => (
                    <article className={styles.equipmentCard} key={`${section.title}-${item.position}`}>
                      <h4>{item.position}</h4>
                      <dl>
                        {item.quantity ? (
                          <div>
                            <dt>Количество</dt>
                            <dd>{item.quantity}</dd>
                          </div>
                        ) : null}
                        {item.details ? (
                          <div>
                            <dt>Характеристики</dt>
                            <dd>{item.details}</dd>
                          </div>
                        ) : null}
                      </dl>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}
