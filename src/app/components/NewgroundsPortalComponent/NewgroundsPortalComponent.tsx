"use client";

import { useState, useEffect, useCallback, useRef, SyntheticEvent } from "react";
import { Search } from "lucide-react";
import {
  CloseButtonComponent,
  SearchInputComponent,
  SelectComponent,
  LoadingIndicatorComponent,
  EmptyStateComponent,
} from "@rodrigo-barraza/components-library";
import { formatNumber } from "@rodrigo-barraza/utilities-library";
import styles from "./NewgroundsPortalComponent.module.css";
import {
  NewgroundsStats,
  ClockCrewForumStats,
  MemberContentItem,
  ForumPost,
} from "../../../types";

// ── Local interfaces ────────────────────────────────────────────

interface PortalContentItem {
  contentId?: string;
  _id?: string;
  title: string;
  url: string;
  thumbnailUrl?: string;
  score?: number;
  views?: number;
  usernameLower: string;
  contentType: string;
  publishedDate?: string;
  description?: string;
}

interface ClockProfile {
  _id?: string;
  username: string;
  usernameLower: string;
  avatarUrl?: string;
  ccAvatarUrl?: string;
  level?: number;
  location?: string;
  joinDate?: string;
  supporter?: boolean;
  rank?: string;
  fans?: { count: number };
}

interface CardApiResponse {
  profile?: NewgroundsStats & {
    username: string;
    profileUrl: string;
    expRank?: number;
    links?: Array<{ url?: string; label?: string; name?: string } | string>;
  };
  ccUser?: ClockCrewForumStats;
  randomPost?: ForumPost;
  topMovies?: MemberContentItem[];
  topGames?: MemberContentItem[];
  topAudio?: MemberContentItem[];
}

interface PortalApiResponse {
  items?: PortalContentItem[];
  totalMovies?: number;
  totalGames?: number;
  totalAudio?: number;
  profiles?: ClockProfile[];
  totalClocks?: number;
}

interface AvailableYears {
  contentYears: number[];
  profileYears: number[];
}

interface PortalCounts {
  movies: number;
  games: number;
  audio: number;
  clocks: number;
}

// ── Score display helpers ────────────────────────────────────────

interface ScoreDisplayProps {
  score?: number | null;
}

function ScoreDisplay({ score }: ScoreDisplayProps) {
  if (score == null) return null;
  const rounded = Math.round(score * 10) / 10;
  return (
    <span className={styles.itemScore}>
      <span className={styles.scoreStar}>★</span>
      {rounded.toFixed(1)}
    </span>
  );
}

