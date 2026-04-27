import Link from "next/link";
import styles from "./MemberCardComponent.module.css";

/**
 * Compact member card for the /clocks directory grid.
 *
 * @param {object} props
 * @param {object} props.user - CC forum user object
 * @param {number} props.index - render index for staggered animation
 */
export default function MemberCardComponent({ user, index = 0 }) {
  const initials = (user.username || "?")
    .replace(/clock$/i, "")
    .slice(0, 2)
    .toUpperCase();

  const joinYear = user.dateRegistered
    ? new Date(user.dateRegistered).getFullYear()
    : null;

  return (
    <Link
      href={`/clocks/${encodeURIComponent(user.username)}`}
      className={styles.card}
      style={{ animationDelay: `${Math.min(index * 30, 600)}ms` }}
    >
      {/* ── Avatar ──────────────────────────────────────────────── */}
      <div className={styles.avatarWrap}>
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={`${user.username} avatar`}
            className={styles.avatarImg}
            loading="lazy"
          />
        ) : (
          <span className={styles.avatarFallback}>{initials}</span>
        )}
      </div>

      {/* ── Info ────────────────────────────────────────────────── */}
      <div className={styles.info}>
        <span className={styles.username}>{user.username}</span>
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
            <span className={styles.metaItem}>
              Joined {joinYear}
            </span>
          )}
        </div>
      </div>

      {/* ── Hover glow ──────────────────────────────────────────── */}
      <div className={styles.glowEdge} aria-hidden="true" />
    </Link>
  );
}
