import { NextResponse } from "next/server";
import Uploads from "@/lib/upload/uploads";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        { message: "No file uploaded" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const upload = new Uploads();

    const result = await upload.handleUpload({
      originalFilename: file.name,
      mimetype: file.type,
      size: file.size,
      buffer,
    });

    return NextResponse.json({
      url: result.url,
    });
  } catch (error) {
    console.error("Editor upload error:", error);
    return NextResponse.json(
      { message: "Upload failed" },
      { status: 500 }
    );
  }
}
