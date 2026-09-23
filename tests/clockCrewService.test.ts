import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  fetchServiceOrNull,
  proxyService,
  ServiceError,
} from "@/lib/clockCrewService";

beforeEach(() => {
  vi.stubEnv("CLOCK_CREW_SERVICE_URL", "http://service.test");
});

describe("proxyService", () => {
  it("forwards only the allowed parameters, with defaults", async () => {
    const fetchMock = vi.fn(async () => Response.json({ items: [] }));
    vi.stubGlobal("fetch", fetchMock);

    const response = await proxyService(
      new Request("http://site.test/api?q=clock&evil=1&year=2004"),
      "/newgrounds/portal",
      {
        allowedParams: ["q", "year"],
        defaults: { limit: "60" },
      },
    );

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledWith(
      "http://service.test/newgrounds/portal?limit=60&q=clock&year=2004",
      { cache: "no-store" },
    );
  });

  it("relays the service's status and message", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json(
          { error: true, message: "Profile not found" },
          { status: 404 },
        ),
      ),
    );
    const response = await proxyService(
      new Request("http://site.test/api"),
      "/newgrounds/portal/nobody/card",
    );
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "Profile not found" });
  });

  it("is a 503 when the service cannot be reached", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Promise.reject(new TypeError("fetch failed"))),
    );
    const response = await proxyService(
      new Request("http://site.test/api"),
      "/newgrounds/portal",
    );
    expect(response.status).toBe(503);
  });
});

describe("fetchServiceOrNull", () => {
  it("answers null for a 404 and throws anything else", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("{}", { status: 404 })),
    );
    expect(await fetchServiceOrNull("/clockcrew/members/nobody")).toBeNull();

    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("{}", { status: 500 })),
    );
    await expect(
      fetchServiceOrNull("/clockcrew/members/x"),
    ).rejects.toBeInstanceOf(ServiceError);
  });
});
