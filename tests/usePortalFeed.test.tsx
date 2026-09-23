import { describe, it, expect, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import {
  usePortalFeed,
  PAGE_SIZE,
  type FeedQuery,
} from "@/app/components/NewgroundsPortalComponent/usePortalFeed";

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((settle) => (resolve = settle));
  return { promise, resolve };
}

function page(titles: string[], total = titles.length) {
  return Response.json({
    count: titles.length,
    totalMovies: total,
    totalGames: 0,
    totalAudio: 0,
    items: titles.map((title) => ({
      _id: title,
      title,
      url: "https://www.newgrounds.com",
      usernameLower: "a",
    })),
  });
}

describe("usePortalFeed", () => {
  it("shows the newest query's results even when an older request answers last", async () => {
    const slow = deferred<Response>();
    const fetchMock = vi.fn((url: string) =>
      new URL(url, "http://site.test").searchParams.get("q") === "cl"
        ? slow.promise
        : Promise.resolve(page(["Clock Day"])),
    );
    vi.stubGlobal("fetch", fetchMock);

    const { result, rerender } = renderHook(
      (query: FeedQuery) => usePortalFeed(query),
      {
        initialProps: { tab: "all", query: "cl", year: "" },
      },
    );
    expect(result.current.loading).toBe(true);

    // The user keeps typing before the first request comes back.
    rerender({ tab: "all", query: "clock", year: "" });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.items.map((item) => item._id)).toEqual(["Clock Day"]);

    // The stale answer arrives late and must not replace it.
    await act(async () => slow.resolve(page(["Stale"])));
    expect(result.current.items.map((item) => item._id)).toEqual(["Clock Day"]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("appends the next page at the right offset and stops at the total", async () => {
    const first = Array.from({ length: PAGE_SIZE }, (_, index) => `m${index}`);
    const fetchMock = vi.fn((url: string) =>
      Promise.resolve(
        new URL(url, "http://site.test").searchParams.get("skip") === "0"
          ? page(first, PAGE_SIZE + 1)
          : page(["last"], PAGE_SIZE + 1),
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() =>
      usePortalFeed({ tab: "movie", query: "", year: "" }),
    );
    await waitFor(() => expect(result.current.hasMore).toBe(true));

    act(() => result.current.loadMore());
    await waitFor(() =>
      expect(result.current.items).toHaveLength(PAGE_SIZE + 1),
    );
    expect(fetchMock.mock.calls[1][0]).toContain(`skip=${PAGE_SIZE}`);
    expect(fetchMock.mock.calls[1][0]).toContain("type=movie");
    expect(result.current.hasMore).toBe(false);
  });

  it("reports a failed load instead of spinning", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("{}", { status: 503 })),
    );
    const { result } = renderHook(() =>
      usePortalFeed({ tab: "clocks", query: "", year: "" }),
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.failed).toBe(true);
  });
});
