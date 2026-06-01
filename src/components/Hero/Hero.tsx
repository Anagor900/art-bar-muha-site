/* eslint-disable @next/next/no-img-element */

import { ButtonLink } from "@/components/ButtonLink/ButtonLink";
import contacts from "../../../content/contacts.json";
import meta from "../../../content/site-meta.json";
import styles from "./Hero.module.css";

type HeroProps = {
  title: string;
  description: string;
};

const hasHeroImage = Boolean(meta.heroImage && meta.heroImage.startsWith("/"));

const heroStyle = hasHeroImage
  ? ({ "--hero-image": `url("${meta.heroImage}")` } as React.CSSProperties)
  : undefined;

export function Hero({ title, description }: HeroProps) {
  return (
    <section className={styles.hero} aria-labelledby="hero-title" style={heroStyle}>
      <div className={styles.stage} data-has-image={hasHeroImage ? "true" : undefined} aria-hidden="true">
        <div className={styles.facade}>
          <span />
          <span />
          <span />
        </div>
      </div>
      <div className={`container ${styles.content}`}>
        <div className={styles.logoWrap}>
          <img alt="Логотип Арт-Ресто-Бара МУХА" src={meta.logoImage} />
        </div>
        <div className={styles.copy}>
          <h1 id="hero-title">{title}</h1>
          <p className={styles.description}>{description}</p>
          <div className={styles.metaRow}>
            <strong>{contacts.hours}</strong>
            <span>Живая музыка · картины · домашние настойки</span>
          </div>
          <div className={styles.actions}>
            <ButtonLink href="#contacts">Связаться с нами</ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
