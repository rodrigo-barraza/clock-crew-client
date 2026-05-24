import Link from "next/link";
import styles from "./MemberCardComponent.module.css";

interface DirectoryUser {
  username?: string;
  avatarUrl?: string;
  customTitle?: string;
  postCount?: number;
  dateRegistered?: string | number;
}

interface MemberCardComponentProps {
  user: DirectoryUser;
  index?: number;
}

/**
 * Compact member card for the /clocks directory grid.
 */
export default function MemberCardComponent({ user, index = 0 }: MemberCardComponentProps) {
  const name = user.username || "?";
  const initials = name
    .replace(/clock$/i, "")
    .slice(0, 2)
    .toUpperCase();

  const joinYear = user.dateRegistered
    ? new Date(user.dateRegistered).getFullYear()
    : null;

  return (
    <Link
      href={`/clocks/${encodeURIComponent(name)}`}
      className={styles.card}
      style={{ animationDelay: `${Math.min(index * 30, 600)}ms` }}
    >
      {/* ── Avatar ──────────────────────────────────────────────── */}
      <div className={styles.avatarWrap}>
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={`${name} avatar`}
            className={styles.avatarImg}
            loading="lazy"
          />
        ) : (
          <span className={styles.avatarFallback}>{initials}</span>
        )}
      </div>

      {/* ── Info ────────────────────────────────────────────────── */}
      <div className={styles.info}>
        <span className={styles.username}>{name}</span>
        {user.customTitle && (
          <span className={styles.customTitle}>{user.customTitle}</span>
        )}
        <div className={styles.meta}>
          {user.postCount != null && (
            <span className={styles.metaItem}>
              <span className={styles.metaValue}>
                {user.postCount.toLocaleString()}
              </span>{" "}
              posts
            </span>
          )}
          {joinYear && (
            <span className={styles.metaItem}>Joined {joinYear}</span>
          )}
        </div>
      </div>

      {/* ── Hover glow ──────────────────────────────────────────── */}
      <div className={styles.glowEdge} aria-hidden="true" />
    </Link>
  );
}
