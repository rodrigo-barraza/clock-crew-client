"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./NavBarComponent.module.css";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/clocks", label: "Members" },
  { href: "/history", label: "History" },
];

export default function NavBarComponent() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(
    () => typeof window !== "undefined" && window.scrollY > 32,
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`${styles.nav} ${scrolled ? styles.navScrolled : ""} ${isHome ? styles.navHome : styles.navInner}`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className={styles.navInnerWrap}>
        {/* ── Logo / Home ──────────────────────────────────────── */}
        <Link href="/" className={styles.logoLink}>
          <img
            src="/animated-clock.gif"
            alt=""
            className={styles.logoGif}
            aria-hidden="true"
          />
          <span className={styles.logoText}>The Clock Crew</span>
        </Link>

        {/* ── Links ────────────────────────────────────────────── */}
        <ul className={styles.linkList}>
          {NAV_LINKS.map(({ href, label }) => {
            const isActive =
              href === "/"
                ? pathname === "/"
                : pathname.startsWith(href);

            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`${styles.link} ${isActive ? styles.linkActive : ""}`}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
