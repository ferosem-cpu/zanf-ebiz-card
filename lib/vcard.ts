import type { Employee } from "./supabase";

// Builds a .vcf (vCard 3.0) file body for an employee's contact details.
export function buildVCard(employee: Employee): string {
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${employee.name}`,
    `ORG:Zan-F Power Systems`,
    `TITLE:${employee.designation}`,
    `TEL;TYPE=CELL:${normalizePhone(employee.phone)}`,
  ];

  if (employee.whatsapp && employee.whatsapp !== employee.phone) {
    lines.push(`TEL;TYPE=WORK,VOICE:${normalizePhone(employee.whatsapp)}`);
  }

  if (employee.email) {
    lines.push(`EMAIL:${employee.email}`);
  }

  lines.push("URL:https://www.zanf.in");
  lines.push("END:VCARD");

  return lines.join("\r\n");
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length === 12) {
    return `+${digits}`;
  }
  if (digits.length === 10) {
    return `+91${digits}`;
  }
  return phone;
}

export function waLink(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  const withCountryCode = digits.startsWith("91") ? digits : `91${digits}`;
  return `https://wa.me/${withCountryCode}`;
}

export function telLink(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  const withCountryCode = digits.startsWith("91") ? digits : `91${digits}`;
  return `tel:+${withCountryCode}`;
}
