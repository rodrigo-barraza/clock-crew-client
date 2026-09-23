import type { SubmissionType } from "@/types";

export type PortalTab = "all" | "movie" | "game" | "audio" | "clocks";

export const PORTAL_TABS: Array<{ key: PortalTab; label: string }> = [
  { key: "all", label: "All" },
  { key: "movie", label: "🎬 Movies" },
  { key: "game", label: "🎮 Games" },
  { key: "audio", label: "🎵 Audio" },
  { key: "clocks", label: "🕰️ Clocks" },
];

export interface TypeMeta {
  emoji: string;
  label: string;
  badgeClass: string;
  action: string;
}

const TYPE_META: Record<Exclude<SubmissionType, "art">, TypeMeta> = {
  movie: {
    emoji: "🎬",
    label: "Movie",
    badgeClass: "type-badge-movie",
    action: "▶ Watch on Newgrounds",
  },
  game: {
    emoji: "🎮",
    label: "Game",
    badgeClass: "type-badge-game",
    action: "🎮 Play on Newgrounds",
  },
  audio: {
    emoji: "🎵",
    label: "Audio",
    badgeClass: "type-badge-audio",
    action: "🎧 Listen on Newgrounds",
  },
};

export function typeMeta(contentType: string | undefined): TypeMeta {
  return TYPE_META[contentType as keyof typeof TYPE_META] ?? TYPE_META.movie;
}
