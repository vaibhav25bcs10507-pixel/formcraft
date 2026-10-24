import QRCode from "qrcode";

type Ctx = { params: Promise<{ slug: string }> };

export async function GET(req: Request, { params }: Ctx) {
  const { slug } = await params;
  const url = new URL(`/f/${slug}`, req.url);
  const png = await QRCode.toBuffer(url.toString(), {
    width: 512,
    margin: 2,
    color: { dark: "#111827", light: "#ffffff" },
  });
  return new Response(new Uint8Array(png), {
    headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=3600" },
  });
}
