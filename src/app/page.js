// ── Home page metadata ───────────────────────────────────────
// The home page component is "use client" so metadata must be
// exported from this separate page-level server component.
// Root layout already provides the default title/description,
// so this only needs to supply the canonical URL.
// ──────────────────────────────────────────────────────────────

export const metadata = {
  alternates: {
    canonical: "/",
  },
};

export { default } from "./HomePage";
