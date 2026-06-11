"use client";

import { useRef, useState, type MouseEvent } from "react";
import { ContactModal } from "@/components/ContactModal/ContactModal";
import contacts from "../../../content/contacts.json";
import buttonStyles from "../ButtonLink/ButtonLink.module.css";

type ContactActionProps = {
  children: React.ReactNode;
  className?: string;
  tone?: "solid" | "quiet";
};

export function ContactAction({ children, className, tone = "solid" }: ContactActionProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const actionRef = useRef<HTMLAnchorElement | null>(null);
  const href = contacts.phones[0].href;

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (shouldCallDirectly()) {
      return;
    }

    event.preventDefault();
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    window.setTimeout(() => {
      actionRef.current?.focus();
    }, 0);
  }

  return (
    <>
      <a
        className={className ?? `${buttonStyles.button} ${buttonStyles[tone]}`}
        href={href}
        onClick={handleClick}
        ref={actionRef}
      >
        {children}
      </a>
      {modalOpen ? <ContactModal onClose={closeModal} /> : null}
    </>
  );
}

function shouldCallDirectly() {
  if (typeof window === "undefined") {
    return false;
  }

  const coarsePointer = window.matchMedia?.("(pointer: coarse)").matches ?? false;
  const touchPoints = navigator.maxTouchPoints ?? 0;
  const compactWidth = window.innerWidth <= 820;

  return compactWidth && (coarsePointer || touchPoints > 0);
}
