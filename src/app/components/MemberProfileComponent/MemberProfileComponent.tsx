"use client";

import { useId, useState, type ReactNode, type SyntheticEvent } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { stripHtml } from "@rodrigo-barraza/utilities-library";
import styles from "./MemberProfileComponent.module.css";
import {
  clip,
  formatArchiveDate as formatDate,
  formatCompact as formatNumber,
  formatScore,
  initials,
  linkLabel,
  safeHref,
} from "@/lib/display";
import type {
  ForumPost,
  ForumThread,
  MemberPageData,
  NewgroundsPost,
  Review,
  Submission,
  SubmissionType,
} from "@/types";

// ── Tabs ─────────────────────────────────────────────────────────

type TabKey =
  "overview" | "movies" | "games" | "audio" | "art" | "posts" | "reviews";

const TABS: Array<{ key: TabKey; label: string; icon: string }> = [
  { key: "overview", label: "Overview", icon: "📋" },
  { key: "movies", label: "Movies", icon: "🎬" },
  { key: "games", label: "Games", icon: "🎮" },
  { key: "audio", label: "Audio", icon: "🎵" },
  { key: "art", label: "Art", icon: "🎨" },
  { key: "posts", label: "Posts", icon: "💬" },
  { key: "reviews", label: "Reviews", icon: "📝" },
];

const TYPE_EMOJI: Record<SubmissionType, string> = {
  movie: "🎬",
  game: "🎮",
  audio: "🎵",
  art: "🎨",
};

function hideBrokenImage(event: SyntheticEvent<HTMLImageElement>) {
  event.currentTarget.style.display = "none";
}

// ── Pieces ───────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: ReactNode;
  icon?: string;
}) {
  return (
    <div className={styles["stat-card"]}>
      {icon && (
        <span className={styles["stat-icon"]} aria-hidden="true">
          {icon}
        </span>
      )}
      <span className={styles["stat-value"]}>{value}</span>
      <span className={styles["stat-label"]}>{label}</span>
    </div>
  );
}

function Panel({
  icon,
  title,
  count,
  children,
}: {
  icon: string;
  title: string;
  count?: number;
  children: ReactNode;
}) {
  return (
    <section className={styles.panel}>
      <h2 className={styles["section-title"]}>
        <span className={styles["section-icon"]} aria-hidden="true">
          {icon}
        </span>
        {title}
        {count !== undefined && (
          <span className={styles["panel-count"]}>{formatNumber(count)}</span>
        )}
      </h2>
      {children}
    </section>
  );
}

function ContentCard({
  item,
  type,
}: {
  item: Submission;
  type: SubmissionType;
}) {
  const kind =
    (item.contentType as SubmissionType) in TYPE_EMOJI
      ? (item.contentType as SubmissionType)
      : type;
  return (
    <a
      href={safeHref(item.url)}
      target="_blank"
      rel="noopener noreferrer"
      className={styles["content-card"]}
    >
      {item.thumbnailUrl && (
        <img
          src={item.thumbnailUrl}
          alt=""
          className={styles["content-thumb"]}
          loading="lazy"
          onError={hideBrokenImage}
        />
      )}
      <div className={styles["content-info"]}>
        <span className={styles["content-title"]}>{item.title}</span>
        <div className={styles["content-meta"]}>
          <span className={styles["content-type"]} aria-label={kind}>
            {TYPE_EMOJI[kind]}
          </span>
          {item.score != null && (
            <span className={styles["content-score"]}>
              ★ {formatScore(item.score)}
            </span>
          )}
          {item.views != null && (
            <span className={styles["content-views"]}>
              {formatNumber(item.views)} views
            </span>
          )}
          {item.publishedDate && (
            <span className={styles["content-date"]}>
              {formatDate(item.publishedDate)}
            </span>
          )}
        </div>
        {item.description && (
          <p className={styles["content-desc"]}>
            {clip(item.description, 120)}
          </p>
        )}
      </div>
    </a>
  );
}

function ContentSection({
  items,
  type,
  emptyLabel,
}: {
  items: Submission[];
  type: SubmissionType;
  emptyLabel: string;
}) {
  if (items.length === 0) {
    return (
      <div className={styles["empty-tab"]}>
        <span className={styles["empty-tab-icon"]} aria-hidden="true">
          📭
        </span>
        <span>No {emptyLabel} found</span>
      </div>
    );
  }
  return (
    <div className={styles["content-grid"]}>
      {items.map((item) => (
        <ContentCard key={item._id} item={item} type={type} />
      ))}
    </div>
  );
}

