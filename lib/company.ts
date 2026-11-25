// Company contact details. Keep in step with the ZAN-F website (zanf.org, src/config/site.ts).
export const company = {
  name: "Zanf Power Systems",
  phoneDisplay: "+91 95002 45599",
  phoneE164: "+919500245599",
  whatsappHref: "https://wa.me/919500245599",
  email: "info@zanf.org",
  website: "https://zanf.org",
  street: "Block 1, Jain's Green Acres, Dargah Road, Zamin Pallavaram",
  city: "Chennai",
  region: "Tamil Nadu",
  postalCode: "600043",
  country: "India",
  cardSiteUrl: "https://vcard.zanf.org",
} as const;

const esc = (v: string) => v.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,");

// vCard 3.0 body for the company contact.
export function buildCompanyVCard(): string {
  return [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:;${esc(company.name)};;;`,
    `FN:${esc(company.name)}`,
    `ORG:${esc(company.name)}`,
    `TEL;TYPE=WORK,VOICE,CELL:${company.phoneE164}`,
    `EMAIL;TYPE=WORK:${company.email}`,
    `URL:${company.website}`,
    `ADR;TYPE=WORK:;;${esc(company.street)};${esc(company.city)};${esc(company.region)};${company.postalCode};${esc(company.country)}`,
    "END:VCARD",
  ].join("\r\n");
}
