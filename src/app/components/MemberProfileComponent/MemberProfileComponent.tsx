"use client";

import { useState, useEffect, useCallback, SyntheticEvent } from "react";
import Link from "next/link";
import { formatNumber, stripHtml } from "@rodrigo-barraza/utilities-library";
import styles from "./MemberProfileComponent.module.css";
import {
  TransformedMemberProfileData,
  MemberProfile,
  NewgroundsStats,
  ClockCrewForumStats,
  AIProfileSummary,
  MemberContentItem,
  ForumThread,
  ForumPost,
  Review,
} from "../../../types";

// ── Helpers ──────────────────────────────────────────────────────

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

const errorMessage = (err: unknown): string =>
  err instanceof Error ? err.message : String(err);

// ── Tab definitions ──────────────────────────────────────────────
interface TabDefinition {
  key: string;
  label: string;
  icon: string;
}

const TABS: TabDefinition[] = [
  { key: "overview", label: "Overview", icon: "📋" },
  { key: "movies", label: "Movies", icon: "🎬" },
  { key: "games", label: "Games", icon: "🎮" },
  { key: "audio", label: "Audio", icon: "🎵" },
  { key: "art", label: "Art", icon: "🎨" },
  { key: "posts", label: "Posts", icon: "💬" },
  { key: "reviews", label: "Reviews", icon: "📝" },
];

// ── Sub-components ───────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string | number | undefined;
  icon?: string;
}

function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <div className={styles.statCard}>
      {icon && <span className={styles.statIcon}>{icon}</span>}
      <span className={styles.statValue}>{value}</span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  );
}

interface ContentCardProps {
  item: MemberContentItem;
  type: string;
}

function ContentCard({ item, type }: ContentCardProps) {
  const emoji =
    type === "movie"
      ? "🎬"
      : type === "game"
        ? "🎮"
        : type === "audio"
          ? "🎵"
          : "🎨";
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.contentCard}
    >
      {item.thumbnailUrl && (
        <img
          src={item.thumbnailUrl}
          alt={item.title}
          className={styles.contentThumb}
          loading="lazy"
          onError={(event: SyntheticEvent<HTMLImageElement>) => {
            event.currentTarget.style.display = "none";
          }}
        />
      )}
      <div className={styles.contentInfo}>
        <span className={styles.contentTitle}>{item.title}</span>
        <div className={styles.contentMeta}>
          <span className={styles.contentType}>{emoji}</span>
          {item.score != null && (
            <span className={styles.contentScore}>
              ★ {(Math.round(item.score * 10) / 10).toFixed(1)}
            </span>
          )}
          {item.views != null && (
            <span className={styles.contentViews}>
              {formatNumber(item.views)} views
            </span>
          )}
          {item.publishedDate && (
            <span className={styles.contentDate}>
              {formatDate(item.publishedDate)}
            </span>
          )}
        </div>
        {item.description && (
          <p className={styles.contentDesc}>
            {item.description.length > 120
              ? item.description.slice(0, 120) + "…"
              : item.description}
          </p>
        )}
      </div>
    </a>
  );
}

interface PostItemProps {
  post: ForumPost;
  showThread?: boolean;
}

function PostItem({ post, showThread = true }: PostItemProps) {
  const body = stripHtml(post.body || post.content || "");
  return (
    <div className={styles.postItem}>
      <div className={styles.postHeader}>
        {showThread && post.threadTitle && (
          <span className={styles.postThread}>{post.threadTitle}</span>
        )}
        {post.date && (
          <time className={styles.postDate}>{formatDate(post.date)}</time>
        )}
      </div>
      {body && (
        <p className={styles.postBody}>
          {body.length > 300 ? body.slice(0, 300) + "…" : body}
        </p>
      )}
    </div>
  );
}

interface ReviewItemProps {
  review: Review;
}

function ReviewItem({ review }: ReviewItemProps) {
  const body = stripHtml(review.body || review.text || "");
  return (
    <div className={styles.reviewItem}>
      <div className={styles.reviewHeader}>
        <span className={styles.reviewTarget}>
          {review.contentTitle || review.contentUrl || "Unknown"}
        </span>
        {review.score != null && (
          <span className={styles.reviewScore}>{review.score}/10</span>
        )}
      </div>
      {body && (
        <p className={styles.reviewBody}>
          {body.length > 250 ? body.slice(0, 250) + "…" : body}
        </p>
      )}
    </div>
  );
}

