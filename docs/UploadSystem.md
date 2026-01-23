# Upload System Documentation

## Overview
Sistem upload yang dapat digunakan untuk semua CRUD yang membutuhkan file upload. Mendukung local storage dan S3.

## File Structure

```
lib/
├── multipart.js          # Helper parsing multipart/form-data untuk Next.js App Router
├── uploads.js            # Uploads class untuk handle storage (local/S3)
└── upload.js             # (optional) Helper functions tambahan

middleware/
└── upload.middleware.js  # Edge middleware untuk pre-validation

app/api/admin/hero/upload/
└── route.js              # Contoh endpoint upload
```

## Environment Variables

```env
# Storage configuration
UPLOAD_STORAGE=local                    # 'local' or 's3'
UPLOAD_LOCAL_PATH=./public/uploads      # Path untuk local storage
UPLOAD_PUBLIC_BASE=/uploads             # Base URL untuk public access

# Upload limits
UPLOAD_MAX_SIZE=10485760                # Max file size in bytes (10MB)
UPLOAD_ALLOWED_TYPES=image/*,video/*    # Allowed MIME types
UPLOAD_QUALITY=80                       # Image quality (1-100)
UPLOAD_PRODUCT_DIMENSION=500            # Product image dimension

# S3 Configuration (production)
S3_BUCKET=your-bucket-name
S3_REGION=us-east-1
S3_ENDPOINT=                            # Optional (for MinIO/DigitalOcean Spaces)
S3_FORCE_PATH_STYLE=false               # Optional
S3_PUBLIC_URL=https://cdn.yourdomain.com
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
```

## Usage Examples

### 1. Upload Terintegrasi dengan CRUD (Recommended)

```javascript
// app/api/admin/hero/route.js
import { parseMultipartForm, validateFileMimeType } from "../../../../lib/upload/multipart";
import Uploads from "../../../../lib/upload/uploads";
import * as heroService from "../../../../modules/hero/services/hero.service.js";

export async function POST(request) {
  const contentType = request.headers.get("content-type") || "";
  let body = {};
  let sourceUrl = null;

  // Support both JSON and multipart
  if (contentType.includes("multipart/form-data")) {
    const { fields, files } = await parseMultipartForm(request);
    body = fields;

    // Upload file jika ada
    if (files && files.length > 0) {
      if (!validateFileMimeType(files[0], ["image/*", "video/*"])) {
        return NextResponse.json({ error: "Invalid file type" }, { status: 415 });
      }

      const uploads = new Uploads();
      const result = await uploads.handleUpload(files[0]);
      sourceUrl = result.url;
    }

    // Convert string boolean
    if (body.isActive) body.isActive = body.isActive === "true";
  } else {
    body = await request.json();
  }

  // Use uploaded URL atau URL yang diberikan
  if (sourceUrl) body.source = sourceUrl;

  const hero = await heroService.createHero(body);
  return NextResponse.json({ success: true, data: hero });
}
```

### 2. Product Upload (Square with White Background)

```javascript
// app/api/admin/products/upload/route.js
import { parseMultipartForm } from "../../../../../lib/multipart";
import Uploads from "../../../../../lib/uploads";

export async function POST(request) {
  const { files } = await parseMultipartForm(request);
  const file = files[0];

  const uploads = new Uploads();
  // This will resize to 500x500 with white background
  const result = await uploads.handleUploadProduct(file);

  return NextResponse.json({ url: result.url });
}
```

### 3. CRUD with Optional Upload

```javascript
// app/api/admin/articles/route.js
import { parseMultipartForm } from "../../../../lib/multipart";
import Uploads from "../../../../lib/uploads";

export async function POST(request) {
  const contentType = request.headers.get("content-type") || "";

  let body = {};
  let imageUrl = null;

  // Check if multipart (has file upload)
  if (contentType.includes("multipart/form-data")) {
    const { fields, files } = await parseMultipartForm(request);
    body = fields;

    // Upload image if provided
    if (files && files.length > 0) {
      const uploads = new Uploads();
      const result = await uploads.handleUpload(files[0]);
      imageUrl = result.url;
    }
  } else {
    // Regular JSON body
    body = await request.json();
  }

  // Create article with image URL
  const article = await articleService.create({
    ...body,
    imageUrl: imageUrl || body.imageUrl, // Use uploaded or provided URL
  });

  return NextResponse.json({ success: true, data: article });
}
```

### 4. Upload Endpoint Terpisah (Optional/Legacy)

> **Note**: Untuk kemudahan, gunakan pattern #1 (upload terintegrasi langsung di CRUD).  
> Endpoint upload terpisah hanya diperlukan untuk use case khusus (e.g., multiple file upload, image gallery, dll).

```javascript
// app/api/admin/gallery/upload/route.js
import { parseMultipartForm } from "../../../../../lib/upload/multipart";
import Uploads from "../../../../../lib/upload/uploads";

export async function POST(request) {
  const { files } = await parseMultipartForm(request, {
    multiples: true,
    maxFileSize: 5 * 1024 * 1024, // 5MB per file
  });

  const uploads = new Uploads();
  const results = [];

  for (const file of files) {
    const result = await uploads.handleUpload(file);
    results.push({
      url: result.url,
      metadata: result.metadata,
    });
  }

  return NextResponse.json({ success: true, data: results });
}
```

