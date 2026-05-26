# Lives of Saints (Web)

Dynamic, database-backed site for Orthodox saints' lives in **English** and **Russian**. Replaces the Hugo static site while preserving URL structure (`/en/january/...`, `/ru/triodion/...`).

This project is **standalone** from [lives-of-saints-hugo](https://github.com/alexeyismirnov/lives-of-saints-hugo). Initial database content is imported by cloning that repo (including git submodules for the `lives` markdown trees).

## Stack

- **Next.js 15** (App Router, SSR)
- **PostgreSQL** + **Prisma**
- **Tailwind CSS**
- **Auth.js** (Phase 2 editor login)

## Quick start (local)

```bash
cd lives-of-saints-web
cp .env.example .env
# Edit .env if needed

docker compose up --build
```

In another terminal (first time only):

```bash
docker compose exec web npx tsx scripts/create_editor_user.ts you@example.com yourpassword
```

(`docker compose` runs migrations, clones Hugo content with submodules, and imports automatically.)

Open [http://localhost:3000/en/](http://localhost:3000/en/)

## Development without Docker

```bash
cd lives-of-saints-web
npm install
cp .env.example .env
# Start Postgres locally and set DATABASE_URL

npx prisma migrate deploy
npm run db:populate    # clone Hugo repo + submodules, seed sections, import entries
npm run create-user -- you@example.com yourpassword
npm run dev
```

### Database population

`npm run db:populate` runs:

1. **`content:fetch`** — clones [lives-of-saints-hugo](https://github.com/alexeyismirnov/lives-of-saints-hugo) into `.content-source/lives-of-saints-hugo` with `git clone --recurse-submodules` (or `git pull` + submodule update if already present). This pulls in:
   - `content/en/lives` → [gitbook-lives-en](https://github.com/alexeyismirnov/gitbook-lives-en)
   - `content/ru/lives` → [gitbook-lives-ru](https://github.com/alexeyismirnov/gitbook-lives-ru)
2. **`db:seed-sections`** — calendar months + Triodion in PostgreSQL
3. **`import:content`** — reads `.content-source/lives-of-saints-hugo/content` by default

Re-run `npm run content:fetch` and `npm run import:content` after upstream Hugo/content changes.

## Environment variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | Random secret for Auth.js (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | Public site URL (e.g. `https://agios.bio`) |
| `CONTENT_DIR` | Optional override for import path (default: `.content-source/lives-of-saints-hugo/content`) |
| `HUGO_SOURCE_REPO` | Optional override for Hugo git URL |

## Railway deployment

1. Create a **PostgreSQL** service and a **Web** service from this directory.
2. Set `DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL` on the web service.
3. **Release command** (image needs `git` for first deploy):  
   `npx prisma migrate deploy && npm run db:populate`
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

## Content source

The Hugo site is **not** a sibling directory of this repo. It is fetched on demand:

```
.content-source/lives-of-saints-hugo/   ← git clone (gitignored)
  content/
    en/lives/   ← submodule
    ru/lives/   ← submodule
    January/ …
```
