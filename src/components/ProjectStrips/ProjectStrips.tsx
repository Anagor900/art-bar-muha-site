"use client";

import type { PointerEvent } from "react";
import projects from "../../../content/projects.json";
import styles from "./ProjectStrips.module.css";

function canAnimate() {
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function ProjectStrips() {
  function handlePointerMove(event: PointerEvent<HTMLAnchorElement>) {
    if (!canAnimate()) {
      return;
    }

    const strip = event.currentTarget;
    const rect = strip.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 16;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 12;

    strip.style.setProperty("--mx", `${x.toFixed(2)}px`);
    strip.style.setProperty("--my", `${y.toFixed(2)}px`);
  }

  function handlePointerLeave(event: PointerEvent<HTMLAnchorElement>) {
    event.currentTarget.style.setProperty("--mx", "0px");
    event.currentTarget.style.setProperty("--my", "0px");
  }

  return (
    <section className={styles.section} aria-label="Связанные проекты">
      <div className={`container ${styles.grid}`}>
        {projects.map((project) => (
          <a
            className={styles.strip}
            data-tone={project.tone}
            href={project.href}
            key={project.title}
            onPointerLeave={handlePointerLeave}
            onPointerMove={handlePointerMove}
          >
            <span aria-hidden="true" />
            <strong>{project.title}</strong>
            <p>{project.description}</p>
          </a>
        ))}
      </div>
    </section>
  );
}