### 5. Frontend Upload Example (Integrated CRUD)

```javascript
// Client-side - Upload file langsung saat create/update hero
function HeroUploadForm() {
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    
    // Tambahkan file jika ada
    const file = e.target.file.files[0];
    if (file) {
      formData.append("file", file);
    }
    
    // Tambahkan fields lain
    formData.append("title", "Hero Title");
    formData.append("description", "Hero Description");
    formData.append("isActive", "true");
    
    // Atau, jika pakai URL eksternal tanpa upload file
    // formData.append("source", "https://example.com/image.jpg");
    
    // Create hero dengan file upload dalam satu request
    const response = await fetch("/api/admin/hero", {
      method: "POST",
      body: formData,
      // Jangan set Content-Type - browser akan set otomatis dengan boundary
    });
    
    const data = await response.json();
    if (data.success) {
      console.log("Hero created:", data.data);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input type="file" name="file" accept="image/*,video/*" />
      <input type="text" name="title" placeholder="Title" />
      <textarea name="description" placeholder="Description" />
      <button type="submit">Create Hero</button>
    </form>
  );
}

// Alternatif: Gunakan JSON jika hanya pakai URL (tanpa upload file)
async function createHeroWithURL() {
  const response = await fetch("/api/admin/hero", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      source: "https://example.com/image.jpg",
      title: "Hero Title",
      description: "Hero Description",
      isActive: true,
    }),
  });
  return response.json();
}
```

### 6. Pattern untuk CRUD Lain (Artikel, Produk, dll)

```javascript
// app/api/admin/articles/route.js
import { parseMultipartForm } from "../../../../lib/upload/multipart";
import Uploads from "../../../../lib/upload/uploads";

export async function POST(request) {
  const contentType = request.headers.get("content-type") || "";
  let body = {};

  if (contentType.includes("multipart/form-data")) {
    const { fields, files } = await parseMultipartForm(request);
    body = fields;

    // Upload image jika ada
    if (files && files.length > 0) {
      const uploads = new Uploads();
      const result = await uploads.handleUpload(files[0]);
      body.imageUrl = result.url;
    }
  } else {
    body = await request.json();
  }

  // Create article dengan imageUrl dari upload atau dari body
  const article = await articleService.create(body);
  return NextResponse.json({ success: true, data: article });
}

// PUT juga sama
export async function PUT(request, { params }) {
  const { id } = await params;
  const contentType = request.headers.get("content-type") || "";
  let body = {};

  if (contentType.includes("multipart/form-data")) {
    const { fields, files } = await parseMultipartForm(request);
    body = fields;

    if (files && files.length > 0) {
      const uploads = new Uploads();
      const result = await uploads.handleUpload(files[0]);
      body.imageUrl = result.url;
    }
  } else {
    body = await request.json();
  }

  const article = await articleService.update(parseInt(id), body);
  return NextResponse.json({ success: true, data: article });
}
```

## API Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    "url": "/uploads/2026/01/1737654321_abc123.jpg",
    "path": "uploads/2026/01/1737654321_abc123.jpg",
    "metadata": {
      "originalName": "hero-image.jpg",
      "mimeType": "image/jpeg",
      "size": 245678,
      "width": 1920,
      "height": 1080
    }
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "File too large",
  "message": "Maximum file size is 10MB"
}
```

## Helper Functions

### parseMultipartForm(request, options)
Parse multipart/form-data from Next.js Request object.

**Options:**
- `maxFileSize`: number (bytes)
- `multiples`: boolean (allow multiple files)
- `filter`: function (custom file filter)

**Returns:** `{ fields: Object, files: Array }`

### validateFileMimeType(file, allowedTypes)
Validate file MIME type.

**Example:**
```javascript
validateFileMimeType(file, ['image/*', 'video/mp4'])
```

### validateFileSize(file, maxSize)
Validate file size.

### Uploads Class Methods

#### `handleUpload(file)`
Upload regular file with image optimization.

#### `handleUploadProduct(file, extension?)`
Upload and resize to square (500x500) with white background.

#### `getFileMetadata(file)`
Extract file metadata.

## Testing

```bash
# Test upload endpoint
curl -X POST http://localhost:3000/api/admin/hero/upload \
  -H "Cookie: accessToken=your-token" \
  -F "file=@/path/to/image.jpg"

# Expected response
{
  "success": true,
  "data": {
    "url": "/uploads/2026/01/1737654321_abc123.jpg",
    "metadata": { ... }
  }
}
```

## Tips

1. **Separation of Concerns**: Upload file terpisah dari create/update CRUD. Client upload dulu, dapat URL, baru POST/PUT dengan URL.

2. **Security**: 
   - Selalu validasi MIME type di server
   - Set max file size
   - Gunakan permission checks
   - Sanitize filename

3. **Performance**:
   - Untuk file besar (video), pertimbangkan streaming ke S3
   - Gunakan CDN untuk serving files
   - Implement lazy loading di frontend

4. **Error Handling**:
   - Wrap upload dalam try-catch
   - Return proper HTTP status codes
   - Log errors untuk debugging

5. **Storage**:
   - Development: gunakan local storage
   - Production: gunakan S3 + CloudFront/CDN
   - Backup files secara berkala
