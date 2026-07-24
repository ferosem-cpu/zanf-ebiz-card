import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function GET() {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("employees")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ employees: data });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, designation, phone, whatsapp, email, photo_url, slug } = body;

  if (!name || !designation || !phone || !whatsapp) {
    return NextResponse.json(
      { error: "Name, designation, phone, and WhatsApp number are required." },
      { status: 400 }
    );
  }

  const finalSlug = slugify(slug || name);

  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("employees")
    .insert({
      name,
      designation,
      phone,
      whatsapp,
      email: email || null,
      photo_url: photo_url || null,
      slug: finalSlug,
    })
    .select()
    .single();

  if (error) {
    const message = error.code === "23505"
      ? `The slug "${finalSlug}" is already in use. Choose a different custom slug.`
      : error.message;
    return NextResponse.json({ error: message }, { status: 400 });
  }

  return NextResponse.json({ employee: data });
}
