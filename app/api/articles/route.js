import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const sort = searchParams.get("sort");

    // ================= SORTING LOGIC =================
    let orderBy = { createdAt: "desc" }; // default: terbaru

    if (sort === "oldest") {
      orderBy = { createdAt: "asc" };
    }

    if (sort === "az") {
      orderBy = { title: "asc" };
    }

    if (sort === "za") {
      orderBy = { title: "desc" };
    }

    // ================= QUERY =================
    const articles = await prisma.article.findMany({
      where: {
        isDeleted: false,
        status: "PUBLISHED",

        ...(search && {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { authorName: { contains: search, mode: "insensitive" } },
          ],
        }),

        ...(category &&
          category !== "all" && {
            categories: {
              some: {
                category: {
                  title: category, // kalau mau lebih stabil bisa pakai slug
                },
              },
            },
          }),
      },

      include: {
        categories: {
          include: {
            category: true,
          },
        },
      },

      orderBy,
    });

    return NextResponse.json({ data: articles });
  } catch (error) {
    console.error("API ERROR:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
