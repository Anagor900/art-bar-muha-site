"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ExternalLink } from "@/components/ExternalLink/ExternalLink";
import contacts from "../../../content/contacts.json";
import styles from "./ContactModal.module.css";

type ContactModalProps = {
  onClose: () => void;
};

type ContactRowData = {
  caption?: string;
  copyValue?: string;
  external?: boolean;
  href?: string;
  id: string;
  label: string;
  value: string;
};

export function ContactModal({ onClose }: ContactModalProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const copyTimeoutRef = useRef<number | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const telegram = contacts.socials.find((social) => social.id === "telegram");
  const vk = contacts.socials.find((social) => social.id === "vk");
  const max = contacts.socials.find((social) => social.id === "max");
  const rows: ContactRowData[] = [
    {
      caption: "Мария, арт-директор",
      copyValue: contacts.phones[0].label,
      href: contacts.phones[0].href,
      id: "phone",
      label: "Телефон",
      value: contacts.phones[0].label,
    },
    {
      copyValue: contacts.email.label,
      href: contacts.email.href,
      id: "email",
      label: "Email",
      value: contacts.email.label,
    },
    getSocialRow("telegram", "Telegram", telegram),
    getSocialRow("vk", "VK", vk),
    getSocialRow("max", "MAX", max),
  ];

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
      if (copyTimeoutRef.current !== null) {
        window.clearTimeout(copyTimeoutRef.current);
      }
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  async function handleCopy(id: string, value: string) {
    await copyText(value);

    if (copyTimeoutRef.current !== null) {
      window.clearTimeout(copyTimeoutRef.current);
    }

    setCopiedId(id);
    copyTimeoutRef.current = window.setTimeout(() => {
      setCopiedId(null);
      copyTimeoutRef.current = null;
    }, 1600);
  }

  return createPortal(
    <div
      aria-labelledby="contact-modal-title"
      aria-modal="true"
      className={styles.overlay}
      onClick={onClose}
      role="dialog"
    >
      <div className={styles.panel} onClick={(event) => event.stopPropagation()} ref={panelRef} tabIndex={-1}>
        <header className={styles.header}>
          <div className={styles.headingGroup}>
            <h2 id="contact-modal-title">Связаться с нами</h2>
            <p>Столики, банкеты, музыка и выставки.</p>
          </div>
          <button aria-label="Закрыть контакты" onClick={onClose} type="button">
            Закрыть
          </button>
        </header>

        <article className={styles.document}>
          <div className={styles.documentInner}>
            <div className={styles.contactGrid}>
              {rows.map((row) => (
                <ContactRow copied={copiedId === row.id} key={row.id} onCopy={handleCopy} row={row} />
              ))}
            </div>
          </div>
        </article>
      </div>
    </div>,
    document.body,
  );
}

function ContactRow({
  copied,
  onCopy,
  row,
}: {
  copied: boolean;
  onCopy: (id: string, value: string) => void;
  row: ContactRowData;
}) {
  const copyValue = row.copyValue;

  return (
    <div className={styles.contactRow}>
      <span>{row.label}</span>
      <div className={styles.contactValue}>
        <ContactValue row={row} />
        {row.caption ? <small>{row.caption}</small> : null}
      </div>
      {copyValue ? (
        <button className={styles.copyButton} onClick={() => onCopy(row.id, copyValue)} type="button">
          {copied ? "Скопировано" : "Скопировать"}
        </button>
      ) : null}
    </div>
  );
}

function ContactValue({ row }: { row: ContactRowData }) {
  if (!row.href) {
    return <span className={styles.placeholder}>{row.value}</span>;
  }

  if (row.external) {
    return <ExternalLink href={row.href}>{row.value}</ExternalLink>;
  }

  return <a href={row.href}>{row.value}</a>;
}

function getSocialRow(
  id: string,
  label: string,
  social?: {
    enabled?: boolean;
    href?: string;
  },
): ContactRowData {
  const href = social?.href;

  if (!social || !social.enabled || !isRealContactLink(href)) {
    return {
      id,
      label,
      value: "Пока не указан",
    };
  }

  return {
    copyValue: href,
    external: true,
    href,
    id,
    label,
    value: href,
  };
}

function isRealContactLink(href?: string): href is string {
  return Boolean(href && href.trim() && href !== "#contacts");
}

async function copyText(value: string) {
  try {
    if (navigator.clipboard?.writeText && window.isSecureContext) {
      await navigator.clipboard.writeText(value);
      return true;
    }

    return copyTextFallback(value);
  } catch {
    return copyTextFallback(value);
  }
}

function copyTextFallback(value: string) {
  let textArea: HTMLTextAreaElement | null = null;

  try {
    textArea = document.createElement("textarea");

    textArea.value = value;
    textArea.setAttribute("readonly", "");
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "0";
    document.body.appendChild(textArea);
    textArea.select();

    const copied = document.execCommand("copy");

    return copied;
  } catch {
    return false;
  } finally {
    textArea?.remove();
  }
}
