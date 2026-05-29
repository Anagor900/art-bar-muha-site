"use client";

import { useState } from "react";
import contacts from "../../../content/contacts.json";
import styles from "./Header.module.css";

const navItems = [
  { label: "О НАС", href: "#about" },
  { label: "МЕНЮ", href: "#menu" },
  { label: "БАРНАЯ КАРТА", href: "#bar-card" },
  { label: "АФИША", href: "#afisha" },
  { label: "ВЫСТАВКА", href: "#exhibition" },
  { label: "УСЛУГИ", href: "#services" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className={styles.header} id="top">
      <div className={styles.contactBand}>
        <div className={`container ${styles.contactInner}`}>
          <div className={styles.socials} aria-label="Социальные ссылки">
            {contacts.socials.map((social) => (
              <a
                aria-disabled={!social.enabled}
                aria-label={social.ariaLabel}
                className={!social.enabled ? styles.disabled : undefined}
                href={social.href}
                key={social.id}
                title={social.ariaLabel}
              >
                {social.label}
              </a>
            ))}
            <a aria-label="Написать на почту" href={contacts.email.href} title="Почта">
              @
            </a>
          </div>
          <div className={styles.quickContacts}>
            {contacts.phones.map((phone) => (
              <a href={phone.href} key={phone.href}>
                {phone.label}
              </a>
            ))}
            <span>{contacts.address}</span>
          </div>
        </div>
      </div>
      <div className={`container ${styles.mainRow}`}>
        <a className={styles.brand} href="#top" aria-label="Арт-Ресто-Бар МУХА">
          <span className={styles.mark} aria-hidden="true" />
          <span>Арт-Ресто-Бар «МУХА»</span>
        </a>
        <button
          aria-controls="main-navigation"
          aria-expanded={open}
          aria-label="Открыть меню"
          className={styles.menuButton}
          onClick={() => setOpen((value) => !value)}
          type="button"
        >
          <span />
          <span />
        </button>
        <nav
          aria-label="Основная навигация"
          className={styles.navigation}
          data-open={open}
          id="main-navigation"
        >
          {navItems.map((item) => (
            <a href={item.href} key={item.href} onClick={() => setOpen(false)}>
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
