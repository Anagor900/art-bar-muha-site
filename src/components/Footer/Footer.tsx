import contacts from "../../../content/contacts.json";
import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <p>© Арт-Ресто-Бар «МУХА», 2026</p>
        <span>{contacts.organizationName}</span>
        <a href="/privacy">Политика обработки персональных данных</a>
      </div>
    </footer>
  );
}
