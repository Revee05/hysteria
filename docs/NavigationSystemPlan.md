# Plan Sistem Navigasi Multi-Level untuk Hysteria

> **Dibuat:** 27 Januari 2026  
> **Tujuan:** Implementasi sistem navigasi dinamis berbasis database dengan dukungan hirarki multi-level untuk kategori Program Hysteria, Platform, dan Artikel.

---

## 📋 Ringkasan Eksekutif

Saat ini navigasi website hardcoded di komponen React. Plan ini merancang sistem navigasi dinamis yang:
- **Top-level navigation tetap hardcoded** (Beranda, Tentang Kami, Program Hysteria, Platform, Event, Artikel, Kontak Kami)
- **Level 2 & 3+ (kategori & sub-kategori) dinamis dari database**
- Mendukung **hirarki unlimited depth** menggunakan self-referential relationships
- Terintegrasi dengan sistem **Permission RBAC** yang sudah ada
- **Admin UI** untuk manajemen kategori tanpa coding

---

## 🗄️ Database Schema

### Model Baru yang Ditambahkan

```prisma
// ====================================
// NAVIGASI & KATEGORI
// ====================================

model Category {
  id          Int            @id @default(autoincrement())
  title       String         @db.VarChar(255)
  slug        String         @unique @db.VarChar(255)
  description String?        @db.Text
  order       Int            @default(0)
  isActive    Boolean        @default(true)
  
  // Optional: Permission gating untuk visibility kategori
  requiredPermissionId Int?
  requiredPermission   Permission? @relation(fields: [requiredPermissionId], references: [id])
  
  items       CategoryItem[]
  
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt
  
  @@index([slug])
  @@index([order])
}

model CategoryItem {
  id         Int       @id @default(autoincrement())
  
  // Relasi ke category parent
  category   Category  @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  categoryId Int
  
  // Self-referential untuk hirarki multi-level
  parent     CategoryItem?  @relation("CatChildren", fields: [parentId], references: [id], onDelete: Cascade)
  parentId   Int?
  children   CategoryItem[] @relation("CatChildren")
  
  title      String         @db.VarChar(255)
  slug       String?        @db.VarChar(255)
  url        String?        @db.VarChar(500)
  
  // Order untuk sorting
  order      Int            @default(0)
  
  // Metadata flexible (JSON)
  meta       Json?          @db.JsonB
  
  isActive   Boolean        @default(true)
  
  createdAt  DateTime       @default(now())
  updatedAt  DateTime       @updatedAt
  
  @@index([categoryId])
  @@index([parentId])
  @@index([order])
}
```

### Relasi dengan Model Existing

- `Category.requiredPermissionId` → `Permission.id` (optional, untuk RBAC)
- Tidak ada perubahan pada model `User`, `Role`, `Permission` yang sudah ada
- Sistem permission tetap menggunakan struktur existing

---

## 📊 Visualisasi Struktur Data

### Level 1: Top Navigation (Hardcoded di Component)

```
┌─────────────────────────────────────────────────────────────┐
│ Beranda │ Tentang Kami │ Program Hysteria* │ Platform* │    │
│ Event │ Artikel* │ Kontak Kami                              │
└─────────────────────────────────────────────────────────────┘
         * = memiliki kategori dinamis dari database
```

### Level 2-3: Dynamic Categories dari Database

