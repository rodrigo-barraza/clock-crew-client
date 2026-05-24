// ── Types and Interfaces for Clock Crew Client ─────────────────

// ── Member Profile Component ─────────────────────────────────────
export interface NewgroundsStats {
  fans: number;
  level?: number;
  blams: number;
  saves: number;
  medals: number;
  trophies: number;
  expPoints?: string;
  votePower?: string;
  description?: string;
  joinDate?: string;
  location?: string;
  job?: string;
  age?: number;
  sex?: string;
  realName?: string;
  school?: string;
  rank?: string;
  globalRank?: number;
  movieCount: number;
  gameCount: number;
  audioCount: number;
  reviewCount: number;
  postCount: number;
  faveCount: number;
  newsCount: number;
  avatarUrl?: string;
  profileUrl?: string;
  supporter?: boolean;
  links?: Array<{ url?: string; label?: string; name?: string } | string>;
}

export interface ClockCrewForumStats {
  avatarUrl?: string;
  username: string;
  customTitle?: string;
  position?: string;
  postCount: number;
  dateRegistered: string; // Date string
  location?: string;
  gender?: string;
  signatureHtml?: string;
  group?: string;
  profileUrl?: string;
}

export interface AIProfileSummary {
  markdown?: string;
  status: "complete" | "pending" | "failed" | string;
  model?: string;
}

export interface MemberProfile {
  username: string;
  avatarUrl?: string;
  newgrounds?: NewgroundsStats;
  ccForum?: ClockCrewForumStats;
  profileSummary?: AIProfileSummary;
}

export interface MemberContentItem {
  contentId?: string;
  _id?: string;
  title: string;
  url: string;
  thumbnailUrl?: string;
  score?: number;
  views?: number;
  publishedDate?: string;
  description?: string;
  type?: string;
}

export interface ForumThread {
  topicId?: string;
  title: string;
  totalPosts?: number;
  date?: string;
  boardName?: string;
}

export interface ForumPost {
  messageId?: string;
  postId?: string;
  body?: string;
  content?: string;
  threadTitle?: string;
  date?: string;
}

export interface Review {
  reviewId?: string;
  contentTitle?: string;
  contentUrl?: string;
  score?: number;
  body?: string;
  text?: string;
}

export interface TransformedMemberProfileData {
  member: MemberProfile;
  movies?: MemberContentItem[];
  games?: MemberContentItem[];
  audio?: MemberContentItem[];
  art?: MemberContentItem[];
  fans?: string[];
  ccPosts?: ForumPost[];
  ngPosts?: ForumPost[];
  ccThreads?: ForumThread[];
  reviews?: Review[];
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
