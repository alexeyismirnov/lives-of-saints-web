import Link from "next/link";

type Reason = "missing-env" | "unreachable";

const COPY: Record<
  Reason,
  { title: string; body: string; steps: string[] }
> = {
  "missing-env": {
    title: "Database not configured",
    body: "The app needs PostgreSQL. Create a local environment file and start the database.",
    steps: [
      "cp .env.example .env",
      "docker compose up -d db",
      "npx prisma migrate deploy",
      "CONTENT_DIR=../content npm run import:content",
      "npm run dev",
    ],
  },
  unreachable: {
    title: "Cannot reach the database",
    body: "DATABASE_URL is set, but PostgreSQL is not responding. Start the database and try again.",
    steps: [
      "docker compose up -d db",
      "npx prisma migrate deploy",
      "npm run dev",
    ],
  },
};

export function DatabaseSetupRequired({ reason }: { reason: Reason }) {
  const { title, body, steps } = COPY[reason];

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="manuscript-sheet w-full max-w-lg">
        <h1 className="font-display text-3xl font-semibold text-wine-900">{title}</h1>
        <p className="mt-3 font-sans text-sm leading-relaxed text-ink-700">{body}</p>
        <ol className="mt-6 list-decimal space-y-2 pl-5 font-mono text-sm text-ink-800">
          {steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <p className="mt-8 font-sans text-sm text-ink-600">
          See{" "}
          <code className="rounded-sm bg-parchment-200 px-1.5 py-0.5 text-xs">
            lives-of-saints-web/README.md
          </code>{" "}
          for details.
        </p>
        <p className="mt-4 font-sans text-sm">
          <Link
            href="/en/"
            className="text-wine-700 underline decoration-gold-500/40 underline-offset-2 hover:text-wine-900"
          >
            Retry
          </Link>
        </p>
      </div>
    </div>
  );
}

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

export function isDatabaseConnectionError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const name = "name" in error ? String(error.name) : "";
  const message = "message" in error ? String(error.message) : "";
  return (
    name === "PrismaClientInitializationError" ||
    message.includes("Can't reach database server") ||
    message.includes("ECONNREFUSED") ||
    message.includes("Connection refused")
  );
}