```
Category: "program-hysteria"
├── CategoryItem: "Festival dan Pameran"
│   ├── CategoryItem: "Festival Kampung"
│   │   ├── CategoryItem: "Festival Kampung Baharu"
│   │   ├── CategoryItem: "Gebyarun Bustaman"
│   │   └── CategoryItem: "Ngajak Gitlok"
│   ├── CategoryItem: "Festival Kota"
│   │   ├── CategoryItem: "Zine Fest"
│   │   ├── CategoryItem: "Rilis Fest"
│   │   └── CategoryItem: "Festival of Yuya"
│   └── CategoryItem: "Biennale"
│       ├── CategoryItem: "Rumah Luka"
│       └── CategoryItem: "Kenangan Residensi"
├── CategoryItem: "Forum"
│   ├── CategoryItem: "Temu Jejaring"
│   ├── CategoryItem: "Buah tangan"
│   ├── CategoryItem: "Lawatan Jalan Terus"
│   ├── CategoryItem: "Simposium"
│   └── CategoryItem: "Mendidik"
├── CategoryItem: "Podcast"
│   ├── CategoryItem: "Sorel di Sekitar"
│   ├── CategoryItem: "Kartu Pos"
│   └── CategoryItem: "Aston"
├── CategoryItem: "Music"
│   ├── CategoryItem: "SGRT"
│   ├── CategoryItem: "Kotak Liemk"
│   ├── CategoryItem: "Dj2(a)kot"
│   └── CategoryItem: "Bunyi Halaman Belakang"
├── CategoryItem: "Pemutaran Film"
│   ├── CategoryItem: "Screening AM"
│   └── CategoryItem: "Lawatan Bandeng Keliling"
├── CategoryItem: "Residensi dan Workshop"
│   ├── CategoryItem: "Pijat Residency"
│   └── CategoryItem: "Kandang Transhap"
└── CategoryItem: "Video Series"
    ├── CategoryItem: "Screening AM"
    └── CategoryItem: "Lawatan Bandeng Keliling"

Category: "platform"
├── CategoryItem: "Hysteria Artlab"
│   ├── CategoryItem: "Merchandise"
│   ├── CategoryItem: "Podcast Artlab"
│   ├── CategoryItem: "Storeh 28 Radio Show"
│   ├── CategoryItem: "Artshop"
│   ├── CategoryItem: "Workshop"
│   ├── CategoryItem: "Hayinji Turunank"
│   ├── CategoryItem: "Peltos"
│   ├── CategoryItem: "Screening Film"
│   ├── CategoryItem: "Maling Artist"
│   └── CategoryItem: "Liali"
├── CategoryItem: "Ditampart"
│   ├── CategoryItem: "3D"
│   ├── CategoryItem: "Mockup dan Poster"
│   ├── CategoryItem: "Short Dokumentasi"
│   └── CategoryItem: "Dokumentasi ditampart"
├── CategoryItem: "Laki Masak"
│   ├── CategoryItem: "Meramu"
│   ├── CategoryItem: "Homecooked"
│   ├── CategoryItem: "Komik Ramuan"
│   └── CategoryItem: "Pre-Order"
├── CategoryItem: "Pekakota"
└── CategoryItem: "Bukit Buku"
    └── CategoryItem: "Untuk Perhatian"

Category: "artikel"
├── CategoryItem: "Esai"
├── CategoryItem: "Bedah Buku"
├── CategoryItem: "Zine"
├── CategoryItem: "Media Partner"
└── CategoryItem: "Rilisan Buku"
```

---

## 💾 Contoh Data Seed

### 1. Categories Table

| id  | title            | slug              | order | isActive | requiredPermissionId |
| --- | ---------------- | ----------------- | ----- | -------- | -------------------- |
| 1   | Program Hysteria | program-hysteria  | 0     | true     | null                 |
| 2   | Platform         | platform          | 1     | true     | null                 |
| 3   | Artikel          | artikel           | 2     | true     | null                 |

### 2. CategoryItems Table (Contoh untuk Program Hysteria)

| id  | categoryId | parentId | title                     | slug                    | url                                  | order |
| --- | ---------- | -------- | ------------------------- | ----------------------- | ------------------------------------ | ----- |
| 1   | 1          | null     | Festival dan Pameran      | festival-dan-pameran    | /program/festival                    | 0     |
| 2   | 1          | 1        | Festival Kampung          | festival-kampung        | /program/festival/kampung            | 0     |
| 3   | 1          | 2        | Festival Kampung Baharu   | kampung-baharu          | /program/festival/kampung/baharu     | 0     |
| 4   | 1          | 2        | Gebyarun Bustaman         | gebyarun-bustaman       | /program/festival/kampung/gebyarun   | 1     |
| 5   | 1          | 2        | Ngajak Gitlok             | ngajak-gitlok           | /program/festival/kampung/gitlok     | 2     |
| 6   | 1          | 1        | Festival Kota             | festival-kota           | /program/festival/kota               | 1     |
| 7   | 1          | 6        | Zine Fest                 | zine-fest               | /program/festival/kota/zine-fest     | 0     |
| 8   | 1          | 6        | Rilis Fest                | rilis-fest              | /program/festival/kota/rilis-fest    | 1     |
| 9   | 1          | 1        | Biennale                  | biennale                | /program/festival/biennale           | 2     |
| 10  | 1          | 9        | Rumah Luka                | rumah-luka              | /program/festival/biennale/rumah     | 0     |
| 11  | 1          | null     | Forum                     | forum                   | /program/forum                       | 1     |
| 12  | 1          | 11       | Temu Jejaring             | temu-jejaring           | /program/forum/temu-jejaring         | 0     |
| 13  | 1          | 11       | Buah tangan               | buah-tangan             | /program/forum/buah-tangan           | 1     |
| 14  | 1          | null     | Podcast                   | podcast                 | /program/podcast                     | 2     |
| 15  | 1          | 14       | Sorel di Sekitar          | sorel-di-sekitar        | /program/podcast/sorel               | 0     |
| 16  | 1          | 14       | Kartu Pos                 | kartu-pos               | /program/podcast/kartu-pos           | 1     |

