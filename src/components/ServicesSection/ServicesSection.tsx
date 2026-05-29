import { SectionTitle } from "@/components/SectionTitle/SectionTitle";
import contacts from "../../../content/contacts.json";
import downloads from "../../../content/downloads.json";
import services from "../../../content/services.json";
import styles from "./ServicesSection.module.css";

export function ServicesSection() {
  return (
    <section className={styles.section} id="services" aria-labelledby="services-title">
      <div className="container">
        <SectionTitle
          eyebrow="Услуги"
          id="services-title"
          title="Банкеты, выставки и мероприятия"
          description="Арт-Ресто-Бар «МУХА» предоставляет широкий спектр услуг."
        />
        <div className={styles.cards}>
          {services.map((service) => (
            <article className={styles.card} key={service.title}>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <a href={contacts.phones[0].href}>{service.cta}</a>
            </article>
          ))}
        </div>
        <div className={styles.downloads} aria-label="Документы">
          {downloads.map((download) => (
            <div key={download.title}>
              <span>{download.title}</span>
              {download.file ? <a href={download.file}>Скачать</a> : <em>{download.status}</em>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
