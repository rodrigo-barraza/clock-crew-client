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
    <span className={styles['item-score']}>
      <span className={styles['score-star']}>★</span>
      {rounded.toFixed(1)}
    </span>
  );
}

function formatDate(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return "—";
  const parsedDate = new Date(dateStr);
  if (isNaN(parsedDate.getTime())) return String(dateStr);
  return parsedDate.toLocaleDateString("en-US", {
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
    <div className={styles['top-submissions']}>
      <div className={styles['top-sub-title']}>
        {emoji} Top {title}
      </div>
      <div className={styles['top-sub-list']}>
        {items.map((sub: MemberContentItem, i: number) => (
          <a
            key={sub.contentId || sub._id || i}
            href={sub.url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles['top-sub-item']}
          >
            {sub.thumbnailUrl && (
              <img
                src={sub.thumbnailUrl}
                alt={sub.title}
                className={styles['top-sub-thumb']}
                loading="lazy"
              />
            )}
            <div className={styles['top-sub-info']}>
              <span className={styles['top-sub-name']}>{sub.title}</span>
            </div>
            {sub.score != null && (
              <span className={styles['top-sub-score']}>
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
      .then((cardData: CardApiResponse) => {
        if (!cancelled) {
          setData(cardData);
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
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const profile = data?.profile;
  const ccUser = data?.ccUser;
  const randomPost = data?.randomPost;
  const meta = getTypeMeta(item?.contentType);

  return (
    <div className={styles['modal-overlay']} onClick={onClose}>
      <div
        className={styles['modal-card']}
        onClick={(event: React.MouseEvent) => event.stopPropagation()}
      >
        <CloseButtonComponent onClick={onClose} />

        {/* ══ CONTENT HERO — the clicked content ══════════ */}
        <div
          className={styles['content-hero']}
          style={
            item?.thumbnailUrl
              ? { backgroundImage: `url(${item.thumbnailUrl})` }
              : undefined
          }
        >
          <div className={styles['content-hero-overlay']} />
          <div className={styles['content-hero-body']}>
            <span className={`${styles['hero-badge']} ${styles[meta.badgeClass]}`}>
              {meta.emoji} {meta.label}
            </span>
            <h2 className={styles['content-hero-title']}>{item?.title}</h2>
            <div className={styles['content-hero-meta']}>
              <span className={styles['content-hero-author']}>
                by {item?.usernameLower}
              </span>
              {item?.score != null && (
                <span className={styles['content-hero-score']}>
                  ★ {item.score.toFixed(1)} / 5.0
                </span>
              )}
            </div>
            {item?.score != null && (
              <div className={styles['score-bar']}>
                <div
                  className={styles['score-bar-fill']}
                  style={{ width: `${(item.score / 5) * 100}%` }}
                />
              </div>
            )}
            <a
              href={item?.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles['action-button']} ${styles['action-hero']}`}
            >
              {meta.action}
            </a>
          </div>
        </div>

        {/* ══ CREATOR PROFILE ════════════════════════════════ */}
        <div className={styles['creator-divider']}>
          <span className={styles['creator-divider-text']}>Created by</span>
        </div>

        {loading ? (
          <div className={styles['is-loading-state']} style={{ minHeight: 120 }}>
            <LoadingIndicatorComponent size={32} />
          </div>
        ) : !profile ? (
          <EmptyStateComponent subtitle="Profile not found" />
        ) : (
          <>
            <div className={styles['creator-header']}>
              <div
                className={styles['card-avatar-wrap']}
                style={{ margin: 0, width: 56, height: 56 }}
              >
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.username}
                    className={styles['card-avatar']}
                  />
                ) : (
                  <div className={styles['card-avatar-fallback']}>
                    {(profile.username || "?")[0].toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <span className={styles['card-username']}>{profile.username}</span>
                <div className={styles['card-rank-row']}>
                  {profile.rank && (
                    <span
                      className={`${styles['card-rank-badge']} ${styles['ng-badge']}`}
                    >
                      {profile.rank}
                    </span>
                  )}
                  {profile.level != null && (
                    <span
                      className={`${styles['card-rank-badge']} ${styles['level-badge']}`}
                    >
                      Lvl {profile.level}
                    </span>
                  )}
                  {profile.supporter && (
                    <span
                      className={`${styles['card-rank-badge']} ${styles['supporter-badge']}`}
                    >
                      ⭐ Supporter
                    </span>
                  )}
                  {ccUser?.position && (
                    <span
                      className={`${styles['card-rank-badge']} ${styles['cc-badge']}`}
                    >
                      {ccUser.position}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {profile.description && (
              <p className={styles['card-description']}>{profile.description}</p>
            )}

            <div className={styles['card-personal-info']}>
              {profile.joinDate && (
                <span className={styles['personal-info-item']}>
                  <span className={styles['personal-info-icon']}>📅</span> Joined{" "}
                  <span className={styles['personal-info-value']}>
                    {profile.joinDate}
                  </span>
                </span>
              )}
              {profile.location && (
                <span className={styles['personal-info-item']}>
                  <span className={styles['personal-info-icon']}>📍</span>{" "}
                  <span className={styles['personal-info-value']}>
                    {profile.location}
                  </span>
                </span>
              )}
              {profile.age != null && (
                <span className={styles['personal-info-item']}>
                  <span className={styles['personal-info-icon']}>🎂</span>{" "}
                  <span className={styles['personal-info-value']}>
                    Age {profile.age}
                  </span>
                </span>
              )}
              {profile.sex && (
                <span className={styles['personal-info-item']}>
                  <span className={styles['personal-info-icon']}>👤</span>{" "}
                  <span className={styles['personal-info-value']}>
                    {profile.sex}
                  </span>
                </span>
              )}
              {profile.job && (
                <span className={styles['personal-info-item']}>
                  <span className={styles['personal-info-icon']}>💼</span>{" "}
                  <span className={styles['personal-info-value']}>
                    {profile.job}
                  </span>
                </span>
              )}
              {profile.globalRank != null && (
                <span className={styles['personal-info-item']}>
                  <span className={styles['personal-info-icon']}>🌍</span> Rank #
                  <span className={styles['personal-info-value']}>
                    {formatNumber(profile.globalRank)}
                  </span>
                </span>
              )}
              {profile.expPoints && (
                <span className={styles['personal-info-item']}>
                  <span className={styles['personal-info-icon']}>✨</span> EXP{" "}
                  <span className={styles['personal-info-value']}>
                    {profile.expPoints}
                  </span>
                </span>
              )}
              {profile.votePower && (
                <span className={styles['personal-info-item']}>
                  <span className={styles['personal-info-icon']}>⚡</span>{" "}
                  <span className={styles['personal-info-value']}>
                    {profile.votePower}
                  </span>
                </span>
              )}
            </div>

            <div className={styles['stats-grid']}>
              <div className={styles['stat-item']}>
                <span className={styles['stat-value']}>
                  {formatNumber(profile.fans)}
                </span>
                <span className={styles['stat-label']}>Fans</span>
              </div>
              <div className={styles['stat-item']}>
                <span className={styles['stat-value']}>
                  {formatNumber(profile.blams)}
                </span>
                <span className={styles['stat-label']}>Blams</span>
              </div>
              <div className={styles['stat-item']}>
                <span className={styles['stat-value']}>
                  {formatNumber(profile.saves)}
                </span>
                <span className={styles['stat-label']}>Saves</span>
              </div>
              <div className={styles['stat-item']}>
                <span className={styles['stat-value']}>
                  {formatNumber(profile.medals)}
                </span>
                <span className={styles['stat-label']}>Medals</span>
              </div>
              <div className={styles['stat-item']}>
                <span className={styles['stat-value']}>
                  {formatNumber(profile.trophies)}
                </span>
                <span className={styles['stat-label']}>Trophies</span>
              </div>
              {profile.expRank != null && (
                <div className={styles['stat-item']}>
                  <span className={styles['stat-value']}>
                    #{formatNumber(profile.expRank)}
                  </span>
                  <span className={styles['stat-label']}>EXP Rank</span>
                </div>
              )}
            </div>

            <div className={styles['content-counts']}>
              {profile.movieCount > 0 && (
                <span className={styles['content-pill']}>
                  <span className={styles['content-pill-icon']}>🎬</span>
                  <span className={styles['content-pill-count']}>
                    {profile.movieCount}
                  </span>{" "}
                  Movies
                </span>
              )}
              {profile.gameCount > 0 && (
                <span className={styles['content-pill']}>
                  <span className={styles['content-pill-icon']}>🎮</span>
                  <span className={styles['content-pill-count']}>
                    {profile.gameCount}
                  </span>{" "}
                  Games
                </span>
              )}
              {profile.audioCount > 0 && (
                <span className={styles['content-pill']}>
                  <span className={styles['content-pill-icon']}>🎵</span>
                  <span className={styles['content-pill-count']}>
                    {profile.audioCount}
                  </span>{" "}
                  Audio
                </span>
              )}

              {profile.reviewCount > 0 && (
                <span className={styles['content-pill']}>
                  <span className={styles['content-pill-icon']}>📝</span>
                  <span className={styles['content-pill-count']}>
                    {profile.reviewCount}
                  </span>{" "}
                  Reviews
                </span>
              )}
              {profile.postCount > 0 && (
                <span className={styles['content-pill']}>
                  <span className={styles['content-pill-icon']}>💬</span>
                  <span className={styles['content-pill-count']}>
                    {profile.postCount}
                  </span>{" "}
                  Posts
                </span>
              )}
              {profile.faveCount > 0 && (
                <span className={styles['content-pill']}>
                  <span className={styles['content-pill-icon']}>❤️</span>
                  <span className={styles['content-pill-count']}>
                    {profile.faveCount}
                  </span>{" "}
                  Faves
                </span>
              )}
            </div>

            {ccUser && (
              <div className={styles['cc-section']}>
                <div className={styles['cc-section-title']}>
                  🕰️ ClockCrew.net Forum
                </div>
                <div className={styles['cc-row']}>
                  {ccUser.avatarUrl && (
                    <img
                      src={ccUser.avatarUrl}
                      alt={ccUser.username}
                      className={styles['cc-avatar']}
                    />
                  )}
                  <div className={styles['cc-info']}>
                    <span className={styles['cc-username']}>{ccUser.username}</span>
                    {ccUser.customTitle && (
                      <div className={styles['cc-custom-title']}>
                        &ldquo;{ccUser.customTitle}&rdquo;
                      </div>
                    )}
                  </div>
                </div>
                <div className={styles['cc-stats']}>
                  {ccUser.postCount != null && (
                    <span className={styles['cc-stat-item']}>
                      Forum Posts:{" "}
                      <span className={styles['cc-stat-value']}>
                        {formatNumber(ccUser.postCount)}
                      </span>
                    </span>
                  )}
                  {ccUser.dateRegistered && (
                    <span className={styles['cc-stat-item']}>
                      Registered:{" "}
                      <span className={styles['cc-stat-value']}>
                        {formatDate(ccUser.dateRegistered)}
                      </span>
                    </span>
                  )}
                </div>

                {randomPost?.body && (
                  <blockquote className={styles['cc-forum-quote']}>
                    <p className={styles['cc-quote-body']}>
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
                    <footer className={styles['cc-quote-footer']}>
                      {randomPost.threadTitle && (
                        <span className={styles['cc-quote-thread']}>
                          <span className={styles['cc-quote-thread-icon']}>💬</span>
                          {randomPost.threadTitle}
                        </span>
                      )}
                      {randomPost.date && (
                        <span className={styles['cc-quote-date']}>
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

            <div className={styles['card-actions']}>
              <a
                href={profile.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles['action-button']} ${styles['action-secondary']}`}
              >
                🌐 NG Profile
              </a>
              {ccUser?.profileUrl && (
                <a
                  href={ccUser.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles['action-button']} ${styles['action-secondary']}`}
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
      .then((cardData: CardApiResponse) => {
        if (!cancelled) {
          setData(cardData);
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
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const profile = data?.profile;
  const ccUser = data?.ccUser;
  const randomPost = data?.randomPost;

  return (
    <div className={styles['modal-overlay']} onClick={onClose}>
      <div
        className={styles['modal-card']}
        onClick={(event: React.MouseEvent) => event.stopPropagation()}
      >
        <CloseButtonComponent onClick={onClose} />

        {/* ══ PROFILE BANNER ════════════════════════════════ */}
        <div className={styles['profile-banner']}>
          <div className={styles['profile-banner-gradient']} />
        </div>

        {loading ? (
          <div className={styles['is-loading-state']} style={{ minHeight: 200 }}>
            <LoadingIndicatorComponent size={32} />
          </div>
        ) : !profile ? (
          <EmptyStateComponent subtitle="Profile not found" />
        ) : (
          <>
            {/* ── Avatar + Identity ─────────────────────────── */}
            <div className={styles['profile-identity']}>
              <div className={styles['profile-avatar-wrap']}>
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.username}
                    className={styles['card-avatar']}
                  />
                ) : (
                  <div className={styles['card-avatar-fallback']}>
                    {(profile.username || "?")[0].toUpperCase()}
                  </div>
                )}
              </div>
              <div className={styles['profile-name-block']}>
                <span className={styles['profile-display-name']}>
                  {profile.username}
                </span>
                <div className={styles['card-rank-row']}>
                  {profile.rank && (
                    <span
                      className={`${styles['card-rank-badge']} ${styles['ng-badge']}`}
                    >
                      {profile.rank}
                    </span>
                  )}
                  {profile.level != null && (
                    <span
                      className={`${styles['card-rank-badge']} ${styles['level-badge']}`}
                    >
                      Lvl {profile.level}
                    </span>
                  )}
                  {profile.supporter && (
                    <span
                      className={`${styles['card-rank-badge']} ${styles['supporter-badge']}`}
                    >
                      ⭐ Supporter
                    </span>
                  )}
                  {ccUser?.position && (
                    <span
                      className={`${styles['card-rank-badge']} ${styles['cc-badge']}`}
                    >
                      {ccUser.position}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {profile.description && (
              <p className={styles['card-description']}>{profile.description}</p>
            )}

            <div className={styles['card-personal-info']}>
              {profile.joinDate && (
                <span className={styles['personal-info-item']}>
                  <span className={styles['personal-info-icon']}>📅</span> Joined{" "}
                  <span className={styles['personal-info-value']}>
                    {profile.joinDate}
                  </span>
                </span>
              )}
              {profile.location && (
                <span className={styles['personal-info-item']}>
                  <span className={styles['personal-info-icon']}>📍</span>{" "}
                  <span className={styles['personal-info-value']}>
                    {profile.location}
                  </span>
                </span>
              )}
              {profile.age != null && (
                <span className={styles['personal-info-item']}>
                  <span className={styles['personal-info-icon']}>🎂</span>{" "}
                  <span className={styles['personal-info-value']}>
                    Age {profile.age}
                  </span>
                </span>
              )}
              {profile.sex && (
                <span className={styles['personal-info-item']}>
                  <span className={styles['personal-info-icon']}>👤</span>{" "}
                  <span className={styles['personal-info-value']}>
                    {profile.sex}
                  </span>
                </span>
              )}
              {profile.job && (
                <span className={styles['personal-info-item']}>
                  <span className={styles['personal-info-icon']}>💼</span>{" "}
                  <span className={styles['personal-info-value']}>
                    {profile.job}
                  </span>
                </span>
              )}
              {profile.realName && (
                <span className={styles['personal-info-item']}>
                  <span className={styles['personal-info-icon']}>🪪</span>{" "}
                  <span className={styles['personal-info-value']}>
                    {profile.realName}
                  </span>
                </span>
              )}
              {profile.school && (
                <span className={styles['personal-info-item']}>
                  <span className={styles['personal-info-icon']}>🎓</span>{" "}
                  <span className={styles['personal-info-value']}>
                    {profile.school}
                  </span>
                </span>
              )}
              {profile.globalRank != null && (
                <span className={styles['personal-info-item']}>
                  <span className={styles['personal-info-icon']}>🌍</span> Rank #
                  <span className={styles['personal-info-value']}>
                    {formatNumber(profile.globalRank)}
                  </span>
                </span>
              )}
              {profile.expPoints && (
                <span className={styles['personal-info-item']}>
                  <span className={styles['personal-info-icon']}>✨</span> EXP{" "}
                  <span className={styles['personal-info-value']}>
                    {profile.expPoints}
                  </span>
                </span>
              )}
              {profile.votePower && (
                <span className={styles['personal-info-item']}>
                  <span className={styles['personal-info-icon']}>⚡</span>{" "}
                  <span className={styles['personal-info-value']}>
                    {profile.votePower}
                  </span>
                </span>
              )}
            </div>

            <div className={styles['stats-grid']}>
              <div className={styles['stat-item']}>
                <span className={styles['stat-value']}>
                  {formatNumber(profile.fans)}
                </span>
                <span className={styles['stat-label']}>Fans</span>
              </div>
              <div className={styles['stat-item']}>
                <span className={styles['stat-value']}>
                  {formatNumber(profile.blams)}
                </span>
                <span className={styles['stat-label']}>Blams</span>
              </div>
              <div className={styles['stat-item']}>
                <span className={styles['stat-value']}>
                  {formatNumber(profile.saves)}
                </span>
                <span className={styles['stat-label']}>Saves</span>
              </div>
              <div className={styles['stat-item']}>
                <span className={styles['stat-value']}>
                  {formatNumber(profile.medals)}
                </span>
                <span className={styles['stat-label']}>Medals</span>
              </div>
              <div className={styles['stat-item']}>
                <span className={styles['stat-value']}>
                  {formatNumber(profile.trophies)}
                </span>
                <span className={styles['stat-label']}>Trophies</span>
              </div>
              {profile.expRank != null && (
                <div className={styles['stat-item']}>
                  <span className={styles['stat-value']}>
                    #{formatNumber(profile.expRank)}
                  </span>
                  <span className={styles['stat-label']}>EXP Rank</span>
                </div>
              )}
            </div>

            <div className={styles['content-counts']}>
              {profile.movieCount > 0 && (
                <span className={styles['content-pill']}>
                  <span className={styles['content-pill-icon']}>🎬</span>
                  <span className={styles['content-pill-count']}>
                    {profile.movieCount}
                  </span>{" "}
                  Movies
                </span>
              )}
              {profile.gameCount > 0 && (
                <span className={styles['content-pill']}>
                  <span className={styles['content-pill-icon']}>🎮</span>
                  <span className={styles['content-pill-count']}>
                    {profile.gameCount}
                  </span>{" "}
                  Games
                </span>
              )}
              {profile.audioCount > 0 && (
                <span className={styles['content-pill']}>
                  <span className={styles['content-pill-icon']}>🎵</span>
                  <span className={styles['content-pill-count']}>
                    {profile.audioCount}
                  </span>{" "}
                  Audio
                </span>
              )}

              {profile.reviewCount > 0 && (
                <span className={styles['content-pill']}>
                  <span className={styles['content-pill-icon']}>📝</span>
                  <span className={styles['content-pill-count']}>
                    {profile.reviewCount}
                  </span>{" "}
                  Reviews
                </span>
              )}
              {profile.postCount > 0 && (
                <span className={styles['content-pill']}>
                  <span className={styles['content-pill-icon']}>💬</span>
                  <span className={styles['content-pill-count']}>
                    {profile.postCount}
                  </span>{" "}
                  Posts
                </span>
              )}
              {profile.faveCount > 0 && (
                <span className={styles['content-pill']}>
                  <span className={styles['content-pill-icon']}>❤️</span>
                  <span className={styles['content-pill-count']}>
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
              <div className={styles['cc-section']}>
                <div className={styles['cc-section-title']}>
                  🕰️ ClockCrew.net Forum
                </div>
                <div className={styles['cc-row']}>
                  {ccUser.avatarUrl && (
                    <img
                      src={ccUser.avatarUrl}
                      alt={ccUser.username}
                      className={styles['cc-avatar']}
                    />
                  )}
                  <div className={styles['cc-info']}>
                    <span className={styles['cc-username']}>{ccUser.username}</span>
                    {ccUser.customTitle && (
                      <div className={styles['cc-custom-title']}>
                        &ldquo;{ccUser.customTitle}&rdquo;
                      </div>
                    )}
                  </div>
                </div>
                <div className={styles['cc-stats']}>
                  {ccUser.postCount != null && (
                    <span className={styles['cc-stat-item']}>
                      Forum Posts:{" "}
                      <span className={styles['cc-stat-value']}>
                        {formatNumber(ccUser.postCount)}
                      </span>
                    </span>
                  )}
                  {ccUser.dateRegistered && (
                    <span className={styles['cc-stat-item']}>
                      Registered:{" "}
                      <span className={styles['cc-stat-value']}>
                        {formatDate(ccUser.dateRegistered)}
                      </span>
                    </span>
                  )}
                </div>

                {randomPost?.body && (
                  <blockquote className={styles['cc-forum-quote']}>
                    <p className={styles['cc-quote-body']}>
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
                    <footer className={styles['cc-quote-footer']}>
                      {randomPost.threadTitle && (
                        <span className={styles['cc-quote-thread']}>
                          <span className={styles['cc-quote-thread-icon']}>💬</span>
                          {randomPost.threadTitle}
                        </span>
                      )}
                      {randomPost.date && (
                        <span className={styles['cc-quote-date']}>
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
              <div className={styles['profile-links']}>
                <div className={styles['top-sub-title']}>🔗 Links</div>
                <div className={styles['profile-links-list']}>
                  {profile.links.map((link: string | { url?: string; label?: string; name?: string }, i: number) => {
                    const url = typeof link === "string" ? link : link.url || "";
                    const label = typeof link === "string" ? link : link.label || link.name || "";
                    return (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles['profile-link-item']}
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

            <div className={styles['card-actions']}>
              <a
                href={profile.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles['action-button']} ${styles['action-primary']}`}
              >
                🌐 NG Profile
              </a>
              {ccUser?.profileUrl && (
                <a
                  href={ccUser.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles['action-button']} ${styles['action-secondary']}`}
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
      className={styles['item-card']}
      onClick={onClick}
      style={style}
      title={`${profile.username} — Lvl ${profile.level ?? "?"}`}
    >
      <div className={styles['clock-avatar-wrap']}>
        {showAvatar ? (
          <img
            src={avatarSrc}
            alt={profile.username}
            className={styles['clock-avatar-img']}
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className={styles['clock-avatar-fallback-initial']}>
            {(profile.username || "?")[0].toUpperCase()}
          </div>
        )}
        {profile.level != null && (
          <span className={styles['clock-level-badge']}>Lvl {profile.level}</span>
        )}
      </div>
      <div className={styles['item-info']}>
        <span className={styles['item-title']}>{profile.username}</span>
        <div className={styles['item-meta']}>
          <span className={styles['item-author']}>
            {profile.location || profile.joinDate || ""}
          </span>
          {fanCount > 0 && (
            <span className={styles['clock-fan-count']}>
              <span className={styles['score-star']}>♥</span>
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
    async (searchQuery = "", contentType = "all", append = false, yearFilter = "") => {
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
        const isClocks = contentType === "clocks";
        const params = new URLSearchParams({
          sort: isClocks ? "fans" : "score",
          limit: String(PAGE_SIZE),
          skip: String(skip),
        });
        if (searchQuery) {
          params.set("q", searchQuery);
          if (!isClocks) params.set("username", searchQuery);
        }
        if (!isClocks) params.set("type", contentType);
        if (yearFilter) params.set("year", yearFilter);

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
        <div className={styles['title-bar']}>
          <div className={styles['traffic-lights']}>
            <span className={styles['traffic-dot']} />
            <span className={styles['traffic-dot']} />
            <span className={styles['traffic-dot']} />
          </div>
          <span className={styles['title-bar-center']}>
            <span className={styles['title-text']}>
              {isClocks ? "Clock Crew" : "Flash Portal"}
            </span>
          </span>
          <span className={styles['title-count']}>{titleSummary}</span>
        </div>

        {/* ── Content ───────────────────────────────────────── */}
        <div className={styles['content-area']}>
          {/* ── Search + Filters ──────────────────────────────── */}
          <div className={styles['search-bar']}>
            <SearchInputComponent
              value={query}
              onChange={(value: string) => handleSearchChange(value)}
              placeholder={
                isClocks
                  ? "Search clocks by name…"
                  : "Search movies, games, audio, or usernames…"
              }
              leadingIcon={<Search size={14} />}
              className={styles['search-input-wrap']}
            />
            <div className={styles['filter-row']}>
              <div className={styles['type-tabs']}>
                {TABS.map(({ key, label }) => (
                  <button
                    key={key}
                    className={`${styles['type-tab']} ${type === key ? styles['type-tab-active'] : ""}`}
                    onClick={() => handleTypeChange(key)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className={styles['year-filter']}>
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
          <div className={styles['item-grid']}>
            {loading && (
              <div className={styles['is-loading-state']} style={{ gridColumn: "1 / -1" }}>
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
                    className={styles['item-card']}
                    onClick={() => handleItemClick(item)}
                    style={{ animationDelay: `${Math.min(i * 30, 600)}ms` }}
                    title={`${item.title} by ${item.usernameLower}`}
                  >
                    <div className={styles['item-thumb-wrap']}>
                      {item.thumbnailUrl && (
                        <img
                          src={item.thumbnailUrl}
                          alt={item.title}
                          className={styles['item-thumb']}
                          loading="lazy"
                          onError={(event: SyntheticEvent<HTMLImageElement>) => {
                            event.currentTarget.style.display = "none";
                          }}
                        />
                      )}
                      <span
                        className={`${styles['type-badge']} ${styles[meta.badgeClass]}`}
                      >
                        {meta.emoji}
                      </span>
                    </div>
                    <div className={styles['item-info']}>
                      <span className={styles['item-title']}>{item.title}</span>
                      <div className={styles['item-meta']}>
                        <span className={styles['item-author']}>
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
              <div className={styles['loading-more']}>
                <LoadingIndicatorComponent size={24} />
              </div>
            )}

            {!loading && !hasMore && items.length > 0 && (
              <div className={styles['end-of-list']}>
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
