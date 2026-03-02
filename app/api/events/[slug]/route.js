import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET(req, { params }) {
  const { slug } = await params;

  const event = await prisma.event.findFirst({
    where: {
      slug,
      isPublished: true,
    },
    include: {
      eventCategories: {
        include: {
          categoryItem: {
            include: {
              category: true,
            },
          },
        },
      },
      organizers: {
        include: {
          categoryItem: {
            select: {
              title: true,
            },
          },
        },
      },
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });

  if (!event) {
    return NextResponse.json(
      { message: "Event not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(event);
}
