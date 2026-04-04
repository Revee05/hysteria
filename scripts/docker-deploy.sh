#!/bin/bash

# Load environment variables if .env exists
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

echo "🚀 Memulai Deployment Docker..."

# Pull latest changes (opsional jika dijalankan manual di VPS)
# git pull origin main

# Build dan jalankan container
echo "🏗️ Building images..."
docker compose build --no-cache

echo "🛑 Stopping existing containers..."
docker compose down

echo "✨ Starting new containers..."
docker compose up -d

# Tunggu DB ready
echo "⏳ Menunggu Database siap..."
sleep 5

# Jalankan migrasi Prisma (Opsional - jalankan jika ada perubahan skema)
echo "📂 Menjalankan migrasi database..."
docker exec hysteria_app npx prisma migrate deploy

echo "✅ Deployment Selesai!"
docker ps | grep hysteria
