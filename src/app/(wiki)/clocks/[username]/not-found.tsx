import Link from "next/link";
import styles from "@/app/components/MemberProfileComponent/MemberProfileComponent.module.css";

export default function MemberNotFound() {
  return (
    <div className={styles["profile-wrap"]}>
      <div className={styles["error-card"]}>
        <span className={styles["error-icon"]} aria-hidden="true">
          ⚠️
        </span>
        <p className={styles["error-text"]}>
          No Clock Crew member by that name is in the archive.
        </p>
        <Link href="/clocks" className={styles["back-link"]}>
          ← Back to Members
        </Link>
      </div>
    </div>
  );
}
