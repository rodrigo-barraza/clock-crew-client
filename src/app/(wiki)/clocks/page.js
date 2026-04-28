// ── Members Directory page ───────────────────────────────────
// Server Component wrapper providing metadata for the client-
// rendered MembersDirectory component.
// ──────────────────────────────────────────────────────────────

export const metadata = {
  title: "Members Directory",
  description:
    "Browse the complete directory of Clock Crew members — the legendary Newgrounds Flash animation collective. View profiles, forum stats, and Newgrounds submissions for all archived community members.",
  alternates: {
    canonical: "/clocks",
  },
  openGraph: {
    title: "Members Directory — The Clock Crew",
    description:
      "Browse all Clock Crew members. Search and explore profiles from the legendary Newgrounds Flash animation collective.",
  },
};

export { default } from "./MembersDirectory";
