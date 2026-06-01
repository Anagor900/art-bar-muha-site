"use client";

/* eslint-disable @next/next/no-img-element */

import { useRef, useState } from "react";
import type { MouseEvent } from "react";
import contacts from "../../../content/contacts.json";
import meta from "../../../content/site-meta.json";
import styles from "./Header.module.css";

const navItems = [
  { label: "О НАС", href: "#about" },
  { label: "МЕНЮ", href: "#menu" },
  { label: "БАРНАЯ КАРТА", href: "#bar-card" },
  { label: "АФИША", href: "#afisha-gallery" },
  { label: "ВЫСТАВКА", href: "#exhibition" },
  { label: "УСЛУГИ", href: "#services" },
];

const socialLinks = [
  ...contacts.socials,
  {
    id: "email",
    label: "Email",
    ariaLabel: "Написать на почту",
    href: contacts.email.href,
    enabled: true,
    icon: contacts.email.icon,
  },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  function handleAnchorClick(event: MouseEvent<HTMLAnchorElement>, href: string) {
    if (!href.startsWith("#") || href === "#") {
      return;
    }

    const target = document.getElementById(href.slice(1));

    if (!target) {
      return;
    }

    event.preventDefault();
    setOpen(false);

    window.requestAnimationFrame(() => {
      const headerRow = headerRef.current?.querySelector(`.${styles.inner}`);
      const headerHeight =
        headerRow instanceof HTMLElement
          ? headerRow.getBoundingClientRect().height
          : (headerRef.current?.getBoundingClientRect().height ?? 0);
      const safeGap =
        Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-safe-gap")) || 20;
      const top =
        href === "#top"
          ? 0
          : Math.max(0, window.scrollY + target.getBoundingClientRect().top - headerHeight - safeGap);

      window.scrollTo({ top, behavior: "smooth" });
      window.history.pushState(null, "", href);
    });
  }

  return (
    <header className={styles.header} id="top" ref={headerRef}>
      <div className={`container ${styles.inner}`}>
        <a className={styles.brand} href="#top" aria-label="Арт-Ресто-Бар МУХА">
          <img className={styles.logo} alt="" aria-hidden="true" src={meta.logoImage} />
          <span>Арт-Ресто-Бар «МУХА»</span>
        </a>
        <nav aria-label="Основная навигация" className={styles.navigation}>
          {navItems.map((item) => (
            <a href={item.href} key={item.href} onClick={(event) => handleAnchorClick(event, item.href)}>
              {item.label}
            </a>
          ))}
        </nav>
        <div className={styles.headerContacts}>
          <SocialIcons />
          <div className={styles.phones}>
            {contacts.phones.map((phone) => (
              <a href={phone.href} key={phone.href}>
                {phone.label}
              </a>
            ))}
          </div>
        </div>
        <button
          aria-controls="main-navigation"
          aria-expanded={open}
          aria-label={open ? "Закрыть меню" : "Открыть меню"}
          className={styles.menuButton}
          onClick={() => setOpen((value) => !value)}
          type="button"
        >
          <span />
          <span />
        </button>
      </div>
      <div className={`container ${styles.mobilePanel}`} data-open={open} id="main-navigation">
        <nav aria-label="Основная навигация">
          {navItems.map((item) => (
            <a href={item.href} key={item.href} onClick={(event) => handleAnchorClick(event, item.href)}>
              {item.label}
            </a>
          ))}
        </nav>
        <div className={styles.mobileContacts}>
          <div className={styles.phones}>
            {contacts.phones.map((phone) => (
              <a href={phone.href} key={phone.href}>
                {phone.label}
              </a>
            ))}
          </div>
          <SocialIcons />
        </div>
      </div>
    </header>
  );
}

function SocialIcons() {
  return (
    <div className={styles.socials} aria-label="Социальные ссылки">
      {socialLinks.map((social) => (
        <a
          aria-disabled={!social.enabled}
          aria-label={social.ariaLabel}
          className={!social.enabled ? styles.disabled : undefined}
          href={social.href}
          key={social.id}
          tabIndex={!social.enabled ? -1 : undefined}
          title={social.ariaLabel}
        >
          <img alt="" aria-hidden="true" src={social.icon} />
        </a>
      ))}
    </div>
  );
}
