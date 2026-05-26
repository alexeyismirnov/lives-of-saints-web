#!/usr/bin/env bash
# One-time Railway setup + deploy from lives-of-saints-web/.
# Prerequisites: railway login, git push to GitHub (optional for repo link).
set -euo pipefail

cd "$(dirname "$0")/.."

if ! railway whoami >/dev/null 2>&1; then
  echo "Run: railway login"
  exit 1
fi

PROJECT_NAME="${RAILWAY_PROJECT_NAME:-lives-of-saints-web}"

if ! railway status >/dev/null 2>&1; then
  echo "Creating Railway project: $PROJECT_NAME"
  railway init -n "$PROJECT_NAME"
fi

echo "Ensure a PostgreSQL plugin exists in the Railway dashboard (railway add --database postgres)."
echo "Link this folder to the web service if prompted."

if [ -z "${AUTH_SECRET:-}" ]; then
  AUTH_SECRET=$(openssl rand -base64 32)
  echo "Generated AUTH_SECRET (save it): $AUTH_SECRET"
fi

railway variables set \
  "AUTH_SECRET=${AUTH_SECRET}" \
  --skip-deploys 2>/dev/null || true

echo "Set NEXTAUTH_URL after deploy to your Railway public URL (e.g. https://xxx.up.railway.app)."
echo "Deploying…"
railway up --detach

echo ""
echo "After the first successful deploy:"
echo "  1. Set NEXTAUTH_URL in Railway variables to your service URL."
echo "  2. Run DB population once from your machine:"
echo "       railway variables   # copy DATABASE_URL"
echo "       DATABASE_URL='...' npm run db:populate"
echo "  3. Create an editor: npm run create-user -- you@example.com password"
