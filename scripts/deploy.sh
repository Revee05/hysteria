#!/bin/bash
# =============================================================
# deploy.sh — Deployment script, dijalankan di VPS
# Usage: bash scripts/deploy.sh
# =============================================================

set -e

APP_DIR="/var/www/hysteria"
LOG_FILE="$APP_DIR/logs/deploy.log"

# Load nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "============================================"
log " Starting deployment..."
log "============================================"

cd $APP_DIR

# ── 1. Pull kode terbaru ─────────────────────────────────────
log "[1/6] Pulling latest code from git..."
git pull origin main

# ── 2. Install dependencies ──────────────────────────────────
log "[2/6] Installing dependencies..."
npm ci

# ── 3. Generate Prisma client ────────────────────────────────
log "[3/6] Generating Prisma client..."
npx prisma generate

# ── 4. Jalankan migrasi database ────────────────────────────
log "[4/6] Running database migrations..."
npx prisma migrate deploy

# ── 5. Build aplikasi ────────────────────────────────────────
log "[5/6] Building application (this may take a few minutes)..."
npm run build

# Copy file statis ke folder standalone
log "  >> Copying static assets to standalone..."
cp -r public .next/standalone/public
cp -r .next/static .next/standalone/.next/static

# ── 6. Restart PM2 ───────────────────────────────────────────
log "[6/6] Restarting PM2..."
if pm2 list | grep -q "hysteria"; then
    pm2 restart hysteria
else
    pm2 start ecosystem.config.js --env production
fi

pm2 save

log "============================================"
log " Deployment BERHASIL!"
log "============================================"
