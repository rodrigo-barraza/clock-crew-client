"use client";

import {
  useEffect,
  useEffectEvent,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  CloseButtonComponent,
  EmptyStateComponent,
  LoadingIndicatorComponent,
} from "@rodrigo-barraza/components-library";
import {
  clip,
  formatArchiveDate,
  formatCompact,
  formatScore,
  linkLabel,
  safeHref,
} from "@/lib/display";
import type { PortalCard, Submission } from "@/types";
import { typeMeta } from "./portalTypes";
import styles from "./NewgroundsPortalComponent.module.css";

// ── Data ─────────────────────────────────────────────────────────

type CardState =
  | { status: "loading" }
  | { status: "loaded"; card: PortalCard }
  | { status: "missing" };

/** The portal card for one NG profile, re-fetched when the name changes. */
function useProfileCard(usernameLower: string): CardState {
  const [loaded, setLoaded] = useState<{
    username: string;
    state: CardState;
  } | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/newgrounds/card/${encodeURIComponent(usernameLower)}`, {
      signal: controller.signal,
    })
      .then((response) =>
        response.ok ? (response.json() as Promise<PortalCard>) : null,
      )
      .then(
        (card) =>
          setLoaded({
            username: usernameLower,
            state: card?.profile
              ? { status: "loaded", card }
              : { status: "missing" },
          }),
        () => {
          if (!controller.signal.aborted)
            setLoaded({
              username: usernameLower,
              state: { status: "missing" },
            });
        },
      );
    return () => controller.abort();
  }, [usernameLower]);

  return loaded?.username === usernameLower
    ? loaded.state
    : { status: "loading" };
}

// ── Dialog shell ─────────────────────────────────────────────────

/**
 * A modal dialog: focus moves in on open and back to the opener on
 * close, Escape and a backdrop click close it, the page stops scrolling.
 */
function PortalDialog({
  labelledBy,
  onClose,
  children,
}: {
  labelledBy: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const onEscape = useEffectEvent((event: KeyboardEvent) => {
    if (event.key === "Escape") onClose();
  });

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => onEscape(event);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      opener?.focus?.();
    };
  }, []);

  return (
    <div className={styles["modal-overlay"]} onClick={onClose}>
      <div
        ref={dialogRef}
        className={styles["modal-card"]}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <CloseButtonComponent onClick={onClose} />
        {children}
      </div>
    </div>
  );
}

// ── Pieces ───────────────────────────────────────────────────────

function Badge({
  variant,
  children,
  title,
}: {
  variant: string;
  children: ReactNode;
  title?: string;
}) {
  return (
    <span
      className={`${styles["card-rank-badge"]} ${styles[variant]}`}
      title={title}
    >
      {children}
    </span>
  );
}

function PersonalInfo({
  icon,
  children,
}: {
  icon: string;
  children: ReactNode;
}) {
  return (
    <span className={styles["personal-info-item"]}>
      <span className={styles["personal-info-icon"]} aria-hidden="true">
        {icon}
      </span>{" "}
      <span className={styles["personal-info-value"]}>{children}</span>
    </span>
  );
}

function Avatar({ url, name }: { url: string | null; name: string }) {
  return url ? (
    <img src={url} alt="" className={styles["card-avatar"]} />
  ) : (
    <div className={styles["card-avatar-fallback"]} aria-hidden="true">
      {(name || "?")[0].toUpperCase()}
    </div>
  );
}

function TopSubmissions({
  title,
  emoji,
  items,
}: {
  title: string;
  emoji: string;
  items: Submission[];
}) {
  if (items.length === 0) return null;
  return (
    <div className={styles["top-submissions"]}>
      <div className={styles["top-sub-title"]}>
        {emoji} Top {title}
      </div>
      <div className={styles["top-sub-list"]}>
        {items.map((submission) => (
          <a
            key={submission._id}
            href={safeHref(submission.url)}
            target="_blank"
            rel="noopener noreferrer"
            className={styles["top-sub-item"]}
          >
            {submission.thumbnailUrl && (
              <img
                src={submission.thumbnailUrl}
                alt=""
                className={styles["top-sub-thumb"]}
                loading="lazy"
              />
            )}
            <div className={styles["top-sub-info"]}>
              <span className={styles["top-sub-name"]}>{submission.title}</span>
            </div>
            {submission.score != null && (
              <span className={styles["top-sub-score"]}>
                ★ {formatScore(submission.score)}
              </span>
            )}
          </a>
        ))}
      </div>
    </div>
  );
}

function ForumSection({ card }: { card: PortalCard }) {
  const { ccUser, randomPost } = card;
  if (!ccUser) return null;
  const quote = randomPost?.body
    ? clip(randomPost.body.replace(/<[^>]*>/g, "").trim(), 277)
    : "";

  return (
    <div className={styles["cc-section"]}>
      <div className={styles["cc-section-title"]}>🕰️ ClockCrew.net Forum</div>
      <div className={styles["cc-row"]}>
        {ccUser.avatarUrl && (
          <img src={ccUser.avatarUrl} alt="" className={styles["cc-avatar"]} />
        )}
        <div className={styles["cc-info"]}>
          <span className={styles["cc-username"]}>{ccUser.username}</span>
          {ccUser.customTitle && (
            <div className={styles["cc-custom-title"]}>
              &ldquo;{ccUser.customTitle}&rdquo;
            </div>
          )}
        </div>
      </div>
      <div className={styles["cc-stats"]}>
        <span className={styles["cc-stat-item"]}>
          Forum Posts:{" "}
          <span className={styles["cc-stat-value"]}>
            {formatCompact(ccUser.postCount)}
          </span>
        </span>
        {ccUser.dateRegistered && (
          <span className={styles["cc-stat-item"]}>
            Registered:{" "}
            <span className={styles["cc-stat-value"]}>
              {formatArchiveDate(ccUser.dateRegistered)}
            </span>
          </span>
        )}
      </div>

      {quote && (
        <blockquote className={styles["cc-forum-quote"]}>
          <p className={styles["cc-quote-body"]}>&ldquo;{quote}&rdquo;</p>
          <footer className={styles["cc-quote-footer"]}>
            {randomPost?.threadTitle && (
              <span className={styles["cc-quote-thread"]}>
                <span
                  className={styles["cc-quote-thread-icon"]}
                  aria-hidden="true"
                >
                  💬
                </span>
                {randomPost.threadTitle}
              </span>
            )}
            {randomPost?.date && (
              <span className={styles["cc-quote-date"]}>
                {formatArchiveDate(randomPost.date)}
              </span>
            )}
          </footer>
        </blockquote>
      )}
    </div>
  );
}

/** Everything the card knows about a creator, below whichever header the modal uses. */
function CreatorDetails({
  card,
  primaryAction,
}: {
  card: PortalCard;
  primaryAction: boolean;
}) {
  const { profile, ccUser } = card;
  const counts = [
    ["🎬", profile.movieCount, "Movies"],
    ["🎮", profile.gameCount, "Games"],
    ["🎵", profile.audioCount, "Audio"],
    ["📝", profile.reviewCount, "Reviews"],
    ["💬", profile.postCount, "Posts"],
    ["❤️", profile.faveCount, "Faves"],
  ] as const;

  return (
    <>
      {profile.description && (
        <p className={styles["card-description"]}>{profile.description}</p>
      )}

      <div className={styles["card-personal-info"]}>
        {profile.joinDate && (
          <PersonalInfo icon="📅">
            Joined {formatArchiveDate(profile.joinDate)}
          </PersonalInfo>
        )}
        {profile.location && (
          <PersonalInfo icon="📍">{profile.location}</PersonalInfo>
        )}
        {profile.age != null && (
          <PersonalInfo icon="🎂">Age {profile.age}</PersonalInfo>
        )}
        {profile.sex && <PersonalInfo icon="👤">{profile.sex}</PersonalInfo>}
        {profile.job && <PersonalInfo icon="💼">{profile.job}</PersonalInfo>}
        {profile.realName && (
          <PersonalInfo icon="🪪">{profile.realName}</PersonalInfo>
        )}
        {profile.school && (
          <PersonalInfo icon="🎓">{profile.school}</PersonalInfo>
        )}
        {profile.globalRank != null && (
          <PersonalInfo icon="🌍">
            Rank #{formatCompact(profile.globalRank)}
          </PersonalInfo>
        )}
        {profile.expPoints && (
          <PersonalInfo icon="✨">EXP {profile.expPoints}</PersonalInfo>
        )}
        {profile.votePower && (
          <PersonalInfo icon="⚡">{profile.votePower}</PersonalInfo>
        )}
      </div>

      <div className={styles["stats-grid"]}>
        {[
          ["Fans", formatCompact(profile.fans)],
          ["Blams", formatCompact(profile.blams)],
          ["Saves", formatCompact(profile.saves)],
          ["Medals", formatCompact(profile.medals)],
          ["Trophies", formatCompact(profile.trophies)],
          ...(profile.expRank != null
            ? [["EXP Rank", `#${formatCompact(profile.expRank)}`]]
            : []),
        ].map(([label, value]) => (
          <div key={label} className={styles["stat-item"]}>
            <span className={styles["stat-value"]}>{value}</span>
            <span className={styles["stat-label"]}>{label}</span>
          </div>
        ))}
      </div>

      <div className={styles["content-counts"]}>
        {counts
          .filter(([, count]) => count > 0)
          .map(([icon, count, label]) => (
            <span key={label} className={styles["content-pill"]}>
              <span className={styles["content-pill-icon"]} aria-hidden="true">
                {icon}
              </span>
              <span className={styles["content-pill-count"]}>
                {formatCompact(count)}
              </span>{" "}
              {label}
            </span>
          ))}
      </div>

      <ForumSection card={card} />
      <TopSubmissions title="Movies" emoji="🎬" items={card.topMovies} />
      <TopSubmissions title="Games" emoji="🎮" items={card.topGames} />
      <TopSubmissions title="Audio" emoji="🎵" items={card.topAudio} />

      {profile.links.length > 0 && (
        <div className={styles["profile-links"]}>
          <div className={styles["top-sub-title"]}>🔗 Links</div>
          <div className={styles["profile-links-list"]}>
            {profile.links.map((link) => (
              <a
                key={link.url}
                href={safeHref(link.url)}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className={styles["profile-link-item"]}
              >
                {linkLabel(link)}
              </a>
            ))}
          </div>
        </div>
      )}

      <div className={styles["card-actions"]}>
        {safeHref(profile.profileUrl) && (
          <a
            href={safeHref(profile.profileUrl)}
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles["action-button"]} ${styles[primaryAction ? "action-primary" : "action-secondary"]}`}
          >
            🌐 NG Profile
          </a>
        )}
        {safeHref(ccUser?.profileUrl) && (
          <a
            href={safeHref(ccUser?.profileUrl)}
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles["action-button"]} ${styles["action-secondary"]}`}
          >
            🕰️ Forum Profile
          </a>
        )}
      </div>
    </>
  );
}

