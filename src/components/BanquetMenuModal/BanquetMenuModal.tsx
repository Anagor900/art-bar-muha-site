"use client";

import { useEffect, useRef } from "react";
import banquetMenu from "@/generated/banquet-menu.json";
import styles from "./BanquetMenuModal.module.css";

type BanquetMenuModalProps = {
  onClose: () => void;
};

export function BanquetMenuModal({ onClose }: BanquetMenuModalProps) {
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
      aria-labelledby="banquet-menu-modal-title"
      aria-modal="true"
      className={styles.overlay}
      onClick={onClose}
      role="dialog"
    >
      <div className={styles.panel} onClick={(event) => event.stopPropagation()} ref={panelRef} tabIndex={-1}>
        <header className={styles.header}>
          <div className={styles.headingGroup}>
            <span>Меню</span>
            <h2 id="banquet-menu-modal-title">{banquetMenu.title}</h2>
            <p>{banquetMenu.subtitle}</p>
          </div>
          <div className={styles.actions}>
            <a download={banquetMenu.downloadFileName} href={banquetMenu.sourceFile}>
              Скачать
            </a>
            <button aria-label="Закрыть банкетное меню" onClick={onClose} type="button">
              Закрыть
            </button>
          </div>
        </header>

        <article className={styles.document}>
          <div className={styles.documentInner}>
            {banquetMenu.sections.map((section) => (
              <section className={styles.menuSection} key={section.title}>
                <h3>{section.title}</h3>
                <div className={styles.tableWrap}>
                  <table>
                    <thead>
                      <tr>
                        <th scope="col">{banquetMenu.columns.name}</th>
                        <th scope="col">{banquetMenu.columns.weight}</th>
                        <th scope="col">{banquetMenu.columns.minimum}</th>
                        <th scope="col">{banquetMenu.columns.price}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {section.items.map((item) => (
                        <tr key={`${section.title}-${item.name}`}>
                          <td>{item.name}</td>
                          <td>{item.weight}</td>
                          <td>{item.minimum}</td>
                          <td>{item.price}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className={styles.mobileCards}>
                  {section.items.map((item) => (
                    <article className={styles.mobileDishCard} key={`${section.title}-${item.name}`}>
                      <h4>{item.name}</h4>
                      <dl>
                        <div>
                          <dt>{banquetMenu.columns.weight}</dt>
                          <dd>{formatCellValue(item.weight)}</dd>
                        </div>
                        <div>
                          <dt>{banquetMenu.columns.minimum}</dt>
                          <dd>{formatCellValue(item.minimum)}</dd>
                        </div>
                        <div className={styles.priceMeta}>
                          <dt>{banquetMenu.columns.price}</dt>
                          <dd>{formatCellValue(item.price)}</dd>
                        </div>
                      </dl>
                    </article>
                  ))}
                </div>
              </section>
            ))}

            {banquetMenu.extras.length > 0 ? (
              <section className={styles.extras}>
                <h3>Дополнительно</h3>
                <dl>
                  {banquetMenu.extras.map((extra) => (
                    <div key={extra.label}>
                      <dt>{extra.label}</dt>
                      <dd>{extra.value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            ) : null}
          </div>
        </article>
      </div>
    </div>
  );
}

function formatCellValue(value: string) {
  return value.trim() || "—";
}
