"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type SyntheticEvent,
} from "react";
import { Search } from "lucide-react";
import {
  SearchInputComponent,
  SelectComponent,
  LoadingIndicatorComponent,
  EmptyStateComponent,
} from "@rodrigo-barraza/components-library";
import { formatCompact, formatCount, formatScore } from "@/lib/display";
import type { ClockProfile, PortalYears, Submission } from "@/types";
import { PORTAL_TABS, typeMeta, type PortalTab } from "./portalTypes";
import { usePortalFeed, type PortalCounts } from "./usePortalFeed";
import { ContentDetailModal, ProfileDetailModal } from "./PortalModals";
import styles from "./NewgroundsPortalComponent.module.css";

const SEARCH_DEBOUNCE_MS = 350;

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

function cardDelay(index: number): CSSProperties {
  return { animationDelay: `${Math.min((index % 40) * 30, 600)}ms` };
}

function hideBrokenImage(event: SyntheticEvent<HTMLImageElement>) {
  event.currentTarget.style.display = "none";
}

// ── Cards ────────────────────────────────────────────────────────

function SubmissionCard({
  item,
  index,
  onOpen,
}: {
  item: Submission;
  index: number;
  onOpen: () => void;
}) {
  const meta = typeMeta(item.contentType);
  return (
    <button
      type="button"
      className={styles["item-card"]}
      onClick={onOpen}
      style={cardDelay(index)}
    >
      <div className={styles["item-thumb-wrap"]}>
        {item.thumbnailUrl && (
          <img
            src={item.thumbnailUrl}
            alt=""
            className={styles["item-thumb"]}
            loading="lazy"
            onError={hideBrokenImage}
          />
        )}
        <span
          className={`${styles["type-badge"]} ${styles[meta.badgeClass]}`}
          aria-label={meta.label}
        >
          {meta.emoji}
        </span>
      </div>
      <div className={styles["item-info"]}>
        <span className={styles["item-title"]}>{item.title}</span>
        <div className={styles["item-meta"]}>
          <span className={styles["item-author"]}>{item.usernameLower}</span>
          {item.score != null && (
            <span className={styles["item-score"]}>
              <span className={styles["score-star"]} aria-hidden="true">
                ★
              </span>
              {formatScore(item.score)}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

function ClockCard({
  profile,
  index,
  onOpen,
}: {
  profile: ClockProfile;
  index: number;
  onOpen: () => void;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const fanCount = profile.fans?.count ?? 0;
  const avatarSrc = profile.ccAvatarUrl || profile.avatarUrl;

  return (
    <button
      type="button"
      className={styles["item-card"]}
      onClick={onOpen}
      style={cardDelay(index)}
    >
      <div className={styles["clock-avatar-wrap"]}>
        {avatarSrc && !imageFailed ? (
          <img
            src={avatarSrc}
            alt=""
            className={styles["clock-avatar-img"]}
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div
            className={styles["clock-avatar-fallback-initial"]}
            aria-hidden="true"
          >
            {(profile.username || "?")[0].toUpperCase()}
          </div>
        )}
        {profile.level != null && (
          <span className={styles["clock-level-badge"]}>
            Lvl {profile.level}
          </span>
        )}
      </div>
      <div className={styles["item-info"]}>
        <span className={styles["item-title"]}>{profile.username}</span>
        <div className={styles["item-meta"]}>
          <span className={styles["item-author"]}>
            {profile.location || profile.joinDate || ""}
          </span>
          {fanCount > 0 && (
            <span className={styles["clock-fan-count"]}>
              <span className={styles["score-star"]} aria-hidden="true">
                ♥
              </span>
              {formatCompact(fanCount)}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

function titleSummary(tab: PortalTab, counts: PortalCounts): string {
  if (tab === "clocks")
    return counts.clocks > 0 ? `${formatCount(counts.clocks)} clocks` : "";
  return [
    [counts.movies, "movies"],
    [counts.games, "games"],
    [counts.audio, "audio"],
  ]
    .filter(([count]) => (count as number) > 0)
    .map(([count, label]) => `${formatCount(count as number)} ${label}`)
    .join(" · ");
}

// ═════════════════════════════════════════════════════════════════
//  NewgroundsPortalComponent
// ═════════════════════════════════════════════════════════════════

export default function NewgroundsPortalComponent() {
  const [tab, setTab] = useState<PortalTab>("all");
  const [search, setSearch] = useState("");
  const [year, setYear] = useState("");
  const [years, setYears] = useState<PortalYears>({
    contentYears: [],
    profileYears: [],
  });
  const [selectedItem, setSelectedItem] = useState<Submission | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const query = useDebouncedValue(search.trim(), SEARCH_DEBOUNCE_MS);
  const feed = usePortalFeed({ tab, query, year });
  const isClocks = tab === "clocks";
  const yearOptions = isClocks ? years.profileYears : years.contentYears;

  // ── Year menus ────────────────────────────────────────────────
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/newgrounds/portal/years", { signal: controller.signal })
      .then((response) =>
        response.ok ? (response.json() as Promise<PortalYears>) : null,
      )
      .then((data) => data && setYears(data))
      .catch(() => {});
    return () => controller.abort();
  }, []);

  // ── Infinite scroll ───────────────────────────────────────────
  const { hasMore, loadMore } = feed;
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => entries[0]?.isIntersecting && loadMore(),
      {
        rootMargin: "200px",
      },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  const changeTab = (next: PortalTab) => {
    setTab(next);
    // Submissions and Clocks have different year pools.
    setYear("");
  };

  return (
    <>
      <div className={styles.container} id="newgrounds-portal">
        {/* ── Title Bar ─────────────────────────────────────── */}
        <div className={styles["title-bar"]}>
          <div className={styles["traffic-lights"]} aria-hidden="true">
            <span className={styles["traffic-dot"]} />
            <span className={styles["traffic-dot"]} />
            <span className={styles["traffic-dot"]} />
          </div>
          <span className={styles["title-bar-center"]}>
            <span className={styles["title-text"]}>
              {isClocks ? "Clock Crew" : "Flash Portal"}
            </span>
          </span>
          <span className={styles["title-count"]}>
            {titleSummary(tab, feed.counts)}
          </span>
        </div>

        <div className={styles["content-area"]}>
          {/* ── Search + Filters ──────────────────────────────── */}
          <div className={styles["search-bar"]}>
            <SearchInputComponent
              value={search}
              onChange={setSearch}
              placeholder={
                isClocks
                  ? "Search clocks by name…"
                  : "Search movies, games, audio, or usernames…"
              }
              leadingIcon={<Search size={14} />}
              className={styles["search-input-wrap"]}
            />
            <div className={styles["filter-row"]}>
              <div
                className={styles["type-tabs"]}
                role="group"
                aria-label="Content type"
              >
                {PORTAL_TABS.map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={tab === key}
                    className={`${styles["type-tab"]} ${tab === key ? styles["type-tab-active"] : ""}`}
                    onClick={() => changeTab(key)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {yearOptions.length > 0 && (
                <div className={styles["year-filter"]}>
                  <SelectComponent
                    value={year}
                    onChange={(value: string | string[]) =>
                      setYear(Array.isArray(value) ? (value[0] ?? "") : value)
                    }
                    options={[
                      { value: "", label: "All Years" },
                      ...yearOptions.map((option) => ({
                        value: option,
                        label: option,
                      })),
                    ]}
                  />
                </div>
              )}
            </div>
          </div>

          {/* ── Item Grid ─────────────────────────────────────── */}
          <div className={styles["item-grid"]} aria-busy={feed.loading}>
            {feed.loading && (
              <div
                className={styles["is-loading-state"]}
                style={{ gridColumn: "1 / -1" }}
              >
                <LoadingIndicatorComponent
                  size="small"
                  ariaLabel={`Loading ${isClocks ? "clocks" : "portal"}`}
                />
                <span>Loading {isClocks ? "clocks" : "portal"}…</span>
              </div>
            )}

            {!feed.loading && feed.items.length === 0 && (
              <div style={{ gridColumn: "1 / -1" }}>
                <EmptyStateComponent
                  icon={<span style={{ fontSize: 40 }}>🔍</span>}
                  subtitle={
                    feed.failed
                      ? "The portal is unavailable right now."
                      : query
                        ? `No results for "${query}"`
                        : isClocks
                          ? "No clocks found"
                          : "No submissions found"
                  }
                />
              </div>
            )}

            {feed.items.map((item, index) =>
              isClocks ? (
                <ClockCard
                  key={item._id}
                  profile={item as ClockProfile}
                  index={index}
                  onOpen={() =>
                    setSelectedProfile((item as ClockProfile).usernameLower)
                  }
                />
              ) : (
                <SubmissionCard
                  key={item._id}
                  item={item as Submission}
                  index={index}
                  onOpen={() => setSelectedItem(item as Submission)}
                />
              ),
            )}

            <div ref={sentinelRef} className={styles.sentinel} />

            {feed.loadingMore && (
              <div className={styles["loading-more"]}>
                <LoadingIndicatorComponent
                  size="small"
                  ariaLabel="Loading more"
                />
              </div>
            )}

            {!feed.loading && !feed.hasMore && feed.items.length > 0 && (
              <div className={styles["end-of-list"]}>
                All {formatCount(feed.items.length)}{" "}
                {isClocks ? "clocks" : "submissions"} loaded
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedItem && (
        <ContentDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
      {selectedProfile && (
        <ProfileDetailModal
          usernameLower={selectedProfile}
          onClose={() => setSelectedProfile(null)}
        />
      )}
    </>
  );
}
