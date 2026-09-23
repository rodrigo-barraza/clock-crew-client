"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ClockProfile, ClocksPage, PortalPage, Submission } from "@/types";
import type { PortalTab } from "./portalTypes";

export const PAGE_SIZE = 40;

export interface PortalCounts {
  movies: number;
  games: number;
  audio: number;
  clocks: number;
}

export type FeedItem = Submission | ClockProfile;

export interface FeedQuery {
  tab: PortalTab;
  query: string;
  year: string;
}

interface FetchedPage {
  items: FeedItem[];
  total: number;
  counts: Partial<PortalCounts>;
}

interface FeedState {
  /** The query these items answer — while it differs from the current one, the feed is loading. */
  key: string | null;
  items: FeedItem[];
  counts: PortalCounts;
  loadingMore: boolean;
  hasMore: boolean;
  failed: boolean;
}

async function fetchPage(
  { tab, query, year }: FeedQuery,
  skip: number,
  signal: AbortSignal,
): Promise<FetchedPage> {
  const clocks = tab === "clocks";
  const params = new URLSearchParams({
    sort: clocks ? "fans" : "score",
    limit: String(PAGE_SIZE),
    skip: String(skip),
  });
  if (query) params.set("q", query);
  if (!clocks) params.set("type", tab);
  if (year) params.set("year", year);

  const response = await fetch(
    `/api/newgrounds/portal${clocks ? "/clocks" : ""}?${params}`,
    { signal },
  );
  if (!response.ok) throw new Error(`Portal answered ${response.status}`);

  if (clocks) {
    const page = (await response.json()) as ClocksPage;
    return {
      items: page.profiles,
      total: page.totalClocks,
      counts: { clocks: page.totalClocks },
    };
  }
  const page = (await response.json()) as PortalPage;
  const totals = {
    all: page.totalMovies + page.totalGames + page.totalAudio,
    movie: page.totalMovies,
    game: page.totalGames,
    audio: page.totalAudio,
  };
  return {
    items: page.items,
    total: totals[tab],
    counts: {
      movies: page.totalMovies,
      games: page.totalGames,
      audio: page.totalAudio,
    },
  };
}

/**
 * The portal's infinitely scrolling list. A new query aborts whatever is
 * in flight and starts over, and a page that arrives for an old query is
 * dropped. (A single "fetching" flag used to drop the NEW request instead,
 * so a search typed while a page was loading never ran.)
 */
export function usePortalFeed({ tab, query, year }: FeedQuery) {
  const key = `${tab}\u0000${query}\u0000${year}`;
  const [state, setState] = useState<FeedState>({
    key: null,
    items: [],
    counts: { movies: 0, games: 0, audio: 0, clocks: 0 },
    loadingMore: false,
    hasMore: false,
    failed: false,
  });
  const controllerRef = useRef<AbortController | null>(null);
  const loadingMoreRef = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    controllerRef.current = controller;
    loadingMoreRef.current = false;

    fetchPage({ tab, query, year }, 0, controller.signal).then(
      (page) => {
        // An answer that beat its own abort still belongs to an old query.
        if (controller.signal.aborted) return;
        setState((previous) => ({
          key,
          items: page.items,
          counts: { ...previous.counts, ...page.counts },
          loadingMore: false,
          hasMore:
            page.items.length === PAGE_SIZE && page.items.length < page.total,
          failed: false,
        }));
      },
      (error: unknown) => {
        if (controller.signal.aborted) return;
        console.error("[NewgroundsPortal] Fetch error:", error);
        setState((previous) => ({
          ...previous,
          key,
          items: [],
          loadingMore: false,
          hasMore: false,
          failed: true,
        }));
      },
    );

    return () => controller.abort();
  }, [key, tab, query, year]);

  const loading = state.key !== key;

  const loadMore = useCallback(() => {
    const controller = controllerRef.current;
    if (!controller || loading || !state.hasMore || loadingMoreRef.current)
      return;
    loadingMoreRef.current = true;
    setState((previous) => ({ ...previous, loadingMore: true }));

    fetchPage({ tab, query, year }, state.items.length, controller.signal)
      .then(
        (page) => {
          if (controller.signal.aborted) return;
          setState((previous) => {
            const items = [...previous.items, ...page.items];
            return {
              ...previous,
              items,
              loadingMore: false,
              hasMore:
                page.items.length === PAGE_SIZE && items.length < page.total,
            };
          });
        },
        (error: unknown) => {
          if (controller.signal.aborted) return;
          console.error("[NewgroundsPortal] Fetch error:", error);
          setState((previous) => ({
            ...previous,
            loadingMore: false,
            hasMore: false,
          }));
        },
      )
      .finally(() => {
        if (controllerRef.current === controller)
          loadingMoreRef.current = false;
      });
  }, [loading, state.hasMore, state.items.length, tab, query, year]);

  return {
    items: loading ? [] : state.items,
    counts: state.counts,
    loading,
    loadingMore: state.loadingMore,
    hasMore: !loading && state.hasMore,
    failed: !loading && state.failed,
    loadMore,
  };
}
