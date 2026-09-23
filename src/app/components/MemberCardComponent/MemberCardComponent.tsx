import Link from "next/link";
import { archiveYear, formatCount, initials } from "@/lib/display";
import type { DirectoryUser } from "@/types";
import styles from "./MemberCardComponent.module.css";

interface MemberCardComponentProps {
  user: DirectoryUser;
  index?: number;
}

/**
 * Compact member card for the /clocks directory grid.
 */
export default function MemberCardComponent({
  user,
  index = 0,
}: MemberCardComponentProps) {
  const joinYear = archiveYear(user.dateRegistered);

  return (
    <Link
      href={`/clocks/${encodeURIComponent(user.username)}`}
      className={styles.card}
      style={{ animationDelay: `${Math.min(index * 30, 600)}ms` }}
    >
      <div className={styles["avatar-wrap"]}>
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt=""
            className={styles["avatar-img"]}
            loading="lazy"
          />
        ) : (
          <span className={styles["avatar-fallback"]} aria-hidden="true">
            {initials(user.username)}
          </span>
        )}
      </div>

      <div className={styles.info}>
        <span className={styles.username}>{user.username}</span>
        {user.customTitle && (
          <span className={styles["custom-title"]}>{user.customTitle}</span>
        )}
        <div className={styles.meta}>
          {user.postCount != null && (
            <span className={styles["meta-item"]}>
              <span className={styles["meta-value"]}>
                {formatCount(user.postCount)}
              </span>{" "}
              posts
            </span>
          )}
          {joinYear && (
            <span className={styles["meta-item"]}>Joined {joinYear}</span>
          )}
        </div>
      </div>

      <div className={styles["glow-edge"]} aria-hidden="true" />
    </Link>
  );
}
