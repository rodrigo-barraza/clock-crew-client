"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./MemberProfileComponent.module.css";

/**
 * Full member profile page component.
 * Fetches composite data from /api/clockcrew/users/[username].
 *
 * @param {object} props
 * @param {string} props.username - URL param username
 */
export default function MemberProfileComponent({ username }) {
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchMember() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `/api/clockcrew/users/${encodeURIComponent(username)}`,
        );

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || `Failed to load profile (${res.status})`);
        }

        const data = await res.json();
        if (!cancelled) setMember(data.member);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchMember();
    return () => { cancelled = true; };
  }, [username]);

  // ── Loading skeleton ──────────────────────────────────────────
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

  // ── Error state ───────────────────────────────────────────────
  if (error || !member) {
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

  const initials = (member.username || "?")
    .replace(/clock$/i, "")
    .slice(0, 2)
    .toUpperCase();

  const joinDate = member.dateRegistered
    ? new Date(member.dateRegistered)
    : null;

  return (
    <div className={styles.profileWrap}>
      {/* ── Header ──────────────────────────────────────────────── */}
      <header className={styles.header}>
        <div className={styles.headerBg} aria-hidden="true" />

        <div className={styles.identity}>
          <div className={styles.avatarLarge}>
            {member.avatarUrl ? (
              <img
                src={member.avatarUrl}
                alt={`${member.username} avatar`}
                className={styles.avatarImg}
              />
            ) : (
              <span className={styles.avatarFallback}>{initials}</span>
            )}
          </div>

          <div className={styles.identityInfo}>
            <h1 className={styles.username}>{member.username}</h1>
            {member.customTitle && (
              <p className={styles.customTitle}>{member.customTitle}</p>
            )}
            {member.group && (
              <span className={styles.groupBadge}>{member.group}</span>
            )}
          </div>
        </div>
      </header>

      {/* ── Stats Grid ──────────────────────────────────────────── */}
      <section className={styles.statsGrid}>
        <StatCard
          label="Posts"
          value={member.postCount?.toLocaleString() || "0"}
        />
        <StatCard
          label="Joined"
          value={
            joinDate
              ? joinDate.toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                })
              : "Unknown"
          }
        />
        {member.location && (
          <StatCard label="Location" value={member.location} />
        )}
        {member.newgrounds && (
          <StatCard
            label="NG Fans"
            value={member.newgrounds.fans?.toLocaleString() || "0"}
          />
        )}
      </section>

      {/* ── Details ─────────────────────────────────────────────── */}
      <div className={styles.detailsGrid}>
        {/* ── Forum Info ──────────────────────────────────────────── */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Forum Profile</h2>
          <div className={styles.panelBody}>
            <DetailRow label="Username" value={member.username} />
            {member.gender && (
              <DetailRow label="Gender" value={member.gender} />
            )}
            {member.website && (
              <DetailRow
                label="Website"
                value={
                  <a
                    href={member.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.externalLink}
                  >
                    {member.website.replace(/^https?:\/\//, "")}
                  </a>
                }
              />
            )}
            {member.lastActive && (
              <DetailRow
                label="Last Active"
                value={new Date(member.lastActive).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              />
            )}
          </div>

          {/* ── Signature ──────────────────────────────────────────── */}
          {member.signatureHtml && (
            <div className={styles.signatureWrap}>
              <span className={styles.signatureLabel}>Signature</span>
              <div
                className={styles.signatureContent}
                dangerouslySetInnerHTML={{ __html: member.signatureHtml }}
              />
            </div>
          )}
        </section>

        {/* ── Newgrounds Integration ──────────────────────────────── */}
        {member.newgrounds && (
          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>
              Newgrounds
              <span className={styles.panelBadge}>Linked</span>
            </h2>
            <div className={styles.ngCard}>
              {member.newgrounds.avatarUrl && (
                <img
                  src={member.newgrounds.avatarUrl}
                  alt={`${member.newgrounds.username} NG avatar`}
                  className={styles.ngAvatar}
                />
              )}
              <div className={styles.ngInfo}>
                <a
                  href={`https://www.newgrounds.com/portal/view/${member.newgrounds.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.ngUsername}
                >
                  {member.newgrounds.username}
                </a>
                {member.newgrounds.description && (
                  <p className={styles.ngDescription}>
                    {member.newgrounds.description}
                  </p>
                )}
                <div className={styles.ngMeta}>
                  {member.newgrounds.fans > 0 && (
                    <span>{member.newgrounds.fans.toLocaleString()} fans</span>
                  )}
                  {member.newgrounds.job && (
                    <span>{member.newgrounds.job}</span>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* ── Recent Posts ─────────────────────────────────────────── */}
      {member.recentPosts?.length > 0 && (
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>
            Recent Forum Posts
            <span className={styles.panelCount}>
              {member.recentPosts.length}
            </span>
          </h2>
          <ul className={styles.postList}>
            {member.recentPosts.map((post, i) => (
              <li key={post.messageId || i} className={styles.postItem}>
                <div className={styles.postHeader}>
                  {post.threadTitle && (
                    <span className={styles.postThread}>
                      {post.threadTitle}
                    </span>
                  )}
                  {post.date && (
                    <time className={styles.postDate}>
                      {new Date(post.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </time>
                  )}
                </div>
                {post.body && (
                  <p className={styles.postBody}>
                    {post.body.length > 200
                      ? `${post.body.slice(0, 200)}…`
                      : post.body}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────

function StatCard({ label, value }) {
  return (
    <div className={styles.statCard}>
      <span className={styles.statValue}>{value}</span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className={styles.detailRow}>
      <span className={styles.detailLabel}>{label}</span>
      <span className={styles.detailValue}>{value}</span>
    </div>
  );
}
