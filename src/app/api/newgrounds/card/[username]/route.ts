// Clock Crew — Newgrounds profile card → clock-crew-service /newgrounds/portal/:username/card

import { proxyService } from "@/lib/clockCrewService";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  const { username } = await params;
  return proxyService(
    request,
    `/newgrounds/portal/${encodeURIComponent(username)}/card`,
    { revalidate: 600 },
  );
}
