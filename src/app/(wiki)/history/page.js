// ── History of the Clock Crew ─────────────────────────────────
// Server Component with metadata, canonical URL, and JSON-LD
// Article structured data for the comprehensive history article.
// ──────────────────────────────────────────────────────────────

import HistoryTimelineComponent from "../../components/HistoryTimelineComponent/HistoryTimelineComponent";

const SITE_URL = "https://clocktopia.com";

export const metadata = {
  title: "History of the Clock Crew",
  description:
    "The complete history of the Clock Crew — from StrawberryClock's legendary 'B' submission in 2001 to the modern archival era. Explore the founding, golden age, rivalries, and legacy of Newgrounds' most iconic Flash animation collective.",
  alternates: {
    canonical: "/history",
  },
  openGraph: {
    type: "article",
    title: "History of the Clock Crew",
    description:
      "Explore the full history of the Clock Crew — Newgrounds' legendary Flash animation collective, est. 2001.",
    url: `${SITE_URL}/history`,
    publishedTime: "2026-04-28T00:00:00Z",
    section: "History",
    tags: [
      "Clock Crew",
      "Newgrounds",
      "Flash Animation",
      "StrawberryClock",
      "Clock Day",
      "Internet History",
    ],
  },
};

// ── JSON-LD Article structured data ──────────────────────────
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "History of the Clock Crew",
  description:
    "The complete history of the Clock Crew — from StrawberryClock's legendary 'B' submission in 2001 to the modern archival era.",
  url: `${SITE_URL}/history`,
  datePublished: "2026-04-28",
  dateModified: new Date().toISOString().split("T")[0],
  author: {
    "@type": "Organization",
    name: "The Clock Crew",
    url: SITE_URL,
  },
  publisher: {
    "@type": "Organization",
    name: "The Clock Crew",
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/icon-512.png`,
    },
  },
  image: `${SITE_URL}/images/clock-crew-banner.png`,
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": `${SITE_URL}/history`,
  },
  about: {
    "@type": "Organization",
    name: "The Clock Crew",
    foundingDate: "2001",
    url: "https://www.newgrounds.com/collection/clockcrew",
  },
  keywords:
    "Clock Crew, Newgrounds, Flash animation, StrawberryClock, Clock Day, Speakonia, Lock Legion, internet history",
};

export default function HistoryPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HistoryTimelineComponent />
    </>
  );
}
