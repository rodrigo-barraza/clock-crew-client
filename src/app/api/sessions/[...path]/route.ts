/**
 * Catch-all API proxy for sessions-service.
 * Forwards requests from /api/sessions/[...path] → sessions-service/[path].
 *
 * Forwards client identity headers (IP, User-Agent, client hints,
 * Accept-Language, Referer) so sessions-service can perform accurate IP
 * geolocation and device fingerprinting.
 */

import { createNextjsProxy } from "@rodrigo-barraza/utilities-library/nextjs";
import { IDENTITY_HEADERS } from "@rodrigo-barraza/utilities-library/taxonomy";
import { SERVER_CONFIG } from "@/config";

export const { GET, POST } = createNextjsProxy({
  serviceName: "sessions",
  // Values, not variable names: the build inlines them, so the proxy
  // never falls back to guessing <this host>:5580.
  publicUrlEnvironmentVariable: SERVER_CONFIG.sessionsServicePublicUrl,
  internalUrlEnvironmentVariable: SERVER_CONFIG.sessionsServiceUrl,
  forwardHeaders: [
    IDENTITY_HEADERS.forwardedFor,
    "x-real-ip",
    "user-agent",
    "x-session-id",
    "accept-language",
    "referer",
    "sec-ch-ua",
    "sec-ch-ua-mobile",
    "sec-ch-ua-platform",
    "sec-ch-ua-platform-version",
    "sec-ch-ua-model",
  ],
  methods: ["GET", "POST"],
});
