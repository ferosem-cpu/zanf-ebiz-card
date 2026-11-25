import { buildCompanyVCard } from "@/lib/company";

// Public: the company contact card. The QR code on the home page points here.
export async function GET() {
  return new Response(buildCompanyVCard(), {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": 'attachment; filename="Zanf-Power-Systems.vcf"',
      "Cache-Control": "public, max-age=3600",
    },
  });
}
