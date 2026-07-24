import { NextRequest, NextResponse } from "next/server";
import { getPublicSupabase } from "@/lib/supabase";
import { buildVCard } from "@/lib/vcard";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = getPublicSupabase();

  const { data: employee, error } = await supabase
    .from("employees")
    .select("*")
    .eq("slug", slug)
    .eq("active", true)
    .single();

  if (error || !employee) {
    return NextResponse.json({ error: "Card not found." }, { status: 404 });
  }

  const vcard = buildVCard(employee);
  return new NextResponse(vcard, {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": `attachment; filename="${employee.slug}.vcf"`,
    },
  });
}
