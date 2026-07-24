import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getPublicSupabase, getServiceSupabase } from "@/lib/supabase";
import { telLink, waLink } from "@/lib/vcard";
import ShareButton from "./ShareButton";

export const revalidate = 0; // always fetch fresh - admin edits publish instantly

type Props = {
  params: Promise<{ slug: string }>;
};

async function getCardUrl(slug: string) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.zanf.in";
  return `${siteUrl.replace(/\/$/, "")}/card/${slug}`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = getPublicSupabase();
  const { data: employee } = await supabase
    .from("employees")
    .select("*")
    .eq("slug", slug)
    .single();

  const cardUrl = await getCardUrl(slug);

  if (!employee || !employee.active) {
    return {
      title: "Zan-F Power Systems",
      description: "Cleaner Power, Greener Future",
    };
  }

  const title = `${employee.name} - Zan-F Power Systems`;
  const description = `${employee.designation}, Zan-F Power Systems`;
  const image = employee.photo_url || `${process.env.NEXT_PUBLIC_SITE_URL}/zanf-logo.jpeg`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: cardUrl,
      images: [{ url: image, width: 512, height: 512 }],
      siteName: "Zan-F Power Systems",
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: [image],
    },
  };
}

export default async function CardPage({ params }: Props) {
  const { slug } = await params;
  const supabase = getPublicSupabase();

  const [{ data: employee }, { data: settings }] = await Promise.all([
    supabase.from("employees").select("*").eq("slug", slug).single(),
    supabase.from("company_settings").select("*").eq("id", 1).single(),
  ]);

  if (!employee) {
    notFound();
  }

  const cardUrl = await getCardUrl(slug);
  const slogan = settings?.slogan || "Cleaner Power, Greener Future";

  if (!employee.active) {
    return <DeactivatedCard settings={settings} slogan={slogan} />;
  }

  // Best-effort view count increment - doesn't block rendering if it fails.
  try {
    const service = getServiceSupabase();
    await service
      .from("employees")
      .update({ view_count: employee.view_count + 1 })
      .eq("id", employee.id);
  } catch {
    // Analytics is a nice-to-have; never let it break the card.
  }

  const qrUrl = `/api/qr/${slug}`;
  const mapsQuery = encodeURIComponent(
    "Zan-F Power Systems, Block 1, Jain's Green Acres, Dargah Road, Zamin Pallavaram, Chennai 600043"
  );
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;
  const logoSrc = settings?.logo_url || "/zanf-logo.jpeg";
  const initials = employee.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w: string) => w[0])
    .join("")
    .toUpperCase();

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 py-10">
      <div className="zanf-fade-in flex flex-1 flex-col rounded-3xl border border-[var(--line)] bg-ink-raised p-6 shadow-xl shadow-black/10">
        {/* Logo (top-left) + photo (top-right) */}
        <div className="flex items-start justify-between">
          <div className="h-24 w-24 overflow-hidden rounded-2xl border border-[var(--line-strong)]">
            <Image
              src={logoSrc}
              alt="Zan-F Power Systems"
              width={192}
              height={192}
              className="h-full w-full object-cover"
              priority
            />
          </div>
          {employee.photo_url ? (
            <div className="h-24 w-24 overflow-hidden rounded-full border-2 border-[var(--line-strong)]">
              <Image
                src={employee.photo_url}
                alt={employee.name}
                width={192}
                height={192}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-[var(--line-strong)] bg-green-deep/15 text-2xl font-semibold text-green-deep">
              {initials}
            </div>
          )}
        </div>

        {/* Identity */}
        <div className="mt-4 flex flex-col items-center text-center">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] bg-gradient-to-r from-green to-blue bg-clip-text text-transparent">{slogan}</p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-semibold text-paper">
            {employee.name}
          </h1>
          <p className="mt-1 text-sm text-steel">{employee.designation}</p>
          <p className="text-sm font-medium text-green">Zan-F Power Systems</p>
        </div>

        <div className="zanf-sweep my-5" />

        {/* Contact actions */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <a
            href={telLink(employee.phone)}
            className="flex flex-col items-center gap-1 rounded-xl bg-green-deep/20 px-3 py-3 text-center text-sm font-medium text-paper transition hover:bg-green-deep/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-green"
          >
            <span>Call</span>
            <span className="font-mono text-xs text-steel">{employee.phone}</span>
          </a>
          <a
            href={waLink(employee.whatsapp)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1 rounded-xl bg-blue-deep/20 px-3 py-3 text-center text-sm font-medium text-paper transition hover:bg-blue-deep/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue"
          >
            <span>WhatsApp</span>
            <span className="font-mono text-xs text-steel">{employee.whatsapp}</span>
          </a>
          {employee.email ? (
            <a
              href={`mailto:${employee.email}`}
              className="col-span-2 flex items-center justify-center gap-2 rounded-xl border border-[var(--line)] px-3 py-3 text-sm font-medium text-paper transition hover:border-steel"
            >
              Email &middot; <span className="font-mono text-xs text-steel">{employee.email}</span>
            </a>
          ) : null}
          <a
            href="https://www.zanf.in"
            target="_blank"
            rel="noopener noreferrer"
            className="col-span-2 flex items-center justify-center rounded-xl border border-[var(--line)] px-3 py-3 text-sm font-medium text-paper transition hover:border-steel"
          >
            www.zanf.in
          </a>
          <a
            href={mapsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="col-span-2 flex items-center justify-center rounded-xl border border-[var(--line)] px-3 py-3 text-center text-sm font-medium text-paper transition hover:border-steel"
          >
            Block 1, Jain&apos;s Green Acres, Dargah Road,
            <br />
            Zamin Pallavaram, Chennai 600043
          </a>
        </div>

        {/* Save + Share */}
        <div className="mt-5 flex flex-col gap-3">
          <a
            href={`/api/vcard/${slug}`}
            className="w-full rounded-xl bg-gradient-to-r from-green to-blue py-3 text-center text-sm font-semibold text-ink transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper"
          >
            Save contact
          </a>
          <ShareButton name={employee.name} designation={employee.designation} url={cardUrl} />
        </div>

        {/* QR code */}
        <div className="mt-6 flex flex-col items-center gap-2">
          <div className="rounded-xl border border-[var(--line)] bg-white p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrUrl} alt={`QR code for ${employee.name}'s card`} width={112} height={112} />
          </div>
          <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-steel-dim">
            Scan to open this card
          </p>
        </div>
      </div>
    </main>
  );
}

function DeactivatedCard({
  settings,
  slogan,
}: {
  settings: { fallback_phone: string; fallback_whatsapp: string; fallback_email: string | null; logo_url?: string | null } | null;
  slogan: string;
}) {
  const phone = settings?.fallback_phone || "+919884977994";
  const whatsapp = settings?.fallback_whatsapp || "+919600051672";
  const logoSrc = settings?.logo_url || "/zanf-logo.jpeg";

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 py-10">
      <div className="flex flex-1 flex-col items-center justify-center rounded-3xl border border-[var(--line)] bg-ink-raised p-8 text-center shadow-xl shadow-black/10">
        <div className="h-20 w-20 overflow-hidden rounded-2xl border border-[var(--line-strong)]">
          <Image
            src={logoSrc}
            alt="Zan-F Power Systems"
            width={160}
            height={160}
            className="h-full w-full object-cover"
          />
        </div>
        <p className="mt-3 font-mono text-[11px] font-bold uppercase tracking-[0.2em] bg-gradient-to-r from-green to-blue bg-clip-text text-transparent">{slogan}</p>

        <div className="zanf-sweep my-6" />

        <p className="text-sm text-steel">
          This person is no longer with Zan-F Power Systems.
          <br />
          For assistance, please contact us directly:
        </p>

        <div className="mt-6 flex w-full flex-col gap-3">
          <a
            href={telLink(phone)}
            className="w-full rounded-xl bg-green-deep/20 py-3 text-sm font-medium text-paper transition hover:bg-green-deep/30"
          >
            Call {phone}
          </a>
          <a
            href={waLink(whatsapp)}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full rounded-xl bg-blue-deep/20 py-3 text-sm font-medium text-paper transition hover:bg-blue-deep/30"
          >
            WhatsApp {whatsapp}
          </a>
          <a
            href="https://www.zanf.in"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full rounded-xl border border-[var(--line)] py-3 text-sm font-medium text-paper transition hover:border-steel"
          >
            www.zanf.in
          </a>
        </div>
      </div>
    </main>
  );
}
