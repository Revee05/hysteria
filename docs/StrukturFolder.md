
# Struktur Folder — Hysteria (Rekomendasi)

Berikut struktur folder yang disarankan:

```
hysteria/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Route group untuk auth pages (non-URL segment)
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/              # Route group untuk halaman terproteksi
│   │   ├── dashboard/
│   │   ├── profile/
│   │   └── settings/
│   ├── api/                      # API Routes (server handlers)
│   │   ├── auth/
│   │   ├── users/
│   │   └── ...
│   ├── globals.css
│   ├── layout.js
│   └── page.js
│
├── components/                   # Reusable UI components
│   ├── ui/                       # Primitives (Button, Input, Modal, dll)
│   ├── forms/                    # Form building blocks
│   ├── layouts/                  # Header, Footer, Sidebar, Page shells
│   └── features/                 # Komponen per fitur (grouped by feature)
│       ├── auth/
│       └── dashboard/
│
├── features/                     # (Opsional) Full feature folders
│   ├── user-management/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── services/
│   └── product-catalog/
│
├── lib/                          # Utilities & konfigurasi (singleton clients)
│   ├── prisma.js                 # Prisma client singleton
│   ├── auth.js                   # Auth helpers
│   └── utils.js                  # Helper umum
│
├── hooks/                        # Custom React hooks (useAuth, useDebounce, dll)
│
├── services/                     # Bisnis logic / api wrappers (fetch, operations)
│   ├── auth.service.js
│   └── user.service.js
│
│
├── constants/                    # Routes, pesan, konfigurasi konstan
│
├── prisma/                       # Prisma schema, migrations, seed
│   ├── schema.prisma
│   ├── migrations/
│   └── seed/
│
├── public/                       # Static assets (images, fonts, icons)
│
├── tests/                        # Unit / integration / e2e tests
│
├── docs/                         # Dokumentasi internal (API, arsitektur)
│
└── konfigurasi proyek            # package.json, tsconfig.json, dll

```

## Detail Folder: features, hooks, constants, types

Berikut penjelasan lebih rinci untuk folder yang sering memicu kebingungan saat skala aplikasi bertambah.

- `features/` — Feature-first grouping
    - Tujuan: menampung semua file yang berkaitan dengan satu fitur bisnis sehingga mudah ditemukan, di-review, dan dihapus/diturunkan.
    - Struktur umum per fitur:
        - `features/<nama-fitur>/components/` — komponen UI khusus fitur
        - `features/<nama-fitur>/hooks/` — hooks spesifik fitur (state, filtering, pagination)
        - `features/<nama-fitur>/services/` — panggilan API, transformasi data, logic bisnis lokal
        - `features/<nama-fitur>/utils/` — util helper khusus fitur
        - `features/<nama-fitur>/index.js` — barrel export untuk memudahkan impor
    - Contoh file workflow: `features/user-management/services/user.service.js` berisi fungsi fetch/CRUD; `components/UserForm.jsx` hanya mengurus presentasi & validasi.

- `hooks/` — Custom React hooks yang reusable
    - Tujuan: kumpulkan hooks yang dipakai di banyak komponen agar tidak duplikasi.
    - Kapan taruh di `features/<...>/hooks` vs `hooks/`:
        - Jika hook hanya relevan untuk satu fitur, letakkan di folder fitur.
        - Jika hook bersifat umum (auth, debounce, form state), taruh di `hooks/` root.
    - Naming & pattern:
        - Gunakan `useXxx` (mis. `useAuth`, `useDebounce`, `useUsers`).
        - Hooks harus fokus pada satu tanggung jawab (fetching, form state, subscription).
    - Contoh `hooks/useAuth.js`:
        ```js
        // returns { user, login, logout, loading }
        export function useAuth() { /* implement */ }
        ```

- `constants/` — Konstanta & konfigurasi ringan
    - Simpan nilai yang tidak berubah dan dipakai di banyak tempat: route names, pesan UI, timeout, enum kecil.
    - Jangan simpan secrets atau konfigurasi environment di sini — gunakan `process.env`.
    - Contoh file:
        - `constants/routes.js` — export path string central seperti `{ DASHBOARD: '/dashboard', LOGIN: '/login' }`.
        - `constants/messages.js` — teks pesan error/pemberitahuan yang dipakai ulang.
    - Naming convention: `camelCase` untuk objek, `UPPER_SNAKE_CASE` untuk nilai enum global jika perlu.

Prinsip & Tips singkat:

- Komponen: letakkan primitives di `components/ui`, lalu feature-specific di `components/features`.
- Feature-first: untuk skala besar, gunakan folder `features/<nama-fitur>` yang berisi komponen, hooks, dan services terkait.
- Business logic: taruh di `services/` dan hanya konsumsi dari UI, jangan campur query langsung di banyak komponen.
- Singletons: buat client Prisma di `lib/prisma.js` agar tidak membuat banyak koneksi.
- Naming: `PascalCase` untuk komponen, `useXxx` untuk hooks, `xxx.service.js` untuk services.
- Barrel exports: gunakan `index.js` di folder `components/ui` dan `features/*` untuk impor yang bersih.

Contoh layout feature (recommended):

```
features/
└── user-management/
        ├── components/
        │   ├── UserList.jsx
        │   └── UserForm.jsx
        ├── hooks/
        │   └── useUsers.js
        └── services/
                └── user.service.js
```