### 3. CategoryItems untuk Platform

| id  | categoryId | parentId | title              | slug               | url                              | order |
| --- | ---------- | -------- | ------------------ | ------------------ | -------------------------------- | ----- |
| 20  | 2          | null     | Hysteria Artlab    | hysteria-artlab    | /platform/artlab                 | 0     |
| 21  | 2          | 20       | Merchandise        | merchandise        | /platform/artlab/merchandise     | 0     |
| 22  | 2          | 20       | Podcast Artlab     | podcast-artlab     | /platform/artlab/podcast         | 1     |
| 23  | 2          | 20       | Workshop           | workshop           | /platform/artlab/workshop        | 2     |
| 24  | 2          | null     | Ditampart          | ditampart          | /platform/ditampart              | 1     |
| 25  | 2          | 24       | 3D                 | 3d                 | /platform/ditampart/3d           | 0     |
| 26  | 2          | 24       | Mockup dan Poster  | mockup-poster      | /platform/ditampart/mockup       | 1     |
| 27  | 2          | null     | Laki Masak         | laki-masak         | /platform/laki-masak             | 2     |
| 28  | 2          | 27       | Meramu             | meramu             | /platform/laki-masak/meramu      | 0     |
| 29  | 2          | 27       | Homecooked         | homecooked         | /platform/laki-masak/homecooked  | 1     |
| 30  | 2          | null     | Pekakota           | pekakota           | /platform/pekakota               | 3     |
| 31  | 2          | null     | Bukit Buku         | bukit-buku         | /platform/bukit-buku             | 4     |

### 4. CategoryItems untuk Artikel

| id  | categoryId | parentId | title         | slug          | url                    | order |
| --- | ---------- | -------- | ------------- | ------------- | ---------------------- | ----- |
| 40  | 3          | null     | Esai          | esai          | /artikel/esai          | 0     |
| 41  | 3          | null     | Bedah Buku    | bedah-buku    | /artikel/bedah-buku    | 1     |
| 42  | 3          | null     | Zine          | zine          | /artikel/zine          | 2     |
| 43  | 3          | null     | Media Partner | media-partner | /artikel/media-partner | 3     |
| 44  | 3          | null     | Rilisan Buku  | rilisan-buku  | /artikel/rilisan-buku  | 4     |

---

## 🔌 API Design

### Endpoint 1: GET /api/categories/:slug

**Request:**
```http
GET /api/categories/program-hysteria
```

**Response:** (tree structure dengan children rekursif)
```json
{
  "id": 1,
  "title": "Program Hysteria",
  "slug": "program-hysteria",
  "isActive": true,
  "items": [
    {
      "id": 1,
      "title": "Festival dan Pameran",
      "slug": "festival-dan-pameran",
      "url": "/program/festival",
      "order": 0,
      "children": [
        {
          "id": 2,
          "title": "Festival Kampung",
          "slug": "festival-kampung",
          "url": "/program/festival/kampung",
          "order": 0,
          "children": [
            {
              "id": 3,
              "title": "Festival Kampung Baharu",
              "slug": "kampung-baharu",
              "url": "/program/festival/kampung/baharu",
              "order": 0,
              "children": []
            },
            {
              "id": 4,
              "title": "Gebyarun Bustaman",
              "slug": "gebyarun-bustaman",
              "url": "/program/festival/kampung/gebyarun",
              "order": 1,
              "children": []
            }
          ]
        },
        {
          "id": 6,
          "title": "Festival Kota",
          "slug": "festival-kota",
          "url": "/program/festival/kota",
          "order": 1,
          "children": [
            {
              "id": 7,
              "title": "Zine Fest",
              "slug": "zine-fest",
              "url": "/program/festival/kota/zine-fest",
              "order": 0,
              "children": []
            }
          ]
        }
      ]
    },
    {
      "id": 11,
      "title": "Forum",
      "slug": "forum",
      "url": "/program/forum",
      "order": 1,
      "children": [
        {
          "id": 12,
          "title": "Temu Jejaring",
          "slug": "temu-jejaring",
          "url": "/program/forum/temu-jejaring",
          "order": 0,
          "children": []
        }
      ]
    }
  ]
}
```

