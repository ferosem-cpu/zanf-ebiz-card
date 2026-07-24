import { createClient } from "@supabase/supabase-js";

// Public client — safe for the browser. Used for reading active cards.
// RLS policies (see supabase/schema.sql) only allow public SELECT, no writes.
export function getPublicSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "Missing Supabase public env vars. Copy .env.local.example to .env.local and fill in your project's URL and anon key."
    );
  }
  return createClient(url, anonKey);
}

// Server-only client — uses the service_role key, which bypasses Row Level
// Security. Only import this inside server components, route handlers, or
// server actions. Never send this client or its key to the browser.
export function getServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "Missing Supabase service env vars. Set SUPABASE_SERVICE_ROLE_KEY in .env.local (server-side only)."
    );
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}

export type Employee = {
  id: string;
  slug: string;
  name: string;
  designation: string;
  phone: string;
  whatsapp: string;
  email: string | null;
  photo_url: string | null;
  active: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
};

export type CompanySettings = {
  id: number;
  fallback_phone: string;
  fallback_whatsapp: string;
  fallback_email: string | null;
  slogan: string;
  logo_url: string | null;
};
