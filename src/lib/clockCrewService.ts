// ============================================================
// clock-crew-service client (server-only)
// ============================================================

import "server-only";
import { SERVER_CONFIG } from "@/config";

export class ServiceError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/** Seconds a service response may be reused — the archive only changes when a scraper runs. */
export const ARCHIVE_REVALIDATE_SECONDS = 3600;

/**
 * GET a clock-crew-service path as JSON. A non-2xx answer throws a
 * `ServiceError` carrying the service's status and message.
 */
export async function fetchService<T>(
  path: string,
  init: RequestInit & { next?: { revalidate?: number | false } } = {},
): Promise<T> {
  const baseUrl = SERVER_CONFIG.clockCrewServiceUrl;
  if (!baseUrl)
    throw new ServiceError(503, "CLOCK_CREW_SERVICE_URL is not configured");

  const response = await fetch(`${baseUrl}${path}`, init);
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      message?: unknown;
    } | null;
    const message =
      typeof body?.message === "string"
        ? body.message
        : `clock-crew-service answered ${response.status}`;
    throw new ServiceError(response.status, message);
  }
  return (await response.json()) as T;
}

/** `fetchService`, answering `null` on a 404. */
export async function fetchServiceOrNull<T>(
  path: string,
  init?: Parameters<typeof fetchService>[1],
): Promise<T | null> {
  try {
    return await fetchService<T>(path, init);
  } catch (error) {
    if (error instanceof ServiceError && error.status === 404) return null;
    throw error;
  }
}

/**
 * An API route's proxy to clock-crew-service: forwards the allowed query
 * parameters and relays the JSON answer, or a JSON error with its status.
 */
export async function proxyService(
  request: Request,
  path: string,
  {
    allowedParams = [],
    defaults = {},
    revalidate = 0,
  }: {
    allowedParams?: readonly string[];
    defaults?: Record<string, string>;
    revalidate?: number;
  } = {},
): Promise<Response> {
  const incoming = new URL(request.url).searchParams;
  const params = new URLSearchParams(defaults);
  for (const key of allowedParams) {
    const value = incoming.get(key);
    if (value) params.set(key, value);
  }
  const query = params.size > 0 ? `?${params}` : "";

  try {
    const data = await fetchService<unknown>(
      `${path}${query}`,
      revalidate > 0 ? { next: { revalidate } } : { cache: "no-store" },
    );
    return Response.json(data);
  } catch (error) {
    if (error instanceof ServiceError) {
      return Response.json({ error: error.message }, { status: error.status });
    }
    console.error(`[clock-crew-service] ${path}:`, (error as Error).message);
    return Response.json({ error: "Service unavailable" }, { status: 503 });
  }
}
