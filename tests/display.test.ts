import { describe, it, expect } from "vitest";
import {
  archiveYear,
  clip,
  formatArchiveDate,
  formatCompact,
  formatCount,
  initials,
  linkLabel,
  safeHref,
} from "@/lib/display";

describe("safeHref", () => {
  it("passes http(s) links and drops everything else", () => {
    expect(safeHref("https://strawberryclock.newgrounds.com")).toBe(
      "https://strawberryclock.newgrounds.com",
    );
    expect(safeHref("http://www.clockcrew.net")).toBe(
      "http://www.clockcrew.net",
    );
    expect(safeHref("javascript:alert(1)")).toBeUndefined();
    expect(safeHref("JaVaScRiPt:alert(1)")).toBeUndefined();
    expect(safeHref("data:text/html,<script>")).toBeUndefined();
    expect(safeHref("not a url")).toBeUndefined();
    expect(safeHref(null)).toBeUndefined();
  });
});

describe("archive formatting", () => {
  it("reads dates in UTC, so a late-evening post keeps its day on the server and in every browser", () => {
    expect(formatArchiveDate("2014-07-09T04:21:55.000Z")).toBe("Jul 9, 2014");
    expect(formatArchiveDate("2000-03-22")).toBe("Mar 22, 2000");
    expect(formatArchiveDate(null)).toBe("—");
    expect(formatArchiveDate("someday")).toBe("someday");
    expect(archiveYear("2003-01-01T02:00:00.000Z")).toBe(2003);
  });

  it("formats numbers in one locale", () => {
    expect(formatCount(12994)).toBe("12,994");
    expect(formatCompact(2900)).toBe("2.9K");
    expect(formatCompact(18)).toBe("18");
    expect(formatCompact(undefined)).toBe("0");
  });
});

describe("text helpers", () => {
  it("builds avatar initials without the Clock suffix", () => {
    expect(initials("StrawberryClock")).toBe("ST");
    expect(initials("Clock")).toBe("CL");
  });

  it("labels a link by its text, else its host", () => {
    expect(
      linkLabel({ url: "http://www.clockcrew.net", text: "Spoony Bard" }),
    ).toBe("Spoony Bard");
    expect(linkLabel({ url: "https://example.com/a", text: null })).toBe(
      "example.com",
    );
  });

  it("clips with an ellipsis", () => {
    expect(clip("abcdef", 3)).toBe("abc…");
    expect(clip("abc", 3)).toBe("abc");
  });
});
