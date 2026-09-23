// ── Members Directory page ───────────────────────────────────
// The forum's member list, fetched on the server so every member
// link is in the HTML; search and sort run in the browser.
// ──────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import {
  ARCHIVE_REVALIDATE_SECONDS,
  fetchService,
} from "@/lib/clockCrewService";
import type { DirectoryUser } from "@/types";
import MembersDirectory from "./MembersDirectory";
import { parseSort } from "./sortOptions";

export const metadata: Metadata = {
  title: "Members Directory",
  description:
    "Browse the complete directory of Clock Crew members — the legendary Newgrounds Flash animation collective. View profiles, forum stats, and Newgrounds submissions for all archived community members.",
  alternates: { canonical: "/clocks" },
  openGraph: {
    title: "Members Directory — The Clock Crew",
    description:
      "Browse all Clock Crew members. Search and explore profiles from the legendary Newgrounds Flash animation collective.",
  },
};

async function loadDirectory(): Promise<DirectoryUser[] | null> {
  try {
    const { users } = await fetchService<{ users: DirectoryUser[] }>(
      "/clockcrew/users?limit=5000",
      {
        next: { revalidate: ARCHIVE_REVALIDATE_SECONDS },
      },
    );
    return users;
  } catch (error) {
    console.error("[clocks] Directory fetch failed:", (error as Error).message);
    return null;
  }
}

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string | string[] }>;
}) {
  // searchParams first: it marks the page dynamic before any fetch runs.
  const initialSort = parseSort((await searchParams).sort);
  const users = await loadDirectory();
  // Keyed by the sort, so a link that changes ?sort= (the sidebar's A–Z) remounts with it.
  return (
    <MembersDirectory
      key={initialSort}
      users={users}
      initialSort={initialSort}
    />
  );
}
