import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getAIConfig, saveAIConfig } from "@/lib/ai";

export async function GET() {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const cfg = await getAIConfig();
  return NextResponse.json({
    configured: !!cfg,
    baseUrl: cfg?.baseUrl ?? "",
    model: cfg?.model ?? "",
    hasKey: !!cfg?.key,
  });
}

export async function POST(req: Request) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  await saveAIConfig({
    key: typeof body.apiKey === "string" && body.apiKey.trim() ? body.apiKey.trim() : undefined,
    baseUrl: typeof body.baseUrl === "string" && body.baseUrl.trim() ? body.baseUrl.trim() : undefined,
    model: typeof body.model === "string" && body.model.trim() ? body.model.trim() : undefined,
  });
  const cfg = await getAIConfig();
  return NextResponse.json({ ok: true, configured: !!cfg, baseUrl: cfg?.baseUrl, model: cfg?.model });
}
