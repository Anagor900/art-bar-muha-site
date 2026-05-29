import { AfishaSection } from "@/components/AfishaSection/AfishaSection";
import { BarCardDeck } from "@/components/BarCardDeck/BarCardDeck";
import { ContactsSection } from "@/components/ContactsSection/ContactsSection";
import { ExhibitionSection } from "@/components/ExhibitionSection/ExhibitionSection";
import { Footer } from "@/components/Footer/Footer";
import { Header } from "@/components/Header/Header";
import { Hero } from "@/components/Hero/Hero";
import { JsonLd } from "@/components/JsonLd/JsonLd";
import { MenuSection } from "@/components/MenuSection/MenuSection";
import { ProjectStrips } from "@/components/ProjectStrips/ProjectStrips";
import { SectionTitle } from "@/components/SectionTitle/SectionTitle";
import { ServicesSection } from "@/components/ServicesSection/ServicesSection";
import { getTextSections } from "@/lib/textSections";
import barCards from "../../content/bar-cards.json";
import contacts from "../../content/contacts.json";
import menu from "../../content/menu.json";
import meta from "../../content/site-meta.json";
import barCardManifest from "../generated/bar-card-manifest.json";
import styles from "./page.module.css";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: meta.siteName,
  url: meta.siteUrl,
  email: contacts.email.label,
  telephone: contacts.phones.map((phone) => phone.label),
  address: {
    "@type": "PostalAddress",
    streetAddress: "улица Пестеля, д. 3",
    addressLocality: "Санкт-Петербург",
    addressCountry: "RU",
  },
  servesCuisine: ["Авторская кухня", "Европейская кухня", "Бар"],
  openingHours: "Mo-Su 09:00-23:00",
};

export default function Home() {
  const texts = getTextSections();

  return (
    <>
      <Header />
      <main>
        <Hero title={texts.main[0]} description={texts.main[1]} />
        <ProjectStrips />
        <section className={styles.about} id="about" aria-labelledby="about-title">
          <div className={`container ${styles.aboutGrid}`}>
            <div>
              <SectionTitle
                eyebrow="О нас"
                id="about-title"
                title="Кухня, музыка и картины у Летнего сада"
                description={texts.about[0]}
              />
              <div className={styles.aboutText}>
                {texts.about.slice(1).map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>
            <div className={styles.aboutVisual} aria-label="Арт-коллаж МУХИ">
              <span />
              <span />
              <span />
            </div>
          </div>
        </section>
        <MenuSection pages={menu.pages} text={texts.menu[0]} />
        <BarCardDeck cards={barCards} manifest={barCardManifest} intro={texts.bar[0]} />
        <AfishaSection />
        <ExhibitionSection />
        <ServicesSection />
        <ContactsSection />
        <JsonLd data={jsonLd} />
      </main>
      <Footer />
    </>
  );
}
