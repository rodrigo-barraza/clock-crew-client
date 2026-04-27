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

export default function WikiSidebarComponent() {
  const pathname = usePathname();
  const isMembersSection = pathname.startsWith("/clocks");
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
        className={styles.mobileToggle}
        onClick={() => setCollapsed((c) => !c)}
        aria-label={collapsed ? "Open sidebar" : "Close sidebar"}
      >
        <span className={styles.mobileToggleIcon}>
          {collapsed ? "☰" : "✕"}
        </span>
        <span className={styles.mobileToggleLabel}>Wiki Nav</span>
      </button>

      {/* ── Sidebar ────────────────────────────────────────────── */}
      <aside
        className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ""}`}
        role="complementary"
        aria-label="Wiki navigation"
      >
        <div className={styles.sidebarInner}>
          {/* ── Section nav ──────────────────────────────────────── */}
          <nav className={styles.sectionNav}>
            <span className={styles.sectionLabel}>Wiki</span>
            {WIKI_SECTIONS.map((section) => (
              <Link
                key={section.id}
                href={section.href}
                className={`${styles.sectionLink} ${activeSectionId === section.id ? styles.sectionLinkActive : ""}`}
              >
                <span className={styles.sectionIcon}>{section.icon}</span>
                {section.label}
              </Link>
            ))}
          </nav>

          {/* ── A–Z Quick Jump (only on members pages) ───────────── */}
          {isMembersSection && (
            <nav className={styles.alphaNav} aria-label="Alphabetical quick jump">
              <span className={styles.sectionLabel}>Jump to</span>
              <div className={styles.alphaGrid}>
                {ALPHABET.map((letter) => (
                  <a
                    key={letter}
                    href={`#letter-${letter}`}
                    className={styles.alphaLink}
                  >
                    {letter}
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
