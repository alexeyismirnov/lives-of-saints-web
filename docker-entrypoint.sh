#!/bin/sh
set -e
npx prisma migrate deploy
if [ -f scripts/import_hugo_to_db.py ] && [ -d "${CONTENT_DIR:-/content}" ]; then
  python3 scripts/import_hugo_to_db.py || echo "Import skipped or failed"
fi
exec "$@"
