# Lives of Saints (Web)

Dynamic, database-backed site for Orthodox saints' lives in **English** and **Russian**. Replaces the Hugo static site while preserving URL structure (`/en/january/...`, `/ru/triodion/...`).

This project lives in **`lives-of-saints-web/`**, separate from the Hugo `content/` and `themes/` in the parent repo.

## Stack

- **Next.js 15** (App Router, SSR)
- **PostgreSQL** + **Prisma**
- **Tailwind CSS**
- **Auth.js** (Phase 2 editor login)
- Import: **Python** [`scripts/import_hugo_to_db.py`](scripts/import_hugo_to_db.py)

## Quick start (local)

```bash
cd lives-of-saints-web
cp .env.example .env
# Edit .env if needed

docker compose up --build
```

In another terminal (first time only):

```bash
docker compose exec web npx prisma migrate deploy
docker compose exec web npm run import:content
docker compose exec web npx tsx scripts/create_editor_user.ts you@example.com yourpassword
```

Open [http://localhost:3000/en/](http://localhost:3000/en/)

## Development without Docker

```bash
cd lives-of-saints-web
npm install
cp .env.example .env
# Start Postgres locally and set DATABASE_URL

npx prisma migrate deploy
npm run db:seed-sections
CONTENT_DIR=../content npm run import:content
npm run create-user -- you@example.com yourpassword
npm run dev
```

If you see **Internal Server Error** (especially on `/login/` or `/edit/new/`):

1. Stop **all** running `next dev` processes for this project (only one dev server may use `.next`).
2. Clear the build cache and restart:

```bash
npm run dev:clean
```

3. Sign in at `/login/` before opening `/edit/new/`.
4. If login worked before but fails after changing `AUTH_SECRET`, clear site cookies for `localhost` or use a private window.

`npm run dev:fresh` also tries to stop other dev servers in this repo before cleaning `.next`.

## Environment variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | Random secret for Auth.js (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | Public site URL (e.g. `https://agios.bio`) |
| `CONTENT_DIR` | Path to Hugo `content/` for import (default `../content`) |

## Railway deployment

1. Create a **PostgreSQL** service and a **Web** service from this directory.
2. Set `DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL` on the web service.
3. **Release command**: `npx prisma migrate deploy && npm run import:content`  
   (mount or copy parent `content/` into the image, or run import from CI once.)
4. Deploy; point custom domain to the web service.

## Routes

| Path | Description |
|------|-------------|
| `/en/`, `/ru/` | Home (author intro) |
| `/{lang}/{month}/` | Month index (grouped by day) |
| `/{lang}/triodion/` | Triodion index |
| `/{lang}/{section}/{slug}/` | Saint article |
| `/login/` | Editor sign-in |
| `/edit/new/` | Create entry (auth required) |
| `/edit/{lang}/{section}/{slug}/` | Edit entry |

## Parent Hugo content

Import reads from `../content` (sibling to this folder). The Hugo site remains in the repo for reference and re-import.
