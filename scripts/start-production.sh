#!/bin/sh
set -e

if [ -n "$DATABASE_URL" ] && [ -x ./node_modules/.bin/prisma ]; then
  echo "Running Prisma migrations…"
  ./node_modules/.bin/prisma migrate deploy
fi

echo "Starting Next.js…"
exec node server.js
