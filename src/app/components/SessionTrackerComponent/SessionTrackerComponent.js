"use client";

// ============================================================
// SessionTrackerComponent — Invisible analytics telemetry layer
// ============================================================
// Drop into the root layout to enable:
//   • Session heartbeat (5s interval)
//   • Automatic page view tracking on route change
//   • New vs returning session events
// ============================================================

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import SessionService from "@/services/SessionService";

const HEARTBEAT_INTERVAL_MS = 5000;

export default function SessionTrackerComponent() {
  const pathname = usePathname();
  const initialized = useRef(false);

  // ── Bootstrap once on mount ────────────────────────────────
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const { isNew } = SessionService.init();

    // Record session type
    SessionService.event(
      "session",
      isNew ? "new-visit" : "returning-visit",
      document.referrer || null,
      window.location.href,
    );

    // Record initial page view
    SessionService.pageView(
      window.location.href,
      document.title,
      document.referrer || null,
    );

    // Session heartbeat
    const heartbeat = setInterval(() => {
      SessionService.heartbeat(
        HEARTBEAT_INTERVAL_MS,
        screen.width,
        screen.height,
      );
    }, HEARTBEAT_INTERVAL_MS);

    // Track external link clicks
    function handleClick(event) {
      const anchor = event.target.closest("a");
      if (!anchor?.href) return;

      const isInternal =
        anchor.href.includes(window.location.hostname) ||
        anchor.href.startsWith("/");

      SessionService.event(
        isInternal ? "navigation" : "link",
        "click",
        anchor.href,
      );
    }

    document.addEventListener("click", handleClick, { capture: true });

    return () => {
      clearInterval(heartbeat);
      document.removeEventListener("click", handleClick, { capture: true });
    };
  }, []);

  // ── Track route changes (App Router SPA navigation) ────────
  useEffect(() => {
    if (!initialized.current) return;

    SessionService.pageView(
      window.location.href,
      document.title,
      null,
    );
  }, [pathname]);

  return null;
}
