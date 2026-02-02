import fs from "fs";
import path from "path";
import { promisify } from "util";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";
import mime from "mime-types";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const exists = (p) => fs.existsSync(p);

function ensureDirSync(dir) {
  if (!exists(dir)) fs.mkdirSync(dir, { recursive: true });
}

function monthPath() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${yyyy}/${mm}/`;
}

function genFileName(originalName, extOverride = "") {
  const ext = extOverride || path.extname(originalName) || `.${mime.extension(mime.lookup(originalName) || "bin")}`;
  return `${Date.now()}_${uuidv4()}${ext.startsWith(".") ? ext : "." + ext}`;
}

function createS3Client() {
  return new S3Client({
    region: process.env.S3_REGION,
    endpoint: process.env.S3_ENDPOINT || undefined,
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true" || undefined,
    credentials:
      process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
        ? {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          }
        : undefined,
  });
}

async function uploadToS3(buffer, key, contentType) {
  const Bucket = process.env.S3_BUCKET;
  if (!Bucket) throw new Error("S3_BUCKET not configured");

  const client = createS3Client();
  const cmd = new PutObjectCommand({
    Bucket,
    Key: key,
    Body: buffer,
    ContentType: contentType || "application/octet-stream",
  });

  await client.send(cmd);

  if (process.env.S3_PUBLIC_URL) {
    return `${process.env.S3_PUBLIC_URL.replace(/\/$/, "")}/${key}`;
  }
  return `https://${Bucket}.s3.${process.env.S3_REGION}.amazonaws.com/${key}`;
}

async function deleteFromS3(key) {
  const Bucket = process.env.S3_BUCKET;
  if (!Bucket) throw new Error("S3_BUCKET not configured");

  const client = createS3Client();
  const cmd = new DeleteObjectCommand({ Bucket, Key: key });
  await client.send(cmd);
}

/**
 * Uploads class untuk handle file uploads
 * Mendukung local storage dan S3
 */
export default class Uploads {
  constructor() {
    this.uploadPath = monthPath(); // 'YYYY/MM/'
    this.localBase = process.env.UPLOAD_LOCAL_PATH || path.join(process.cwd(), "public", "uploads");
    // Determine storage: explicit env `UPLOAD_STORAGE` wins, otherwise use S3 when S3_BUCKET available
    this.storage = (process.env.UPLOAD_STORAGE || (process.env.S3_BUCKET ? "s3" : "local")).toLowerCase();
    this.useS3 = this.storage === "s3" && !!process.env.S3_BUCKET;
    if (this.storage === "s3" && !this.useS3) {
      // requested s3 but missing config, fallback to local
      console.warn("UPLOADS: UPLOAD_STORAGE=s3 requested but S3_BUCKET missing — falling back to local storage.");
      this.storage = "local";
      this.useS3 = false;
    }

    // Ensure local dir exists
    if (!exists(this.localBase)) {
      ensureDirSync(this.localBase);
    }

    const fullDir = path.join(this.localBase, this.uploadPath);
    ensureDirSync(fullDir);
  }

  /**
   * Handle regular file upload (with image optimization)
   *
   * @param {Object} file - File object from formidable { filepath, originalFilename, mimetype, size }
   * @returns {Promise<{url: string, path: string, metadata: Object}>}
   */
  async handleUpload(file) {
    const quality = parseInt(process.env.UPLOAD_QUALITY || "80", 10);
    const originalName = file.originalFilename || file.name || "file";
    const ext = path.extname(originalName).toLowerCase();
    const filename = genFileName(originalName);
    const relativePath = `uploads/${this.uploadPath}${filename}`;

    // Read file buffer
    const inputBuffer = file.filepath ? await readFile(file.filepath) : file.buffer;

    // Extract metadata
    const metadata = {
      originalName,
      mimeType: file.mimetype || mime.lookup(filename) || "application/octet-stream",
      size: file.size || inputBuffer.length,
    };

    let processedBuffer = inputBuffer;

    // Process image files with sharp
    if (metadata.mimeType.startsWith("image/")) {
      try {
        const image = sharp(inputBuffer).rotate(); // auto-rotate based on EXIF
        const meta = await image.metadata();

        metadata.width = meta.width;
        metadata.height = meta.height;

        // Convert and optimize
        const format = ext.replace(".", "") === "jpg" ? "jpeg" : ext.replace(".", "");
        processedBuffer = await image.toFormat(format, { quality }).toBuffer();
      } catch (err) {
        console.error("Error processing image:", err);
        // If sharp fails, use original buffer
      }
    }

    // Upload to S3 or save locally
    if (this.useS3) {
      const key = relativePath;
      const url = await uploadToS3(processedBuffer, key, metadata.mimeType);
      return { url, path: key, metadata };
    } else {
      const outPath = path.join(this.localBase, this.uploadPath, filename);
      await writeFile(outPath, processedBuffer);
      return { url: `/${relativePath}`, path: relativePath, metadata };
    }
  }