function ForumPostItem({ post }: { post: ForumPost }) {
  const body = stripHtml(post.body ?? "");
  return (
    <div className={styles["post-item"]}>
      <div className={styles["post-header"]}>
        {post.threadTitle && (
          <span className={styles["post-thread"]}>{post.threadTitle}</span>
        )}
        {post.date && (
          <time className={styles["post-date"]}>{formatDate(post.date)}</time>
        )}
      </div>
      {body && <p className={styles["post-body"]}>{clip(body, 300)}</p>}
    </div>
  );
}

/** A Newgrounds BBS post — the archive keeps its topic title and link, not its text. */
function NewgroundsPostItem({ post }: { post: NewgroundsPost }) {
  const body = stripHtml(post.body ?? "");
  const href = safeHref(post.contentUrl);
  const title = post.title || "Untitled post";
  return (
    <div className={styles["post-item"]}>
      <div className={styles["post-header"]}>
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={styles["post-thread"]}
          >
            {title}
          </a>
        ) : (
          <span className={styles["post-thread"]}>{title}</span>
        )}
        {post.date && (
          <time className={styles["post-date"]}>{formatDate(post.date)}</time>
        )}
      </div>
      {body && <p className={styles["post-body"]}>{clip(body, 300)}</p>}
    </div>
  );
}

function ReviewItem({ review }: { review: Review }) {
  const body = stripHtml(review.body ?? "");
  const href = safeHref(review.reviewedUrl);
  const target =
    review.reviewedTitle || review.reviewedUrl || "Unknown submission";
  return (
    <div className={styles["review-item"]}>
      <div className={styles["review-header"]}>
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={styles["review-target"]}
          >
            {target}
          </a>
        ) : (
          <span className={styles["review-target"]}>{target}</span>
        )}
        {review.score != null && (
          <span
            className={styles["review-score"]}
            aria-label={`${review.score} out of 5 stars`}
          >
            ★ {formatScore(review.score)} / 5
          </span>
        )}
      </div>
      {body && <p className={styles["review-body"]}>{clip(body, 250)}</p>}
    </div>
  );
}

// ── AI summary ──────────────────────────────────────────────────
// react-markdown renders no raw HTML, so model output cannot inject markup.

const MARKDOWN_COMPONENTS: Components = {
  h1: ({ children }) => <h1 className={styles["md-h1"]}>{children}</h1>,
  h2: ({ children }) => <h2 className={styles["md-h2"]}>{children}</h2>,
  h3: ({ children }) => <h3 className={styles["md-h3"]}>{children}</h3>,
  blockquote: ({ children }) => (
    <blockquote className={styles["md-blockquote"]}>{children}</blockquote>
  ),
  ul: ({ children }) => <ul className={styles["md-list"]}>{children}</ul>,
  ol: ({ children }) => <ol className={styles["md-list"]}>{children}</ol>,
  p: ({ children }) => <p className={styles["md-paragraph"]}>{children}</p>,
  a: ({ href, children }) => (
    <a href={safeHref(href)} target="_blank" rel="noopener noreferrer nofollow">
      {children}
    </a>
  ),
};

