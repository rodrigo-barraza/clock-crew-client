/**
 * Catch-all API proxy for sessions-service.
 * Forwards requests from /api/sessions/[...path] → sessions-service:5580/[path].
 *
 * Unlike the generic proxy, this handler forwards client identity headers
 * (IP, User-Agent, Accept-Language) so sessions-service can perform
 * accurate IP geolocation and device fingerprinting server-side.
 */

import { NextResponse } from "next/server";

const SESSIONS_SERVICE_PORT = 5580;

function resolveUpstream(request) {
  const publicUrl = process.env.SESSIONS_SERVICE_PUBLIC_URL;
  if (publicUrl) return publicUrl;

  const internalUrl = process.env.SESSIONS_SERVICE_URL;
  if (
    internalUrl &&
    !internalUrl.includes("localhost") &&
    !internalUrl.includes("127.0.0.1")
  ) {
    return internalUrl;
  }

  const host = request.headers.get("host");
  if (host) {
    const hostname = host.split(":")[0];
    const protocol = request.headers.get("x-forwarded-proto") || "http";
    return `${protocol}://${hostname}:${SESSIONS_SERVICE_PORT}`;
  }

  return internalUrl || `http://localhost:${SESSIONS_SERVICE_PORT}`;
}

async function proxyRequest(request, { params }) {
  const { path } = await params;
  const segments = Array.isArray(path) ? path.join("/") : path;

  const url = new URL(request.url);
  const queryString = url.search || "";
  const upstream = resolveUpstream(request);
  const targetUrl = `${upstream}/${segments}${queryString}`;

  try {
    const headers = { "Content-Type": "application/json" };

    // Forward client IP for geolocation
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "";
    if (clientIp) {
      headers["x-forwarded-for"] = clientIp;
      headers["x-real-ip"] = clientIp;
    }

    // Forward user-agent for browser/OS/device parsing
    const userAgent = request.headers.get("user-agent");
    if (userAgent) headers["user-agent"] = userAgent;

    // Forward session ID header
    const sessionId = request.headers.get("x-session-id");
    if (sessionId) headers["x-session-id"] = sessionId;

    // Forward accept-language for locale detection
    const acceptLanguage = request.headers.get("accept-language");
    if (acceptLanguage) headers["accept-language"] = acceptLanguage;

    const fetchOptions = { method: request.method, headers };

    if (request.method !== "GET" && request.method !== "HEAD") {
      try {
        const body = await request.json();
        fetchOptions.body = JSON.stringify(body);
      } catch {
        // No body — fine for some POSTs
      }
    }

    const response = await fetch(targetUrl, fetchOptions);
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error(
      `[Sessions Proxy] ${request.method} /${segments} → ${targetUrl} failed:`,
      error.message,
    );
    return NextResponse.json(
      { error: `Failed to reach sessions service: ${error.message}` },
      { status: 502 },
    );
  }
}

export const GET = proxyRequest;
export const POST = proxyRequest;
