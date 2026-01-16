
# Panduan Migration Prisma — Singkat

1. Siapkan `.env` dengan `DATABASE_URL`. ini kalo db nya local

```powershell
DATABASE_URL="postgresql://nama_user:password@localhost:5432/nama_database?schema=public"
```

2. (Baru) Inisialisasi Prisma:

```powershell
npx prisma init
```

3. Edit `prisma/schema.prisma` — tambahkan/ubah model.

4. Generate client:

```powershell
npx prisma generate
```

5. Buat & terapkan migration (development):

```powershell
npx prisma migrate dev --name <nama_file_migrasi>
```

6. Terapkan migration di production/CI:

```powershell
npx prisma migrate deploy
```

7. Periksa status / reset (dev):

```powershell
npx prisma migrate status
npx prisma migrate reset   # HATI-HATI: hapus semua data
```

Perintah cepat: 
`- npx prisma init`,
`- npx prisma generate`,
`- npx prisma migrate dev --nama_file`,
`- npx prisma migrate deploy //ini untuk production db`,
`- npx prisma studio //ini untuk membuka table database menggunakan prisma server`