"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Trash2, Check } from "lucide-react";

export default function FormCardActions({ formId, title }: { formId: string; title: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function duplicate() {
    setBusy("dup");
    await fetch(`/api/forms/${formId}/duplicate`, { method: "POST" });
    setBusy(null);
    router.refresh();
  }

  async function remove() {
    if (!window.confirm(`Delete “${title}” and all its responses? This cannot be undone.`)) return;
    setBusy("del");
    await fetch(`/api/forms/${formId}`, { method: "DELETE" });
    setBusy(null);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={duplicate}
        disabled={!!busy}
        title="Duplicate form"
        className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-neutral-400 transition hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-40"
      >
        {busy === "dup" ? <Check size={13} /> : <Copy size={13} />} Duplicate
      </button>
      <button
        onClick={remove}
        disabled={!!busy}
        title="Delete form"
        className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-neutral-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-40"
      >
        <Trash2 size={13} /> Delete
      </button>
    </div>
  );
}
