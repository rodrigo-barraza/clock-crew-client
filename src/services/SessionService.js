// ============================================================
// SessionService — Client-side visitor analytics
// ============================================================
// Manages session + visitor IDs and sends heartbeat, page view,
// and event telemetry to sessions-service via the Next.js proxy.
// ============================================================

const PROJECT_ID = "clock-crew-client";
const SESSION_KEY = "sessions_session_id";
const VISITOR_KEY = "sessions_visitor_id";
const API_BASE = "/api/sessions";

import { generateUUID } from "@rodrigo-barraza/utilities-library";
// ─── Session & Visitor ID Management ───────────────────────────

function getVisitorId() {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id = generateUUID();
    localStorage.setItem(VISITOR_KEY, id);
  }
  return id;
}

function getSessionId() {
  if (typeof window === "undefined") return "";
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = generateUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

function isReturningSession() {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(SESSION_KEY) !== null;
}

// ─── UTM Parameter Extraction ──────────────────────────────────

function extractUtmParams() {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const utm = {};
  const keys = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];

  for (const key of keys) {
    const value = params.get(key);
    if (value) utm[key.replace("utm_", "")] = value;
  }

  return Object.keys(utm).length > 0 ? utm : null;
}

// ─── Fire-and-forget fetch ─────────────────────────────────────

function send(path, body) {
  try {
    fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-session-id": getSessionId(),
      },
      body: JSON.stringify({ ...body, projectId: PROJECT_ID }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Analytics should never break the app
  }
}

// ─── Public API ────────────────────────────────────────────────

const SessionService = {
  /**
   * Initialize session tracking. Call once on app mount.
   * Returns whether this is a new or returning session.
   */
  init() {
    const isNew = !isReturningSession();
    const sessionId = getSessionId();
    const visitorId = getVisitorId();
    return { isNew, sessionId, visitorId };
  },

  /**
   * Send a session heartbeat (call on interval, e.g. every 5s).
   */
  heartbeat(duration, width, height) {
    send("/sessions", {
      sessionId: getSessionId(),
      visitorId: getVisitorId(),
      duration,
      width,
      height,
      referrer: document.referrer || null,
      utm: extractUtmParams(),
    });
  },

  /**
   * Record a page view.
   */
  pageView(url, title, referrer) {
    send("/pageviews", {
      sessionId: getSessionId(),
      visitorId: getVisitorId(),
      url,
      title,
      referrer: referrer || null,
    });
  },

  /**
   * Record a custom interaction event.
   */
  event(category, action, label, value) {
    send("/events", {
      sessionId: getSessionId(),
      visitorId: getVisitorId(),
      category,
      action,
      label: label || null,
      value: value || null,
    });
  },
};

export default SessionService;
