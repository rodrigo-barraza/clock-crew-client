// ============================================================
// Display helpers shared by the member page and the portal
// ============================================================

import type { ProfileLink } from "@/types";

/**
 * `url` when it is an http(s) link, else `undefined`. Every href here
 * comes from a scrape, and a `javascript:` URL in one runs on click.
 */
export function safeHref(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  try {
    const { protocol } = new URL(url);
    return protocol === "http:" || protocol === "https:" ? url : undefined;
  } catch {
    return undefined;
  }
}

/** A profile link's own text, else its host. */
export function linkLabel(link: ProfileLink): string {
  if (link.text) return link.text;
  try {
    return new URL(link.url).hostname;
  } catch {
    return "Link";
  }
}

/** A Newgrounds 0–5 rating to one decimal. */
export function formatScore(score: number): string {
  return (Math.round(score * 10) / 10).toFixed(1);
}

/** `text` cut to `length` characters with an ellipsis. */
export function clip(text: string, length: number): string {
  return text.length > length ? `${text.slice(0, length).trimEnd()}…` : text;
}

/** The two-letter avatar fallback — "StrawberryClock" → "ST". */
export function initials(name: string): string {
  return (name.replace(/clock$/i, "") || name || "?").slice(0, 2).toUpperCase();
}

const ARCHIVE_DATE = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

/**
 * An archived date as "Mar 22, 2000", read in UTC. Pages render on the
 * server and hydrate in the browser, so a local-time format would print
 * a different day on each side of midnight — and not match on hydration.
 */
export function formatArchiveDate(
  value: string | Date | null | undefined,
): string {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime())
    ? String(value)
    : ARCHIVE_DATE.format(date);
}

/** The UTC year of an archived date, or null. */
export function archiveYear(
  value: string | Date | null | undefined,
): number | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.getUTCFullYear();
}

/** A count with thousands separators, the same on the server and in every browser locale. */
export function formatCount(value: number): string {
  return value.toLocaleString("en-US");
}

const COMPACT = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

/** A stat as "2.9K" / "1.2M" — fixed locale, so server and browser print the same. */
export function formatCompact(value: number | null | undefined): string {
  return COMPACT.format(value ?? 0);
}
