import { describe, it, expect, vi } from "vitest";

const fetchService = vi.fn();
vi.mock("@/lib/clockCrewService", () => ({
  fetchService: (...args: unknown[]) => fetchService(...args),
}));
const { default: sitemap } = await import("@/app/sitemap");

describe("sitemap", () => {
  it("lists the static pages and every directory member", async () => {
    fetchService.mockResolvedValue({
      users: [{ userId: 3, username: "Strawberry Clock" }],
    });
    const entries = await sitemap();
    expect(entries.map((entry) => entry.url)).toEqual([
      "https://clocktopia.com",
      "https://clocktopia.com/clocks",
      "https://clocktopia.com/history",
      "https://clocktopia.com/clocks/Strawberry%20Clock",
    ]);
    expect(entries[3].lastModified).toBeUndefined();
  });

  it("falls back to the static pages when the service is down", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    fetchService.mockRejectedValue(new Error("down"));
    expect(await sitemap()).toHaveLength(3);
  });
});
