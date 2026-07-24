import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";

// Public endpoint: generates a QR code PNG pointing at a card's public URL.
// Encoding the URL isn't sensitive, so this doesn't need admin protection -
// it's used both for the on-page QR preview and the admin "download PNG" button.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.zanf.in";
  const cardUrl = `${siteUrl.replace(/\/$/, "")}/card/${slug}`;

  const buffer = await QRCode.toBuffer(cardUrl, {
    width: 640,
    margin: 2,
    color: {
      dark: "#0e1512",
      light: "#ffffff",
    },
  });

  const download = request.nextUrl.searchParams.get("download");

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=3600",
      ...(download
        ? { "Content-Disposition": `attachment; filename="${slug}-qr.png"` }
        : {}),
    },
  });
}
