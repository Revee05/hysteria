import { getEvents } from "../../../modules/public/events/services/event.service";

export async function GET(req) {
  const { searchParams } = new URL(req.url);

  const q = searchParams.get("q") || "";
  const status = searchParams.get("status") || "all";
  const sort = searchParams.get("sort") || "latest";

  const events = await getEvents({ q, status, sort });

  return Response.json(events);
}