function formatDate(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return String(dateStr);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ── Top Submissions Section ──────────────────────────────────

interface TopSubmissionsSectionProps {
  title: string;
  emoji: string;
  items?: MemberContentItem[];
}

function TopSubmissionsSection({ title, emoji, items }: TopSubmissionsSectionProps) {
  if (!items?.length) return null;
  return (
    <div className={styles.topSubmissions}>
      <div className={styles.topSubTitle}>
        {emoji} Top {title}
      </div>
      <div className={styles.topSubList}>
        {items.map((sub: MemberContentItem, i: number) => (
          <a
            key={sub.contentId || sub._id || i}
            href={sub.url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.topSubItem}
          >
            {sub.thumbnailUrl && (
              <img
                src={sub.thumbnailUrl}
                alt={sub.title}
                className={styles.topSubThumb}
                loading="lazy"
              />
            )}
            <div className={styles.topSubInfo}>
              <span className={styles.topSubName}>{sub.title}</span>
            </div>
            {sub.score != null && (
              <span className={styles.topSubScore}>
                ★ {(Math.round(sub.score * 10) / 10).toFixed(1)}
              </span>
            )}
          </a>
        ))}
      </div>
    </div>
  );
}

// ── Type metadata ────────────────────────────────────────────────
interface TypeMetaEntry {
  emoji: string;
  label: string;
  badgeClass: string;
  action: string;
}

const TYPE_META: Record<string, TypeMetaEntry> = {
  movie: {
    emoji: "🎬",
    label: "Movie",
    badgeClass: "typeBadgeMovie",
    action: "▶ Watch on Newgrounds",
  },
  game: {
    emoji: "🎮",
    label: "Game",
    badgeClass: "typeBadgeGame",
    action: "🎮 Play on Newgrounds",
  },
  audio: {
    emoji: "🎵",
    label: "Audio",
    badgeClass: "typeBadgeAudio",
    action: "🎧 Listen on Newgrounds",
  },
};

function getTypeMeta(contentType: string): TypeMetaEntry {
  return TYPE_META[contentType] || TYPE_META.movie;
}

// ── Content Detail Modal ─────────────────────────────────────────

interface ContentDetailModalProps {
  item: PortalContentItem;
  onClose: () => void;
}

function ContentDetailModal({ item, onClose }: ContentDetailModalProps) {
  const [data, setData] = useState<CardApiResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!item?.usernameLower) return;
    let cancelled = false;
    setLoading(true);
    fetch(`/api/newgrounds/card/${encodeURIComponent(item.usernameLower)}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((d: CardApiResponse) => {
        if (!cancelled) {
          setData(d);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [item?.usernameLower]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const profile = data?.profile;
  const ccUser = data?.ccUser;
  const randomPost = data?.randomPost;
  const meta = getTypeMeta(item?.contentType);

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modalCard}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <CloseButtonComponent onClick={onClose} />

        {/* ══ CONTENT HERO — the clicked content ══════════ */}
        <div
          className={styles.contentHero}
          style={
            item?.thumbnailUrl
              ? { backgroundImage: `url(${item.thumbnailUrl})` }
              : undefined
          }
        >
          <div className={styles.contentHeroOverlay} />
          <div className={styles.contentHeroBody}>
            <span className={`${styles.heroBadge} ${styles[meta.badgeClass]}`}>
              {meta.emoji} {meta.label}
            </span>
            <h2 className={styles.contentHeroTitle}>{item?.title}</h2>
            <div className={styles.contentHeroMeta}>
              <span className={styles.contentHeroAuthor}>
                by {item?.usernameLower}
              </span>
              {item?.score != null && (
                <span className={styles.contentHeroScore}>
                  ★ {item.score.toFixed(1)} / 5.0
                </span>
              )}
            </div>
            {item?.score != null && (
              <div className={styles.scoreBar}>
                <div
                  className={styles.scoreBarFill}
                  style={{ width: `${(item.score / 5) * 100}%` }}
                />
              </div>
            )}
            <a
              href={item?.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.actionButton} ${styles.actionHero}`}
            >
              {meta.action}
            </a>
          </div>
        </div>

        {/* ══ CREATOR PROFILE ════════════════════════════════ */}
        <div className={styles.creatorDivider}>
          <span className={styles.creatorDividerText}>Created by</span>
        </div>

        {loading ? (
          <div className={styles.loading} style={{ minHeight: 120 }}>
            <LoadingIndicatorComponent size={32} />
          </div>
        ) : !profile ? (
          <EmptyStateComponent subtitle="Profile not found" />
        ) : (
          <>
            <div className={styles.creatorHeader}>
              <div
                className={styles.cardAvatarWrap}
                style={{ margin: 0, width: 56, height: 56 }}
              >
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.username}
                    className={styles.cardAvatar}
                  />
                ) : (
                  <div className={styles.cardAvatarFallback}>
                    {(profile.username || "?")[0].toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <span className={styles.cardUsername}>{profile.username}</span>
                <div className={styles.cardRankRow}>
                  {profile.rank && (
                    <span
                      className={`${styles.cardRankBadge} ${styles.ngBadge}`}
                    >
                      {profile.rank}
                    </span>
                  )}
                  {profile.level != null && (
                    <span
                      className={`${styles.cardRankBadge} ${styles.levelBadge}`}
                    >
                      Lvl {profile.level}
                    </span>
                  )}
                  {profile.supporter && (
                    <span
                      className={`${styles.cardRankBadge} ${styles.supporterBadge}`}
                    >
                      ⭐ Supporter
                    </span>
                  )}
                  {ccUser?.position && (
                    <span
                      className={`${styles.cardRankBadge} ${styles.ccBadge}`}
                    >
                      {ccUser.position}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {profile.description && (
              <p className={styles.cardDescription}>{profile.description}</p>
            )}

            <div className={styles.cardPersonalInfo}>
              {profile.joinDate && (
                <span className={styles.personalInfoItem}>
                  <span className={styles.personalInfoIcon}>📅</span> Joined{" "}
                  <span className={styles.personalInfoValue}>
                    {profile.joinDate}
                  </span>
                </span>
              )}
              {profile.location && (
                <span className={styles.personalInfoItem}>
                  <span className={styles.personalInfoIcon}>📍</span>{" "}
                  <span className={styles.personalInfoValue}>
                    {profile.location}
                  </span>
                </span>
              )}
              {profile.age != null && (
                <span className={styles.personalInfoItem}>
                  <span className={styles.personalInfoIcon}>🎂</span>{" "}
                  <span className={styles.personalInfoValue}>
                    Age {profile.age}
                  </span>
                </span>
              )}
              {profile.sex && (
                <span className={styles.personalInfoItem}>
                  <span className={styles.personalInfoIcon}>👤</span>{" "}
                  <span className={styles.personalInfoValue}>
                    {profile.sex}
                  </span>
                </span>
              )}
              {profile.job && (
                <span className={styles.personalInfoItem}>
                  <span className={styles.personalInfoIcon}>💼</span>{" "}
                  <span className={styles.personalInfoValue}>
                    {profile.job}
                  </span>
                </span>
              )}
              {profile.globalRank != null && (
                <span className={styles.personalInfoItem}>
                  <span className={styles.personalInfoIcon}>🌍</span> Rank #
                  <span className={styles.personalInfoValue}>
                    {formatNumber(profile.globalRank)}
                  </span>
                </span>
              )}
              {profile.expPoints && (
                <span className={styles.personalInfoItem}>
                  <span className={styles.personalInfoIcon}>✨</span> EXP{" "}
                  <span className={styles.personalInfoValue}>
                    {profile.expPoints}
                  </span>
                </span>
              )}
              {profile.votePower && (
                <span className={styles.personalInfoItem}>
                  <span className={styles.personalInfoIcon}>⚡</span>{" "}
                  <span className={styles.personalInfoValue}>
                    {profile.votePower}
                  </span>
                </span>
              )}
            </div>

            <div className={styles.statsGrid}>
              <div className={styles.statItem}>
                <span className={styles.statValue}>
                  {formatNumber(profile.fans)}
                </span>
                <span className={styles.statLabel}>Fans</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>
                  {formatNumber(profile.blams)}
                </span>
                <span className={styles.statLabel}>Blams</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>
                  {formatNumber(profile.saves)}
                </span>
                <span className={styles.statLabel}>Saves</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>
                  {formatNumber(profile.medals)}
                </span>
                <span className={styles.statLabel}>Medals</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>
                  {formatNumber(profile.trophies)}
                </span>
                <span className={styles.statLabel}>Trophies</span>
              </div>
              {profile.expRank != null && (
                <div className={styles.statItem}>
                  <span className={styles.statValue}>
                    #{formatNumber(profile.expRank)}
                  </span>
                  <span className={styles.statLabel}>EXP Rank</span>
                </div>
              )}
            </div>

            <div className={styles.contentCounts}>
              {profile.movieCount > 0 && (
                <span className={styles.contentPill}>
                  <span className={styles.contentPillIcon}>🎬</span>
                  <span className={styles.contentPillCount}>
                    {profile.movieCount}
                  </span>{" "}
                  Movies
                </span>
              )}
              {profile.gameCount > 0 && (
                <span className={styles.contentPill}>
                  <span className={styles.contentPillIcon}>🎮</span>
                  <span className={styles.contentPillCount}>
                    {profile.gameCount}
                  </span>{" "}
                  Games
                </span>
              )}
              {profile.audioCount > 0 && (
                <span className={styles.contentPill}>
                  <span className={styles.contentPillIcon}>🎵</span>
                  <span className={styles.contentPillCount}>
                    {profile.audioCount}
                  </span>{" "}
                  Audio
                </span>
              )}

              {profile.reviewCount > 0 && (
                <span className={styles.contentPill}>
                  <span className={styles.contentPillIcon}>📝</span>
                  <span className={styles.contentPillCount}>
                    {profile.reviewCount}
                  </span>{" "}
                  Reviews
                </span>
              )}
              {profile.postCount > 0 && (
                <span className={styles.contentPill}>
                  <span className={styles.contentPillIcon}>💬</span>
                  <span className={styles.contentPillCount}>
                    {profile.postCount}
                  </span>{" "}
                  Posts
                </span>
              )}
              {profile.faveCount > 0 && (
                <span className={styles.contentPill}>
                  <span className={styles.contentPillIcon}>❤️</span>
                  <span className={styles.contentPillCount}>
                    {profile.faveCount}
                  </span>{" "}
                  Faves
                </span>
              )}
            </div>

            {ccUser && (
              <div className={styles.ccSection}>
                <div className={styles.ccSectionTitle}>
                  🕰️ ClockCrew.net Forum
                </div>
                <div className={styles.ccRow}>
                  {ccUser.avatarUrl && (
                    <img
                      src={ccUser.avatarUrl}
                      alt={ccUser.username}
                      className={styles.ccAvatar}
                    />
                  )}
                  <div className={styles.ccInfo}>
                    <span className={styles.ccUsername}>{ccUser.username}</span>
                    {ccUser.customTitle && (
                      <div className={styles.ccCustomTitle}>
                        &ldquo;{ccUser.customTitle}&rdquo;
                      </div>
                    )}
                  </div>
                </div>
                <div className={styles.ccStats}>
                  {ccUser.postCount != null && (
                    <span className={styles.ccStatItem}>
                      Forum Posts:{" "}
                      <span className={styles.ccStatValue}>
                        {formatNumber(ccUser.postCount)}
                      </span>
                    </span>
                  )}
                  {ccUser.dateRegistered && (
                    <span className={styles.ccStatItem}>
                      Registered:{" "}
                      <span className={styles.ccStatValue}>
                        {formatDate(ccUser.dateRegistered)}
                      </span>
                    </span>
                  )}
                </div>

                {randomPost?.body && (
                  <blockquote className={styles.ccForumQuote}>
                    <p className={styles.ccQuoteBody}>
                      &ldquo;
                      {(() => {
                        const stripped = randomPost.body
                          .replace(/<[^>]*>/g, "")
                          .trim();
                        return stripped.length > 280
                          ? stripped.slice(0, 277) + "…"
                          : stripped;
                      })()}
                      &rdquo;
                    </p>
                    <footer className={styles.ccQuoteFooter}>
                      {randomPost.threadTitle && (
                        <span className={styles.ccQuoteThread}>
                          <span className={styles.ccQuoteThreadIcon}>💬</span>
                          {randomPost.threadTitle}
                        </span>
                      )}
                      {randomPost.date && (
                        <span className={styles.ccQuoteDate}>
                          {formatDate(randomPost.date)}
                        </span>
                      )}
                    </footer>
                  </blockquote>
                )}
              </div>
            )}

            <TopSubmissionsSection
              title="Movies"
              emoji="🎬"
              items={data?.topMovies}
            />
            <TopSubmissionsSection
              title="Games"
              emoji="🎮"
              items={data?.topGames}
            />
            <TopSubmissionsSection
              title="Audio"
              emoji="🎵"
              items={data?.topAudio}
            />

            <div className={styles.cardActions}>
              <a
                href={profile.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.actionButton} ${styles.actionSecondary}`}
              >
                🌐 NG Profile
              </a>
              {ccUser?.profileUrl && (
                <a
                  href={ccUser.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.actionButton} ${styles.actionSecondary}`}
                >
                  🕰️ Forum Profile
                </a>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Profile Detail Modal (for Clocks tab) ────────────────────

interface ProfileDetailModalProps {
  username: string;
  onClose: () => void;
}

function ProfileDetailModal({ username, onClose }: ProfileDetailModalProps) {
  const [data, setData] = useState<CardApiResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!username) return;
    let cancelled = false;
    setLoading(true);
    fetch(`/api/newgrounds/card/${encodeURIComponent(username)}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((d: CardApiResponse) => {
        if (!cancelled) {
          setData(d);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [username]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const profile = data?.profile;
  const ccUser = data?.ccUser;
  const randomPost = data?.randomPost;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modalCard}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <CloseButtonComponent onClick={onClose} />

        {/* ══ PROFILE BANNER ════════════════════════════════ */}
        <div className={styles.profileBanner}>
          <div className={styles.profileBannerGradient} />
        </div>

        {loading ? (
          <div className={styles.loading} style={{ minHeight: 200 }}>
            <LoadingIndicatorComponent size={32} />
          </div>
        ) : !profile ? (
          <EmptyStateComponent subtitle="Profile not found" />
        ) : (
          <>
            {/* ── Avatar + Identity ─────────────────────────── */}
            <div className={styles.profileIdentity}>
              <div className={styles.profileAvatarWrap}>
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.username}
                    className={styles.cardAvatar}
                  />
                ) : (
                  <div className={styles.cardAvatarFallback}>
                    {(profile.username || "?")[0].toUpperCase()}
                  </div>
                )}
              </div>
              <div className={styles.profileNameBlock}>
                <span className={styles.profileDisplayName}>
                  {profile.username}
                </span>
                <div className={styles.cardRankRow}>
                  {profile.rank && (
                    <span
                      className={`${styles.cardRankBadge} ${styles.ngBadge}`}
                    >
                      {profile.rank}
                    </span>
                  )}
                  {profile.level != null && (
                    <span
                      className={`${styles.cardRankBadge} ${styles.levelBadge}`}
                    >
                      Lvl {profile.level}
                    </span>
                  )}
                  {profile.supporter && (
                    <span
                      className={`${styles.cardRankBadge} ${styles.supporterBadge}`}
                    >
                      ⭐ Supporter
                    </span>
                  )}
                  {ccUser?.position && (
                    <span
                      className={`${styles.cardRankBadge} ${styles.ccBadge}`}
                    >
                      {ccUser.position}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {profile.description && (
              <p className={styles.cardDescription}>{profile.description}</p>
            )}

            <div className={styles.cardPersonalInfo}>
              {profile.joinDate && (
                <span className={styles.personalInfoItem}>
                  <span className={styles.personalInfoIcon}>📅</span> Joined{" "}
                  <span className={styles.personalInfoValue}>
                    {profile.joinDate}
                  </span>
                </span>
              )}
              {profile.location && (
                <span className={styles.personalInfoItem}>
                  <span className={styles.personalInfoIcon}>📍</span>{" "}
                  <span className={styles.personalInfoValue}>
                    {profile.location}
                  </span>
                </span>
              )}
              {profile.age != null && (
                <span className={styles.personalInfoItem}>
                  <span className={styles.personalInfoIcon}>🎂</span>{" "}
                  <span className={styles.personalInfoValue}>
                    Age {profile.age}
                  </span>
                </span>
              )}
              {profile.sex && (
                <span className={styles.personalInfoItem}>
                  <span className={styles.personalInfoIcon}>👤</span>{" "}
                  <span className={styles.personalInfoValue}>
                    {profile.sex}
                  </span>
                </span>
              )}
              {profile.job && (
                <span className={styles.personalInfoItem}>
                  <span className={styles.personalInfoIcon}>💼</span>{" "}
                  <span className={styles.personalInfoValue}>
                    {profile.job}
                  </span>
                </span>
              )}
              {profile.realName && (
                <span className={styles.personalInfoItem}>
                  <span className={styles.personalInfoIcon}>🪪</span>{" "}
                  <span className={styles.personalInfoValue}>
                    {profile.realName}
                  </span>
                </span>
              )}
              {profile.school && (
                <span className={styles.personalInfoItem}>
                  <span className={styles.personalInfoIcon}>🎓</span>{" "}
                  <span className={styles.personalInfoValue}>
                    {profile.school}
                  </span>
                </span>
              )}
              {profile.globalRank != null && (
                <span className={styles.personalInfoItem}>
                  <span className={styles.personalInfoIcon}>🌍</span> Rank #
                  <span className={styles.personalInfoValue}>
                    {formatNumber(profile.globalRank)}
                  </span>
                </span>
              )}
              {profile.expPoints && (
                <span className={styles.personalInfoItem}>
                  <span className={styles.personalInfoIcon}>✨</span> EXP{" "}
                  <span className={styles.personalInfoValue}>
                    {profile.expPoints}
                  </span>
                </span>
              )}
              {profile.votePower && (
                <span className={styles.personalInfoItem}>
                  <span className={styles.personalInfoIcon}>⚡</span>{" "}
                  <span className={styles.personalInfoValue}>
                    {profile.votePower}
                  </span>
                </span>
              )}
            </div>

            <div className={styles.statsGrid}>
              <div className={styles.statItem}>
                <span className={styles.statValue}>
                  {formatNumber(profile.fans)}
                </span>
                <span className={styles.statLabel}>Fans</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>
                  {formatNumber(profile.blams)}
                </span>
                <span className={styles.statLabel}>Blams</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>
                  {formatNumber(profile.saves)}
                </span>
                <span className={styles.statLabel}>Saves</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>
                  {formatNumber(profile.medals)}
                </span>
                <span className={styles.statLabel}>Medals</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>
                  {formatNumber(profile.trophies)}
                </span>
                <span className={styles.statLabel}>Trophies</span>
              </div>
              {profile.expRank != null && (
                <div className={styles.statItem}>
                  <span className={styles.statValue}>
                    #{formatNumber(profile.expRank)}
                  </span>
                  <span className={styles.statLabel}>EXP Rank</span>
                </div>
              )}
            </div>

            <div className={styles.contentCounts}>
              {profile.movieCount > 0 && (
                <span className={styles.contentPill}>
                  <span className={styles.contentPillIcon}>🎬</span>
                  <span className={styles.contentPillCount}>
                    {profile.movieCount}
                  </span>{" "}
                  Movies
                </span>
              )}
              {profile.gameCount > 0 && (
                <span className={styles.contentPill}>
                  <span className={styles.contentPillIcon}>🎮</span>
                  <span className={styles.contentPillCount}>
                    {profile.gameCount}
                  </span>{" "}
                  Games
                </span>
              )}
              {profile.audioCount > 0 && (
                <span className={styles.contentPill}>
                  <span className={styles.contentPillIcon}>🎵</span>
                  <span className={styles.contentPillCount}>
                    {profile.audioCount}
                  </span>{" "}
                  Audio
                </span>
              )}

              {profile.reviewCount > 0 && (
                <span className={styles.contentPill}>
                  <span className={styles.contentPillIcon}>📝</span>
                  <span className={styles.contentPillCount}>
                    {profile.reviewCount}
                  </span>{" "}
                  Reviews
                </span>
              )}
              {profile.postCount > 0 && (
                <span className={styles.contentPill}>
                  <span className={styles.contentPillIcon}>💬</span>
                  <span className={styles.contentPillCount}>
                    {profile.postCount}
                  </span>{" "}
                  Posts
                </span>
              )}
              {profile.faveCount > 0 && (
                <span className={styles.contentPill}>
                  <span className={styles.contentPillIcon}>❤️</span>
                  <span className={styles.contentPillCount}>
                    {profile.faveCount}
                  </span>{" "}
                  Faves
                </span>
              )}
            </div>

            {/* ── Top Submissions ─────────────────────────────── */}
            <TopSubmissionsSection
              title="Movies"
              emoji="🎬"
              items={data?.topMovies}
            />
            <TopSubmissionsSection
              title="Games"
              emoji="🎮"
              items={data?.topGames}
            />
            <TopSubmissionsSection
              title="Audio"
              emoji="🎵"
              items={data?.topAudio}
            />

            {/* ── CC Forum ─────────────────────────────────────── */}
            {ccUser && (
              <div className={styles.ccSection}>
                <div className={styles.ccSectionTitle}>
                  🕰️ ClockCrew.net Forum
                </div>
                <div className={styles.ccRow}>
                  {ccUser.avatarUrl && (
                    <img
                      src={ccUser.avatarUrl}
                      alt={ccUser.username}
                      className={styles.ccAvatar}
                    />
                  )}
                  <div className={styles.ccInfo}>
                    <span className={styles.ccUsername}>{ccUser.username}</span>
                    {ccUser.customTitle && (
                      <div className={styles.ccCustomTitle}>
                        &ldquo;{ccUser.customTitle}&rdquo;
                      </div>
                    )}
                  </div>
                </div>
                <div className={styles.ccStats}>
                  {ccUser.postCount != null && (
                    <span className={styles.ccStatItem}>
                      Forum Posts:{" "}
                      <span className={styles.ccStatValue}>
                        {formatNumber(ccUser.postCount)}
                      </span>
                    </span>
                  )}
                  {ccUser.dateRegistered && (
                    <span className={styles.ccStatItem}>
                      Registered:{" "}
                      <span className={styles.ccStatValue}>
                        {formatDate(ccUser.dateRegistered)}
                      </span>
                    </span>
                  )}
                </div>

                {randomPost?.body && (
                  <blockquote className={styles.ccForumQuote}>
                    <p className={styles.ccQuoteBody}>
                      &ldquo;
                      {(() => {
                        const stripped = randomPost.body
                          .replace(/<[^>]*>/g, "")
                          .trim();
                        return stripped.length > 280
                          ? stripped.slice(0, 277) + "…"
                          : stripped;
                      })()}
                      &rdquo;
                    </p>
                    <footer className={styles.ccQuoteFooter}>
                      {randomPost.threadTitle && (
                        <span className={styles.ccQuoteThread}>
                          <span className={styles.ccQuoteThreadIcon}>💬</span>
                          {randomPost.threadTitle}
                        </span>
                      )}
                      {randomPost.date && (
                        <span className={styles.ccQuoteDate}>
                          {formatDate(randomPost.date)}
                        </span>
                      )}
                    </footer>
                  </blockquote>
                )}
              </div>
            )}

            {/* ── External Links ──────────────────────────────── */}
            {profile.links && profile.links.length > 0 && (
              <div className={styles.profileLinks}>
                <div className={styles.topSubTitle}>🔗 Links</div>
                <div className={styles.profileLinksList}>
                  {profile.links.map((link: string | { url?: string; label?: string; name?: string }, i: number) => {
                    const url = typeof link === "string" ? link : link.url || "";
                    const label = typeof link === "string" ? link : link.label || link.name || "";
                    return (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.profileLinkItem}
                      >
                        {label || (() => {
                          try { return new URL(url).hostname; } catch { return "Link"; }
                        })()}
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            <div className={styles.cardActions}>
              <a
                href={profile.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.actionButton} ${styles.actionPrimary}`}
              >
                🌐 NG Profile
              </a>
              {ccUser?.profileUrl && (
                <a
                  href={ccUser.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.actionButton} ${styles.actionSecondary}`}
                >
                  🕰️ Forum Profile
                </a>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Clock Profile Card (for Clocks tab) ──────────────────────────

interface ClockCardProps {
  profile: ClockProfile;
  style?: React.CSSProperties;
  onClick: () => void;
}

function ClockCard({ profile, style, onClick }: ClockCardProps) {
  const [imgError, setImgError] = useState(false);
  const fanCount = profile.fans?.count ?? 0;
  const avatarSrc = profile.ccAvatarUrl || profile.avatarUrl;
  const showAvatar = avatarSrc && !imgError;
  return (
    <div
      className={styles.itemCard}
      onClick={onClick}
      style={style}
      title={`${profile.username} — Lvl ${profile.level ?? "?"}`}
    >
      <div className={styles.clockAvatarWrap}>
        {showAvatar ? (
          <img
            src={avatarSrc}
            alt={profile.username}
            className={styles.clockAvatarImg}
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className={styles.clockAvatarFallbackInitial}>
            {(profile.username || "?")[0].toUpperCase()}
          </div>
        )}
        {profile.level != null && (
          <span className={styles.clockLevelBadge}>Lvl {profile.level}</span>
        )}
      </div>
      <div className={styles.itemInfo}>
        <span className={styles.itemTitle}>{profile.username}</span>
        <div className={styles.itemMeta}>
          <span className={styles.itemAuthor}>
            {profile.location || profile.joinDate || ""}
          </span>
          {fanCount > 0 && (
            <span className={styles.clockFanCount}>
              <span className={styles.scoreStar}>♥</span>
              {formatNumber(fanCount)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════
//  NewgroundsPortalComponent
// ═════════════════════════════════════════════════════════════════

const PAGE_SIZE = 40;

// Tab definitions — "clocks" uses a separate endpoint
const TABS = [
  { key: "all", label: "All" },
  { key: "movie", label: "🎬 Movies" },
  { key: "game", label: "🎮 Games" },
  { key: "audio", label: "🎵 Audio" },
  { key: "clocks", label: "🕰️ Clocks" },
];

export default function NewgroundsPortalComponent() {
  const [items, setItems] = useState<(PortalContentItem | ClockProfile)[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [year, setYear] = useState("");
  const [availableYears, setAvailableYears] = useState<AvailableYears>({
    contentYears: [],
    profileYears: [],
  });
  const [counts, setCounts] = useState<PortalCounts>({
    movies: 0,
    games: 0,
    audio: 0,
    clocks: 0,
  });
  const [selectedItem, setSelectedItem] = useState<PortalContentItem | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const skipRef = useRef(0);
  const fetchingRef = useRef(false);

  // ── Build title bar summary ────────────────────────────────────
  const titleSummary = (() => {
    if (type === "clocks") {
      return counts.clocks > 0
        ? `${counts.clocks.toLocaleString()} clocks`
        : "";
    }
    const parts: string[] = [];
    if (counts.movies > 0)
      parts.push(`${counts.movies.toLocaleString()} movies`);
    if (counts.games > 0) parts.push(`${counts.games.toLocaleString()} games`);
    if (counts.audio > 0) parts.push(`${counts.audio.toLocaleString()} audio`);
    return parts.join(" · ");
  })();

  // ── Fetch available years for dropdown ─────────────────────────
  useEffect(() => {
    let cancelled = false;
    fetch("/api/newgrounds/portal/years")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data: AvailableYears) => {
        if (!cancelled) setAvailableYears(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Fetch portal data ──────────────────────────────────────────
  const fetchPortal = useCallback(
    async (q = "", t = "all", append = false, yr = "") => {
      if (fetchingRef.current) return;
      fetchingRef.current = true;

      const skip = append ? skipRef.current : 0;
      if (!append) {
        setLoading(true);
        setHasMore(true);
        skipRef.current = 0;
      } else {
        setLoadingMore(true);
      }

      try {
        const isClocks = t === "clocks";
        const params = new URLSearchParams({
          sort: isClocks ? "fans" : "score",
          limit: String(PAGE_SIZE),
          skip: String(skip),
        });
        if (q) {
          params.set("q", q);
          if (!isClocks) params.set("username", q);
        }
        if (!isClocks) params.set("type", t);
        if (yr) params.set("year", yr);

        const endpoint = isClocks
          ? "/api/newgrounds/portal/clocks"
          : "/api/newgrounds/portal";
        const response = await fetch(`${endpoint}?${params}`);

        if (response.ok) {
          const data: PortalApiResponse = await response.json();

          if (isClocks) {
            const profiles = data.profiles || [];
            if (append) {
              setItems((prev) => [...prev, ...profiles]);
            } else {
              setItems(profiles);
              setCounts((prev) => ({ ...prev, clocks: data.totalClocks || 0 }));
            }
            skipRef.current = skip + profiles.length;
            if (
              profiles.length < PAGE_SIZE ||
              skipRef.current >= (data.totalClocks || 0)
            ) {
              setHasMore(false);
            }
          } else {
            const newItems = data.items || [];
            if (append) {
              setItems((prev) => [...prev, ...newItems]);
            } else {
              setItems(newItems);
              setCounts((prev) => ({
                movies: data.totalMovies || 0,
                games: data.totalGames || 0,
                audio: data.totalAudio || 0,
                clocks: prev.clocks,
              }));
            }
            skipRef.current = skip + newItems.length;
            const totalFiltered =
              (data.totalMovies || 0) +
              (data.totalGames || 0) +
              (data.totalAudio || 0);
            if (
              newItems.length < PAGE_SIZE ||
              skipRef.current >= totalFiltered
            ) {
              setHasMore(false);
            }
          }
        }
      } catch (error: unknown) {
        console.error("[NewgroundsPortal] Fetch error:", error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
        fetchingRef.current = false;
      }
    },
    [],
  );

  // ── Initial load ───────────────────────────────────────────────
  useEffect(() => {
    fetchPortal("", "all", false, "");
  }, [fetchPortal]);

  // ── IntersectionObserver for infinite scroll ───────────────────
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && hasMore && !loading && !loadingMore) {
          fetchPortal(query, type, true, year);
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, query, type, year, fetchPortal]);

  // ── Debounced search ───────────────────────────────────────────
  const handleSearchChange = useCallback(
    (value: string) => {
      setQuery(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        fetchPortal(value, type, false, year);
      }, 350);
    },
    [fetchPortal, type, year],
  );

  // ── Type tab switch ────────────────────────────────────────────
  const handleTypeChange = useCallback(
    (newType: string) => {
      setType(newType);
      // Reset year when switching between content and clocks tabs
      // since they use different year pools
      setYear("");
      fetchPortal(query, newType, false, "");
    },
    [fetchPortal, query],
  );

  // ── Year filter change ────────────────────────────────────────
  const handleYearChange = useCallback(
    (newYear: string) => {
      setYear(newYear);
      fetchPortal(query, type, false, newYear);
    },
    [fetchPortal, query, type],
  );

  // ── Card click → content detail modal ──────────────────────────
  const handleItemClick = useCallback((item: PortalContentItem) => {
    setSelectedItem(item);
  }, []);

  // ── Clock card click → open profile modal ──────────────────────
  const handleClockClick = useCallback((profile: ClockProfile) => {
    setSelectedProfile(
      profile.usernameLower || profile.username?.toLowerCase(),
    );
  }, []);

  const isClocks = type === "clocks";

  return (
    <>
      <div className={styles.container} id="newgrounds-portal">
        {/* ── Title Bar ─────────────────────────────────────── */}
        <div className={styles.titleBar}>
          <div className={styles.trafficLights}>
            <span className={styles.trafficDot} />
            <span className={styles.trafficDot} />
            <span className={styles.trafficDot} />
          </div>
          <span className={styles.titleBarCenter}>
            <span className={styles.titleText}>
              {isClocks ? "Clock Crew" : "Flash Portal"}
            </span>
          </span>
          <span className={styles.titleCount}>{titleSummary}</span>
        </div>

        {/* ── Content ───────────────────────────────────────── */}
        <div className={styles.contentArea}>
          {/* ── Search + Filters ──────────────────────────────── */}
          <div className={styles.searchBar}>
            <SearchInputComponent
              value={query}
              onChange={(value: string) => handleSearchChange(value)}
              placeholder={
                isClocks
                  ? "Search clocks by name…"
                  : "Search movies, games, audio, or usernames…"
              }
              leadingIcon={<Search size={14} />}
              className={styles.searchInputWrap}
            />
            <div className={styles.filterRow}>
              <div className={styles.typeTabs}>
                {TABS.map(({ key, label }) => (
                  <button
                    key={key}
                    className={`${styles.typeTab} ${type === key ? styles.typeTabActive : ""}`}
                    onClick={() => handleTypeChange(key)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className={styles.yearFilter}>
                <SelectComponent
                  value={year}
                  onChange={(value: string) => handleYearChange(value)}
                  options={[
                    { value: "", label: "All Years" },
                    ...(isClocks
                      ? availableYears.profileYears
                      : availableYears.contentYears
                    ).map((y: number) => ({ value: String(y), label: String(y) })),
                  ]}
                />
              </div>
            </div>
          </div>

          {/* ── Item Grid ─────────────────────────────────────── */}
          <div className={styles.itemGrid}>
            {loading && (
              <div className={styles.loading} style={{ gridColumn: "1 / -1" }}>
                <LoadingIndicatorComponent size={32} />
                <span>Loading {isClocks ? "clocks" : "portal"}…</span>
              </div>
            )}

            {!loading && items.length === 0 && (
              <div style={{ gridColumn: "1 / -1" }}>
                <EmptyStateComponent
                  icon={<span style={{ fontSize: 40 }}>🔍</span>}
                  subtitle={
                    query
                      ? `No results for "${query}"`
                      : isClocks
                        ? "No clocks found"
                        : "No submissions found"
                  }
                />
              </div>
            )}

            {!isClocks &&
              (items as PortalContentItem[]).map((item: PortalContentItem, i: number) => {
                const meta = getTypeMeta(item.contentType);
                return (
                  <div
                    key={`${item.contentId || item._id}-${i}`}
                    className={styles.itemCard}
                    onClick={() => handleItemClick(item)}
                    style={{ animationDelay: `${Math.min(i * 30, 600)}ms` }}
                    title={`${item.title} by ${item.usernameLower}`}
                  >
                    <div className={styles.itemThumbWrap}>
                      {item.thumbnailUrl && (
                        <img
                          src={item.thumbnailUrl}
                          alt={item.title}
                          className={styles.itemThumb}
                          loading="lazy"
                          onError={(e: SyntheticEvent<HTMLImageElement>) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      )}
                      <span
                        className={`${styles.typeBadge} ${styles[meta.badgeClass]}`}
                      >
                        {meta.emoji}
                      </span>
                    </div>
                    <div className={styles.itemInfo}>
                      <span className={styles.itemTitle}>{item.title}</span>
                      <div className={styles.itemMeta}>
                        <span className={styles.itemAuthor}>
                          {item.usernameLower}
                        </span>
                        <ScoreDisplay score={item.score} />
                      </div>
                    </div>
                  </div>
                );
              })}

            {isClocks &&
              (items as ClockProfile[]).map((profile: ClockProfile, i: number) => (
                <ClockCard
                  key={`${profile.usernameLower || profile._id}-${i}`}
                  profile={profile}
                  style={{ animationDelay: `${Math.min(i * 30, 600)}ms` }}
                  onClick={() => handleClockClick(profile)}
                />
              ))}

            {/* ── Infinite scroll sentinel ─────────────────────── */}
            <div ref={sentinelRef} className={styles.sentinel} />

            {loadingMore && (
              <div className={styles.loadingMore}>
                <LoadingIndicatorComponent size={24} />
              </div>
            )}

            {!loading && !hasMore && items.length > 0 && (
              <div className={styles.endOfList}>
                All {items.length.toLocaleString()}{" "}
                {isClocks ? "clocks" : "submissions"} loaded
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Content Detail Modal ─────────────────────────── */}
      {selectedItem && (
        <ContentDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}

      {/* ── Profile Detail Modal (Clocks tab) ────────────── */}
      {selectedProfile && (
        <ProfileDetailModal
          username={selectedProfile}
          onClose={() => setSelectedProfile(null)}
        />
      )}
    </>
  );
}
