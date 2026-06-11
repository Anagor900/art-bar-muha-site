"use client";

import { useCallback, useRef, useState } from "react";
import { BanquetMenuModal } from "@/components/BanquetMenuModal/BanquetMenuModal";
import { ContactAction } from "@/components/ContactAction/ContactAction";
import { ExhibitionTermsModal } from "@/components/ExhibitionTermsModal/ExhibitionTermsModal";
import { SectionTitle } from "@/components/SectionTitle/SectionTitle";
import { TechnicalRiderModal } from "@/components/TechnicalRiderModal/TechnicalRiderModal";
import { ZoomableImageViewer } from "@/components/ZoomableImageViewer/ZoomableImageViewer";
import downloads from "../../../content/downloads.json";
import services from "../../../content/services.json";
import styles from "./ServicesSection.module.css";

const HALL_PLAN_FILE = "/downloads/hall-plan.png";
const HALL_PLAN_DOWNLOAD_FILE_NAME = "plan-zalov-art-bar-muha.png";
const BANQUET_MENU_FILE = "/downloads/MUHA_Banquet_Menu.xlsx";
const TECHNICAL_RIDER_FILE = "/downloads/teh_rayder_muha_red.docx";
const TECHNICAL_RIDER_DOWNLOAD_FILE_NAME = "teh-rayder-art-bar-muha.docx";

export function ServicesSection() {
  const [banquetMenuOpen, setBanquetMenuOpen] = useState(false);
  const [hallPlanOpen, setHallPlanOpen] = useState(false);
  const [exhibitionTermsOpen, setExhibitionTermsOpen] = useState(false);
  const [technicalRiderOpen, setTechnicalRiderOpen] = useState(false);
  const banquetMenuButtonRef = useRef<HTMLButtonElement | null>(null);
  const hallPlanButtonRef = useRef<HTMLButtonElement | null>(null);
  const exhibitionTermsButtonRef = useRef<HTMLButtonElement | null>(null);
  const technicalRiderButtonRef = useRef<HTMLButtonElement | null>(null);

  const closeBanquetMenu = useCallback(() => {
    setBanquetMenuOpen(false);
    window.setTimeout(() => {
      banquetMenuButtonRef.current?.focus();
    }, 0);
  }, []);

  const closeHallPlan = useCallback(() => {
    setHallPlanOpen(false);
    window.setTimeout(() => {
      hallPlanButtonRef.current?.focus();
    }, 0);
  }, []);

  const closeExhibitionTerms = useCallback(() => {
    setExhibitionTermsOpen(false);
    window.setTimeout(() => {
      exhibitionTermsButtonRef.current?.focus();
    }, 0);
  }, []);

  const closeTechnicalRider = useCallback(() => {
    setTechnicalRiderOpen(false);
    window.setTimeout(() => {
      technicalRiderButtonRef.current?.focus();
    }, 0);
  }, []);

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
              <ContactAction>{service.cta}</ContactAction>
            </article>
          ))}
        </div>
        <div className={styles.downloads} aria-label="Документы">
          {downloads.map((download) => {
            const isBanquetMenu = download.file === BANQUET_MENU_FILE;
            const isHallPlan = download.file === HALL_PLAN_FILE;
            const isExhibitionTerms = download.title === "Базовые условия участия в выставках Арт-Ресто-Бара «МУХА»";
            const isTechnicalRider = download.file === TECHNICAL_RIDER_FILE;

            return (
              <div key={download.title}>
                <span>{download.title}</span>
                {isBanquetMenu ? (
                  <button
                    aria-label="Открыть банкетное меню"
                    className={styles.documentButton}
                    onClick={() => setBanquetMenuOpen(true)}
                    ref={banquetMenuButtonRef}
                    type="button"
                  >
                    Банкетное меню
                  </button>
                ) : isHallPlan ? (
                  <button
                    aria-label="Открыть план залов"
                    className={styles.documentButton}
                    onClick={() => setHallPlanOpen(true)}
                    ref={hallPlanButtonRef}
                    type="button"
                  >
                    План залов
                  </button>
                ) : isExhibitionTerms ? (
                  <button
                    aria-label="Открыть условия выставки"
                    className={styles.documentButton}
                    onClick={() => setExhibitionTermsOpen(true)}
                    ref={exhibitionTermsButtonRef}
                    type="button"
                  >
                    Условия выставки
                  </button>
                ) : isTechnicalRider ? (
                  <button
                    aria-label="Открыть технический райдер"
                    className={styles.documentButton}
                    onClick={() => setTechnicalRiderOpen(true)}
                    ref={technicalRiderButtonRef}
                    type="button"
                  >
                    Технический райдер
                  </button>
                ) : download.file ? (
                  <a href={download.file}>Скачать</a>
                ) : (
                  <em>{download.status}</em>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {hallPlanOpen ? (
        <ZoomableImageViewer
          alt="План залов Арт-Ресто-Бара МУХА"
          downloadFileName={HALL_PLAN_DOWNLOAD_FILE_NAME}
          downloadHref={HALL_PLAN_FILE}
          eyebrow="Документы"
          onClose={closeHallPlan}
          showDownload
          src={HALL_PLAN_FILE}
          subtitle="Арт-Ресто-Бар МУХА"
          title="План залов"
          variant="document"
        />
      ) : null}

      {banquetMenuOpen ? <BanquetMenuModal onClose={closeBanquetMenu} /> : null}

      {exhibitionTermsOpen ? <ExhibitionTermsModal onClose={closeExhibitionTerms} /> : null}

      {technicalRiderOpen ? (
        <TechnicalRiderModal
          downloadFileName={TECHNICAL_RIDER_DOWNLOAD_FILE_NAME}
          downloadHref={TECHNICAL_RIDER_FILE}
          onClose={closeTechnicalRider}
        />
      ) : null}
    </section>
  );
}
