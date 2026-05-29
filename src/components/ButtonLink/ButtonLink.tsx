import styles from "./ButtonLink.module.css";

type ButtonLinkProps = {
  children: React.ReactNode;
  href: string;
  tone?: "solid" | "quiet";
};

export function ButtonLink({ children, href, tone = "solid" }: ButtonLinkProps) {
  return (
    <a className={`${styles.button} ${styles[tone]}`} href={href}>
      {children}
    </a>
  );
}
