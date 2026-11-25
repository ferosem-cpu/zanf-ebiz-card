import Image from "next/image";
import type { Metadata } from "next";
import QRCode from "qrcode";
import { company } from "@/lib/company";
import UploadCard from "./UploadCard";

export const metadata: Metadata = {
  title: "Zanf Power Systems | Digital Business Card",
  description: "Scan the QR code or download the contact card for Zanf Power Systems.",
};

// Read the environment on each request so the upload form appears as soon as Drive is connected.
export const dynamic = "force-dynamic";

export default async function Home() {
  const vcfUrl = `${company.cardSiteUrl}/zanf-power-systems.vcf`;
  const qr = await QRCode.toDataURL(vcfUrl, { width: 640, margin: 2, color: { dark: "#0e1512", light: "#ffffff" } });

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-5 py-10">
      <div className="zanf-fade-in rounded-3xl border border-[var(--line)] bg-ink-raised p-8 text-center shadow-xl shadow-black/10">
        <div className="mx-auto h-20 w-20 overflow-hidden rounded-2xl border border-[var(--line-strong)]">
          <Image src="/zanf-logo.jpeg" alt={company.name} width={160} height={160} className="h-full w-full object-cover" priority />
        </div>
        <h1 className="mt-5 font-display text-2xl font-semibold text-paper">{company.name}</h1>
        <p className="mt-2 text-steel">Scan the QR code with your phone camera to save our contact.</p>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qr} alt={`QR code to save the ${company.name} contact`} width={256} height={256} className="mx-auto mt-5 h-64 w-64 rounded-xl border border-[var(--line-strong)]" />

        <a
          href="/zanf-power-systems.vcf"
          download
          className="mt-5 inline-flex items-center justify-center rounded-full bg-green px-6 py-3 font-medium text-white hover:bg-green-deep"
        >
          Download contact (.vcf)
        </a>

        <div className="zanf-sweep my-6" />
        <ul className="space-y-1 text-left text-sm text-steel">
          <li><span className="font-medium text-paper">Phone / WhatsApp:</span> <a className="underline" href={`tel:${company.phoneE164}`}>{company.phoneDisplay}</a></li>
          <li><span className="font-medium text-paper">Email:</span> <a className="underline" href={`mailto:${company.email}`}>{company.email}</a></li>
          <li><span className="font-medium text-paper">Website:</span> <a className="underline" href={company.website}>zanf.org</a></li>
          <li><span className="font-medium text-paper">Address:</span> {company.street}, {company.city} {company.postalCode}</li>
        </ul>
      </div>

      {process.env.DRIVE_UPLOAD_URL && process.env.DRIVE_UPLOAD_SECRET ? <UploadCard /> : null}
    </main>
  );
}
