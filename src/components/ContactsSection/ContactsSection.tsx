/* eslint-disable @next/next/no-img-element */

import { SectionTitle } from "@/components/SectionTitle/SectionTitle";
import contacts from "../../../content/contacts.json";
import styles from "./ContactsSection.module.css";

const socialLinks = [
  {
    id: "email",
    ariaLabel: "Написать на почту",
    href: contacts.email.href,
    enabled: true,
    icon: contacts.email.icon,
  },
  ...contacts.socials,
];

export function ContactsSection() {
  return (
    <section className={styles.section} id="contacts" aria-labelledby="contacts-title">
      <div className={`container ${styles.grid}`}>
        <div>
          <SectionTitle
            eyebrow="Контакты"
            id="contacts-title"
            title="Столики, банкеты, музыка и выставки"
            description="Для связи доступны телефон, почта и социальные ссылки."
          />
          <div className={styles.list}>
            <div className={styles.phoneItem}>
              <span>Бронирование и мероприятия</span>
              <div className={styles.phoneLinks}>
                {contacts.phones.map((phone) => (
                  <a href={phone.href} key={phone.href}>
                    {phone.label}
                  </a>
                ))}
              </div>
            </div>
            <a href={contacts.email.href}>
              <span>Email</span>
              <strong>{contacts.email.label}</strong>
            </a>
            <p>
              <span>Адрес</span>
              <strong>{contacts.address}</strong>
            </p>
            <p>
              <span>Часы работы</span>
              <strong>{contacts.hours}</strong>
            </p>
          </div>
          <div className={styles.quick}>
            <a className={styles.textAction} href={contacts.phones[0].href}>
              Позвонить
            </a>
            {socialLinks.map((social) => (
              <a
                aria-disabled={!social.enabled}
                aria-label={social.ariaLabel}
                className={`${styles.iconLink} ${!social.enabled ? styles.disabled : ""}`}
                href={social.href}
                key={social.id}
                tabIndex={!social.enabled ? -1 : undefined}
                title={social.ariaLabel}
              >
                <img alt="" aria-hidden="true" src={social.icon} />
              </a>
            ))}
          </div>
        </div>
        <div className={styles.map}>
          <div>
            <strong>{contacts.address}</strong>
            <a href={contacts.mapLink}>Открыть карту</a>
          </div>
          <iframe
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src={contacts.mapEmbedUrl}
            title="Карта: Санкт-Петербург, улица Пестеля, д. 3"
          />
        </div>
      </div>
    </section>
  );
}