interface ContentSectionProps {
  items?: MemberContentItem[];
  type: string;
  emptyLabel: string;
}

function ContentSection({ items, type, emptyLabel }: ContentSectionProps) {
  if (!items?.length) {
    return (
      <div className={styles.emptyTab}>
        <span className={styles.emptyTabIcon}>📭</span>
        <span>No {emptyLabel} found</span>
      </div>
    );
  }
  return (
    <div className={styles.contentGrid}>
      {items.map((item, i) => (
        <ContentCard
          key={item.contentId || item._id || i}
          item={item}
          type={item.type || type}
        />
      ))}
    </div>
  );
}

// ── Overview Tab ─────────────────────────────────────────────────

interface OverviewTabProps {
  data: TransformedMemberProfileData;
}

function OverviewTab({ data }: OverviewTabProps) {
  const { member, movies, games, audio, fans, ccPosts, ccThreads } = data;
  const newgroundsStats = member.newgrounds;
  const clockCrewForum = member.ccForum;
  const summary = member.profileSummary;

  // Top 3 of each content type for highlights
  const topMovies = movies?.slice(0, 3) || [];
  const topGames = games?.slice(0, 3) || [];
  const topAudio = audio?.slice(0, 3) || [];

  return (
    <div className={styles.overviewGrid}>
      {/* ── AI Profile Summary ─────────────────────────────────── */}
      {summary?.markdown && summary.status === "complete" && (
        <section className={styles.summaryPanel}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>🤖</span>
            AI-Generated Profile
            <span className={styles.summaryMeta}>
              {summary.model && (
                <span className={styles.summaryModel}>{summary.model}</span>
              )}
            </span>
          </h2>
          <div className={styles.summaryContent}>
            <MarkdownRenderer markdown={summary.markdown} />
          </div>
        </section>
      )}

      {/* ── Newgrounds Stats ───────────────────────────────────── */}
      {newgroundsStats && (
        <section className={styles.panel}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>🟠</span>
            Newgrounds Stats
          </h2>
          <div className={styles.miniStatsGrid}>
            <StatCard label="Fans" value={formatNumber(newgroundsStats.fans)} icon="♥" />
            <StatCard label="Level" value={newgroundsStats.level ?? "—"} icon="⬆" />
            <StatCard label="Blams" value={formatNumber(newgroundsStats.blams)} icon="💣" />
            <StatCard label="Saves" value={formatNumber(newgroundsStats.saves)} icon="🛡" />
            <StatCard
              label="Medals"
              value={formatNumber(newgroundsStats.medals)}
              icon="🏅"
            />
            <StatCard
              label="Trophies"
              value={formatNumber(newgroundsStats.trophies)}
              icon="🏆"
            />
            {newgroundsStats.expPoints && (
              <StatCard label="EXP" value={newgroundsStats.expPoints} icon="✨" />
            )}
            {newgroundsStats.votePower && (
              <StatCard label="Vote Power" value={newgroundsStats.votePower} icon="⚡" />
            )}
          </div>
          {newgroundsStats.description && <p className={styles.ngBio}>{newgroundsStats.description}</p>}
          <div className={styles.personalInfo}>
            {newgroundsStats.joinDate && (
              <span className={styles.infoItem}>📅 Joined {newgroundsStats.joinDate}</span>
            )}
            {newgroundsStats.location && (
              <span className={styles.infoItem}>📍 {newgroundsStats.location}</span>
            )}
            {newgroundsStats.job && <span className={styles.infoItem}>💼 {newgroundsStats.job}</span>}
            {newgroundsStats.age != null && (
              <span className={styles.infoItem}>🎂 Age {newgroundsStats.age}</span>
            )}
            {newgroundsStats.sex && <span className={styles.infoItem}>👤 {newgroundsStats.sex}</span>}
            {newgroundsStats.realName && (
              <span className={styles.infoItem}>🪪 {newgroundsStats.realName}</span>
            )}
            {newgroundsStats.school && (
              <span className={styles.infoItem}>🎓 {newgroundsStats.school}</span>
            )}
            {newgroundsStats.rank && <span className={styles.infoItem}>🎖 {newgroundsStats.rank}</span>}
            {newgroundsStats.globalRank != null && (
              <span className={styles.infoItem}>
                🌍 Rank #{formatNumber(newgroundsStats.globalRank)}
              </span>
            )}
          </div>
        </section>
      )}

      {/* ── CC Forum ───────────────────────────────────────────── */}
      {clockCrewForum && (
        <section className={styles.panel}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>🕰️</span>
            ClockCrew.net Forum
          </h2>
          <div className={styles.ccIdentity}>
            {clockCrewForum.avatarUrl && (
              <img
                src={clockCrewForum.avatarUrl}
                alt={clockCrewForum.username}
                className={styles.ccAvatar}
              />
            )}
            <div>
              <span className={styles.ccName}>{clockCrewForum.username}</span>
              {clockCrewForum.customTitle && (
                <span className={styles.ccTitle}>
                  &ldquo;{clockCrewForum.customTitle}&rdquo;
                </span>
              )}
              {clockCrewForum.position && (
                <span className={styles.ccBadge}>{clockCrewForum.position}</span>
              )}
            </div>
          </div>
          <div className={styles.miniStatsGrid}>
            <StatCard
              label="Posts"
              value={formatNumber(clockCrewForum.postCount)}
              icon="💬"
            />
            <StatCard
              label="Registered"
              value={formatDate(clockCrewForum.dateRegistered)}
              icon="📅"
            />
            {clockCrewForum.location && (
              <StatCard label="Location" value={clockCrewForum.location} icon="📍" />
            )}
            {clockCrewForum.gender && (
              <StatCard label="Gender" value={clockCrewForum.gender} icon="👤" />
            )}
          </div>
          {clockCrewForum.signatureHtml && (
            <div className={styles.signatureWrap}>
              <span className={styles.signatureLabel}>Signature</span>
              <div
                className={styles.signatureContent}
                dangerouslySetInnerHTML={{ __html: clockCrewForum.signatureHtml }}
              />
            </div>
          )}
        </section>
      )}

      {/* ── Content Counts ─────────────────────────────────────── */}
      {newgroundsStats && (
        <section className={styles.panel}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>📊</span>
            Content Overview
          </h2>
          <div className={styles.contentPills}>
            {newgroundsStats.movieCount > 0 && (
              <span className={styles.pill}>🎬 {newgroundsStats.movieCount} Movies</span>
            )}
            {newgroundsStats.gameCount > 0 && (
              <span className={styles.pill}>🎮 {newgroundsStats.gameCount} Games</span>
            )}
            {newgroundsStats.audioCount > 0 && (
              <span className={styles.pill}>🎵 {newgroundsStats.audioCount} Audio</span>
            )}
            {newgroundsStats.reviewCount > 0 && (
              <span className={styles.pill}>📝 {newgroundsStats.reviewCount} Reviews</span>
            )}
            {newgroundsStats.postCount > 0 && (
              <span className={styles.pill}>💬 {newgroundsStats.postCount} Posts</span>
            )}
            {newgroundsStats.faveCount > 0 && (
              <span className={styles.pill}>❤️ {newgroundsStats.faveCount} Faves</span>
            )}
            {newgroundsStats.newsCount > 0 && (
              <span className={styles.pill}>📰 {newgroundsStats.newsCount} News</span>
            )}
          </div>
        </section>
      )}

      {/* ── Top Movies ─────────────────────────────────────────── */}
      {topMovies.length > 0 && (
        <section className={styles.panel}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>🎬</span>
            Top Movies
          </h2>
          <div className={styles.topContentList}>
            {topMovies.map((movie: MemberContentItem, i: number) => (
              <ContentCard key={movie.contentId || i} item={movie} type="movie" />
            ))}
          </div>
        </section>
      )}

      {/* ── Top Games ──────────────────────────────────────────── */}
      {topGames.length > 0 && (
        <section className={styles.panel}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>🎮</span>
            Top Games
          </h2>
          <div className={styles.topContentList}>
            {topGames.map((game: MemberContentItem, i: number) => (
              <ContentCard key={game.contentId || i} item={game} type="game" />
            ))}
          </div>
        </section>
      )}

      {/* ── Top Audio ──────────────────────────────────────────── */}
      {topAudio.length > 0 && (
        <section className={styles.panel}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>🎵</span>
            Top Audio
          </h2>
          <div className={styles.topContentList}>
            {topAudio.map((audio: MemberContentItem, i: number) => (
              <ContentCard key={audio.contentId || i} item={audio} type="audio" />
            ))}
          </div>
        </section>
      )}

      {/* ── Fans ───────────────────────────────────────────────── */}
      {fans && fans.length > 0 && (
        <section className={styles.panel}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>♥</span>
            Fans
            <span className={styles.panelCount}>{fans.length}</span>
          </h2>
          <div className={styles.fansList}>
            {fans.slice(0, 50).map((fan: string, i: number) => (
              <span key={i} className={styles.fanTag}>
                {fan}
              </span>
            ))}
            {fans.length > 50 && (
              <span className={styles.fanMore}>+{fans.length - 50} more</span>
            )}
          </div>
        </section>
      )}

      {/* ── CC Threads Started ─────────────────────────────────── */}
      {ccThreads && ccThreads.length > 0 && (
        <section className={styles.panel}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>📌</span>
            Forum Threads Started
            <span className={styles.panelCount}>{ccThreads.length}</span>
          </h2>
          <ul className={styles.threadList}>
            {ccThreads.slice(0, 20).map((forumThread: ForumThread, i: number) => (
              <li key={forumThread.topicId || i} className={styles.threadItem}>
                <span className={styles.threadTitle}>{forumThread.title}</span>
                <span className={styles.threadMeta}>
                  {forumThread.totalPosts != null && <span>{forumThread.totalPosts} replies</span>}
                  {forumThread.date && <span>{formatDate(forumThread.date)}</span>}
                  {forumThread.boardName && (
                    <span className={styles.threadBoard}>{forumThread.boardName}</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── Recent CC Posts ─────────────────────────────────────── */}
      {ccPosts && ccPosts.length > 0 && (
        <section className={styles.panel}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>💬</span>
            Recent Forum Posts
            <span className={styles.panelCount}>{ccPosts.length}</span>
          </h2>
          <div className={styles.postsList}>
            {ccPosts.slice(0, 10).map((post: ForumPost, i: number) => (
              <PostItem key={post.messageId || i} post={post} />
            ))}
          </div>
        </section>
      )}

      {/* ── External Links ─────────────────────────────────────── */}
      {newgroundsStats?.links && newgroundsStats.links.length > 0 && (
        <section className={styles.panel}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>🔗</span>
            Links
          </h2>
          <div className={styles.linksList}>
            {newgroundsStats.links.map((link: string | { url?: string; label?: string; name?: string }, i: number) => {
              const url = typeof link === "string" ? link : link.url || "";
              const label = typeof link === "string" ? link : link.label || link.name || "";
              return (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.linkItem}
                >
                  {label || (() => {
                    try {
                      return new URL(url).hostname;
                    } catch {
                      return "Link";
                    }
                  })()}
                </a>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

// ── Simple markdown renderer ─────────────────────────────────────
interface MarkdownRendererProps {
  markdown?: string;
}

function MarkdownRenderer({ markdown }: MarkdownRendererProps) {
  if (!markdown) return null;

  const lines = markdown.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("# ")) {
      elements.push(
        <h1 key={i} className={styles.mdH1}>
          {line.slice(2)}
        </h1>,
      );
    } else if (line.startsWith("## ")) {
      elements.push(
        <h2 key={i} className={styles.mdH2}>
          {line.slice(3)}
        </h2>,
      );
    } else if (line.startsWith("### ")) {
      elements.push(
        <h3 key={i} className={styles.mdH3}>
          {line.slice(4)}
        </h3>,
      );
    } else if (line.startsWith("> ")) {
      elements.push(
        <blockquote key={i} className={styles.mdBlockquote}>
          {line.slice(2)}
        </blockquote>,
      );
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      const listItems: string[] = [];
      let j = i;
      while (
        j < lines.length &&
        (lines[j].startsWith("- ") ||
          lines[j].startsWith("* ") ||
          lines[j].startsWith("  "))
      ) {
        listItems.push(lines[j].replace(/^[-*]\s/, "").replace(/^\s+/, ""));
        j++;
      }
      elements.push(
        <ul key={i} className={styles.mdList}>
          {listItems.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>,
      );
      i = j;
      continue;
    } else if (line.trim() === "") {
      // skip
    } else {
      elements.push(
        <p key={i} className={styles.mdParagraph}>
          {line}
        </p>,
      );
    }
    i++;
  }

  return <div className={styles.mdWrap}>{elements}</div>;
}

// ═════════════════════════════════════════════════════════════════
// Main Component
// ═════════════════════════════════════════════════════════════════

interface MemberProfileComponentProps {
  username: string;
}

interface FetchMemberResponse {
  data: TransformedMemberProfileData | null;
  error: string | null;
}

export default function MemberProfileComponent({ username }: MemberProfileComponentProps) {
  const [data, setData] = useState<TransformedMemberProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  const fetchMember = useCallback(async (name: string): Promise<FetchMemberResponse> => {
    try {
      const response = await fetch(
        `/api/clockcrew/users/${encodeURIComponent(name)}`,
      );
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || `Failed (${response.status})`);
      }
      return { data: await response.json(), error: null };
    } catch (err: unknown) {
      return { data: null, error: errorMessage(err) };
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    fetchMember(username).then(({ data: fetchedData, error: fetchedError }) => {
      if (cancelled) return;
      setData(fetchedData);
      setError(fetchedError);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [username, fetchMember]);

  // ── Loading ────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className={styles.profileWrap}>
        <div className={styles.skeleton}>
          <div className={styles.skeletonAvatar} />
          <div className={styles.skeletonLines}>
            <div className={styles.skeletonLine} style={{ width: "40%" }} />
            <div className={styles.skeletonLine} style={{ width: "60%" }} />
            <div className={styles.skeletonLine} style={{ width: "30%" }} />
          </div>
        </div>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────
  if (error || !data?.member) {
    return (
      <div className={styles.profileWrap}>
        <div className={styles.errorCard}>
          <span className={styles.errorIcon}>⚠️</span>
          <p className={styles.errorText}>{error || "Member not found"}</p>
          <Link href="/clocks" className={styles.backLink}>
            ← Back to Members
          </Link>
        </div>
      </div>
    );
  }

  const { member, movies, games, audio, art, reviews } = data;
  const newgroundsStats = member.newgrounds;
  const clockCrewForum = member.ccForum;

  const initials = (member.username || "?")
    .replace(/clock$/i, "")
    .slice(0, 2)
    .toUpperCase();
  const avatarUrl = clockCrewForum?.avatarUrl || newgroundsStats?.avatarUrl || member.avatarUrl;

  // Build visible tabs based on available data
  const visibleTabs = TABS.filter((tab) => {
    if (tab.key === "overview") return true;
    if (tab.key === "movies") return !!(movies && movies.length > 0);
    if (tab.key === "games") return !!(games && games.length > 0);
    if (tab.key === "audio") return !!(audio && audio.length > 0);
    if (tab.key === "art") return !!(art && art.length > 0);
    if (tab.key === "posts")
      return !!((data.ccPosts && data.ccPosts.length > 0) || (data.ngPosts && data.ngPosts.length > 0));
    if (tab.key === "reviews") return !!(reviews && reviews.length > 0);
    return false;
  });

  return (
    <div className={styles.profileWrap}>
      {/* ── Header ────────────────────────────────────────────── */}
      <header className={styles.header}>
        <div className={styles.headerBg} aria-hidden="true" />
        <div className={styles.identity}>
          <div className={styles.avatarLarge}>
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={`${member.username} avatar`}
                className={styles.avatarImg}
              />
            ) : (
              <span className={styles.avatarFallback}>{initials}</span>
            )}
          </div>
          <div className={styles.identityInfo}>
            <h1 className={styles.username}>{member.username}</h1>
            <div className={styles.badges}>
              {clockCrewForum?.customTitle && (
                <span className={styles.customTitle}>{clockCrewForum.customTitle}</span>
              )}
              {clockCrewForum?.group && (
                <span className={styles.groupBadge}>{clockCrewForum.group}</span>
              )}
              {clockCrewForum?.position && (
                <span className={styles.posBadge}>{clockCrewForum.position}</span>
              )}
              {newgroundsStats?.rank && (
                <span className={styles.ngRankBadge}>{newgroundsStats.rank}</span>
              )}
              {newgroundsStats?.level != null && (
                <span className={styles.levelBadge}>Lvl {newgroundsStats.level}</span>
              )}
              {newgroundsStats?.supporter && (
                <span className={styles.supporterBadge}>⭐ Supporter</span>
              )}
            </div>
            <div className={styles.headerActions}>
              {newgroundsStats?.profileUrl && (
                <a
                  href={newgroundsStats.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.headerButton}
                >
                  🌐 Newgrounds
                </a>
              )}
              {clockCrewForum?.profileUrl && (
                <a
                  href={clockCrewForum.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.headerButton}
                >
                  🕰️ Forum
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── Quick Stats Bar ───────────────────────────────────── */}
      <section className={styles.quickStats}>
        {clockCrewForum && clockCrewForum.postCount > 0 && (
          <StatCard
            label="Forum Posts"
            value={formatNumber(clockCrewForum.postCount)}
            icon="💬"
          />
        )}
        {newgroundsStats && newgroundsStats.fans > 0 && (
          <StatCard label="NG Fans" value={formatNumber(newgroundsStats.fans)} icon="♥" />
        )}
        {movies && movies.length > 0 && (
          <StatCard label="Movies" value={movies.length} icon="🎬" />
        )}
        {games && games.length > 0 && (
          <StatCard label="Games" value={games.length} icon="🎮" />
        )}
        {audio && audio.length > 0 && (
          <StatCard label="Audio" value={audio.length} icon="🎵" />
        )}
        {art && art.length > 0 && (
          <StatCard label="Art" value={art.length} icon="🎨" />
        )}
        {reviews && reviews.length > 0 && (
          <StatCard label="Reviews" value={reviews.length} icon="📝" />
        )}
      </section>

      {/* ── Tabs ──────────────────────────────────────────────── */}
      {visibleTabs.length > 1 && (
        <nav className={styles.tabBar}>
          {visibleTabs.map((tab) => (
            <button
              key={tab.key}
              className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              <span className={styles.tabIcon}>{tab.icon}</span>
              {tab.label}
              {tab.key === "movies" && movies && movies.length > 0 && (
                <span className={styles.tabCount}>{movies.length}</span>
              )}
              {tab.key === "games" && games && games.length > 0 && (
                <span className={styles.tabCount}>{games.length}</span>
              )}
              {tab.key === "audio" && audio && audio.length > 0 && (
                <span className={styles.tabCount}>{audio.length}</span>
              )}
              {tab.key === "art" && art && art.length > 0 && (
                <span className={styles.tabCount}>{art.length}</span>
              )}
              {tab.key === "reviews" && reviews && reviews.length > 0 && (
                <span className={styles.tabCount}>{reviews.length}</span>
              )}
            </button>
          ))}
        </nav>
      )}

      {/* ── Tab Content ───────────────────────────────────────── */}
      <div className={styles.tabContent}>
        {activeTab === "overview" && <OverviewTab data={data} />}
        {activeTab === "movies" && (
          <ContentSection items={movies} type="movie" emptyLabel="movies" />
        )}
        {activeTab === "games" && (
          <ContentSection items={games} type="game" emptyLabel="games" />
        )}
        {activeTab === "audio" && (
          <ContentSection items={audio} type="audio" emptyLabel="audio" />
        )}
        {activeTab === "art" && (
          <ContentSection items={art} type="art" emptyLabel="art" />
        )}
        {activeTab === "posts" && (
          <div className={styles.postsTab}>
            {data.ccPosts && data.ccPosts.length > 0 && (
              <section className={styles.panel}>
                <h2 className={styles.sectionTitle}>
                  <span className={styles.sectionIcon}>🕰️</span>
                  ClockCrew Forum Posts
                  <span className={styles.panelCount}>
                    {data.ccPosts.length}
                  </span>
                </h2>
                <div className={styles.postsList}>
                  {data.ccPosts.map((post: ForumPost, i: number) => (
                    <PostItem key={post.messageId || i} post={post} />
                  ))}
                </div>
              </section>
            )}
            {data.ngPosts && data.ngPosts.length > 0 && (
              <section className={styles.panel}>
                <h2 className={styles.sectionTitle}>
                  <span className={styles.sectionIcon}>🟠</span>
                  Newgrounds BBS Posts
                  <span className={styles.panelCount}>
                    {data.ngPosts.length}
                  </span>
                </h2>
                <div className={styles.postsList}>
                  {data.ngPosts.map((post: ForumPost, i: number) => (
                    <PostItem key={post.postId || i} post={post} showThread={false} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
        {activeTab === "reviews" && (
          <div className={styles.reviewsList}>
            {reviews?.map((review: Review, i: number) => (
              <ReviewItem key={review.reviewId || i} review={review} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