### Endpoint 2: GET /api/categories (Admin)

**Response:** List semua categories
```json
{
  "categories": [
    { "id": 1, "title": "Program Hysteria", "slug": "program-hysteria", "itemCount": 45 },
    { "id": 2, "title": "Platform", "slug": "platform", "itemCount": 18 },
    { "id": 3, "title": "Artikel", "slug": "artikel", "itemCount": 5 }
  ]
}
```

### Endpoint 3: POST /api/admin/categories/:id/items (Admin)

**Request:**
```json
{
  "title": "Festival Baru",
  "slug": "festival-baru",
  "url": "/program/festival/baru",
  "parentId": 1,
  "order": 10
}
```

**Response:**
```json
{
  "success": true,
  "item": {
    "id": 50,
    "title": "Festival Baru",
    "categoryId": 1,
    "parentId": 1,
    "order": 10
  }
}
```

---

## 🎨 Frontend Integration

### 1. MenuPanel Component (Mobile Menu)

**File:** `components/layout/MenuPanel.jsx`

**Perubahan:**
- Top-level links tetap hardcoded (Beranda, Tentang Kami, Kontak Kami)
- Links dengan kategori (Program Hysteria, Platform, Artikel) jadi `<button>` yang trigger `loadCategory(slug)`
- Panel kiri menampilkan hasil fetch dari `/api/categories/:slug` secara recursive

**Komponen Recursive:**
```jsx
function RenderCategoryItems({ items, onClose, depth = 0 }) {
  if (!items || items.length === 0) return null;
  
  return (
    <div className={`ml-${depth * 4}`}>
      {items.map(item => (
        <div key={item.id} className="mb-2">
          <a 
            href={item.url} 
            onClick={onClose} 
            className="text-sm font-medium hover:underline"
          >
            {item.title}
          </a>
          {item.children && item.children.length > 0 && (
            <RenderCategoryItems 
              items={item.children} 
              onClose={onClose} 
              depth={depth + 1} 
            />
          )}
        </div>
      ))}
    </div>
  );
}
```

### 2. Desktop Navigation (Header)

**File:** `components/layout/Header.jsx`

**Implementasi:**
- Dropdown menu untuk kategori
- Hover trigger fetch category items
- Multi-column layout untuk sub-categories (seperti mega menu)

### 3. Caching Strategy

```jsx
const [categoryCache, setCategoryCache] = useState({});

async function loadCategory(slug) {
  if (categoryCache[slug]) {
    setItems(categoryCache[slug]);
    return;
  }
  
  const res = await fetch(`/api/categories/${slug}`);
  const data = await res.json();
  
  setCategoryCache(prev => ({ ...prev, [slug]: data.items }));
  setItems(data.items);
}
```

---

## 🛠️ Admin UI Design

### Page: `/admin/section/navigation`

**Fitur:**
1. **Category List** - Tabel kategori dengan jumlah items
2. **Tree View** - Expandable tree untuk melihat hirarki
3. **Drag & Drop** - Reorder items dalam level yang sama
4. **Add/Edit Modal** - Form untuk create/update item dengan:
   - Title
   - Slug (auto-generated dari title)
   - URL
   - Parent selector (dropdown tree)
   - Order (manual atau auto)
   - Active toggle
5. **Bulk Actions** - Delete multiple items, activate/deactivate

**Komponen Admin:**
```jsx
// components/adminUI/CategoryTreeEditor.jsx
function CategoryTreeEditor({ categoryId }) {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Fetch items
  useEffect(() => {
    fetch(`/api/admin/categories/${categoryId}/items`)
      .then(r => r.json())
      .then(data => setItems(data.items));
  }, [categoryId]);
  
  // Render tree dengan indentation dan expand/collapse
  return (
    <div className="tree-view">
      {items.map(item => (
        <TreeNode 
          key={item.id} 
          item={item} 
          onEdit={setSelectedItem}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}
```

---

## 🚀 Implementation Steps

### Phase 1: Database Setup (Hari 1)

1. **Update Prisma Schema**
   ```bash
   # Edit prisma/schema.prisma
   # Tambahkan model Category dan CategoryItem
   ```

2. **Create Migration**
   ```bash
   npx prisma migrate dev --name add_navigation_system
   ```

3. **Create Seed File**
   ```bash
   # Edit prisma/seed/navigation.seed.ts
   # Populate categories dan items sesuai struktur di atas
   ```

