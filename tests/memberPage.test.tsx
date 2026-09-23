import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { memberData } from "./fixtures";

const fetchServiceOrNull = vi.fn();
vi.mock("@/lib/clockCrewService", () => ({
  ARCHIVE_REVALIDATE_SECONDS: 3600,
  fetchServiceOrNull: (...args: unknown[]) => fetchServiceOrNull(...args),
}));

const { default: MemberProfilePage, generateMetadata } =
  await import("@/app/(wiki)/clocks/[username]/page");
const params = (username: string) => ({
  params: Promise.resolve({ username }),
});

beforeEach(() => fetchServiceOrNull.mockReset());

describe("member page", () => {
  it("is a real 404 for an unknown member", async () => {
    fetchServiceOrNull.mockResolvedValue(null);
    await expect(MemberProfilePage(params("Nobody"))).rejects.toThrow(
      "NEXT_NOT_FOUND",
    );
  });

  it("treats the old service's 200 error body as not found", async () => {
    fetchServiceOrNull.mockResolvedValue({
      error: true,
      message: "Member not found",
      statusCode: 404,
    });
    await expect(MemberProfilePage(params("Nobody"))).rejects.toThrow(
      "NEXT_NOT_FOUND",
    );
  });

  it("escapes the JSON-LD so no member text can close the script tag", async () => {
    const data = memberData();
    data.member.newgrounds!.description = "</script><script>alert(1)</script>";
    fetchServiceOrNull.mockResolvedValue(data);
    const html = renderToStaticMarkup(
      await MemberProfilePage(params("StrawberryClock")),
    );
    const jsonLd =
      html.match(/<script type="application\/ld\+json">(.*?)<\/script>/)?.[1] ??
      "";
    expect(jsonLd).not.toContain("</script>");
    expect(JSON.parse(jsonLd).description).toBe(
      "</script><script>alert(1)</script>",
    );
  });

  it("titles the page with the canonical name and the member's own bio", async () => {
    fetchServiceOrNull.mockResolvedValue(memberData());
    const metadata = await generateMetadata(params("strawberryclock"));
    expect(metadata.title).toBe("StrawberryClock — Clock Crew Member");
    expect(metadata.description).toBe(
      "StrawberryClock: IM STRAWBERRYCLOCK HAHAHA",
    );
    expect(metadata.alternates?.canonical).toBe("/clocks/StrawberryClock");
    expect(fetchServiceOrNull).toHaveBeenCalledWith(
      "/clockcrew/members/strawberryclock",
      { next: { revalidate: 3600 } },
    );
  });

  it("survives a malformed percent-encoding in the URL", async () => {
    fetchServiceOrNull.mockResolvedValue(null);
    const metadata = await generateMetadata(params("100%Clock"));
    expect(metadata.title).toBe("100%Clock — Clock Crew Member");
  });
});
