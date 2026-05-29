import { Footer } from "@/components/Footer/Footer";
import { Header } from "@/components/Header/Header";
import contacts from "../../../content/contacts.json";
import styles from "./page.module.css";

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className={styles.page}>
        <article className={`container ${styles.article}`}>
          <p className={styles.kicker}>Политика обработки персональных данных</p>
          <h1>Политика обработки персональных данных</h1>
          <p>
            Настоящая политика описывает базовые правила обработки персональных данных
            посетителей сайта Арт-Ресто-Бара «МУХА». На сайте нет форм отправки данных:
            для связи используются телефонные, почтовые и социальные ссылки.
          </p>
          <h2>Оператор</h2>
          <p>{contacts.organizationName}</p>
          <h2>Какие данные могут обрабатываться</h2>
          <p>
            При обращении по телефону, электронной почте или через социальные сети могут
            обрабатываться имя, контактный телефон, адрес электронной почты и содержание
            обращения, если посетитель передает их самостоятельно.
          </p>
          <h2>Цели обработки</h2>
          <p>
            Данные используются для ответа на обращения, бронирования столиков, обсуждения
            банкетов, музыкальных мероприятий, выставок и других запросов, связанных с
            работой арт-ресто-бара.
          </p>
          <h2>Контакты</h2>
          <p>
            По вопросам обработки персональных данных можно написать на{" "}
            <a href={contacts.email.href}>{contacts.email.label}</a> или позвонить по
            телефону <a href={contacts.phones[0].href}>{contacts.phones[0].label}</a>.
          </p>
        </article>
      </main>
      <Footer />
    </>
  );
}