4. **Run Seed**
   ```bash
   npx prisma db seed
   ```

### Phase 2: API Development (Hari 2-3)

1. **Public API Endpoints**
   - `app/api/categories/[slug]/route.js` - GET category dengan tree
   - Tree builder utility di `lib/helper/tree.helper.js`

2. **Admin API Endpoints**
   - `app/api/admin/categories/route.js` - GET all, POST create
   - `app/api/admin/categories/[id]/route.js` - GET one, PUT update, DELETE
   - `app/api/admin/categories/[id]/items/route.js` - GET items, POST create
   - `app/api/admin/categories/[id]/items/[itemId]/route.js` - PUT, DELETE
   - `app/api/admin/categories/[id]/items/reorder/route.js` - POST bulk reorder

3. **Auth Middleware**
   - Protect admin endpoints dengan existing auth middleware
   - Permission check: `categories.manage` atau `admin.full`

### Phase 3: Frontend Public (Hari 4-5)

1. **Refactor MenuPanel.jsx**
   - State management untuk active category
   - Fetch function dengan caching
   - Recursive rendering component
   - Loading states

2. **Update Header.jsx** (Desktop)
   - Mega menu dropdown
   - Hover trigger
   - Grid layout untuk sub-categories

3. **Testing**
   - Navigasi mobile responsif
   - Kategori load dengan benar
   - Deep links (level 3+) berfungsi

### Phase 4: Admin UI (Hari 6-7)

1. **Navigation Management Page**
   - Category selector
   - Tree view dengan expand/collapse
   - Search & filter

2. **CRUD Modals**
   - Add/Edit item modal
   - Parent selector (tree dropdown)
   - Slug auto-generation
   - Validation

3. **Reordering**
   - Drag & drop library (react-beautiful-dnd atau @dnd-kit)
   - Visual feedback
   - Save order API call

### Phase 5: Testing & Optimization (Hari 8)

1. **Integration Testing**
   - Setiap level navigation dapat diakses
   - Admin CRUD berfungsi
   - Permission gating works

2. **Performance**
   - API response caching (Redis optional)
   - Frontend caching strategy
   - Lazy loading untuk large trees

3. **Documentation**
   - API documentation
   - Admin user guide
   - Developer notes

---

## 📦 Dependencies yang Dibutuhkan

```json
{
  "dependencies": {
    "@prisma/client": "^5.x",
    "next": "^14.x",
    "react": "^18.x"
  },
  "devDependencies": {
    "prisma": "^5.x",
    "@dnd-kit/core": "^6.x",
    "@dnd-kit/sortable": "^7.x"
  }
}
```

---

## 🔒 Security Considerations

1. **Permission-based Visibility**
   - Field `requiredPermissionId` di Category
   - Frontend filter items berdasarkan user permissions
   - Backend validation di API

2. **Input Validation**
   - Slug sanitization (no special chars, lowercase)
   - URL validation (internal paths only)
   - XSS prevention (escape HTML dalam titles)

3. **Admin Access**
   - Semua admin endpoints require authentication
   - Permission check: `categories.manage` minimum
   - Rate limiting untuk API calls

---

## 📈 Future Enhancements

1. **SEO Metadata**
   - Field `metaTitle`, `metaDescription` di CategoryItem
   - Dynamic sitemap generation

2. **Multi-language**
   - Field `locale` di CategoryItem
   - Language switcher di admin UI

3. **Analytics**
   - Click tracking per item
   - Popular categories dashboard

4. **Advanced Features**
   - External URL support dengan validation
   - Icon picker untuk category items
   - Color/theme customization per category
   - Schedule publish (publishAt, unpublishAt fields)

---

## ✅ Success Criteria

- ✅ Top-level navigation tetap berfungsi seperti sekarang
- ✅ 3 kategori utama (Program, Platform, Artikel) load dari database
- ✅ Hirarki 3+ level dapat di-render dengan benar
- ✅ Admin dapat menambah/edit/hapus items tanpa coding
- ✅ Drag & drop reordering berfungsi smooth
- ✅ Mobile menu responsif dan performant
- ✅ Desktop mega menu tampil dengan layout grid yang rapi
- ✅ API response time < 200ms untuk category fetch
- ✅ Zero breaking changes pada existing features

---

**Estimasi Total:** 8 hari kerja (1 developer)  
**Priority:** High  
**Complexity:** Medium-High  
**Impact:** High (reduces technical debt, enables content team autonomy)
