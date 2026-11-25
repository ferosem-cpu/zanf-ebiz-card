import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_BYTES = 4 * 1024 * 1024;
const TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "application/pdf": "pdf" };

const clean = (v: string) => v.normalize("NFKC").replace(/[^\p{L}\p{N} .'&()-]/gu, " ").replace(/\s+/g, " ").trim().slice(0, 60);

// Public upload: saves a visitor's business card to Google Drive as "<Company> - <Person>.<ext>".
// The Drive side is a small Google Apps Script web app owned by the company's Google account.
// DRIVE_UPLOAD_URL and DRIVE_UPLOAD_SECRET come from the environment; nothing secret is in code.
export async function POST(request: Request) {
  const url = process.env.DRIVE_UPLOAD_URL?.trim();
  const secret = process.env.DRIVE_UPLOAD_SECRET?.trim();
  if (!url || !secret) {
    return NextResponse.json({ ok: false, error: "Card upload is not switched on yet. Nothing was uploaded." }, { status: 503 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  if (String(form.get("website") || "")) return NextResponse.json({ ok: true }); // honeypot

  const person = clean(String(form.get("person") || ""));
  const comp = clean(String(form.get("company") || ""));
  const file = form.get("file");
  if (!person || !comp) return NextResponse.json({ ok: false, error: "Please enter your name and company." }, { status: 422 });
  if (!(file instanceof File) || file.size === 0) return NextResponse.json({ ok: false, error: "Please choose a file." }, { status: 422 });
  if (file.size > MAX_BYTES) return NextResponse.json({ ok: false, error: "The file is larger than 4 MB." }, { status: 413 });
  const ext = TYPES[file.type];
  if (!ext) return NextResponse.json({ ok: false, error: "Only JPG, PNG or PDF files are accepted." }, { status: 415 });

  const bytes = Buffer.from(await file.arrayBuffer());
  // Check the real file signature, not just the declared type.
  const sig = bytes.subarray(0, 4).toString("hex");
  const okSig = (ext === "jpg" && sig.startsWith("ffd8ff")) || (ext === "png" && sig === "89504e47") || (ext === "pdf" && sig === "25504446");
  if (!okSig) return NextResponse.json({ ok: false, error: "That file does not look like a JPG, PNG or PDF." }, { status: 415 });

  try {
    const res = await fetch(url, {
      method: "POST",
      redirect: "follow",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ secret, fileName: `${comp} - ${person}.${ext}`, mimeType: file.type, data: bytes.toString("base64") }),
      signal: AbortSignal.timeout(25000),
    });
    const out = (await res.json().catch(() => null)) as { ok?: boolean } | null;
    if (!res.ok || !out?.ok) throw new Error("drive");
    return NextResponse.json({ ok: true });
  } catch {
    console.error("[upload-card] Drive save failed");
    return NextResponse.json({ ok: false, error: "We could not save your card. Nothing was uploaded." }, { status: 502 });
  }
}
