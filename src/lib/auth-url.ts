function isInvalidAuthUrl(value: string | undefined): boolean {
  if (!value) return true;
  const trimmed = value.trim();
  if (!trimmed || trimmed === "https://" || trimmed === "http://") return true;
  if (trimmed.includes("${{")) return true;
  try {
    const url = new URL(trimmed);
    return url.hostname.length === 0;
  } catch {
    return true;
  }
}

/** Resolve a valid Auth.js base URL (origin only). */
export function resolveAuthBaseUrl(): string | undefined {
  const candidates = [
    process.env.AUTH_URL,
    process.env.NEXTAUTH_URL,
    process.env.RAILWAY_STATIC_URL,
    process.env.RAILWAY_PUBLIC_DOMAIN
      ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
      : undefined,
  ];

  for (const raw of candidates) {
    if (!raw || isInvalidAuthUrl(raw)) continue;
    try {
      return new URL(raw.trim()).origin;
    } catch {
      continue;
    }
  }
  return undefined;
}

/** Fix invalid Railway template values like NEXTAUTH_URL=https://${{RAILWAY_PUBLIC_DOMAIN}} */
export function sanitizeAuthEnv(): void {
  const resolved = resolveAuthBaseUrl();
  if (resolved) {
    process.env.AUTH_URL = resolved;
    process.env.NEXTAUTH_URL = resolved;
    return;
  }

  if (isInvalidAuthUrl(process.env.NEXTAUTH_URL)) {
    delete process.env.NEXTAUTH_URL;
  }
  if (isInvalidAuthUrl(process.env.AUTH_URL)) {
    delete process.env.AUTH_URL;
  }
}
