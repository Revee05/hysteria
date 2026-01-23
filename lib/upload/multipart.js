import { IncomingForm } from "formidable";
import { Readable } from "stream";

/**
 * Parse multipart/form-data request di Next.js App Router
 * 
 * @param {Request} request - Next.js Request object
 * @param {Object} options - Formidable options
 * @returns {Promise<{fields: Object, files: Array}>}
 */
export async function parseMultipartForm(request, options = {}) {
  // Convert Web API Request to Node.js readable stream
  const chunks = [];
  const reader = request.body?.getReader();
  
  if (!reader) {
    throw new Error("Request body is not readable");
  }

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  const buffer = Buffer.concat(chunks.map(chunk => Buffer.from(chunk)));
  const stream = Readable.from(buffer);

  // Prepare headers for formidable
  const headers = {};
  request.headers.forEach((value, key) => {
    headers[key.toLowerCase()] = value;
  });

  // Create formidable instance with options
  // Build options carefully to avoid passing non-function `filter`
  const formOptions = {
    maxFileSize: options.maxFileSize || 10 * 1024 * 1024, // 10MB default
    allowEmptyFiles: false,
    keepExtensions: true,
    multiples: options.multiples !== false,
    ...options,
  };

  if (formOptions.filter && typeof formOptions.filter !== "function") {
    // some callers or accidental spreads may set filter to a non-function
    // formidable expects a function here — remove it to avoid runtime error
    delete formOptions.filter;
  }

  const form = new IncomingForm(formOptions);

  return new Promise((resolve, reject) => {
    // Create a fake IncomingMessage-like object
    // Create a fake IncomingMessage-like object expected by formidable
    const req = Object.assign(stream, {
      headers,
      method: request.method || "POST",
      url: request.url || undefined,
    });

    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err);
        return;
      }

      // Normalize fields (formidable returns arrays)
      const normalizedFields = {};
      for (const [key, value] of Object.entries(fields)) {
        normalizedFields[key] = Array.isArray(value) && value.length === 1 ? value[0] : value;
      }

      // Normalize files to array
      const fileArray = [];
      for (const [fieldName, fileData] of Object.entries(files)) {
        const fileList = Array.isArray(fileData) ? fileData : [fileData];
        fileList.forEach(file => {
          fileArray.push({
            fieldname: fieldName,
            originalFilename: file.originalFilename,
            filepath: file.filepath,
            mimetype: file.mimetype,
            size: file.size,
            newFilename: file.newFilename,
          });
        });
      }

      resolve({
        fields: normalizedFields,
        files: fileArray,
      });
    });
  });
}

/**
 * Validate file mime type
 * 
 * @param {Object} file - File object from formidable
 * @param {Array<string>} allowedTypes - Allowed MIME types (e.g., ['image/*', 'video/mp4'])
 * @returns {boolean}
 */
export function validateFileMimeType(file, allowedTypes = []) {
  if (!allowedTypes.length) return true;
  
  const mime = file.mimetype || "";
  
  return allowedTypes.some(allowed => {
    if (allowed.endsWith("/*")) {
      const prefix = allowed.replace("/*", "");
      return mime.startsWith(prefix);
    }
    return allowed === mime;
  });
}

/**
 * Validate file size
 * 
 * @param {Object} file - File object from formidable
 * @param {number} maxSize - Max size in bytes
 * @returns {boolean}
 */
export function validateFileSize(file, maxSize) {
  return file.size <= maxSize;
}
