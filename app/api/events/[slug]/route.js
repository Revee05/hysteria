import { NextResponse } from "next/server";
import {
  getEventDetail,
  getOtherEvents,
} from "../../../../modules/public/events/services/event.service";

export async function GET(req, { params }) {
  try {
    const { slug } = params;

    const event = await getEventDetail(slug);
    const otherEvents = await getOtherEvents(slug);

    return NextResponse.json({
      event,
      otherEvents,
    });
  } catch (err) {
    return NextResponse.json(
      { message: err.message },
      { status: 404 }
    );
  }
}