// ── Clock Crew Member Profile Page ───────────────────────────
// Server-rendered: the member is fetched here (once — generateMetadata
// and the page share the cached request), unknown names are a real
// 404, and the profile ships as HTML instead of a loading skeleton.
// ──────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import MemberProfileComponent from "@/app/components/MemberProfileComponent/MemberProfileComponent";
import {
  ARCHIVE_REVALIDATE_SECONDS,
  fetchServiceOrNull,
} from "@/lib/clockCrewService";
import { clip } from "@/lib/display";
import { SITE_NAME, SITE_URL } from "@/constants";
import type { MemberPageData } from "@/types";

interface MemberPageProps {
  params: Promise<{ username: string }>;
}

/** Route params arrive percent-encoded for some characters; a stray `%` must not throw. */
function decodeUsername(raw: string): string {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

const getMember = cache((username: string) =>
  fetchServiceOrNull<MemberPageData>(
    `/clockcrew/members/${encodeURIComponent(username)}`,
    {
      next: { revalidate: ARCHIVE_REVALIDATE_SECONDS },
    },
  ),
);

/** The page's one-line description: the member's own bio, else a stock line. */
function describe(data: MemberPageData | null, name: string): string {
  const bio =
    data?.member.newgrounds?.description?.trim() ||
    data?.member.ccForum?.personalText?.trim();
  return bio
    ? `${name}: ${clip(bio, 150)}`
    : `Profile page for ${name}, a member of the Clock Crew — the legendary Newgrounds Flash animation collective.`;
}

export async function generateMetadata({
  params,
}: MemberPageProps): Promise<Metadata> {
  const requested = decodeUsername((await params).username);
  const data = await getMember(requested).catch(() => null);
  const name = data?.member.username ?? requested;
  const title = `${name} — Clock Crew Member`;
  const description = describe(data, name);
  const canonical = `/clocks/${encodeURIComponent(name)}`;
  const avatarUrl = data?.member.avatarUrl;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "profile",
      title,
      description,
      url: `${SITE_URL}${canonical}`,
      images: avatarUrl
        ? [{ url: avatarUrl, width: 300, height: 300, alt: `${name} avatar` }]
        : [
            {
              url: `${SITE_URL}/og-image.png`,
              width: 1200,
              height: 630,
              alt: SITE_NAME,
            },
          ],
    },
    twitter: {
      card: avatarUrl ? "summary" : "summary_large_image",
      title,
      description,
    },
  };
}

export default async function MemberProfilePage({ params }: MemberPageProps) {
  const data = await getMember(decodeUsername((await params).username));
  if (!data) notFound();

  const { member } = data;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: member.username,
    url: `${SITE_URL}/clocks/${encodeURIComponent(member.username)}`,
    memberOf: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    ...(member.avatarUrl && { image: member.avatarUrl }),
    ...(member.newgrounds?.description && {
      description: clip(member.newgrounds.description, 200),
    }),
    sameAs: [member.newgrounds?.profileUrl, member.ccForum?.profileUrl].filter(
      Boolean,
    ),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <MemberProfileComponent data={data} />
    </>
  );
}
