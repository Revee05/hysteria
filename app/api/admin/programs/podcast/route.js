import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma"; // Mundurnya nambah satu level (../../../../../)

// ==========================================
// METHOD GET: Mengambil data link podcast saat ini
// ==========================================
export async function GET() {
  try {
    const podcastData = await prisma.podcast.findFirst();
    return NextResponse.json(podcastData || {}, { status: 200 });
  } catch (error) {
    console.error("GET Podcast Error:", error);
    return NextResponse.json({ message: "Gagal mengambil data podcast" }, { status: 500 });
  }
}

// ==========================================
// METHOD POST: Menyimpan / Mengupdate link
// ==========================================
export async function POST(req) {
  try {
    const body = await req.json();
    const { astonLink, soreDiStonenLink } = body;

    const existingData = await prisma.podcast.findFirst();

    let savedPodcast;

    if (existingData) {
      savedPodcast = await prisma.podcast.update({
        where: { id: existingData.id },
        data: {
          astonLink: astonLink,
          soreDiStonenLink: soreDiStonenLink,
        },
      });
    } else {
      savedPodcast = await prisma.podcast.create({
        data: {
          astonLink: astonLink,
          soreDiStonenLink: soreDiStonenLink,
        },
      });
    }

    return NextResponse.json(savedPodcast, { status: 200 });
  } catch (error) {
    console.error("POST Podcast Error:", error);
    return NextResponse.json({ message: "Gagal menyimpan link podcast" }, { status: 500 });
  }
}