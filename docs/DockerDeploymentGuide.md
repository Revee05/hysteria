# Panduan Deploy Hysteria menggunakan Docker 🐳

Menggunakan Docker jauh lebih praktis karena semua dependensi (Node.js, PostgreSQL, Nginx) sudah terbungkus dalam container, sehingga tidak perlu menginstall Node.js atau PostgreSQL secara manual di VPS (Hostinger/DigitalOcean/AWS).

---

## 🏗️ Persiapan (Awal Saja)

1.  **Akses VPS**: Pastikan kamu sudah bisa SSH ke VPS.
2.  **Install Docker & Docker Compose**: 
    Jika belum ada, install di Ubuntu VPS kamu:
    ```bash
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    ```

3.  **Clone Repository**:
    ```bash
    git clone <URL_REPO_KAMU> /var/www/hysteria-docker
    cd /var/www/hysteria-docker
    ```

4.  **Konfigurasi .env**:
    ```bash
    cp .env.production.example .env
    nano .env
    ```
    Karena kita pakai Docker, `DATABASE_URL` di `.env` harus mengarah ke container database:
    ```env
    DATABASE_URL="postgresql://postgres:password@db:5432/hysteria"
    ```

---

## 🚀 Deployment Pertama

Jalankan perintah berikut untuk mem-build dan menjalankan semua container:

```bash
docker compose up -d --build
```

### Menjalankan Migrasi Database
Karena ini pertama kali, jalankan migrasi Prisma untuk membuat tabel:

```bash
# Tunggu database 5-10 detik agar siap, lalu jalankan:
docker compose run --rm app npx prisma migrate deploy
```

*(Opsional)* Jika ada data seed yang ingin dimasukkan:
```bash
docker compose run --rm app node prisma/seed/index.js
```

---

## 🔄 Update Aplikasi Selanjutnya

Setiap kali ada perubahan code, cukup jalankan:

```bash
git pull origin main
docker compose up -d --build
```
Atau gunakan script yang sudah saya buatkan:
```bash
bash scripts/docker-deploy.sh
```

---

## 🛠️ Perintah Docker yang Sering Dipakai

```bash
# Cek semua container yang jalan
docker ps

# Lihat logs aplikasi
docker logs -f hysteria_app

# Restart aplikasi
docker compose restart app

# Masuk ke terminal container database
docker exec -it hysteria_db psql -U postgres -d hysteria

# Menghapus semua container dan membersihkan data (HATI-HATI)
docker compose down -v
```

---

## 🌐 Konfigurasi Nginx di Host (Opsional)

Jika VPS kamu sudah terinstal Nginx di luar Docker, arahkan Nginx tersebut ke port 3000 (port yang diekspos oleh container `app`).

```nginx
# /etc/nginx/sites-available/hysteria
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Lalu jalankan `certbot` untuk SSL seperti biasa.

---

### Tips Optimasi RAM di VPS Hostinger
Jika VPS kamu RAM-nya hanya 2GB (VPS 1), pastikan sudah menyalakan **SWAP** agar build Docker tidak *crash* kehabisan memori. (Lihat `DeploymentGuide.md` bagian Swap).
