"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Copy,
  ExternalLink,
  GripVertical,
  Palette,
  Plus,
  Share2,
  Trash2,
  Eye,
} from "lucide-react";
import ConversationalForm from "@/components/ConversationalForm";
import {
  QUESTION_TYPES,
  QUESTION_TYPE_LABELS,
  type FormDTO,
  type FormSettings,
  type Question,
  type QuestionType,
} from "@/lib/types";
import { newId } from "@/lib/utils";

const BRAND_PRESETS = ["#6366f1", "#0ea5e9", "#10b981", "#f97316", "#ef4444", "#ec4899", "#8b5cf6", "#111827"];

export default function FormBuilder({ initialForm }: { initialForm: FormDTO }) {
  const [title, setTitle] = useState(initialForm.title);
  const [description, setDescription] = useState(initialForm.description);
  const [slug, setSlug] = useState(initialForm.slug);
  const [questions, setQuestions] = useState<Question[]>(initialForm.questions);
  const [settings, setSettings] = useState<FormSettings>(initialForm.settings);
  const [selected, setSelected] = useState<string | null>(initialForm.questions[0]?.id ?? null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [slugError, setSlugError] = useState("");
  const [tab, setTab] = useState<"preview" | "design" | "share">("preview");
  const [previewKey, setPreviewKey] = useState(0);
  const [origin, setOrigin] = useState("");

  // window isn't available during SSR; sync it once on the client.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setOrigin(window.location.origin), []);

  const draft: FormDTO = useMemo(
    () => ({ ...initialForm, title, description, slug, questions, settings }),
    [initialForm, title, description, slug, questions, settings],
  );

  // Debounced autosave
  const firstRender = useRef(true);
  const dirty = useRef(false);
  const patch = useCallback(
    async (payload: Record<string, unknown>) => {
      setSaveState("saving");
      const res = await fetch(`/api/forms/${initialForm.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (payload.slug) setSlugError(data?.error || "Could not save URL");
        setSaveState("error");
        return;
      }
      if (payload.slug) setSlugError("");
      setSaveState("saved");
    },
    [initialForm.id],
  );

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    dirty.current = true;
    const t = setTimeout(() => {
      if (!dirty.current) return;
      dirty.current = false;
      patch({ title, description, questions, settings });
    }, 700);
    return () => clearTimeout(t);
  }, [title, description, questions, settings, patch]);

  async function saveSlug(newSlug: string) {
    const cleaned = newSlug
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/^-+|-+$/g, "");
    if (!cleaned || cleaned === slug) return;
    setSlug(cleaned);
    await patch({ slug: cleaned });
  }

  async function togglePublish() {
    const next = { ...settings, published: !settings.published };
    setSettings(next);
    await patch({ settings: next });
  }

  function updateQuestion(id: string, patchQ: Partial<Question>) {
    setQuestions((qs) => qs.map((q) => (q.id === id ? { ...q, ...patchQ } : q)));
  }

  function addQuestion() {
    const q: Question = {
      id: newId(),
      type: "short",
      title: "Your question here?",
      required: false,
    };
    setQuestions((qs) => [...qs, q]);
    setSelected(q.id);
    setPreviewKey((k) => k + 1);
  }

  function duplicateQuestion(id: string) {
    setQuestions((qs) => {
      const i = qs.findIndex((q) => q.id === id);
      if (i < 0) return qs;
      const copy = { ...qs[i], id: newId() };
      const next = [...qs];
      next.splice(i + 1, 0, copy);
      return next;
    });
    setPreviewKey((k) => k + 1);
  }

  function deleteQuestion(id: string) {
    setQuestions((qs) => qs.filter((q) => q.id !== id));
    if (selected === id) setSelected(null);
    setPreviewKey((k) => k + 1);
  }

  function moveQuestion(from: number, to: number) {
    if (to < 0 || to >= questions.length || from === to) return;
    setQuestions((qs) => {
      const next = [...qs];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
    setPreviewKey((k) => k + 1);
  }

  // HTML5 drag & drop
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [dragEnabled, setDragEnabled] = useState(false);

  function needsOptions(type: QuestionType) {
    return type === "choice" || type === "multi" || type === "dropdown";
  }

  const publicUrl = `${origin}/f/${slug}`;

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-neutral-200 bg-white px-6 py-3">
        <Link href="/dashboard" className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100">
          <ArrowLeft size={18} />
        </Link>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="min-w-0 flex-1 rounded-lg px-2 py-1.5 text-lg font-bold outline-none hover:bg-neutral-100 focus:bg-neutral-100"
        />
        <span className="hidden text-xs font-medium text-neutral-400 sm:block">
          {saveState === "saving" && "Saving…"}
          {saveState === "saved" && (
            <span className="inline-flex items-center gap-1 text-emerald-600">
              <Check size={13} /> Saved
            </span>
          )}
          {saveState === "error" && <span className="text-red-500">Save failed — retry an edit</span>}
        </span>
        <Link
          href={`/dashboard/forms/${initialForm.id}/responses`}
          className="rounded-lg px-3 py-2 text-sm font-semibold text-neutral-600 hover:bg-neutral-100"
        >
          Responses
        </Link>
        <button
          onClick={togglePublish}
          className={
            "rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm transition " +
            (settings.published ? "bg-neutral-800 hover:bg-neutral-700" : "bg-indigo-500 hover:bg-indigo-400")
          }
        >
          {settings.published ? "Unpublish" : "Publish"}
        </button>
        {settings.published && (
          <a
            href={`/f/${slug}`}
            target="_blank"
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50"
          >
            <ExternalLink size={15} /> View
          </a>
        )}
      </header>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Question list */}
        <div className="w-[420px] shrink-0 overflow-y-auto border-r border-neutral-200 bg-neutral-50 p-5">
          <div className="space-y-3">
            {questions.map((q, i) => (
              <div
                key={q.id}
                draggable={dragEnabled}
                onDragStart={(e) => {
                  setDragIndex(i);
                  e.dataTransfer.effectAllowed = "move";
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverIndex(i);
                }}
                onDragEnd={() => {
                  setDragIndex(null);
                  setDragOverIndex(null);
                  setDragEnabled(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (dragIndex !== null) moveQuestion(dragIndex, i);
                  setDragIndex(null);
                  setDragOverIndex(null);
                  setDragEnabled(false);
                }}
                className={
                  "rounded-xl border bg-white transition " +
                  (selected === q.id ? "border-indigo-400 shadow-md" : "border-neutral-200") +
                  (dragOverIndex === i && dragIndex !== null && dragIndex !== i ? " ring-2 ring-indigo-300" : "")
                }
              >
                <div className="flex items-center gap-1 p-2.5">
                  <span
                    onMouseDown={() => setDragEnabled(true)}
                    onMouseUp={() => setDragEnabled(false)}
                    className="cursor-grab touch-none rounded p-1 text-neutral-300 hover:text-neutral-500"
                    title="Drag to reorder"
                  >
                    <GripVertical size={16} />
                  </span>
                  <button
                    onClick={() => setSelected(selected === q.id ? null : q.id)}
                    className="flex min-w-0 flex-1 items-center gap-2 text-left"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xs font-bold text-neutral-500">
                      {i + 1}
                    </span>
                    <span className="truncate text-sm font-medium">{q.title || "Untitled question"}</span>
                    <span className="ml-auto shrink-0 text-[10px] font-semibold uppercase tracking-wide text-neutral-400">
                      {QUESTION_TYPE_LABELS[q.type]}
                    </span>
                  </button>
                </div>

                {selected === q.id && (
                  <div className="border-t border-neutral-100 px-4 pb-4 pt-3">
                    <input
                      value={q.title}
                      onChange={(e) => updateQuestion(q.id, { title: e.target.value })}
                      placeholder="Question title"
                      className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium outline-none focus:border-indigo-400"
                    />
                    <input
                      value={q.description ?? ""}
                      onChange={(e) => updateQuestion(q.id, { description: e.target.value })}
                      placeholder="Description (optional)"
                      className="mt-2 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
                    />

                    <div className="mt-2 flex gap-2">
                      <select
                        value={q.type}
                        onChange={(e) => {
                          const type = e.target.value as QuestionType;
                          const patchQ: Partial<Question> = { type };
                          if (needsOptions(type) && !q.options) patchQ.options = ["Option 1", "Option 2"];
                          updateQuestion(q.id, patchQ);
                        }}
                        className="flex-1 rounded-lg border border-neutral-200 px-2 py-2 text-sm outline-none focus:border-indigo-400"
                      >
                        {QUESTION_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {QUESTION_TYPE_LABELS[t]}
                          </option>
                        ))}
                      </select>
                      {(q.type === "short" || q.type === "long" || q.type === "email" || q.type === "number") && (
                        <input
                          value={q.placeholder ?? ""}
                          onChange={(e) => updateQuestion(q.id, { placeholder: e.target.value })}
                          placeholder="Placeholder"
                          className="flex-1 rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
                        />
                      )}
                    </div>

                    {needsOptions(q.type) && (
                      <div className="mt-3 space-y-2">
                        {q.options?.map((opt, oi) => (
                          <div key={oi} className="flex items-center gap-2">
                            <input
                              value={opt}
                              onChange={(e) => {
                                const options = [...(q.options ?? [])];
                                options[oi] = e.target.value;
                                updateQuestion(q.id, { options });
                              }}
                              className="flex-1 rounded-lg border border-neutral-200 px-3 py-1.5 text-sm outline-none focus:border-indigo-400"
                            />
                            <button
                              onClick={() =>
                                updateQuestion(q.id, {
                                  options: (q.options ?? []).filter((_, j) => j !== oi),
                                })
                              }
                              className="rounded p-1 text-neutral-300 hover:bg-red-50 hover:text-red-500"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() =>
                            updateQuestion(q.id, { options: [...(q.options ?? []), `Option ${(q.options?.length ?? 0) + 1}`] })
                          }
                          className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-500"
                        >
                          <Plus size={13} /> Add option
                        </button>
                      </div>
                    )}

                    {(q.type === "choice" || q.type === "dropdown" || q.type === "yesno") && (
                      <div className="mt-4 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
                        <p className="text-xs font-bold uppercase tracking-wide text-neutral-400">
                          Skip logic
                        </p>
                        <p className="mt-0.5 text-xs text-neutral-500">
                          Send people to a different question based on their answer.
                        </p>
                        <div className="mt-2 space-y-1.5">
                          {(q.type === "yesno" ? ["Yes", "No"] : q.options ?? []).map((opt) => (
                            <div key={opt} className="flex items-center gap-2 text-xs">
                              <span className="w-28 shrink-0 truncate font-medium text-neutral-600" title={opt}>
                                “{opt}”
                              </span>
                              <span className="text-neutral-400">→</span>
                              <select
                                value={q.jump?.[opt] ?? ""}
                                onChange={(e) => {
                                  const jump = { ...(q.jump ?? {}) };
                                  if (e.target.value) jump[opt] = e.target.value;
                                  else delete jump[opt];
                                  updateQuestion(q.id, { jump: Object.keys(jump).length ? jump : undefined });
                                }}
                                className="flex-1 rounded-lg border border-neutral-200 bg-white px-2 py-1.5 text-xs outline-none focus:border-indigo-400"
                              >
                                <option value="">Continue in order</option>
                                <option value="__end__">Submit the form</option>
                                {questions
                                  .filter((other) => other.id !== q.id)
                                  .map((other) => (
                                    <option key={other.id} value={other.id}>
                                      Go to “{other.title.slice(0, 40)}”
                                    </option>
                                  ))}
                              </select>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {q.type === "rating" && (
                      <label className="mt-3 flex items-center gap-2 text-sm text-neutral-600">
                        Scale
                        <select
                          value={q.maxRating ?? 5}
                          onChange={(e) => updateQuestion(q.id, { maxRating: Number(e.target.value) })}
                          className="rounded-lg border border-neutral-200 px-2 py-1.5 text-sm"
                        >
                          {[3, 4, 5, 7, 10].map((n) => (
                            <option key={n} value={n}>
                              1 – {n}
                            </option>
                          ))}
                        </select>
                      </label>
                    )}

                    <div className="mt-3 flex items-center justify-between">
                      <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-600">
                        <input
                          type="checkbox"
                          checked={q.required}
                          onChange={(e) => updateQuestion(q.id, { required: e.target.checked })}
                          className="h-4 w-4 accent-indigo-500"
                        />
                        Required
                      </label>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => moveQuestion(i, i - 1)}
                          disabled={i === 0}
                          className="rounded p-1.5 text-neutral-400 hover:bg-neutral-100 disabled:opacity-30"
                          title="Move up"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => moveQuestion(i, i + 1)}
                          disabled={i === questions.length - 1}
                          className="rounded p-1.5 text-neutral-400 hover:bg-neutral-100 disabled:opacity-30"
                          title="Move down"
                        >
                          ↓
                        </button>
                        <button
                          onClick={() => duplicateQuestion(q.id)}
                          className="rounded p-1.5 text-neutral-400 hover:bg-neutral-100"
                          title="Duplicate"
                        >
                          <Copy size={14} />
                        </button>
                        <button
                          onClick={() => deleteQuestion(q.id)}
                          className="rounded p-1.5 text-neutral-400 hover:bg-red-50 hover:text-red-500"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={addQuestion}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-neutral-300 py-3 text-sm font-semibold text-neutral-500 transition hover:border-indigo-400 hover:text-indigo-600"
          >
            <Plus size={16} /> Add question
          </button>
        </div>

        {/* Right panel */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-white">
          <div className="flex gap-1 border-b border-neutral-200 px-6 pt-4">
            {(
              [
                ["preview", "Preview", Eye],
                ["design", "Design", Palette],
                ["share", "Share", Share2],
              ] as const
            ).map(([key, label, Icon]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={
                  "flex items-center gap-1.5 border-b-2 px-3 pb-2.5 text-sm font-semibold transition " +
                  (tab === key ? "border-indigo-500 text-indigo-600" : "border-transparent text-neutral-400 hover:text-neutral-600")
                }
              >
                <Icon size={15} /> {label}
              </button>
            ))}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-6">
            {tab === "preview" && (
              <div className="mx-auto max-w-xl">
                {questions.length === 0 ? (
                  <div className="rounded-2xl border-2 border-dashed border-neutral-200 p-16 text-center text-sm text-neutral-400">
                    Add a question to see it come alive here.
                  </div>
                ) : (
                  <>
                    <div className="mb-3 flex items-center justify-between text-xs text-neutral-400">
                      <span>Live preview — click through it like a visitor</span>
                      <button onClick={() => setPreviewKey((k) => k + 1)} className="font-semibold text-indigo-600 hover:text-indigo-500">
                        Restart
                      </button>
                    </div>
                    <div className="overflow-hidden rounded-2xl border border-neutral-200 shadow-lg">
                      <ConversationalForm key={previewKey} form={draft} mode="preview" onRestart={() => setPreviewKey((k) => k + 1)} />
                    </div>
                  </>
                )}
              </div>
            )}

            {tab === "design" && (
              <div className="mx-auto max-w-xl space-y-6">
                <section>
                  <h3 className="text-sm font-bold uppercase tracking-wide text-neutral-400">Brand color</h3>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {BRAND_PRESETS.map((c) => (
                      <button
                        key={c}
                        onClick={() => setSettings({ ...settings, brandColor: c })}
                        className={
                          "h-9 w-9 rounded-full border-2 transition hover:scale-110 " +
                          (settings.brandColor === c ? "border-neutral-900" : "border-transparent")
                        }
                        style={{ background: c }}
                        aria-label={c}
                      />
                    ))}
                    <input
                      type="color"
                      value={settings.brandColor}
                      onChange={(e) => setSettings({ ...settings, brandColor: e.target.value })}
                      className="h-9 w-9 cursor-pointer rounded-full border border-neutral-200 bg-white p-0.5"
                      title="Custom color"
                    />
                  </div>
                </section>

                <section className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold">Dark theme</h3>
                    <p className="text-sm text-neutral-500">Midnight mode for the form surface</p>
                  </div>
                  <button
                    onClick={() => setSettings({ ...settings, theme: settings.theme === "dark" ? "light" : "dark" })}
                    className={
                      "relative h-7 w-12 rounded-full transition " + (settings.theme === "dark" ? "bg-indigo-500" : "bg-neutral-200")
                    }
                  >
                    <span
                      className={
                        "absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all " +
                        (settings.theme === "dark" ? "left-6" : "left-1")
                      }
                    />
                  </button>
                </section>

                <section className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold">Progress bar</h3>
                    <p className="text-sm text-neutral-500">Show completion progress at the top</p>
                  </div>
                  <button
                    onClick={() => setSettings({ ...settings, showProgress: !settings.showProgress })}
                    className={
                      "relative h-7 w-12 rounded-full transition " + (settings.showProgress ? "bg-indigo-500" : "bg-neutral-200")
                    }
                  >
                    <span
                      className={
                        "absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all " +
                        (settings.showProgress ? "left-6" : "left-1")
                      }
                    />
                  </button>
                </section>

                <section className="space-y-3 rounded-xl border border-neutral-200 p-4">
                  <label className="flex items-center gap-2 font-bold">
                    <input
                      type="checkbox"
                      checked={settings.welcomeEnabled}
                      onChange={(e) => setSettings({ ...settings, welcomeEnabled: e.target.checked })}
                      className="h-4 w-4 accent-indigo-500"
                    />
                    Welcome screen
                  </label>
                  {settings.welcomeEnabled && (
                    <>
                      <input
                        value={settings.welcomeTitle ?? ""}
                        onChange={(e) => setSettings({ ...settings, welcomeTitle: e.target.value })}
                        placeholder="Welcome title (defaults to form title)"
                        className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
                      />
                      <input
                        value={settings.welcomeDescription ?? ""}
                        onChange={(e) => setSettings({ ...settings, welcomeDescription: e.target.value })}
                        placeholder="Welcome description"
                        className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
                      />
                      <input
                        value={settings.welcomeButton ?? ""}
                        onChange={(e) => setSettings({ ...settings, welcomeButton: e.target.value })}
                        placeholder="Button label (Start)"
                        className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
                      />
                    </>
                  )}
                </section>

                <section className="space-y-3 rounded-xl border border-neutral-200 p-4">
                  <label className="flex items-center gap-2 font-bold">
                    <input
                      type="checkbox"
                      checked={settings.thankYouEnabled}
                      onChange={(e) => setSettings({ ...settings, thankYouEnabled: e.target.checked })}
                      className="h-4 w-4 accent-indigo-500"
                    />
                    Thank-you screen
                  </label>
                  {settings.thankYouEnabled && (
                    <>
                      <input
                        value={settings.thankYouTitle ?? ""}
                        onChange={(e) => setSettings({ ...settings, thankYouTitle: e.target.value })}
                        placeholder="Thank-you title"
                        className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
                      />
                      <input
                        value={settings.thankYouDescription ?? ""}
                        onChange={(e) => setSettings({ ...settings, thankYouDescription: e.target.value })}
                        placeholder="Thank-you description"
                        className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
                      />
                    </>
                  )}
                </section>

                <section>
                  <h3 className="text-sm font-bold uppercase tracking-wide text-neutral-400">Form description</h3>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Shown under the welcome title and in link previews"
                    className="mt-3 w-full resize-none rounded-xl border border-neutral-200 p-3 text-sm outline-none focus:border-indigo-400"
                  />
                </section>
              </div>
            )}

            {tab === "share" && (
              <div className="mx-auto max-w-xl space-y-6">
                {!settings.published && (
                  <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                    This form is a draft — publish it to start collecting responses.
                  </p>
                )}

                <section>
                  <h3 className="font-bold">Public link</h3>
                  <div className="mt-2 flex items-center gap-2">
                    <code className="min-w-0 flex-1 truncate rounded-lg bg-neutral-100 px-3 py-2.5 text-sm">{publicUrl}</code>
                    <CopyButton text={publicUrl} />
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-sm">
                    <span className="text-neutral-500">Edit URL slug:</span>
                    <input
                      defaultValue={slug}
                      onBlur={(e) => saveSlug(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
                      className="w-48 rounded-lg border border-neutral-200 px-2.5 py-1.5 text-sm outline-none focus:border-indigo-400"
                    />
                    {slugError && <span className="text-xs font-medium text-red-500">{slugError}</span>}
                  </div>
                </section>

                <section>
                  <h3 className="font-bold">QR code</h3>
                  <p className="text-sm text-neutral-500">Perfect for posters, menus and slides.</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/api/qr/${slug}`}
                    alt="QR code to this form"
                    width={160}
                    height={160}
                    className="mt-3 rounded-xl border border-neutral-200"
                  />
                </section>

                <section>
                  <h3 className="font-bold">Get notified</h3>
                  <p className="text-sm text-neutral-500">
                    Fire a Slack or Discord webhook on every new response — paste the incoming-webhook URL.
                  </p>
                  <input
                    value={settings.webhookUrl ?? ""}
                    onChange={(e) => setSettings({ ...settings, webhookUrl: e.target.value })}
                    placeholder="https://hooks.slack.com/services/… or https://discord.com/api/webhooks/…"
                    spellCheck={false}
                    className="mt-2 w-full rounded-lg border border-neutral-200 px-3 py-2.5 font-mono text-xs outline-none focus:border-indigo-400"
                  />
                  <p className="mt-1.5 text-xs text-neutral-400">
                    Saved automatically with the form. The visitor&apos;s submission never waits on it.
                  </p>
                </section>

                <section>
                  <h3 className="font-bold">Embed in a page</h3>
                  <p className="text-sm text-neutral-500">Drop this anywhere HTML is allowed.</p>
                  <CopyField
                    label="Iframe"
                    value={`<iframe src="${origin}/embed/${slug}" width="100%" height="600" style="border:0;border-radius:16px" title="${title}"></iframe>`}
                  />
                  <CopyField
                    label="Popup button"
                    value={`<script async src="${origin}/api/embed.js?id=${slug}&text=Open%20form&color=${encodeURIComponent(settings.brandColor)}"></script>`}
                  />
                </section>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="flex items-center gap-1.5 rounded-lg bg-neutral-800 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-700"
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function CopyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-3">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wide text-neutral-400">{label}</span>
        <CopyButton text={value} />
      </div>
      <pre className="overflow-x-auto rounded-lg bg-neutral-950 p-3 text-xs leading-relaxed text-neutral-300">
        <code>{value}</code>
      </pre>
    </div>
  );
}
