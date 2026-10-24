"use client";

import { useState } from "react";
import { Check, Sparkles } from "lucide-react";

export default function AISettingsForm({
  initial,
}: {
  initial: { baseUrl: string; model: string; configured: boolean };
}) {
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState(initial.baseUrl || "https://api.openai.com/v1");
  const [model, setModel] = useState(initial.model || "gpt-4o-mini");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string>("");

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiKey: apiKey || undefined, baseUrl, model }),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setApiKey("");
      setTimeout(() => setSaved(false), 2500);
    }
  }

  async function testConnection() {
    setTesting(true);
    setTestResult("");
    const res = await fetch("/api/settings/test");
    const data = await res.json();
    setTestResult(
      data.ok
        ? `✓ Connected — model "${model}" is ready to generate forms`
        : "⚠ Couldn't reach the provider. Check the base URL and API key, then save.",
    );
    setTesting(false);
  }

  return (
    <form onSubmit={save} className="mt-8 rounded-2xl border border-neutral-200 bg-white p-6">
      <div className="flex items-center gap-2">
        <Sparkles size={18} className="text-indigo-500" />
        <h2 className="font-bold">AI form generation</h2>
        {initial.configured && (
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-600">
            Configured
          </span>
        )}
      </div>
      <p className="mt-1 text-sm text-neutral-500">
        Plug in any OpenAI-compatible API (OpenAI, Groq, Together, Ollama, LM Studio…) to generate
        forms from a description.
      </p>

      <label className="mt-5 block text-sm font-semibold">API key</label>
      <input
        type="password"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        placeholder={initial.configured ? "•••••• stored (leave blank to keep)" : "sk-…"}
        className="mt-1.5 w-full rounded-lg border border-neutral-200 px-3 py-2.5 font-mono text-sm outline-none focus:border-indigo-400"
      />

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-semibold">Base URL</label>
          <input
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-neutral-200 px-3 py-2.5 font-mono text-sm outline-none focus:border-indigo-400"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold">Model</label>
          <input
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-neutral-200 px-3 py-2.5 font-mono text-sm outline-none focus:border-indigo-400"
          />
        </div>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          onClick={testConnection}
          disabled={testing}
          className="rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-semibold text-neutral-600 transition hover:bg-neutral-50 disabled:opacity-50"
        >
          {testing ? "Testing…" : "Test connection"}
        </button>
        {saved && (
          <span className="flex items-center gap-1 text-sm font-medium text-emerald-600">
            <Check size={15} /> Saved
          </span>
        )}
      </div>
      {testResult && <p className="mt-3 text-sm text-neutral-600">{testResult}</p>}
    </form>
  );
}
