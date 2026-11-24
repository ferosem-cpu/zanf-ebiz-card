import Image from "next/image";
import type { Metadata } from "next";

// The root of this app has no card to show - each card lives at /card/[slug] and the
// admin panel at /card/admin. Show a small landing page here instead of redirecting
// visitors away to another website. It lists no staff or card details.
export const metadata: Metadata = {
  title: "ZAN-F Digital Business Cards",
  description: "Digital business cards for the team at ZAN-F Power Systems.",
};

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 py-10">
      <div className="zanf-fade-in rounded-3xl border border-[var(--line)] bg-ink-raised p-8 text-center shadow-xl shadow-black/10">
        <div className="mx-auto h-24 w-24 overflow-hidden rounded-2xl border border-[var(--line-strong)]">
          <Image
            src="/zanf-logo.jpeg"
            alt="ZAN-F Power Systems"
            width={192}
            height={192}
            className="h-full w-full object-cover"
            priority
          />
        </div>
        <h1 className="mt-6 font-display text-2xl font-semibold text-paper">
          ZAN-F Digital Business Cards
        </h1>
        <p className="mt-3 text-steel">
          Each member of our team has a personal digital card. Scan their QR code, or open the
          link they shared with you, to save their contact details.
        </p>
        <div className="zanf-sweep my-6" />
        <a
          href="https://zanf.org"
          className="inline-flex items-center justify-center rounded-full bg-green px-6 py-3 font-medium text-white hover:bg-green-deep"
        >
          Visit zanf.org
        </a>
      </div>
    </main>
  );
}
