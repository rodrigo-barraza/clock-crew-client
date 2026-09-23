"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./WikiSidebarComponent.module.css";

const WIKI_SECTIONS = [
  { id: "members", label: "Members", href: "/clocks", icon: "👥" },
  { id: "history", label: "History", href: "/history", icon: "📜" },
];

// A–Z quick-jump letters for the members directory
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#".split("");

// Article section anchors for the history page
const HISTORY_SECTIONS = [
  { id: "origins", label: "Origins" },
  { id: "the-movie-b", label: 'The Movie "B"' },
  { id: "formation", label: "Formation" },
  { id: "identity", label: "Style & Identity" },
  { id: "golden-age", label: "Golden Age" },
  { id: "clock-day", label: "Clock Day" },
  { id: "rivalries", label: "Rivalries" },
  { id: "notable-works", label: "Notable Works" },
  { id: "notable-members", label: "Notable Members" },
  { id: "evolution", label: "Evolution" },
  { id: "preservation", label: "Preservation" },
  { id: "cultural-impact", label: "Cultural Impact" },
  { id: "timeline", label: "Timeline" },
  { id: "references", label: "References" },
];

export default function WikiSidebarComponent() {
  const pathname = usePathname();
  const isDirectory = pathname === "/clocks";
  const isHistory = pathname === "/history";
  const activeSectionId = pathname.startsWith("/clocks")
    ? "members"
    : pathname.startsWith("/history")
      ? "history"
      : null;

  // On narrow screens the sidebar is a drawer: closed until asked for, and
  // closed again by any navigation. (It used to open over every page load.)
  const [open, setOpen] = useState(false);
  const [openedAt, setOpenedAt] = useState(pathname);
  if (open && openedAt !== pathname) setOpen(false);

  const toggle = () => {
    setOpenedAt(pathname);
    setOpen((previous) => !previous);
  };
  const close = () => setOpen(false);

  return (
    <>
      {/* ── Mobile toggle ──────────────────────────────────────── */}
      <button
        type="button"
        className={styles["mobile-toggle"]}
        onClick={toggle}
        aria-expanded={open}
        aria-controls="wiki-sidebar"
        aria-label={open ? "Close wiki navigation" : "Open wiki navigation"}
      >
        <span className={styles["mobile-toggle-icon"]} aria-hidden="true">
          {open ? "✕" : "☰"}
        </span>
        <span className={styles["mobile-toggle-label"]}>Wiki Nav</span>
      </button>

      {/* ── Sidebar ────────────────────────────────────────────── */}
      <aside
        id="wiki-sidebar"
        className={`${styles.sidebar} ${open ? "" : styles["sidebar-collapsed"]}`}
        aria-label="Wiki navigation"
      >
        <div className={styles["sidebar-inner"]}>
          {/* ── Section nav ──────────────────────────────────────── */}
          <nav className={styles["section-nav"]}>
            <span className={styles["section-label"]}>Wiki</span>
            {WIKI_SECTIONS.map((section) => (
              <Link
                key={section.id}
                href={section.href}
                onClick={close}
                aria-current={
                  activeSectionId === section.id ? "page" : undefined
                }
                className={`${styles["section-link"]} ${activeSectionId === section.id ? styles["section-link-active"] : ""}`}
              >
                <span className={styles["section-icon"]} aria-hidden="true">
                  {section.icon}
                </span>
                {section.label}
              </Link>
            ))}
          </nav>

          {/* ── A–Z Quick Jump (directory only) ─────────────────── */}
          {/* The letter headings exist only in the A–Z sort, so each link switches to it. */}
          {isDirectory && (
            <nav
              className={styles["alpha-nav"]}
              aria-label="Alphabetical quick jump"
            >
              <span className={styles["section-label"]}>Jump to</span>
              <div className={styles["alpha-grid"]}>
                {ALPHABET.map((letter) => (
                  <Link
                    key={letter}
                    href={`/clocks?sort=alpha#letter-${letter}`}
                    onClick={close}
                    className={styles["alpha-link"]}
                  >
                    {letter}
                  </Link>
                ))}
              </div>
            </nav>
          )}

          {/* ── Article Sections (history page only) ────────────── */}
          {isHistory && (
            <nav
              className={styles["alpha-nav"]}
              aria-label="Article section jump"
            >
              <span className={styles["section-label"]}>On This Page</span>
              <div className={styles["article-sections"]}>
                {HISTORY_SECTIONS.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    onClick={close}
                    className={styles["article-section-link"]}
                  >
                    {section.label}
                  </a>
                ))}
              </div>
            </nav>
          )}
        </div>
      </aside>

      {/* ── Backdrop (mobile) ──────────────────────────────────── */}
      {open && (
        <div className={styles.backdrop} onClick={close} aria-hidden="true" />
      )}
    </>
  );
}
