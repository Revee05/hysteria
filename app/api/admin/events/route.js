import {
  getEvents,
  createEvent
} from "@/modules/admin/events";

export async function GET() {
  const events = await getEvents();
  return Response.json(events);
}

export async function POST(req) {
  const body = await req.json();

  const event = await createEvent(body);

  return Response.json(event, { status: 201 });
}