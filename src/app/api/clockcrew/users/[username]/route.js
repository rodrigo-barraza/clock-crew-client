// ============================================================
// Clock Crew — Composite Member Profile API Proxy
// ============================================================
// Fetches and merges data from multiple clockcrew-api endpoints:
//   1. CC forum user profile  → /clockcrew/users/by-name/:username
//   2. Recent forum posts     → /clockcrew/posts/by-author/:author
//   3. Newgrounds profile     → /newgrounds/profiles/:username (via UserProfileLink)
// Returns a unified member object for the profile page.
// ============================================================

const CLOCK_CREW_SERVICE_URL = process.env.CLOCK_CREW_SERVICE_URL || "http://192.168.86.2:5593";

/**
 * Safe fetch helper — returns null on failure instead of throwing.
 */
async function safeFetch(url) {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function GET(_request, { params }) {
  const { username } = await params;

  if (!username) {
    return Response.json({ error: "Username is required" }, { status: 400 });
  }

  try {
    // 1. Fetch the CC forum user profile
    const ccUser = await safeFetch(
      `${CLOCK_CREW_SERVICE_URL}/clockcrew/users/by-name/${encodeURIComponent(username)}`,
    );

    if (!ccUser) {
      return Response.json({ error: "Member not found" }, { status: 404 });
    }

    // 2. Fetch recent forum posts (fire-and-forget style — non-blocking)
    const postsPromise = safeFetch(
      `${CLOCK_CREW_SERVICE_URL}/clockcrew/posts/by-author/${encodeURIComponent(username)}?limit=20`,
    );

    // 3. Try to find a linked Newgrounds profile
    let ngProfile = null;
    try {
      // The profile link collection maps ccUsername → ngUsernameLower
      // For now, try matching by the same username (most CC members used the same name on NG)
      const ngRes = await safeFetch(
        `${CLOCK_CREW_SERVICE_URL}/newgrounds/profiles/${encodeURIComponent(username)}`,
      );
      if (ngRes && ngRes.username) {
        ngProfile = ngRes;
      }
    } catch {
      // No linked profile — that's fine
    }

    const postsData = await postsPromise;

    return Response.json({
      member: {
        // CC forum identity
        username: ccUser.username,
        userId: ccUser.userId,
        postCount: ccUser.postCount,
        dateRegistered: ccUser.dateRegistered,
        avatarUrl: ccUser.avatarUrl || null,
        signatureHtml: ccUser.signatureHtml || null,
        customTitle: ccUser.customTitle || null,
        location: ccUser.location || null,
        group: ccUser.group || null,
        gender: ccUser.gender || null,
        website: ccUser.website || null,
        lastActive: ccUser.lastActive || null,

        // Linked Newgrounds profile (if any)
        newgrounds: ngProfile
          ? {
              username: ngProfile.username,
              avatarUrl: ngProfile.avatarUrl || null,
              description: ngProfile.description || null,
              fans: ngProfile.fans?.count || 0,
              joinDate: ngProfile.joinDate || null,
              location: ngProfile.location || null,
              job: ngProfile.job || null,
              social: ngProfile.social || null,
            }
          : null,

        // Recent forum posts
        recentPosts: postsData?.posts || [],
      },
    });
  } catch (error) {
    console.error("[clockcrew/users/:username] Error:", error.message);
    return Response.json(
      { error: "Service unavailable" },
      { status: 503 },
    );
  }
}
