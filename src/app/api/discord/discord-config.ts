// ============================================================
// Clock Crew — Discord proxy configuration (server-only)
// ============================================================
// The guild comes from the vault and never from a request; channels
// are limited to the public whitelist.
// ============================================================

import "server-only";
import {
  rewritePrivateUrls,
  rewriteStream,
} from "@rodrigo-barraza/utilities-library/media";
import { SERVER_CONFIG } from "@/config";
import { GENERAL_CHAT_CHANNEL_ID, PUBLIC_CHANNEL_IDS } from "@/constants";

export { GENERAL_CHAT_CHANNEL_ID, PUBLIC_CHANNEL_IDS };
export const ALLOWED_CHANNELS: ReadonlySet<string> = new Set(
  PUBLIC_CHANNEL_IDS,
);

export const discordConfig = {
  get guildId() {
    return SERVER_CONFIG.guildId;
  },
  get luposUrl() {
    return SERVER_CONFIG.luposUrl;
  },
  get toolsServiceUrl() {
    return SERVER_CONFIG.toolsServiceUrl;
  },
};

const DEFAULT_MESSAGE_LIMIT = 50;
const MAX_MESSAGE_LIMIT = 500;

/** `?limit=` as 1–500, defaulting to 50 — never NaN or negative upstream. */
export function messageLimit(searchParams: URLSearchParams): number {
  const parsed = Number.parseInt(searchParams.get("limit") ?? "", 10);
  if (Number.isNaN(parsed)) return DEFAULT_MESSAGE_LIMIT;
  return Math.min(Math.max(parsed, 1), MAX_MESSAGE_LIMIT);
}

/** Discord ids are 17–20 digit snowflakes. */
export function isSnowflake(value: unknown): value is string {
  return typeof value === "string" && /^\d{17,20}$/.test(value);
}

/**
 * Private MinIO URLs → the /api/media proxy, so no visitor gets Chrome's
 * Private Network Access prompt. With no MinIO URL configured this is a
 * no-op: the library would otherwise replaceAll("") and splice
 * "/api/media" between every character of the response.
 */
export function rewriteMediaUrls(text: string): string {
  const minioUrl = SERVER_CONFIG.minioInternalUrl;
  return minioUrl ? rewritePrivateUrls(text, minioUrl) : text;
}

export function rewriteMediaStream(
  stream: ReadableStream<Uint8Array>,
): ReadableStream<Uint8Array> {
  const minioUrl = SERVER_CONFIG.minioInternalUrl;
  return minioUrl ? rewriteStream(stream, minioUrl) : stream;
}
