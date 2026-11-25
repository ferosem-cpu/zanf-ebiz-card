"use client";

import { useState } from "react";

const MAX_BYTES = 4 * 1024 * 1024;

export default function UploadCard() {
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const file = data.get("file") as File | null;
    if (!file || file.size === 0) { setStatus("error"); setMessage("Please choose your business card file."); return; }
    if (file.size > MAX_BYTES) { setStatus("error"); setMessage("The file is larger than 4 MB. Please choose a smaller one."); return; }
    setStatus("sending"); setMessage("");
    try {
      const res = await fetch("/api/upload-card", { method: "POST", body: data });
      const json = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (!res.ok || !json?.ok) { setStatus("error"); setMessage(json?.error || "We could not save your card. Nothing was uploaded."); return; }
      setStatus("done"); form.reset();
    } catch {
      setStatus("error"); setMessage("We could not save your card. Nothing was uploaded.");
    }
  }

  const input = "mt-1 w-full rounded-xl border border-[var(--line-strong)] bg-white px-3 py-2 text-paper";

  if (status === "done") {
    return (
      <div role="status" className="rounded-3xl border border-[var(--line)] bg-ink-raised p-6 text-center shadow-xl shadow-black/10">
        <h2 className="font-display text-xl font-semibold text-paper">Thank you</h2>
        <p className="mt-2 text-steel">We have received your business card.</p>
        <button type="button" onClick={() => setStatus("idle")} className="mt-4 underline text-steel">Upload another</button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-3xl border border-[var(--line)] bg-ink-raised p-6 shadow-xl shadow-black/10">
      <h2 className="font-display text-xl font-semibold text-paper">Share your business card</h2>
      <p className="mt-1 text-sm text-steel">Upload a photo or PDF of your card (JPG, PNG or PDF, up to 4 MB).</p>
      <label className="mt-4 block text-sm text-paper">Your name
        <input name="person" required maxLength={80} autoComplete="name" className={input} />
      </label>
      <label className="mt-3 block text-sm text-paper">Company
        <input name="company" required maxLength={80} autoComplete="organization" className={input} />
      </label>
      <label className="mt-3 block text-sm text-paper">Business card
        <input name="file" type="file" required accept="image/jpeg,image/png,application/pdf" className={input} />
      </label>
      <div aria-hidden="true" style={{ position: "absolute", left: "-9999px" }}>
        <label>Leave empty<input name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>
      {status === "error" && <p role="alert" className="mt-3 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-900">{message}</p>}
      <button type="submit" disabled={status === "sending"} className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-green px-6 py-3 font-medium text-white hover:bg-green-deep disabled:opacity-60">
        {status === "sending" ? "Uploading..." : "Upload card"}
      </button>
    </form>
  );
}
