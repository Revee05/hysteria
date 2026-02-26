import { NextResponse } from "next/server";
import {
  getArticleById,
  updateArticleService,
  deleteArticleService,
} from "@/modules/admin/articles/services/article.service.js";

function extractId(request) {
  const { pathname } = request.nextUrl;
  return Number(pathname.split("/").pop());
}

// ======================
// GET
// ======================
export async function GET(request) {
  try {
    const id = extractId(request);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid ID" },
        { status: 400 }
      );
    }

    const article = await getArticleById(id);

    if (!article) {
      return NextResponse.json(
        { success: false, error: "Artikel tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: article });
  } catch (error) {
    console.error("GET ERROR:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// ======================
// PUT
// ======================
export async function PUT(request) {
  try {
    const id = extractId(request);
    const formData = await request.formData();

    const payload = {
      title: formData.get("title"),
      slug: formData.get("slug"),
      content: JSON.parse(formData.get("content")),
      excerpt: formData.get("excerpt"),
      categoryIds: JSON.parse(formData.get("categoryIds")),
      authorName: formData.get("authorName"),
      editorName: formData.get("editorName") || null,
      status: formData.get("status"),
      publishedAt: formData.get("publishedAt")
        ? new Date(formData.get("publishedAt"))
        : null,
      tagNames: JSON.parse(formData.get("tagNames") || "[]"),
    };

    const updated = await updateArticleService(id, payload);

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("UPDATE ERROR:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

// ======================
// DELETE
// ======================
export async function DELETE(request) {
  try {
    const id = extractId(request);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid ID" },
        { status: 400 }
      );
    }

    await deleteArticleService(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE ERROR:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