  /**
   * Handle product image upload (resize to square with white background)
   *
   * @param {Object} file - File object from formidable
   * @param {string} extension - Optional extension override
   * @returns {Promise<{url: string, path: string, metadata: Object}>}
   */
  async handleUploadProduct(file, extension = "") {
    const dimension = parseInt(process.env.UPLOAD_PRODUCT_DIMENSION || "500", 10);
    const quality = parseInt(process.env.UPLOAD_QUALITY || "80", 10);
    const originalName = file.originalFilename || file.name || "file";
    const ext = extension || path.extname(originalName).toLowerCase();
    const filename = genFileName(originalName, ext);
    const relativePath = `uploads/${this.uploadPath}${filename}`;

    // Read file buffer
    const inputBuffer = file.filepath ? await readFile(file.filepath) : file.buffer;

    const metadata = {
      originalName,
      mimeType: file.mimetype || mime.lookup(filename) || "application/octet-stream",
      size: file.size || inputBuffer.length,
      width: dimension,
      height: dimension,
    };

    // Process with sharp: resize to fit dimension x dimension with white background
    const processedBuffer = await sharp(inputBuffer)
      .rotate()
      .resize(dimension, dimension, {
        fit: "contain",
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      })
      .toFormat(ext.replace(".", "") === "jpg" ? "jpeg" : ext.replace(".", ""), { quality })
      .toBuffer();

    // Upload to S3 or save locally
    if (this.useS3) {
      const key = relativePath;
      const url = await uploadToS3(processedBuffer, key, metadata.mimeType);
      return { url, path: key, metadata };
    } else {
      const outPath = path.join(this.localBase, this.uploadPath, filename);
      await writeFile(outPath, processedBuffer);
      return { url: `/${relativePath}`, path: relativePath, metadata };
    }
  }

  /**
   * Get metadata dari file yang sudah di-upload (untuk video)
   * Note: untuk video metadata lengkap, gunakan ffprobe
   *
   * @param {Object} file - File object
   * @returns {Object} metadata
   */
  getFileMetadata(file) {
    return {
      originalName: file.originalFilename || file.name,
      mimeType: file.mimetype || mime.lookup(file.originalFilename || file.name),
      size: file.size,
    };
  }

  /**
   * Delete a file from storage (local or S3).
   * Accepts either a public URL, a key like 'uploads/YYYY/MM/filename', or a local path.
   * Returns true if deletion was attempted (may throw on S3 errors).
   */
  async deleteFile(source) {
    if (!source) return false;
    const normalizedSource = String(source).replace(/\\/g, "/");

    // If source is a full URL that contains S3_PUBLIC_URL, extract key
    if (this.useS3) {
      let key = normalizedSource;
      if (process.env.S3_PUBLIC_URL && normalizedSource.startsWith(process.env.S3_PUBLIC_URL)) {
        key = normalizedSource.replace(process.env.S3_PUBLIC_URL.replace(/\/$/, "") + "/", "");
      } else {
        // If it's a full S3 URL like https://bucket.s3.region.amazonaws.com/key
        const s3Match = normalizedSource.match(/https?:\/\/[^/]+\/(.+)$/);
        if (s3Match) key = s3Match[1];
      }

      await deleteFromS3(key);
      return true;
    }

    // Local delete: accept '/uploads/..' or 'uploads/..' or full path
    let relative = normalizedSource;
    if (relative.startsWith("/")) relative = relative.slice(1);
    if (relative.startsWith("public/uploads/")) relative = relative.replace(/^public\//, "");
    if (relative.startsWith("uploads/")) {
      const localPath = path.join(this.localBase, relative.replace(/^uploads\//, ""));
      if (exists(localPath)) {
        await fs.promises.unlink(localPath);
        return true;
      }
      // try if source is already full local path
      if (exists(source)) {
        await fs.promises.unlink(source);
        return true;
      }
      if (normalizedSource !== source && exists(normalizedSource)) {
        await fs.promises.unlink(normalizedSource);
        return true;
      }
      return false;
    }

    // If it's a full filesystem path
    if (exists(source)) {
      await fs.promises.unlink(source);
      return true;
    }
    if (normalizedSource !== source && exists(normalizedSource)) {
      await fs.promises.unlink(normalizedSource);
      return true;
    }

    return false;
  }
}