function RankBadges({ card }: { card: PortalCard }) {
  const { profile, ccUser } = card;
  return (
    <div className={styles["card-rank-row"]}>
      {profile.rank && <Badge variant="ng-badge">{profile.rank}</Badge>}
      {profile.level != null && (
        <Badge variant="level-badge">Lvl {profile.level}</Badge>
      )}
      {profile.supporter && (
        <Badge
          variant="supporter-badge"
          title={`Supporter for ${profile.supporter}`}
        >
          ⭐ Supporter
        </Badge>
      )}
      {ccUser?.position && <Badge variant="cc-badge">{ccUser.position}</Badge>}
    </div>
  );
}

function CardBody({
  state,
  children,
}: {
  state: CardState;
  children: (card: PortalCard) => ReactNode;
}) {
  if (state.status === "loading") {
    return (
      <div className={styles["is-loading-state"]} style={{ minHeight: 160 }}>
        <LoadingIndicatorComponent size="small" ariaLabel="Loading profile" />
      </div>
    );
  }
  if (state.status === "missing")
    return <EmptyStateComponent subtitle="Profile not found" />;
  return <>{children(state.card)}</>;
}

// ── Modals ───────────────────────────────────────────────────────

/** A clicked submission, with its creator's card below it. */
export function ContentDetailModal({
  item,
  onClose,
}: {
  item: Submission;
  onClose: () => void;
}) {
  const titleId = useId();
  const cardState = useProfileCard(item.usernameLower);
  const meta = typeMeta(item.contentType);

  return (
    <PortalDialog labelledBy={titleId} onClose={onClose}>
      <div
        className={styles["content-hero"]}
        style={
          item.thumbnailUrl
            ? { backgroundImage: `url(${JSON.stringify(item.thumbnailUrl)})` }
            : undefined
        }
      >
        <div className={styles["content-hero-overlay"]} />
        <div className={styles["content-hero-body"]}>
          <span
            className={`${styles["hero-badge"]} ${styles[meta.badgeClass]}`}
          >
            {meta.emoji} {meta.label}
          </span>
          <h2 id={titleId} className={styles["content-hero-title"]}>
            {item.title}
          </h2>
          <div className={styles["content-hero-meta"]}>
            <span className={styles["content-hero-author"]}>
              by {item.usernameLower}
            </span>
            {item.score != null && (
              <span className={styles["content-hero-score"]}>
                ★ {formatScore(item.score)} / 5.0
              </span>
            )}
          </div>
          {item.score != null && (
            <div className={styles["score-bar"]} aria-hidden="true">
              <div
                className={styles["score-bar-fill"]}
                style={{ width: `${Math.min(item.score / 5, 1) * 100}%` }}
              />
            </div>
          )}
          <a
            href={safeHref(item.url)}
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles["action-button"]} ${styles["action-hero"]}`}
          >
            {meta.action}
          </a>
        </div>
      </div>

      <div className={styles["creator-divider"]}>
        <span className={styles["creator-divider-text"]}>Created by</span>
      </div>

      <CardBody state={cardState}>
        {(card) => (
          <>
            <div className={styles["creator-header"]}>
              <div
                className={styles["card-avatar-wrap"]}
                style={{ margin: 0, width: 56, height: 56 }}
              >
                <Avatar
                  url={card.profile.avatarUrl}
                  name={card.profile.username}
                />
              </div>
              <div>
                <span className={styles["card-username"]}>
                  {card.profile.username}
                </span>
                <RankBadges card={card} />
              </div>
            </div>
            <CreatorDetails card={card} primaryAction={false} />
          </>
        )}
      </CardBody>
    </PortalDialog>
  );
}

/** A clicked Clock from the Clocks tab. */
export function ProfileDetailModal({
  usernameLower,
  onClose,
}: {
  usernameLower: string;
  onClose: () => void;
}) {
  const titleId = useId();
  const cardState = useProfileCard(usernameLower);

  return (
    <PortalDialog labelledBy={titleId} onClose={onClose}>
      <div className={styles["profile-banner"]}>
        <div className={styles["profile-banner-gradient"]} />
      </div>

      <CardBody state={cardState}>
        {(card) => (
          <>
            <div className={styles["profile-identity"]}>
              <div className={styles["profile-avatar-wrap"]}>
                <Avatar
                  url={card.profile.avatarUrl}
                  name={card.profile.username}
                />
              </div>
              <div className={styles["profile-name-block"]}>
                <h2 id={titleId} className={styles["profile-display-name"]}>
                  {card.profile.username}
                </h2>
                <RankBadges card={card} />
              </div>
            </div>
            <CreatorDetails card={card} primaryAction />
          </>
        )}
      </CardBody>
    </PortalDialog>
  );
}
