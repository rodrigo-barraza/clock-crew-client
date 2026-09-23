// ── Types for the Clock Crew client ────────────────────────────
// The shapes clock-crew-service answers with (see its
// src/services/serializers.ts), plus the history page's data.

// ── Forum + Newgrounds identities ───────────────────────────────

export interface ForumUser {
  userId: number;
  username: string;
  avatarUrl: string | null;
  customTitle: string | null;
  position: string | null;
  group: string | null;
  postCount: number;
  personalText: string | null;
  dateRegistered: string | null;
  age: number | null;
  gender: string | null;
  location: string | null;
  onlineStatus: string | null;
  profileUrl: string | null;
  signature: string | null;
  website: string | null;
  lastActive: string | null;
}

export interface ProfileLink {
  url: string;
  text: string | null;
}

export interface NewgroundsProfile {
  username: string;
  usernameLower: string;
  avatarUrl: string | null;
  bannerUrl: string | null;
  profileUrl: string | null;
  description: string | null;
  level: number | null;
  rank: string | null;
  globalRank: number | null;
  expPoints: string | null;
  expRank: number | null;
  blams: number;
  saves: number;
  votePower: string | null;
  fans: number;
  medals: number;
  trophies: number;
  sex: string | null;
  age: number | null;
  location: string | null;
  job: string | null;
  joinDate: string | null;
  realName: string | null;
  school: string | null;
  /** Supporter tenure, e.g. "1y 1m" — null when not a supporter. */
  supporter: string | null;
  links: ProfileLink[];
  movieCount: number;
  gameCount: number;
  audioCount: number;
  reviewCount: number;
  postCount: number;
  faveCount: number;
  newsCount: number;
}

export interface ProfileSummary {
  markdown: string | null;
  generatedAt: string | null;
  model: string | null;
  status: "complete" | "insufficient_data" | string;
}

// ── Archived content ───────────────────────────────────────────

export type SubmissionType = "movie" | "game" | "audio" | "art";

export interface Submission {
  _id: string;
  contentId?: number;
  contentType?: SubmissionType | string;
  title: string;
  url: string;
  thumbnailUrl?: string;
  /** Newgrounds rating, 0–5. */
  score?: number | null;
  views?: number;
  publishedDate?: string | null;
  description?: string;
  usernameLower: string;
}

export interface ForumPost {
  _id: string;
  messageId: number;
  topicId?: number;
  body?: string;
  date?: string | null;
  threadTitle: string | null;
}

export interface ForumThread {
  _id: string;
  topicId: number;
  title: string;
  totalPosts?: number;
  date?: string | null;
  boardName?: string;
  url?: string;
}

export interface NewgroundsPost {
  _id: string;
  postId?: number;
  title?: string;
  contentUrl?: string;
  body?: string;
  date?: string | null;
}

export interface Review {
  _id: string;
  reviewId?: number;
  body?: string;
  /** Stars given, 0–5. */
  score?: number | null;
  reviewedTitle?: string;
  reviewedUrl?: string;
  reviewedThumbnail?: string;
  date?: string | null;
}

// ── Member page ─────────────────────────────────────────────────

export interface Member {
  username: string;
  userId: number | null;
  avatarUrl: string | null;
  ccForum: ForumUser | null;
  newgrounds: NewgroundsProfile | null;
  profileSummary: ProfileSummary | null;
}

export interface MemberPageData {
  member: Member;
  movies: Submission[];
  games: Submission[];
  audio: Submission[];
  art: Submission[];
  reviews: Review[];
  favorites: Submission[];
  news: Submission[];
  fans: string[];
  ngPosts: NewgroundsPost[];
  ccPosts: ForumPost[];
  ccThreads: ForumThread[];
  ccThreadCount: number;
}

// ── Directory ───────────────────────────────────────────────────

export interface DirectoryUser {
  userId: number;
  username: string;
  avatarUrl?: string;
  customTitle?: string;
  postCount?: number;
  dateRegistered?: string | null;
}

// ── Portal ──────────────────────────────────────────────────────

export interface ClockProfile {
  _id: string;
  username: string;
  usernameLower: string;
  avatarUrl?: string;
  ccAvatarUrl: string | null;
  level?: number;
  location?: string;
  joinDate?: string;
  fans?: { count?: number };
}

export interface PortalPage {
  count: number;
  totalMovies: number;
  totalGames: number;
  totalAudio: number;
  items: Submission[];
}

export interface ClocksPage {
  count: number;
  totalClocks: number;
  profiles: ClockProfile[];
}

export interface PortalYears {
  contentYears: string[];
  profileYears: string[];
}

export interface PortalCard {
  profile: NewgroundsProfile;
  ccUser: ForumUser | null;
  topMovies: Submission[];
  topGames: Submission[];
  topAudio: Submission[];
  randomPost: {
    body: string;
    date: string | null;
    topicId: number | null;
    threadTitle: string | null;
  } | null;
}

// ── History Timeline Component ──────────────────────────────────
export interface TimelineEvent {
  year: string;
  title: string;
  content: string;
  era: "origins" | "golden" | "middle" | "modern";
}

export interface InfoBoxRow {
  label: string;
  value: string;
}

export interface InfoBoxData {
  title: string;
  imageUrl: string;
  imageAlt: string;
  caption: string;
  rows: InfoBoxRow[];
}

export interface TableOfContentsItem {
  id: string;
  label: string;
}

export interface ReferenceItem {
  id: number;
  text: string;
  url: string;
}

export interface NotableWork {
  title: string;
  year: string;
  author: string;
  description: string;
  url: string;
}

export interface NotableMember {
  name: string;
  aka: string | null;
  role: string;
  note: string;
  url?: string;
}

export interface RivalCrew {
  name: string;
  year: string;
  description: string;
  url: string | null;
}

export interface SeeAlsoItem {
  label: string;
  url: string;
}
