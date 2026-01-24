# Hero Module

Module untuk mengelola Hero Section pada aplikasi Hysteria.

## Struktur Module

```
modules/hero/
├── index.js                      # Export utama
├── repositories/
│   └── hero.repository.js       # Database operations
├── services/
│   └── hero.service.js          # Business logic
└── validators/
    └── hero.validator.js        # Input validation
```

## Features

- ✅ CRUD operations untuk hero sections
- ✅ Validasi URL media (reject Pexels page URLs)
- ✅ Auto-deactivate other heroes saat set active
- ✅ Pagination dengan cursor-based
- ✅ Comprehensive logging
- ✅ Error handling yang proper

## Repository Layer

### Methods

- `findAllHeroes({ perPage, cursor, isActive })` - Get all heroes dengan pagination
- `findHeroById(id)` - Get hero by ID
- `findActiveHero()` - Get active hero (public)
- `createHero(data)` - Create new hero
- `updateHero(id, data)` - Update hero
- `deleteHero(id)` - Delete hero
- `countHeroes(where)` - Count heroes

## Service Layer

### Methods

- `getAllHeroes(options)` - Get all heroes dengan validasi
- `getHeroById(id)` - Get hero dengan error handling
- `getActiveHero()` - Get active hero untuk public
- `createHero(data)` - Create dengan validasi
- `updateHero(id, data)` - Update dengan validasi
- `deleteHero(id)` - Delete dengan checks
- `setActiveHero(id)` - Set hero sebagai active

## Validators

### URL Validation

**Valid URLs:**
```javascript
✅ https://images.pexels.com/photos/123/image.jpeg
✅ https://example.com/video.mp4
✅ /videos/local-video.mp4
✅ https://cloudinary.com/xxx/image.jpg
```

**Invalid URLs:**
```javascript
❌ https://www.pexels.com/video/xxx-123/  // Page URL
❌ https://www.pexels.com/photo/xxx-123/  // Page URL
❌ https://youtube.com/watch?v=xxx        // Streaming platform
❌ not-a-url                              // Invalid format
```

### Schemas

#### createHeroSchema
```javascript
{
  source: string (validated media URL),
  title: string (3-500 chars),
  description: string (10-2000 chars),
  isActive: boolean (optional, default: false)
}
```

#### updateHeroSchema
```javascript
{
  source: string (optional),
  title: string (optional),
  description: string (optional),
  isActive: boolean (optional)
}
```

#### heroQuerySchema
```javascript
{
  perPage: number (1-100, default: 10),
  cursor: number (optional),
  isActive: boolean string (optional, "true"/"false")
}
```

## Usage Examples

### Import Module

```javascript
import * as heroService from './modules/hero/services/hero.service.js';
// or
import { getAllHeroes, createHero } from './modules/hero/index.js';
```

### Create Hero

```javascript
try {
  const hero = await heroService.createHero({
    source: 'https://images.pexels.com/photos/123/image.jpeg',
    title: 'Beautiful Nature',
    description: 'A stunning view of mountains',
    isActive: true
  });
  console.log('Hero created:', hero.id);
} catch (error) {
  console.error('Error:', error.message);
}
```

### Get All Heroes

```javascript
const result = await heroService.getAllHeroes({
  perPage: 10,
  cursor: null,
  isActive: true
});

console.log('Heroes:', result.heroes);
console.log('Has more:', result.hasMore);
console.log('Next cursor:', result.nextCursor);
```

### Update Hero

```javascript
await heroService.updateHero(24, {
  source: 'https://images.pexels.com/photos/456/new-image.jpeg',
  title: 'Updated Title'
});
```

### Set Active Hero

```javascript
// Automatically deactivates all others
await heroService.setActiveHero(24);
```

## API Integration

Module ini digunakan oleh API routes:

- `GET /api/hero/active` - Public endpoint (no auth)
- `GET /api/admin/hero` - List heroes (requires hero.read)
- `POST /api/admin/hero` - Create hero (requires hero.create)
- `GET /api/admin/hero/[id]` - Get hero detail (requires hero.read)
- `PUT /api/admin/hero/[id]` - Update hero (requires hero.update)
- `DELETE /api/admin/hero/[id]` - Delete hero (requires hero.delete)

## Error Handling

Module menggunakan `AppError` untuk error handling:

```javascript
try {
  await heroService.getHeroById(999);
} catch (error) {
  if (error instanceof AppError) {
    console.log(error.message); // "Hero not found"
    console.log(error.status);  // 404
    console.log(error.code);    // Error code
  }
}
```

## Common Errors

- `404` - Hero not found
- `400` - Validation error (invalid URL, missing fields, etc.)
- `500` - Internal server error

## Validation Error Messages

```javascript
// URL Validation
"Invalid URL format"
"URL must be a direct media file (.mp4, .jpg, etc.) or from a supported CDN"
"Please use direct media URLs, not page URLs"

// Field Validation
"Title must be at least 3 characters"
"Description must be at least 10 characters"
"No valid fields to update"
```

## Logging

Module menggunakan `logger` untuk tracking:

```javascript
// Info logs
logger.info('Hero created successfully', { heroId, isActive });
logger.info('Hero updated successfully', { heroId, updatedFields });

// Warning logs
logger.warn('Hero validation failed', { error: error.errors });

// Error logs
logger.error('Error creating hero', { error: error.message });
```

## Best Practices

1. **Always validate URLs** - Module otomatis reject Pexels page URLs
2. **Use direct media URLs** - Untuk performance & reliability
3. **One active hero** - Module auto-handle deactivation
4. **Handle errors properly** - Catch AppError untuk user feedback
5. **Use pagination** - Untuk list besar, gunakan cursor pagination

## Testing

```bash
# Create test hero
node test/test-hero-crud.mjs

# Check database
node test/check-hero-data.mjs
```

## Migration Notes

Jika upgrade dari direct prisma calls:

**Before:**
```javascript
const hero = await prisma.heroSection.findFirst({
  where: { isActive: true }
});
```

**After:**
```javascript
import * as heroService from './modules/hero/services/hero.service.js';
const hero = await heroService.getActiveHero();
```

Benefits:
- ✅ Built-in validation
- ✅ Error handling
- ✅ Logging
- ✅ Type safety (dengan JSDoc)
- ✅ Easier testing
- ✅ Centralized business logic
