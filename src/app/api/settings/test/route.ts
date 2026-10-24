import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getAIConfig } from "@/lib/ai";

export async function GET() {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const cfg = await getAIConfig();
  if (!cfg) return NextResponse.json({ ok: false });
  try {
    const res = await fetch(`${cfg.baseUrl}/models`, {
      headers: { Authorization: `Bearer ${cfg.key}` },
      signal: AbortSignal.timeout(8000),
    });
    return NextResponse.json({ ok: res.ok, status: res.status });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
