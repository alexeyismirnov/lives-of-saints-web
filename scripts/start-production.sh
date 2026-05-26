#!/bin/sh
set -e

if [ -n "$DATABASE_URL" ] && command -v prisma >/dev/null 2>&1; then
  echo "Running Prisma migrations…"
  prisma migrate deploy
fi

echo "Starting Next.js…"
exec node server.js
