import { NextResponse } from "next/server";
import { parseMultipartForm } from "@/lib/upload/multipart";
import { validateFileMimeType } from "@/lib/upload/multipart";

import {
  getArticles,
  createArticleService,
} from "@/modules/admin/articles/services/article.service.js";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const data = await getArticles({ status });

  return NextResponse.json({ success: true, data });
}

export async function POST(req) {
  try {
    const { fields, files } = await parseMultipartForm(req);

    const featured = files.find((f) => f.fieldname === "featuredImage");

    if (featured && !validateFileMimeType(featured, ["image/*"])) {
      return NextResponse.json(
        { success: false, error: "Invalid file type" },
        { status: 400 },
      );
    }

    const payload = {
      title: fields.title,
      slug: fields.slug,
      content: JSON.parse(fields.content),
      excerpt: fields.excerpt || null,

      categoryIds: JSON.parse(fields.categoryIds),
      authorName: fields.authorName,
      editorName: fields.editorName || null,
      
      status: fields.status || "DRAFT",

      publishedAt: fields.publishedAt ? new Date(fields.publishedAt) : null,

      tagNames: fields.tagNames ? JSON.parse(fields.tagNames) : [],
    };

    const article = await createArticleService(payload, featured);

    return NextResponse.json({ success: true, data: article });
  } catch (error) {
    console.error("CREATE ARTICLE ERROR:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 },
    );
  }
}

// export async function POST(req) {
//   try {
//     const formData = await req.formData();

//     const file = formData.get("featuredImage");
//     let imageUrl = null;

//     if (file && typeof file === "object" && file.size > 0) {
//       const bytes = await file.arrayBuffer();
//       const buffer = Buffer.from(bytes);

//       const uploadDir = path.join(process.cwd(), "public/uploads");
//       await mkdir(uploadDir, { recursive: true });

//       const fileName = `${Date.now()}-${file.name}`;
//       const filePath = path.join(uploadDir, fileName);

//       await writeFile(filePath, buffer);

//       imageUrl = `/uploads/${fileName}`;
//     }

//     const payload = {
//       title: formData.get("title"),
//       slug: formData.get("slug"),
//       content: JSON.parse(formData.get("content")),
//       excerpt: formData.get("excerpt") || null,
//       featuredImage: imageUrl,
//       categoryId: Number(formData.get("categoryId")),
//       authorId: Number(formData.get("authorId")),
//       status: formData.get("status") || "DRAFT",

//       publishedAt:
//         formData.get("publishedAt") && formData.get("publishedAt") !== ""
//           ? new Date(formData.get("publishedAt"))
//           : null,

//       tagNames: formData.get("tagNames")
//         ? JSON.parse(formData.get("tagNames"))
//         : [],
//     };

//     console.log("PAYLOAD:", payload);

//     const article = await createArticleService(payload);

//     return NextResponse.json({
//       success: true,
//       data: article,
//     });
//   } catch (error) {
//     console.error("CREATE ARTICLE ERROR:", error);

//     return NextResponse.json(
//       { success: false, error: error.message },
//       { status: 400 },
//     );
//   }
// }
