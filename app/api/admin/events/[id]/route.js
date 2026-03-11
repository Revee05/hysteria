import {
  getEventById,
  updateEvent,
  deleteEvent
} from "@/modules/admin/events";

/* ================= GET ================= */

export async function GET(req, { params }) {
  const { id } = await params;
  const eventId = Number(id);

  if (isNaN(eventId)) {
    return Response.json(
      { message: "Invalid event ID" },
      { status: 400 }
    );
  }

  const event = await getEventById(eventId);

  if (!event) {
    return Response.json(
      { message: "Event tidak ditemukan" },
      { status: 404 }
    );
  }

  return Response.json(event);
}

/* ================= PUT ================= */

export async function PUT(req, { params }) {
  const { id } = await params;
  const eventId = Number(id);

  if (isNaN(eventId)) {
    return Response.json(
      { message: "Invalid event ID" },
      { status: 400 }
    );
  }

  const body = await req.json();

  const event = await updateEvent(eventId, body);

  return Response.json(event);
}

/* ================= DELETE ================= */

export async function DELETE(req, { params }) {
  const { id } = await params;
  const eventId = Number(id);

  if (isNaN(eventId)) {
    return Response.json(
      { message: "Invalid event ID" },
      { status: 400 }
    );
  }

  await deleteEvent(eventId);

  return Response.json({ success: true });
}