// Clock Crew — Newgrounds portal browse → clock-crew-service /newgrounds/portal

import { proxyService } from "@/lib/clockCrewService";

export function GET(request: Request) {
  return proxyService(request, "/newgrounds/portal", {
    allowedParams: ["q", "username", "type", "sort", "limit", "skip", "year"],
    defaults: { limit: "60" },
  });
}
