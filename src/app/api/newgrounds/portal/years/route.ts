// Clock Crew — portal year menus → clock-crew-service /newgrounds/portal/years

import { proxyService } from "@/lib/clockCrewService";

export function GET(request: Request) {
  return proxyService(request, "/newgrounds/portal/years", { revalidate: 600 });
}
