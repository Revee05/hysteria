
# Panduan Seeding (Seed.Rule)

Dokumen ini menjelaskan cara membuat file seeder dan menjalankannya di proyek.

**Ringkasan Singkat**
- Runner seeder utama berada di: `prisma/seed/index.js`.
- Semua file seeder sebaiknya diletakkan di folder: `prisma/seed/`.
- Runner menggunakan daftar statis `seeds` di `index.js`. Untuk mengaktifkan atau menonaktifkan seeder, cukup comment/uncomment baris `require()` pada array `seeds`.

**Cara Membuat Seeder Baru**
1. Buat file JS baru di `prisma/seed/`, beri nama bebas misal seperti `001-create-foo-pg.js`, `userSeed.js` dll.
2. Ekspor sebuah fungsi async sebagai default export atau `module.exports`.
3. Seeder dapat menggunakan `process.env.DATABASE_URL` dan library `pg` untuk menjalankan query SQL, contoh:

```js
// prisma/seed/002-test-pg.js
const { Client } = require('pg');
module.exports = async function seed() {
	const url = process.env.DATABASE_URL;
	if (!url) return console.warn('DATABASE_URL not set; skipping');
	const client = new Client({ connectionString: url });
	await client.connect();
	await client.query('INSERT INTO "Test" (name) VALUES ($1)', ['Seed 002']);
	await client.end();
};
```

**Mengaktifkan / Menonaktifkan Seeder**
- Buka `prisma/seed/index.js` dan ubah array `seeds`.
- Contoh (aktifkan `002-test-pg.js` saja):

```js
const seeds = [
	// require('./001-create-test-pg.js'), // disabled
	require('./002-test-pg.js'), // enabled
	// require('./003-create-more-test-pg.js'),	
];
// di file index.js nanti akan running seed yang gak dijadikan comment (ctrl + / untuk comment atau uncomment)
```

Keuntungan: perubahan jelas di commit/PR — reviewer bisa langsung melihat file mana yang diaktifkan.

**Menjalankan Seeder**
- Pastikan `DATABASE_URL` tersedia (mis. di file `.env`).
- Jalankan perintah:

```terminal root
npx prisma db seed
```

Runner akan menjalankan semua seeder yang di-`require()` di array `seeds`.

