"use client";

import { useState, useEffect, useMemo } from "react";
import { Search } from "lucide-react";
import {
  SearchInputComponent,
  LoadingIndicatorComponent,
  EmptyStateComponent,
} from "@rodrigo-barraza/components-library";
import MemberCardComponent from "../../components/MemberCardComponent/MemberCardComponent";
import styles from "./MembersPage.module.css";

const SORT_OPTIONS = [
  { key: "posts", label: "Most Posts" },
  { key: "newest", label: "Newest" },
  { key: "oldest", label: "Oldest" },
  { key: "alpha", label: "A → Z" },
];

export default function MembersDirectory() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("posts");

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch("/api/clockcrew/users?limit=2000");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setUsers(data.users || []);
      } catch (error) {
        console.error("[MembersPage] Fetch error:", (error as any).message);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  // ── Filter + sort ─────────────────────────────────────────────
  const filteredUsers = useMemo(() => {
    let list = users;

    // Search filter
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (u) =>
          u.username?.toLowerCase().includes(q) ||
          u.customTitle?.toLowerCase().includes(q),
      );
    }

    // Sort
    const sorted = [...list];
    switch (sort) {
      case "posts":
        sorted.sort((a, b) => (b.postCount || 0) - (a.postCount || 0));
        break;
      case "newest":
        sorted.sort(
          (a, b) =>
            (new Date(b.dateRegistered || 0) as any) - (new Date(a.dateRegistered || 0) as any),
        );
        break;
      case "oldest":
        sorted.sort(
          (a, b) =>
            (new Date(a.dateRegistered || 0) as any) - (new Date(b.dateRegistered || 0) as any),
        );
        break;
      case "alpha":
        sorted.sort((a, b) =>
          (a.username || "").localeCompare(b.username || ""),
        );
        break;
    }

    return sorted;
  }, [users, search, sort]);

  // ── Group by letter for A–Z anchors ───────────────────────────
  const grouped = useMemo(() => {
    if (sort !== "alpha") return null;

    const groups = {};
    for (const user of filteredUsers) {
      const letter = (user.username || "?")[0].toUpperCase();
      const key = /[A-Z]/.test(letter) ? letter : "#";
      if (!(groups as any)[key]) (groups as any)[key] = [];
      (groups as any)[key].push(user);
    }
    return groups;
  }, [filteredUsers, sort]);

  return (
    <div className={styles.page}>
      {/* ── Page Header ─────────────────────────────────────────── */}
      <header className={styles.header}>
        <h1 className={styles.title}>Members</h1>
        <p className={styles.subtitle}>
          {loading
            ? "Loading directory…"
            : `${users.length} Clock Crew members archived`}
        </p>
      </header>

      {/* ── Controls ────────────────────────────────────────────── */}
      <div className={styles.controls}>
        <SearchInputComponent
          value={search}
          onChange={setSearch}
          placeholder="Search members…"
          leadingIcon={<Search size={14} />}
        />
        <div className={styles.sortGroup}>
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              className={`${styles.sortBtn} ${sort === opt.key ? styles.sortBtnActive : ""}`}
              onClick={() => setSort(opt.key)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Loading state ───────────────────────────────────────── */}
      {loading && (
        <div className={styles.loadingState}>
          <LoadingIndicatorComponent size={48} />
          <span>Loading directory…</span>
        </div>
      )}

      {/* ── Alphabetical grouped view ───────────────────────────── */}
      {!loading && grouped && (
        <div className={styles.groupedList}>
          {Object.entries(grouped)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([letter, members]) => (
              <div key={letter} id={`letter-${letter}`}>
                <h2 className={styles.letterHeading}>{letter}</h2>
                <div className={styles.grid}>
                  {(members as any).map((user: any, i: any) => (
                    <MemberCardComponent
                      key={user.userId || user.username}
                      user={user}
                      index={i}
                    />
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* ── Flat grid view ──────────────────────────────────────── */}
      {!loading && !grouped && (
        <div className={styles.grid}>
          {filteredUsers.map((user: any, i: any) => (
            <MemberCardComponent
              key={user.userId || user.username}
              user={user}
              index={i}
            />
          ))}
        </div>
      )}

      {/* ── Empty state ─────────────────────────────────────────── */}
      {!loading && filteredUsers.length === 0 && (
        <EmptyStateComponent
          icon={<span style={{ fontSize: 40 }}>🔍</span>}
          subtitle={`No members found matching "${search}"`}
        />
      )}
    </div>
  );
}
