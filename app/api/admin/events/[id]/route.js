import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

/* =========================
   GET EVENT BY ID
========================= */
export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const eventId = Number(id);

    if (isNaN(eventId)) {
      return NextResponse.json(
        { message: "Invalid event ID" },
        { status: 400 }
      );
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json(
        { message: "Event tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error("GET EVENT ERROR:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/* =========================
   UPDATE EVENT
========================= */
export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const eventId = Number(id);
    const body = await req.json();

    if (isNaN(eventId)) {
      return NextResponse.json(
        { message: "Invalid event ID" },
        { status: 400 }
      );
    }

    const data = {
      title: body.title,
      description: body.description,
      organizer: body.organizer,
      categoryItemId: body.categoryItemId
        ? Number(body.categoryItemId)
        : undefined,
      location: body.location,
      registerLink: body.registerLink,
      mapsEmbedSrc: body.mapsEmbedSrc,
      poster: body.poster || null,
      driveLink: body.driveLink ?? null,
      youtubeLink: body.youtubeLink ?? null,
      isPublished:
        typeof body.isPublished === "boolean"
          ? body.isPublished
          : undefined,
    };

    // START & END (SENSITIF JAM)
    if (body.startDate && body.startTime) {
      data.startAt = new Date(`${body.startDate}T${body.startTime}`);
    } else if (body.startAt) {
      data.startAt = new Date(body.startAt);
    }

    if (body.endDate && body.endTime) {
      data.endAt = new Date(`${body.endDate}T${body.endTime}`);
    } else if (body.endAt) {
      data.endAt = new Date(body.endAt);
    }

    const event = await prisma.event.update({
      where: { id: eventId },
      data,
    });
    
    return NextResponse.json(event);
  } catch (error) {
    console.error("UPDATE EVENT ERROR:", error);
    return NextResponse.json(
      { message: "Gagal mengupdate event" },
      { status: 500 }
    );
  }
}

/* =========================
   DELETE EVENT
========================= */
export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    const eventId = Number(id);

    if (isNaN(eventId)) {
      return NextResponse.json(
        { message: "Invalid event ID" },
        { status: 400 }
      );
    }

    await prisma.event.delete({
      where: { id: eventId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE EVENT ERROR:", error);
    return NextResponse.json(
      { message: "Gagal menghapus event" },
      { status: 500 }
    );
  }
}
