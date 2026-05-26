"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import Link from "next/link";
import { OrnamentalRule } from "@/components/ui/Ornament";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/en/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      setError("Invalid email or password");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="manuscript-sheet w-full max-w-md">
        <OrnamentalRule className="mb-6" />
        <h1 className="mb-6 text-center font-display text-3xl font-semibold text-wine-900">
          Sign in
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="rounded-sm bg-red-50 px-3 py-2 font-sans text-sm text-red-900">
              {error}
            </p>
          )}
          <label className="block">
            <span className="font-sans text-sm font-medium text-wine-800">
              Email
            </span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-sm border border-gold-600/30 bg-parchment-50 px-3 py-2 font-sans focus:border-gold-600 focus:outline-none focus:ring-1 focus:ring-gold-500/40"
            />
          </label>
          <label className="block">
            <span className="font-sans text-sm font-medium text-wine-800">
              Password
            </span>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-sm border border-gold-600/30 bg-parchment-50 px-3 py-2 font-sans focus:border-gold-600 focus:outline-none focus:ring-1 focus:ring-gold-500/40"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="mt-6 text-center font-sans text-sm text-ink-600">
          <Link
            href="/en/"
            className="text-wine-700 underline decoration-gold-500/40 underline-offset-2 hover:text-wine-900"
          >
            ← Back to site
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
