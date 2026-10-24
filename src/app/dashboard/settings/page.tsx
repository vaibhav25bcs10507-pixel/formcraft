import { getAIConfig } from "@/lib/ai";
import AISettingsForm from "./AISettingsForm";

export default async function SettingsPage() {
  const cfg = await getAIConfig();
  return (
    <div className="mx-auto max-w-2xl px-8 py-10">
      <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
      <p className="mt-1 text-sm text-neutral-500">Workspace configuration.</p>

      <AISettingsForm
        initial={{ baseUrl: cfg?.baseUrl ?? "", model: cfg?.model ?? "", configured: !!cfg }}
      />

      <section className="mt-10 rounded-2xl border border-neutral-200 bg-white p-6">
        <h2 className="font-bold">Self-hosting info</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-neutral-500">Data location</dt>
            <dd className="font-mono text-xs">./data/formcraft.db (SQLite)</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-neutral-500">Admin credentials</dt>
            <dd className="font-mono text-xs">ADMIN_EMAIL / ADMIN_PASSWORD env</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-neutral-500">License</dt>
            <dd className="text-xs">AGPL-3.0 — free to self-host forever</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