function SummaryMarkdown({ markdown }: { markdown: string }) {
  return (
    <div className={styles["md-wrap"]}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={MARKDOWN_COMPONENTS}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}

// ── Overview ────────────────────────────────────────────────────

function InfoItem({ icon, children }: { icon: string; children: ReactNode }) {
  return (
    <span className={styles["info-item"]}>
      <span aria-hidden="true">{icon}</span> {children}
    </span>
  );
}

function TopContent({
  icon,
  title,
  items,
  type,
}: {
  icon: string;
  title: string;
  items: Submission[];
  type: SubmissionType;
}) {
  if (items.length === 0) return null;
  return (
    <Panel icon={icon} title={title}>
      <div className={styles["top-content-list"]}>
        {items.slice(0, 3).map((item) => (
          <ContentCard key={item._id} item={item} type={type} />
        ))}
      </div>
    </Panel>
  );
}

const FANS_SHOWN = 50;
const THREADS_SHOWN = 20;
const RECENT_POSTS_SHOWN = 10;

function OverviewTab({ data }: { data: MemberPageData }) {
  const {
    member,
    movies,
    games,
    audio,
    fans,
    ccPosts,
    ccThreads,
    ccThreadCount,
  } = data;
  const ng = member.newgrounds;
  const forum = member.ccForum;
  const summary = member.profileSummary;
  const contentCounts = ng
    ? (
        [
          ["🎬", ng.movieCount, "Movies"],
          ["🎮", ng.gameCount, "Games"],
          ["🎵", ng.audioCount, "Audio"],
          ["📝", ng.reviewCount, "Reviews"],
          ["💬", ng.postCount, "Posts"],
          ["❤️", ng.faveCount, "Faves"],
          ["📰", ng.newsCount, "News"],
        ] as const
      ).filter(([, count]) => count > 0)
    : [];

  return (
    <div className={styles["overview-grid"]}>
      {summary?.markdown && summary.status === "complete" && (
        <section className={styles["summary-panel"]}>
          <h2 className={styles["section-title"]}>
            <span className={styles["section-icon"]} aria-hidden="true">
              🤖
            </span>
            AI-Generated Profile
            {summary.model && (
              <span className={styles["summary-meta"]}>
                <span className={styles["summary-model"]}>{summary.model}</span>
              </span>
            )}
          </h2>
          <div className={styles["summary-content"]}>
            <SummaryMarkdown markdown={summary.markdown} />
          </div>
        </section>
      )}

      {ng && (
        <Panel icon="🟠" title="Newgrounds Stats">
          <div className={styles["mini-stats-grid"]}>
            <StatCard label="Fans" value={formatNumber(ng.fans)} icon="♥" />
            <StatCard label="Level" value={ng.level ?? "—"} icon="⬆" />
            <StatCard label="Blams" value={formatNumber(ng.blams)} icon="💣" />
            <StatCard label="Saves" value={formatNumber(ng.saves)} icon="🛡" />
            <StatCard
              label="Medals"
              value={formatNumber(ng.medals)}
              icon="🏅"
            />
            <StatCard
              label="Trophies"
              value={formatNumber(ng.trophies)}
              icon="🏆"
            />
            {ng.expPoints && (
              <StatCard label="EXP" value={ng.expPoints} icon="✨" />
            )}
            {ng.votePower && (
              <StatCard label="Vote Power" value={ng.votePower} icon="⚡" />
            )}
          </div>
          {ng.description && (
            <p className={styles["ng-bio"]}>{ng.description}</p>
          )}
          <div className={styles["personal-info"]}>
            {ng.joinDate && (
              <InfoItem icon="📅">Joined {formatDate(ng.joinDate)}</InfoItem>
            )}
            {ng.location && <InfoItem icon="📍">{ng.location}</InfoItem>}
            {ng.job && <InfoItem icon="💼">{ng.job}</InfoItem>}
            {ng.age != null && <InfoItem icon="🎂">Age {ng.age}</InfoItem>}
            {ng.sex && <InfoItem icon="👤">{ng.sex}</InfoItem>}
            {ng.realName && <InfoItem icon="🪪">{ng.realName}</InfoItem>}
            {ng.school && <InfoItem icon="🎓">{ng.school}</InfoItem>}
            {ng.rank && <InfoItem icon="🎖">{ng.rank}</InfoItem>}
            {ng.globalRank != null && (
              <InfoItem icon="🌍">Rank #{formatNumber(ng.globalRank)}</InfoItem>
            )}
          </div>
        </Panel>
      )}

      {forum && (
        <Panel icon="🕰️" title="ClockCrew.net Forum">
          <div className={styles["cc-identity"]}>
            {forum.avatarUrl && (
              <img
                src={forum.avatarUrl}
                alt=""
                className={styles["cc-avatar"]}
              />
            )}
            <div>
              <span className={styles["cc-name"]}>{forum.username}</span>
              {forum.customTitle && (
                <span className={styles["cc-title"]}>
                  &ldquo;{forum.customTitle}&rdquo;
                </span>
              )}
              {forum.position && (
                <span className={styles["cc-badge"]}>{forum.position}</span>
              )}
            </div>
          </div>
          <div className={styles["mini-stats-grid"]}>
            <StatCard
              label="Posts"
              value={formatNumber(forum.postCount)}
              icon="💬"
            />
            {forum.dateRegistered && (
              <StatCard
                label="Registered"
                value={formatDate(forum.dateRegistered)}
                icon="📅"
              />
            )}
            {forum.location && (
              <StatCard label="Location" value={forum.location} icon="📍" />
            )}
            {forum.gender && (
              <StatCard label="Gender" value={forum.gender} icon="👤" />
            )}
          </div>
          {forum.signature && (
            <div className={styles["signature-wrap"]}>
              <span className={styles["signature-label"]}>Signature</span>
              <p className={styles["signature-content"]}>{forum.signature}</p>
            </div>
          )}
        </Panel>
      )}

      {contentCounts.length > 0 && (
        <Panel icon="📊" title="Content Overview">
          <div className={styles["content-pills"]}>
            {contentCounts.map(([icon, count, label]) => (
              <span key={label} className={styles.pill}>
                {icon} {formatNumber(count)} {label}
              </span>
            ))}
          </div>
        </Panel>
      )}

      <TopContent icon="🎬" title="Top Movies" items={movies} type="movie" />
      <TopContent icon="🎮" title="Top Games" items={games} type="game" />
      <TopContent icon="🎵" title="Top Audio" items={audio} type="audio" />

      {fans.length > 0 && (
        <Panel icon="♥" title="Fans" count={fans.length}>
          <div className={styles["fans-list"]}>
            {fans.slice(0, FANS_SHOWN).map((fan) => (
              <span key={fan} className={styles["fan-tag"]}>
                {fan}
              </span>
            ))}
            {fans.length > FANS_SHOWN && (
              <span className={styles["fan-more"]}>
                +{fans.length - FANS_SHOWN} more
              </span>
            )}
          </div>
        </Panel>
      )}

      {ccThreads.length > 0 && (
        <Panel icon="📌" title="Forum Threads Started" count={ccThreadCount}>
          <ul className={styles["thread-list"]}>
            {ccThreads.slice(0, THREADS_SHOWN).map((thread: ForumThread) => (
              <li key={thread._id} className={styles["thread-item"]}>
                {safeHref(thread.url) ? (
                  <a
                    href={safeHref(thread.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles["thread-title"]}
                  >
                    {thread.title}
                  </a>
                ) : (
                  <span className={styles["thread-title"]}>{thread.title}</span>
                )}
                <span className={styles["thread-meta"]}>
                  {thread.totalPosts != null && (
                    <span>{formatNumber(thread.totalPosts)} replies</span>
                  )}
                  {thread.date && <span>{formatDate(thread.date)}</span>}
                  {thread.boardName && (
                    <span className={styles["thread-board"]}>
                      {thread.boardName}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      {ccPosts.length > 0 && (
        <Panel icon="💬" title="Recent Forum Posts">
          <div className={styles["posts-list"]}>
            {ccPosts.slice(0, RECENT_POSTS_SHOWN).map((post) => (
              <ForumPostItem key={post._id} post={post} />
            ))}
          </div>
        </Panel>
      )}

      {ng && ng.links.length > 0 && (
        <Panel icon="🔗" title="Links">
          <div className={styles["links-list"]}>
            {ng.links.map((link) => (
              <a
                key={link.url}
                href={safeHref(link.url)}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className={styles["link-item"]}
              >
                {linkLabel(link)}
              </a>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════
// Main Component
// ═════════════════════════════════════════════════════════════════

/** A member's wiki page body. The page fetches the data on the server. */
export default function MemberProfileComponent({
  data,
}: {
  data: MemberPageData;
}) {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const tabsId = useId();

  const { member, movies, games, audio, art, reviews, ccPosts, ngPosts } = data;
  const ng = member.newgrounds;
  const forum = member.ccForum;
  const avatarUrl = forum?.avatarUrl || ng?.avatarUrl || member.avatarUrl;

  const tabCounts: Record<TabKey, number> = {
    overview: 1,
    movies: movies.length,
    games: games.length,
    audio: audio.length,
    art: art.length,
    posts: ccPosts.length + ngPosts.length,
    reviews: reviews.length,
  };
  const visibleTabs = TABS.filter((tab) => tabCounts[tab.key] > 0);

  return (
    <div className={styles["profile-wrap"]}>
      {/* ── Header ────────────────────────────────────────────── */}
      <header className={styles.header}>
        <div className={styles["header-bg"]} aria-hidden="true" />
        <div className={styles.identity}>
          <div className={styles["avatar-large"]}>
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={`${member.username} avatar`}
                className={styles["avatar-img"]}
              />
            ) : (
              <span className={styles["avatar-fallback"]} aria-hidden="true">
                {initials(member.username)}
              </span>
            )}
          </div>
          <div className={styles["identity-info"]}>
            <h1 className={styles.username}>{member.username}</h1>
            <div className={styles.badges}>
              {forum?.customTitle && (
                <span className={styles["custom-title"]}>
                  {forum.customTitle}
                </span>
              )}
              {forum?.group && (
                <span className={styles["group-badge"]}>{forum.group}</span>
              )}
              {forum?.position && (
                <span className={styles["pos-badge"]}>{forum.position}</span>
              )}
              {ng?.rank && (
                <span className={styles["ng-rank-badge"]}>{ng.rank}</span>
              )}
              {ng?.level != null && (
                <span className={styles["level-badge"]}>Lvl {ng.level}</span>
              )}
              {ng?.supporter && (
                <span
                  className={styles["supporter-badge"]}
                  title={`Supporter for ${ng.supporter}`}
                >
                  ⭐ Supporter
                </span>
              )}
            </div>
            <div className={styles["header-actions"]}>
              {safeHref(ng?.profileUrl) && (
                <a
                  href={safeHref(ng?.profileUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles["header-button"]}
                >
                  🌐 Newgrounds
                </a>
              )}
              {safeHref(forum?.profileUrl) && (
                <a
                  href={safeHref(forum?.profileUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles["header-button"]}
                >
                  🕰️ Forum
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── Quick Stats ───────────────────────────────────────── */}
      <section className={styles["quick-stats"]} aria-label="Quick stats">
        {forum && forum.postCount > 0 && (
          <StatCard
            label="Forum Posts"
            value={formatNumber(forum.postCount)}
            icon="💬"
          />
        )}
        {ng && ng.fans > 0 && (
          <StatCard label="NG Fans" value={formatNumber(ng.fans)} icon="♥" />
        )}
        {movies.length > 0 && (
          <StatCard label="Movies" value={movies.length} icon="🎬" />
        )}
        {games.length > 0 && (
          <StatCard label="Games" value={games.length} icon="🎮" />
        )}
        {audio.length > 0 && (
          <StatCard label="Audio" value={audio.length} icon="🎵" />
        )}
        {art.length > 0 && (
          <StatCard label="Art" value={art.length} icon="🎨" />
        )}
        {reviews.length > 0 && (
          <StatCard label="Reviews" value={reviews.length} icon="📝" />
        )}
      </section>

      {/* ── Tabs ──────────────────────────────────────────────── */}
      {visibleTabs.length > 1 && (
        <div
          className={styles["tab-bar"]}
          role="tablist"
          aria-label="Profile sections"
        >
          {visibleTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              id={`${tabsId}-${tab.key}`}
              aria-selected={activeTab === tab.key}
              aria-controls={`${tabsId}-panel`}
              className={`${styles.tab} ${activeTab === tab.key ? styles["tab-active"] : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              <span className={styles["tab-icon"]} aria-hidden="true">
                {tab.icon}
              </span>
              {tab.label}
              {tab.key !== "overview" && tab.key !== "posts" && (
                <span className={styles["tab-count"]}>
                  {tabCounts[tab.key]}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* ── Tab Content ───────────────────────────────────────── */}
      <div
        className={styles["tab-content"]}
        id={`${tabsId}-panel`}
        role={visibleTabs.length > 1 ? "tabpanel" : undefined}
        aria-labelledby={
          visibleTabs.length > 1 ? `${tabsId}-${activeTab}` : undefined
        }
      >
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
          <div className={styles["posts-tab"]}>
            {ccPosts.length > 0 && (
              <Panel
                icon="🕰️"
                title="ClockCrew Forum Posts"
                count={ccPosts.length}
              >
                <div className={styles["posts-list"]}>
                  {ccPosts.map((post) => (
                    <ForumPostItem key={post._id} post={post} />
                  ))}
                </div>
              </Panel>
            )}
            {ngPosts.length > 0 && (
              <Panel
                icon="🟠"
                title="Newgrounds BBS Posts"
                count={ngPosts.length}
              >
                <div className={styles["posts-list"]}>
                  {ngPosts.map((post) => (
                    <NewgroundsPostItem key={post._id} post={post} />
                  ))}
                </div>
              </Panel>
            )}
          </div>
        )}
        {activeTab === "reviews" && (
          <div className={styles["reviews-list"]}>
            {reviews.map((review) => (
              <ReviewItem key={review._id} review={review} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
