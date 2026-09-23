import { describe, it, expect, vi } from "vitest";
import { parseTenorUrl, thumbnailToGif } from "@/lib/tenor";
import { mediaObjectPath } from "@/lib/media";
import {
  isSnowflake,
  messageLimit,
  rewriteMediaUrls,
} from "@/app/api/discord/discord-config";

describe("parseTenorUrl", () => {
  it("accepts only https tenor.com pages", () => {
    expect(parseTenorUrl("https://tenor.com/view/clock-123")).toBe(
      "https://tenor.com/view/clock-123",
    );
    expect(parseTenorUrl("https://media.tenor.com/x.gif")).toBe(
      "https://media.tenor.com/x.gif",
    );
    expect(parseTenorUrl("https://evil.com/?tenor.com")).toBeNull();
    expect(parseTenorUrl("https://tenor.com.evil.com/view")).toBeNull();
    expect(parseTenorUrl("http://tenor.com/view/x")).toBeNull();
    expect(parseTenorUrl(null)).toBeNull();
  });

  it("swaps the nano PNG thumbnail for the GIF", () => {
    expect(thumbnailToGif("https://media.tenor.com/abcAAAAN/clock.png")).toBe(
      "https://media.tenor.com/abcAAAAC/clock.gif",
    );
    expect(thumbnailToGif(undefined)).toBeNull();
  });
});

describe("mediaObjectPath", () => {
  it("serves only the archived-media bucket", () => {
    expect(mediaObjectPath(["discord-media", "media", "a b.png"])).toBe(
      "discord-media/media/a%20b.png",
    );
    expect(mediaObjectPath(["private-bucket", "secret.txt"])).toBeNull();
    expect(mediaObjectPath(["discord-media"])).toBeNull();
    expect(mediaObjectPath([])).toBeNull();
  });

  it("refuses any path that climbs out of the bucket", () => {
    expect(mediaObjectPath(["discord-media", "..", "private", "x"])).toBeNull();
    expect(mediaObjectPath(["discord-media", ".", "x"])).toBeNull();
    expect(mediaObjectPath(["discord-media", "a\\..\\b"])).toBeNull();
  });
});

describe("discord proxy helpers", () => {
  it("bounds ?limit= to 1–500 and never forwards NaN", () => {
    expect(messageLimit(new URLSearchParams("limit=abc"))).toBe(50);
    expect(messageLimit(new URLSearchParams("limit=-3"))).toBe(1);
    expect(messageLimit(new URLSearchParams("limit=9000"))).toBe(500);
    expect(messageLimit(new URLSearchParams())).toBe(50);
  });

  it("knows a snowflake", () => {
    expect(isSnowflake("671089694397956116")).toBe(true);
    expect(isSnowflake("123")).toBe(false);
    expect(isSnowflake(671089694397956116)).toBe(false);
  });

  it("leaves a response untouched when no MinIO URL is configured (it used to splice /api/media between every character)", () => {
    vi.stubEnv("MINIO_INTERNAL_URL", "");
    expect(rewriteMediaUrls('{"count":0}')).toBe('{"count":0}');
  });

  it("rewrites private MinIO URLs to the media proxy", () => {
    vi.stubEnv("MINIO_INTERNAL_URL", "http://10.0.0.2:9000");
    expect(
      rewriteMediaUrls('{"url":"http://10.0.0.2:9000/discord-media/a.png"}'),
    ).toBe('{"url":"/api/media/discord-media/a.png"}');
  });
});
