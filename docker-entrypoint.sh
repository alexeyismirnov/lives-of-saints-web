#!/bin/sh
set -e
npx prisma migrate deploy
if [ "${RUN_DB_POPULATE:-0}" = "1" ]; then
  npm run db:populate
fi
exec "$@"
