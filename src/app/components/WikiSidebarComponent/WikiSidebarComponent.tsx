"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./WikiSidebarComponent.module.css";

const WIKI_SECTIONS = [
  {
    id: "members",
    label: "Members",
    href: "/clocks",
    icon: "👥",
  },
  {
    id: "history",
    label: "History",
    href: "/history",
    icon: "📜",
  },
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
  const isMembersSection = pathname.startsWith("/clocks");
  const isHistorySection = pathname === "/history";
  const [collapsed, setCollapsed] = useState(false);

  const activeSectionId = useMemo(() => {
    if (pathname.startsWith("/clocks")) return "members";
    if (pathname.startsWith("/history")) return "history";
    return null;
  }, [pathname]);

  return (
    <>
      {/* ── Mobile toggle ──────────────────────────────────────── */}
      <button
        className={styles['mobile-toggle']}
        onClick={() => setCollapsed((previous) => !previous)}
        aria-label={collapsed ? "Open sidebar" : "Close sidebar"}
      >
        <span className={styles['mobile-toggle-icon']}>
          {collapsed ? "☰" : "✕"}
        </span>
        <span className={styles['mobile-toggle-label']}>Wiki Nav</span>
      </button>

      {/* ── Sidebar ────────────────────────────────────────────── */}
      <aside
        className={`${styles.sidebar} ${collapsed ? styles['sidebar-collapsed'] : ""}`}
        role="complementary"
        aria-label="Wiki navigation"
      >
        <div className={styles['sidebar-inner']}>
          {/* ── Section nav ──────────────────────────────────────── */}
          <nav className={styles['section-nav']}>
            <span className={styles['section-label']}>Wiki</span>
            {WIKI_SECTIONS.map((section) => (
              <Link
                key={section.id}
                href={section.href}
                className={`${styles['section-link']} ${activeSectionId === section.id ? styles['section-link-active'] : ""}`}
              >
                <span className={styles['section-icon']}>{section.icon}</span>
                {section.label}
              </Link>
            ))}
          </nav>

          {/* ── A–Z Quick Jump (only on members pages) ───────────── */}
          {isMembersSection && (
            <nav
              className={styles['alpha-nav']}
              aria-label="Alphabetical quick jump"
            >
              <span className={styles['section-label']}>Jump to</span>
              <div className={styles['alpha-grid']}>
                {ALPHABET.map((letter) => (
                  <a
                    key={letter}
                    href={`#letter-${letter}`}
                    className={styles['alpha-link']}
                  >
                    {letter}
                  </a>
                ))}
              </div>
            </nav>
          )}

          {/* ── Article Sections (only on history page) ──────────── */}
          {isHistorySection && (
            <nav className={styles['alpha-nav']} aria-label="Article section jump">
              <span className={styles['section-label']}>On This Page</span>
              <div className={styles['article-sections']}>
                {HISTORY_SECTIONS.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className={styles['article-section-link']}
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
      {!collapsed && (
        <div
          className={styles.backdrop}
          onClick={() => setCollapsed(true)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
