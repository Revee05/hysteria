#!/bin/bash
# =============================================================
# setup-vps.sh — Jalankan SEKALI saat pertama kali setup VPS
# Usage: bash scripts/setup-vps.sh
# =============================================================

set -e

APP_DIR="/var/www/hysteria"
NODE_VERSION="20"

echo "============================================"
echo " Hysteria — Initial VPS Setup"
echo "============================================"

# ── 1. Update sistem ─────────────────────────────────────────
echo "[1/8] Updating system packages..."
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl wget unzip build-essential

# ── 2. Install Node.js via nvm ───────────────────────────────
echo "[2/8] Installing Node.js $NODE_VERSION via nvm..."
if [ ! -d "$HOME/.nvm" ]; then
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
fi

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

nvm install $NODE_VERSION
nvm use $NODE_VERSION
nvm alias default $NODE_VERSION

echo "Node: $(node -v), NPM: $(npm -v)"

# ── 3. Install PM2 ───────────────────────────────────────────
echo "[3/8] Installing PM2..."
npm install -g pm2
pm2 startup systemd -u $USER --hp $HOME | tail -1 | sudo bash

# ── 4. Install Nginx ─────────────────────────────────────────
echo "[4/8] Installing Nginx..."
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx

# ── 5. Install PostgreSQL ────────────────────────────────────
echo "[5/8] Installing PostgreSQL..."
sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable postgresql
sudo systemctl start postgresql

echo ""
echo "  >> Membuat database dan user PostgreSQL..."
sudo -u postgres psql <<EOF
CREATE USER hysteria_user WITH PASSWORD 'ganti_password_kuat';
CREATE DATABASE hysteria OWNER hysteria_user;
GRANT ALL PRIVILEGES ON DATABASE hysteria TO hysteria_user;
EOF

# ── 6. Install Certbot (SSL) ─────────────────────────────────
echo "[6/8] Installing Certbot..."
sudo apt install -y certbot python3-certbot-nginx

# ── 7. Buat direktori aplikasi ───────────────────────────────
echo "[7/8] Creating app directory..."
sudo mkdir -p $APP_DIR
sudo chown $USER:$USER $APP_DIR
mkdir -p $APP_DIR/public/uploads
mkdir -p $APP_DIR/logs

# ── 8. Konfigurasi firewall ──────────────────────────────────
echo "[8/8] Configuring firewall (UFW)..."
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
sudo ufw status

echo ""
echo "============================================"
echo " Setup Selesai!"
echo "============================================"
echo ""
echo "Langkah selanjutnya:"
echo "  1. Clone repo:   git clone <repo-url> $APP_DIR"
echo "  2. Buat .env:    cp $APP_DIR/.env.production.example $APP_DIR/.env"
echo "  3. Edit .env:    nano $APP_DIR/.env"
echo "  4. Setup Nginx:  sudo cp $APP_DIR/nginx/hysteria.conf /etc/nginx/sites-available/hysteria"
echo "                   sudo ln -s /etc/nginx/sites-available/hysteria /etc/nginx/sites-enabled/"
echo "                   sudo nginx -t && sudo systemctl reload nginx"
echo "  5. Deploy:       bash $APP_DIR/scripts/deploy.sh"
echo "  6. SSL:          sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com"
echo ""
echo "  DATABASE_URL untuk .env:"
echo "  postgresql://hysteria_user:ganti_password_kuat@localhost:5432/hysteria?schema=public"
