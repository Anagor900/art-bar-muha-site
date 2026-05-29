import styles from "./SectionTitle.module.css";

type SectionTitleProps = {
  eyebrow?: string;
  id?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
};

export function SectionTitle({
  eyebrow,
  id,
  title,
  description,
  align = "left",
}: SectionTitleProps) {
  return (
    <div className={`${styles.titleBlock} ${styles[align]}`}>
      {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
      <h2 id={id}>{title}</h2>
      {description ? <p className={styles.description}>{description}</p> : null}
    </div>
  );
}
