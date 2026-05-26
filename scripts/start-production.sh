#!/bin/sh
set -e

# Railway: NEXTAUTH_URL=https://${{RAILWAY_PUBLIC_DOMAIN}} becomes "https://" if unset
case "${NEXTAUTH_URL:-}" in
  ""|https://|http://|*"{{"*)
    if [ -n "${RAILWAY_STATIC_URL:-}" ]; then
      export NEXTAUTH_URL="${RAILWAY_STATIC_URL}"
    elif [ -n "${RAILWAY_PUBLIC_DOMAIN:-}" ]; then
      export NEXTAUTH_URL="https://${RAILWAY_PUBLIC_DOMAIN}"
    else
      unset NEXTAUTH_URL
    fi
    ;;
esac
if [ -n "${NEXTAUTH_URL:-}" ]; then
  export AUTH_URL="${AUTH_URL:-$NEXTAUTH_URL}"
fi

if [ -n "$DATABASE_URL" ] && command -v prisma >/dev/null 2>&1; then
  echo "Running Prisma migrations…"
  prisma migrate deploy
fi

echo "Starting Next.js…"
exec node server.js
