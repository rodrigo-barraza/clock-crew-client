// Clock Crew — Clock profiles browse → clock-crew-service /newgrounds/portal/clocks

import { proxyService } from "@/lib/clockCrewService";

export function GET(request: Request) {
  return proxyService(request, "/newgrounds/portal/clocks", {
    allowedParams: ["q", "sort", "limit", "skip", "year"],
    defaults: { limit: "60" },
  });
}
