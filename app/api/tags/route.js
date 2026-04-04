import { prisma } from "@/lib/prisma";

export async function GET() {
  const tags = await prisma.tag.findMany({
    select: {
      name: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return Response.json({
    data: tags,
  });
}