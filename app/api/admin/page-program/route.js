// app/api/admin/page-program/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const settings = await prisma.pageProgram.findUnique({
      where: { pageSlug: "program" },
    });

    if (!settings) {
      return NextResponse.json({ mainHero: {}, covers: {}, slugHeros: {} }, { status: 200 });
    }

    return NextResponse.json(settings, { status: 200 });
  } catch (error) {
    console.error("GET Page Program Error:", error);
    return NextResponse.json({ message: "Gagal mengambil data pengaturan" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { mainHero, covers, slugHeros } = body;

    const savedSettings = await prisma.pageProgram.upsert({
      where: { pageSlug: "program" },
      update: {
        mainHero: mainHero !== undefined ? mainHero : undefined,
        covers: covers !== undefined ? covers : undefined,
        slugHeros: slugHeros !== undefined ? slugHeros : undefined,
      },
      create: {
        pageSlug: "program",
        mainHero: mainHero || {},
        covers: covers || {},
        slugHeros: slugHeros || {},
      },
    });

    return NextResponse.json(savedSettings, { status: 200 });
  } catch (error) {
    console.error("POST Page Program Error:", error);
    return NextResponse.json({ message: "Gagal menyimpan pengaturan" }, { status: 500 });
  }
}