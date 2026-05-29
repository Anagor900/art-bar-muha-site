import { SectionTitle } from "@/components/SectionTitle/SectionTitle";
import contacts from "../../../content/contacts.json";
import styles from "./ContactsSection.module.css";

export function ContactsSection() {
  return (
    <section className={styles.section} id="contacts" aria-labelledby="contacts-title">
      <div className={`container ${styles.grid}`}>
        <div>
          <SectionTitle
            eyebrow="Контакты"
            id="contacts-title"
            title="Столики, банкеты, музыка и выставки"
            description="Для связи доступны телефон, почта, VK и будущие социальные каналы."
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
            <a href={contacts.phones[0].href}>Позвонить</a>
            <a href={contacts.email.href}>Написать на почту</a>
            {contacts.socials.map((social) => (
              <a
                aria-disabled={!social.enabled}
                className={!social.enabled ? styles.disabled : undefined}
                href={social.href}
                key={social.id}
              >
                {social.label}
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
