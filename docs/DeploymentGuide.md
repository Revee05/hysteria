# Panduan Deploy Hysteria ke Hostinger VPS

## Arsitektur
```
Internet → Nginx (port 80/443) → PM2/Next.js (port 3000) → PostgreSQL
```

> [!TIP]
> **Rekomendasi Baru**: Kamu sekarang bisa deploy menggunakan **Docker** yang lebih praktis dan modern.
> Baca panduannya di sini: [**Docker Deployment Guide**](./DockerDeploymentGuide.md)

---


## Prasyarat
- Hostinger VPS dengan OS **Ubuntu 22.04 LTS**
- Domain yang sudah diarahkan ke IP VPS (A record)
- Repository di GitHub
- Akses SSH ke VPS

---

## FASE 1 — Setup Awal VPS (Sekali Saja)

### 1.1 Login ke VPS
```bash
ssh root@IP_VPS_KAMU
# Atau dengan user non-root yang sudah dibuat
```

### 1.2 Clone repository
```bash
git clone https://github.com/USERNAME/hysteria_prod.git /var/www/hysteria
# Atau jika repo private, gunakan SSH key atau personal access token
```

### 1.3 Jalankan setup script
```bash
cd /var/www/hysteria
bash scripts/setup-vps.sh
```

Script ini akan otomatis menginstall:
- Node.js 20 (via nvm)
- PM2
- Nginx
- PostgreSQL
- Certbot (SSL)

---

## FASE 2 — Konfigurasi Aplikasi

### 2.1 Buat file .env
```bash
cp /var/www/hysteria/.env.production.example /var/www/hysteria/.env
nano /var/www/hysteria/.env
```

Isi nilai berikut dengan benar:
- `DATABASE_URL` — sesuaikan password PostgreSQL
- `JWT_SECRET` — generate dengan: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
- `JWT_REFRESH_SECRET` — generate dengan perintah yang sama (nilai berbeda)  
- `APP_URL` — domain kamu, misal `https://hysteria.id`
- `ADMIN_EMAIL`, `ADMIN_PASSWORD` — untuk akun admin pertama

### 2.2 Setup Nginx
```bash
# Ubah yourdomain.com di file nginx config
sudo nano /etc/nginx/sites-available/hysteria
# Edit baris: server_name yourdomain.com www.yourdomain.com;

# Copy config
sudo cp /var/www/hysteria/nginx/hysteria.conf /etc/nginx/sites-available/hysteria

# Aktifkan
sudo ln -s /etc/nginx/sites-available/hysteria /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test dan reload
sudo nginx -t
sudo systemctl reload nginx
```

---

## FASE 3 — Deploy Pertama Kali

```bash
cd /var/www/hysteria
bash scripts/deploy.sh
```

### Seed database (hanya pertama kali)
```bash
cd /var/www/hysteria
node prisma/seed/index.js
```

---

## FASE 4 — Setup SSL (HTTPS)

```bash
# Pastikan domain sudah pointing ke IP VPS
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Certbot akan otomatis mengonfigurasi Nginx untuk HTTPS dan auto-renewal.

---

## FASE 5 — Setup CI/CD (GitHub Actions)

Setiap kali push ke branch `main`, deployment akan berjalan otomatis.

### 5.1 Buat SSH key khusus untuk deployment
```bash
# Di VPS, buat SSH key baru
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/deploy_key -N ""

# Tambahkan public key ke authorized_keys
cat ~/.ssh/deploy_key.pub >> ~/.ssh/authorized_keys

# Tampilkan private key (untuk disalin ke GitHub Secrets)
cat ~/.ssh/deploy_key
```

### 5.2 Tambahkan GitHub Secrets
Di repository GitHub: **Settings → Secrets and variables → Actions → New repository secret**

| Secret Name | Nilai |
|-------------|-------|
| `VPS_HOST` | IP address VPS kamu |
| `VPS_USER` | Username SSH (misal: `root` atau `ubuntu`) |
| `VPS_SSH_KEY` | Isi private key dari `~/.ssh/deploy_key` |
| `VPS_PORT` | Port SSH (default: `22`) |

### 5.3 Test CI/CD
```bash
git add .
git commit -m "chore: setup deployment"
git push origin main
```
Cek tab **Actions** di GitHub untuk melihat progress deployment.

---

## Perintah Berguna di VPS

```bash
# Cek status PM2
pm2 status
pm2 logs hysteria

# Restart aplikasi manual
pm2 restart hysteria

# Cek status Nginx
sudo systemctl status nginx
sudo nginx -t

# Cek log Nginx
sudo tail -f /var/log/nginx/error.log

# Deploy manual
cd /var/www/hysteria && bash scripts/deploy.sh

# Cek penggunaan disk
df -h

# Cek RAM
free -h
```

---

## Rekomendasi Spesifikasi VPS Hostinger

| Plan | Cocok untuk |
|------|-------------|
| VPS 1 (1 vCPU, 4GB RAM) | Development / Low traffic |
| VPS 2 (2 vCPU, 8GB RAM) | Production standard — **Recommended** |
| VPS 4+ | High traffic |

> Build Next.js membutuhkan setidaknya 2GB RAM. Jika pakai VPS 1, buat swap file 2GB.

### Membuat swap file (jika RAM kurang)
```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

---

## Troubleshooting

**Build gagal karena kehabisan memori**
→ Buat swap file 2GB (lihat di atas)

**502 Bad Gateway di Nginx**
→ Cek apakah PM2 running: `pm2 status`
→ Cek log: `pm2 logs hysteria`

**Database connection error**
→ Cek apakah PostgreSQL running: `sudo systemctl status postgresql`
→ Pastikan `DATABASE_URL` di `.env` sudah benar

**File upload tidak tersimpan**
→ Cek permission folder uploads: `ls -la /var/www/hysteria/public/uploads`
→ Perbaiki: `sudo chown -R $USER:$USER /var/www/hysteria/public/uploads`

**Permission denied saat deploy**
→ Pastikan user GitHub Actions punya akses ke direktori: `sudo chown -R ubuntu:ubuntu /var/www/hysteria`
