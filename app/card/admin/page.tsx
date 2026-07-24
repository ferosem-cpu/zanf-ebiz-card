"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Something went wrong. Try again.");
      return;
    }

    router.push("/card/admin/dashboard");
    router.refresh();
  }

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center px-5 py-10">
      <div className="w-full rounded-3xl border border-[var(--line)] bg-ink-raised p-8 shadow-xl shadow-black/10">
        <div className="flex flex-col items-center text-center">
          <div className="h-16 w-16 overflow-hidden rounded-2xl border border-[var(--line-strong)]">
            <Image src="/zanf-logo.jpeg" alt="Zan-F" width={128} height={128} className="h-full w-full object-cover" />
          </div>
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-xl font-semibold text-paper">
            Card admin
          </h1>
          <p className="mt-1 text-sm text-steel">Sign in to manage employee cards</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div>
            <label htmlFor="password" className="mb-1 block text-xs font-medium uppercase tracking-wide text-steel-dim">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-[var(--line-strong)] bg-transparent px-4 py-3 text-paper outline-none focus:border-blue"
            />
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-xl bg-gradient-to-r from-green to-blue py-3 text-sm font-semibold text-ink transition hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
