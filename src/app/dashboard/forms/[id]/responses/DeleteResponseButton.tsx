"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export default function DeleteResponseButton({ responseId }: { responseId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function remove() {
    if (!window.confirm("Delete this response permanently?")) return;
    setBusy(true);
    await fetch(`/api/responses/${responseId}`, { method: "DELETE" });
    setBusy(false);
    router.refresh();
  }

  return (
    <button
      onClick={remove}
      disabled={busy}
      className="rounded-md px-2 py-1 text-xs font-semibold text-neutral-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-40"
    >
      <Trash2 size={13} className="inline" /> Delete response
    </button>
  );
}
