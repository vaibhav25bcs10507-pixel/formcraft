"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Sparkles } from "lucide-react";
import { TEMPLATES } from "@/lib/templates";

type Tab = "start" | "ai";

export default function NewFormButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("start");
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function create(body: Record<string, unknown>, label: string) {
    setBusy(label);
    setError("");
    const res = await fetch("/api/forms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(null);
    if (!res.ok) {
      setError(data?.error || "Failed to create form");
      return;
    }
    setOpen(false);
    router.push(`/dashboard/forms/${data.id}`);
  }

  async function generateAI() {
    setBusy("ai");
    setError("");
    const res = await fetch("/api/ai/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(null);
    if (!res.ok) {
      setError(data?.error || "AI generation failed");
      return;
    }
    setOpen(false);
    router.push(`/dashboard/forms/${data.id}`);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-400"
      >
        <Plus size={16} /> New form
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Create a form</h2>
              <button onClick={() => setOpen(false)} className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-100">
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 flex gap-1 rounded-xl bg-neutral-100 p-1">
              <button
                onClick={() => setTab("start")}
                className={
                  "flex-1 rounded-lg px-3 py-1.5 text-sm font-semibold transition " +
                  (tab === "start" ? "bg-white shadow" : "text-neutral-500")
                }
              >
                Templates
              </button>
              <button
                onClick={() => setTab("ai")}
                className={
                  "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition " +
                  (tab === "ai" ? "bg-white shadow" : "text-neutral-500")
                }
              >
                <Sparkles size={14} /> Generate with AI
              </button>
            </div>

            {tab === "start" ? (
              <div className="mt-4 space-y-2">
                <button
                  disabled={!!busy}
                  onClick={() => create({}, "blank")}
                  className="w-full rounded-xl border border-neutral-200 p-4 text-left transition hover:border-indigo-300 disabled:opacity-50"
                >
                  <span className="text-lg">📝</span>
                  <span className="ml-2 font-bold">Blank form</span>
                  <span className="block text-sm text-neutral-500">Start from a single question</span>
                </button>
                {TEMPLATES.map((t) => (
                  <button
                    key={t.key}
                    disabled={!!busy}
                    onClick={() => create({ template: t.key }, t.key)}
                    className="w-full rounded-xl border border-neutral-200 p-4 text-left transition hover:border-indigo-300 disabled:opacity-50"
                  >
                    <span className="text-lg">{t.emoji}</span>
                    <span className="ml-2 font-bold">{t.name}</span>
                    <span className="block text-sm text-neutral-500">{t.description}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="mt-4">
                <textarea
                  rows={4}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. A feedback form for my coffee shop — ask about their visit, what they ordered, and how likely they are to come back"
                  className="w-full resize-none rounded-xl border border-neutral-200 p-3 text-sm outline-none placeholder:text-neutral-400 focus:border-indigo-400"
                />
                <button
                  onClick={generateAI}
                  disabled={!!busy || prompt.trim().length < 4}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 py-2.5 font-semibold text-white transition hover:bg-indigo-400 disabled:opacity-50"
                >
                  <Sparkles size={15} />
                  {busy === "ai" ? "Generating…" : "Generate form"}
                </button>
                <p className="mt-2 text-center text-xs text-neutral-400">
                  Configure any OpenAI-compatible API key in Settings first.
                </p>
              </div>
            )}

            {error && (
              <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
