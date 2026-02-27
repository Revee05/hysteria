import { NextResponse } from "next/server";
import Uploads from "../../../../../lib/upload/uploads";
import sharp from "sharp";

export const runtime = "nodejs";

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_SIZE = 3 * 1024 * 1024; // 3MB
const REQUIRED_RATIO = 4 / 5; // 0.8
const RATIO_TOLERANCE = 0.01;

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        { message: "Poster wajib diupload" },
        { status: 400 }
      );
    }

    // ===== MIME =====
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { message: "Format file harus JPG, PNG, atau WEBP" },
        { status: 400 }
      );
    }

    // ===== SIZE =====
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { message: "Ukuran maksimal poster 3 MB" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const image = sharp(buffer);
    const meta = await image.metadata();

    if (!meta.width || !meta.height) {
      return NextResponse.json(
        { message: "Gagal membaca dimensi gambar" },
        { status: 400 }
      );
    }

    let outputBuffer = buffer;
    let cropped = false;

    const ratio = meta.width / meta.height;

    // ===== AUTO CROP JIKA RATIO BEDA =====
    if (Math.abs(ratio - REQUIRED_RATIO) > RATIO_TOLERANCE) {
      cropped = true;

      let cropWidth = meta.width;
      let cropHeight = Math.round(meta.width / REQUIRED_RATIO);

      if (cropHeight > meta.height) {
        cropHeight = meta.height;
        cropWidth = Math.round(meta.height * REQUIRED_RATIO);
      }

      const left = Math.floor((meta.width - cropWidth) / 2);
      const top = Math.floor((meta.height - cropHeight) / 2);

      outputBuffer = await image
        .extract({ left, top, width: cropWidth, height: cropHeight })
        .toBuffer();
    }

    // ===== UPLOAD =====
    const uploader = new Uploads();
    const result = await uploader.handleUpload({
      buffer: outputBuffer,
      originalFilename: file.name,
      mimetype: file.type,
      size: outputBuffer.length,
    });

    return NextResponse.json({
      url: result.url,
      path: result.path,
      cropped,
      message: cropped
        ? "Gambar otomatis dipotong ke rasio 4:5 (800 × 1000 px)"
        : "Gambar sesuai rasio 4:5",
      metadata: {
        original: {
          width: meta.width,
          height: meta.height,
        },
        finalRatio: "4:5",
        size: outputBuffer.length,
      },
    });
  } catch (err) {
    console.error("UPLOAD POSTER ERROR:", err);
    return NextResponse.json(
      { message: "Server error saat upload poster" },
      { status: 500 }
    );
  }
}