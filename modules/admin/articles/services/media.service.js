import Uploads from "@/lib/upload/uploads";

export async function uploadMedia(file) {
  if (!file || file.size === 0) {
    throw new Error("No file provided");
  }

  const arrayBuffer = await file.arrayBuffer();

  if (!arrayBuffer) {
    throw new Error("Failed to read file buffer");
  }

  const buffer = Buffer.from(arrayBuffer);

  const upload = new Uploads();

  return upload.handleUpload({
    originalFilename: file.name,
    mimetype: file.type,
    size: file.size,
    buffer,
  });
}