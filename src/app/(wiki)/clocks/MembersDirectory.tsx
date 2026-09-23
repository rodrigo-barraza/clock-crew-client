"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import {
  SearchInputComponent,
  EmptyStateComponent,
} from "@rodrigo-barraza/components-library";
import MemberCardComponent from "@/app/components/MemberCardComponent/MemberCardComponent";
import { formatCount } from "@/lib/display";
import type { DirectoryUser } from "@/types";
import { SORT_OPTIONS, type DirectorySort } from "./sortOptions";
import styles from "./MembersPage.module.css";

function registered(user: DirectoryUser): number {
  const time = user.dateRegistered ? Date.parse(user.dateRegistered) : NaN;
  return Number.isNaN(time) ? 0 : time;
}

const COMPARE: Record<
  DirectorySort,
  (a: DirectoryUser, b: DirectoryUser) => number
> = {
  posts: (a, b) => (b.postCount ?? 0) - (a.postCount ?? 0),
  newest: (a, b) => registered(b) - registered(a),
  oldest: (a, b) => registered(a) - registered(b),
  alpha: (a, b) =>
    a.username.localeCompare(b.username, "en", { sensitivity: "base" }),
};

/** The A–Z bucket of a name: a letter, or "#" for anything else. */
export function letterOf(username: string): string {
  const letter = username.charAt(0).toUpperCase();
  return /[A-Z]/.test(letter) ? letter : "#";
}

interface MembersDirectoryProps {
  /** null when the service could not be reached. */
  users: DirectoryUser[] | null;
  initialSort: DirectorySort;
}

export default function MembersDirectory({
  users,
  initialSort,
}: MembersDirectoryProps) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<DirectorySort>(initialSort);

  const changeSort = (next: DirectorySort) => {
    setSort(next);
    // Keep the sort shareable without a server round-trip; Next syncs its router with history.
    const url = new URL(window.location.href);
    if (next === "posts") url.searchParams.delete("sort");
    else url.searchParams.set("sort", next);
    url.hash = "";
    window.history.replaceState(null, "", url);
  };

  const filteredUsers = useMemo(() => {
    const needle = search.trim().toLowerCase();
    const matching = needle
      ? (users ?? []).filter(
          (user) =>
            user.username.toLowerCase().includes(needle) ||
            user.customTitle?.toLowerCase().includes(needle),
        )
      : (users ?? []);
    return [...matching].sort(COMPARE[sort]);
  }, [users, search, sort]);

  const groups = useMemo(() => {
    if (sort !== "alpha") return null;
    const byLetter = new Map<string, DirectoryUser[]>();
    for (const user of filteredUsers) {
      const letter = letterOf(user.username);
      byLetter.set(letter, [...(byLetter.get(letter) ?? []), user]);
    }
    return [...byLetter].sort(([a], [b]) =>
      a === "#" ? 1 : b === "#" ? -1 : a.localeCompare(b),
    );
  }, [filteredUsers, sort]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Members</h1>
        <p className={styles.subtitle}>
          {users
            ? `${formatCount(users.length)} Clock Crew members archived`
            : "The member directory is unavailable right now."}
        </p>
      </header>

      <div className={styles.controls}>
        <SearchInputComponent
          value={search}
          onChange={setSearch}
          placeholder="Search members…"
          leadingIcon={<Search size={14} />}
          className={styles["search-input"]}
        />
        <div
          className={styles["sort-group"]}
          role="group"
          aria-label="Sort members"
        >
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.key}
              type="button"
              aria-pressed={sort === option.key}
              className={`${styles["sort-button"]} ${sort === option.key ? styles["sort-btn-active"] : ""}`}
              onClick={() => changeSort(option.key)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {groups ? (
        <div className={styles["grouped-list"]}>
          {groups.map(([letter, members]) => (
            <section key={letter} aria-labelledby={`letter-${letter}`}>
              <h2 id={`letter-${letter}`} className={styles["letter-heading"]}>
                {letter}
              </h2>
              <div className={styles.grid}>
                {members.map((user, index) => (
                  <MemberCardComponent
                    key={user.userId}
                    user={user}
                    index={index}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredUsers.map((user, index) => (
            <MemberCardComponent key={user.userId} user={user} index={index} />
          ))}
        </div>
      )}

      {users && filteredUsers.length === 0 && (
        <EmptyStateComponent
          icon={<span style={{ fontSize: 40 }}>🔍</span>}
          subtitle={`No members found matching "${search}"`}
        />
      )}
    </div>
  );
}
