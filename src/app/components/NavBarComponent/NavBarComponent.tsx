"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
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
  // Starts false on both sides so hydration matches; the first scroll
  // event (or a page restored mid-scroll) sets it.
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    window.addEventListener("scroll", onScroll, { passive: true });
    const frame = requestAnimationFrame(onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <nav
      className={`${styles["navigation-bar"]} ${scrolled ? styles["navigation-scrolled"] : ""} ${isHome ? styles["navigation-home"] : styles["navigation-inner"]}`}
      aria-label="Main navigation"
    >
      <div className={styles["navigation-inner-wrapper"]}>
        {/* ── Logo / Home ──────────────────────────────────────── */}
        <Link href="/" className={styles["logo-link"]}>
          <Image
            src="/animated-clock.gif"
            alt=""
            className={styles["logo-gif"]}
            aria-hidden="true"
            width={32}
            height={32}
            unoptimized
          />
          <span className={styles["logo-text"]}>The Clock Crew</span>
        </Link>

        {/* ── Links ────────────────────────────────────────────── */}
        <ul className={styles["link-list"]}>
          {NAV_LINKS.map(({ href, label }) => {
            const isActive =
              href === "/" ? pathname === "/" : pathname.startsWith(href);

            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`${styles.link} ${isActive ? styles["link-active"] : ""}`}
                  aria-current={isActive ? "page" : undefined}
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
