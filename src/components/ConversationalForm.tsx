"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import type { AnswerMap, FormDTO, Question } from "@/lib/types";
import { cn } from "@/lib/utils";

type Mode = "live" | "preview";

type Props = {
  form: FormDTO;
  mode?: Mode;
  onRestart?: () => void;
  embedded?: boolean;
};

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export default function ConversationalForm({ form, mode = "live", onRestart, embedded }: Props) {
  const { questions, settings } = form;
  const total = questions.length;
  const [stage, setStage] = useState<"welcome" | number | "done">(settings.welcomeEnabled ? "welcome" : 0);
  const [history, setHistory] = useState<number[]>([]);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const answersRef = useRef<AnswerMap>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const startedAt = useRef(0);
  const hpRef = useRef<HTMLInputElement>(null);

  const dark = settings.theme === "dark";
  const brand = settings.brandColor || "#6366f1";
  const [r, g, b] = useMemo(() => hexToRgb(brand), [brand]);

  // Measure total fill time once, for the server-side time-trap.
  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  // Choice/rating/yesno buttons set an answer and advance shortly after;
  // advance() must then see the fresh value, not the click-time snapshot.
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  function validate(q: Question, value: AnswerMap[string] | undefined): string | null {
    const empty =
      value === undefined ||
      value === "" ||
      (Array.isArray(value) && value.length === 0) ||
      (typeof value === "number" && Number.isNaN(value));
    if (empty) return q.required ? "This one is required" : null;
    if (q.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))) {
      return "That email doesn't look right";
    }
    if (q.type === "number" && Number.isNaN(Number(value))) return "Please enter a number";
    return null;
  }

  function setAnswer(id: string, v: AnswerMap[string]) {
    setAnswers((a) => ({ ...a, [id]: v }));
    setErrors((e) => {
      if (!e[id]) return e;
      const next = { ...e };
      delete next[id];
      return next;
    });
  }

  async function submit(finalAnswers: AnswerMap) {
    if (mode === "preview") {
      setStage("done");
      return;
    }
    setSubmitting(true);
    setServerError("");
    try {
      const res = await fetch(`/api/public/submit/${form.slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: finalAnswers,
          _hp: hpRef.current?.value ?? "",
          _t: Date.now() - startedAt.current,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data?.errors) {
          setErrors(data.errors);
          const firstBad = questions.findIndex((q) => data.errors[q.id]);
          if (firstBad >= 0) {
            setStage(firstBad);
          }
          return;
        }
        setServerError(data?.error || "Something went wrong. Please try again.");
        return;
      }
      setStage("done");
    } catch {
      setServerError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // Where should we go after answering question `at`? Handles skip logic.
  function nextStageAfter(at: number): number | "submit" {
    const q = questions[at];
    if (q.jump) {
      const v = answersRef.current[q.id];
      const key = Array.isArray(v) ? String(v[0]) : String(v ?? "");
      const target = q.jump[key];
      if (target === "__end__") return "submit";
      if (target) {
        const idx = questions.findIndex((x) => x.id === target);
        if (idx >= 0 && idx !== at) return idx;
      }
    }
    return at + 1; // natural flow; >= total means submit
  }

  function goTo(next: number | "welcome" | "done") {
    setHistory((h) => (typeof stage === "number" ? [...h, stage] : h));
    setStage(next);
  }

  function advance() {
    if (stage === "welcome") {
      goTo(total > 0 ? 0 : "done");
      return;
    }
    if (stage === "done" || typeof stage !== "number") return;
    const q = questions[stage];
    const currentAnswers = answersRef.current;
    const err = validate(q, currentAnswers[q.id]);
    if (err) {
      setErrors((e) => ({ ...e, [q.id]: err }));
      return;
    }
    const next = nextStageAfter(stage);
    if (next === "submit" || next >= total) {
      submit(currentAnswers);
    } else {
      goTo(next);
    }
  }

  function back() {
    if (stage === "done") {
      if (history.length > 0) {
        setStage(history[history.length - 1]);
        setHistory((h) => h.slice(0, -1));
      } else {
        setStage(Math.max(0, total - 1));
      }
      return;
    }
    if (typeof stage !== "number") return;
    if (history.length > 0) {
      // retrace the exact path the visitor took (skips included)
      setStage(history[history.length - 1]);
      setHistory((h) => h.slice(0, -1));
      return;
    }
    if (stage === 0 && settings.welcomeEnabled) {
      setStage("welcome");
      return;
    }
    if (stage > 0) {
      setStage(stage - 1);
    }
  }

  const surface = dark
    ? "bg-neutral-950 text-neutral-100"
    : "bg-white text-neutral-900";
  const muted = dark ? "text-neutral-400" : "text-neutral-500";
  const cardBorder = dark ? "border-neutral-800" : "border-neutral-200";

  const progress =
    stage === "done" ? 100 : typeof stage === "number" ? ((stage + 1) / total) * 100 : 0;

  return (
    <div
      className={cn("relative flex min-h-full w-full flex-col", surface, embedded ? "" : "min-h-[560px]")}
      style={
        {
          ["--brand" as string]: brand,
          ["--brand-soft" as string]: `rgba(${r},${g},${b},0.08)`,
          ["--brand-ring" as string]: `rgba(${r},${g},${b},0.35)`,
        } as React.CSSProperties
      }
    >
      {settings.showProgress && total > 0 && (
        <div className={cn("h-1 w-full", dark ? "bg-neutral-800" : "bg-neutral-100")}>
          <div
            className="h-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%`, background: brand }}
          />
        </div>
      )}

      {/* Honeypot: invisible to humans, catnip for bots */}
      <input
        ref={hpRef}
        type="text"
        name="formcraft_website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="pointer-events-none absolute left-[-9999px] h-0 w-0 opacity-0"
      />

      <div className="flex flex-1 items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-xl">
          {stage === "welcome" && (
            <div key="welcome" className="formcraft-anim">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {settings.welcomeTitle || form.title}
              </h1>
              {(settings.welcomeDescription || form.description) && (
                <p className={cn("mt-4 text-lg", muted)}>
                  {settings.welcomeDescription || form.description}
                </p>
              )}
              {total > 0 && (
                <p className={cn("mt-6 text-sm font-medium", muted)}>
                  {total} {total === 1 ? "question" : "questions"} — takes about a minute
                </p>
              )}
              <AdvanceButton
                label={settings.welcomeButton || "Start"}
                brand={brand}
                dark={dark}
                onClick={advance}
              />
            </div>
          )}

          {typeof stage === "number" && questions[stage] && (
            <QuestionCard
              key={`q-${stage}`}
              q={questions[stage]}
              index={stage}
              total={total}
              value={answers[questions[stage].id]}
              error={errors[questions[stage].id]}
              dark={dark}
              cardBorder={cardBorder}
              muted={muted}
              brand={brand}
              onChange={(v) => setAnswer(questions[stage].id, v)}
              onAdvance={advance}
              onBack={back}
              submitting={submitting}
            />
          )}

          {stage === "done" && (
            <div key="done" className="formcraft-anim text-center">
              <div
                className="mx-auto flex h-16 w-16 items-center justify-center rounded-full text-3xl"
                style={{ background: "var(--brand-soft)" }}
              >
                <span style={{ color: brand }}>✓</span>
              </div>
              <h2 className="mt-6 text-3xl font-bold tracking-tight">
                {settings.thankYouTitle || "Thank you!"}
              </h2>
              {settings.thankYouDescription && (
                <p className={cn("mt-3 text-lg", muted)}>{settings.thankYouDescription}</p>
              )}
              {mode === "preview" && onRestart && (
                <button
                  onClick={onRestart}
                  className="mt-8 rounded-lg border px-4 py-2 text-sm font-medium transition hover:opacity-80"
                  style={{ borderColor: brand, color: brand }}
                >
                  Restart preview
                </button>
              )}
              {embedded && (
                <button
                  onClick={() => {
                    window.parent?.postMessage("formcraft:close", "*");
                  }}
                  className="mt-8 block w-full rounded-lg border px-4 py-2 text-sm font-medium"
                >
                  Close
                </button>
              )}
            </div>
          )}

          {serverError && (
            <div
              className={cn(
                "mt-4 rounded-lg border px-4 py-3 text-sm",
                dark ? "border-red-900 bg-red-950 text-red-300" : "border-red-200 bg-red-50 text-red-700",
              )}
            >
              {serverError}
            </div>
          )}
        </div>
      </div>

      {mode === "live" && (
        <a
          href="/"
          target="_blank"
          className={cn(
            "absolute bottom-3 right-4 rounded-md px-2 py-1 text-xs font-medium transition-opacity hover:opacity-100",
            dark ? "text-neutral-500" : "text-neutral-400",
            stage === "done" ? "opacity-100" : "opacity-60",
          )}
        >
          ⚡ Built with <span className="font-bold">FormCraft</span>
        </a>
      )}
    </div>
  );
}

function AdvanceButton({
  label,
  brand,
  dark,
  onClick,
  disabled,
  small,
}: {
  label: string;
  brand: string;
  dark: boolean;
  onClick: () => void;
  disabled?: boolean;
  small?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "mt-8 rounded-xl font-semibold text-white shadow-lg transition-all hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50",
        small ? "px-4 py-2 text-sm" : "px-7 py-3.5 text-base",
      )}
      style={{ background: brand, boxShadow: `0 8px 24px var(--brand-ring)` }}
      data-dark={dark ? "" : undefined}
    >
      {label}
    </button>
  );
}

function QuestionCard({
  q,
  index,
  total,
  value,
  error,
  dark,
  cardBorder,
  muted,
  brand,
  onChange,
  onAdvance,
  onBack,
  submitting,
}: {
  q: Question;
  index: number;
  total: number;
  value: AnswerMap[string] | undefined;
  error?: string;
  dark: boolean;
  cardBorder: string;
  muted: string;
  brand: string;
  onChange: (v: AnswerMap[string]) => void;
  onAdvance: () => void;
  onBack: () => void;
  submitting: boolean;
}) {
  const isLast = index === total - 1;
  const inputCls = cn(
    "w-full border-b-2 bg-transparent pb-3 text-2xl font-medium outline-none transition-colors placeholder:font-normal",
    dark
      ? "border-neutral-700 placeholder:text-neutral-600 focus:border-white"
      : "border-neutral-200 placeholder:text-neutral-300 focus:border-neutral-900",
  );

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && q.type !== "long") {
      e.preventDefault();
      onAdvance();
    }
    if (e.key === "Escape") onBack();
  }

  return (
    <div key={q.id} className="formcraft-anim">
      <div className="flex items-center justify-between">
        <p className={cn("text-sm font-semibold uppercase tracking-widest", muted)}>
          {index + 1} / {total}
          {q.required && <span style={{ color: brand }}> *</span>}
        </p>
        <span className={cn("text-xs font-medium rounded-full px-2.5 py-0.5", dark ? "bg-neutral-800 text-neutral-400" : "bg-neutral-100 text-neutral-600")}>
          {Math.round(((index + 1) / total) * 100)}% completed
        </span>
      </div>
      <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">{q.title}</h2>
      {q.description && <p className={cn("mt-2 text-base", muted)}>{q.description}</p>}

      <div className="mt-7">
        {(q.type === "short" || q.type === "email" || q.type === "number") && (
          <input
            autoFocus
            type={q.type === "email" ? "email" : q.type === "number" ? "number" : "text"}
            inputMode={q.type === "number" ? "decimal" : undefined}
            value={String(value ?? "")}
            placeholder={q.placeholder || (q.type === "email" ? "you@example.com" : "Type here…")}
            onChange={(e) => onChange(q.type === "number" ? (e.target.value === "" ? ("") as never : Number(e.target.value)) : e.target.value)}
            onKeyDown={handleKeyDown}
            className={cn(inputCls, error && "border-red-400")}
          />
        )}

        {q.type === "long" && (
          <div>
            <textarea
              autoFocus
              rows={4}
              value={String(value ?? "")}
              placeholder={q.placeholder || "Type here…"}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) onAdvance();
                if (e.key === "Escape") onBack();
              }}
              className={cn(inputCls, "resize-none border rounded-xl px-4 pt-3 pb-2", error && "border-red-400")}
            />
            <p className={cn("mt-2 text-xs", muted)}>⌘ + Enter to continue</p>
          </div>
        )}

        {q.type === "choice" && (
          <div className="flex flex-col gap-2.5">
            {(q.options ?? []).map((opt, i) => {
              const selected = value === opt;
              return (
                <button
                  key={opt}
                  autoFocus={i === 0}
                  onClick={() => {
                    onChange(opt);
                    setTimeout(onAdvance, 140);
                  }}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border px-4 py-3.5 text-left text-lg font-medium transition-all",
                    cardBorder,
                    selected ? "shadow-md" : "hover:translate-x-1",
                    dark ? "bg-neutral-900 hover:bg-neutral-800" : "bg-white hover:border-neutral-300",
                  )}
                  style={selected ? { borderColor: brand, background: "var(--brand-soft)" } : undefined}
                >
                  <span
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2"
                    style={{ borderColor: selected ? brand : undefined }}
                  >
                    {selected && <span className="h-2.5 w-2.5 rounded-full" style={{ background: brand }} />}
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>
        )}

        {q.type === "multi" && (
          <MultiPicker q={q} value={Array.isArray(value) ? value : []} onChange={onChange} dark={dark} cardBorder={cardBorder} brand={brand} />
        )}

        {q.type === "dropdown" && (
          <select
            autoFocus
            value={String(value ?? "")}
            onChange={(e) => {
              onChange(e.target.value);
              if (e.target.value) setTimeout(onAdvance, 140);
            }}
            onKeyDown={handleKeyDown}
            className={cn(inputCls, "cursor-pointer appearance-none rounded-xl border px-4 py-3", cardBorder, error && "border-red-400")}
          >
            <option value="">Choose…</option>
            {(q.options ?? []).map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        )}

        {q.type === "rating" && <RatingPicker q={q} value={typeof value === "number" ? value : undefined} onChange={onChange} onAdvance={onAdvance} brand={brand} muted={muted} />}

        {q.type === "yesno" && (
          <div className="flex gap-3">
            {(["Yes", "No"] as const).map((opt, i) => {
              const selected = value === opt;
              return (
                <button
                  key={opt}
                  autoFocus={i === 0}
                  onClick={() => {
                    onChange(opt);
                    setTimeout(onAdvance, 140);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
                      const parent = (e.target as HTMLElement).parentElement;
                      const target = e.key === "ArrowLeft" ? parent?.querySelector("button:first-of-type") : parent?.querySelector("button:last-of-type");
                      (target as HTMLElement | null)?.focus();
                    }
                  }}
                  className={cn(
                    "flex-1 rounded-xl border px-6 py-4 text-center text-lg font-semibold transition-all",
                    cardBorder,
                    dark ? "bg-neutral-900 hover:bg-neutral-800" : "bg-white hover:border-neutral-300",
                  )}
                  style={selected ? { borderColor: brand, background: "var(--brand-soft)" } : undefined}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {error && <p className="formcraft-shake mt-3 text-sm font-medium text-red-500">{error}</p>}

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <AdvanceButton
          label={submitting ? "Sending…" : isLast ? "Submit" : "Next"}
          brand={brand}
          dark={dark}
          onClick={onAdvance}
          disabled={submitting}
        />
        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <kbd className="rounded border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 font-mono text-[11px] shadow-sm">Enter ↵</kbd>
          <span>to advance</span>
          {index > 0 && (
            <>
              <span className="opacity-40">·</span>
              <button onClick={onBack} className={cn("font-medium underline-offset-4 hover:underline", muted)}>
                Esc to go back
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function MultiPicker({
  q,
  value,
  onChange,
  dark,
  cardBorder,
  brand,
}: {
  q: Question;
  value: string[];
  onChange: (v: string[]) => void;
  dark: boolean;
  cardBorder: string;
  brand: string;
}) {
  const [lastFocused, setLastFocused] = useState(-1);

  function toggle(opt: string) {
    onChange(value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt]);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (lastFocused >= 0 && (q.options ?? [])[lastFocused]) toggle((q.options ?? [])[lastFocused]);
      else if (value.length === 0) toggle((q.options ?? [])[0] ?? "");
    }
  }

  return (
    <div className="flex flex-col gap-2.5" onKeyDown={handleKeyDown}>
      {(q.options ?? []).map((opt, i) => {
        const checked = value.includes(opt);
        return (
          <button
            key={opt}
            autoFocus={i === 0}
            onClick={() => toggle(opt)}
            onFocus={() => setLastFocused(i)}
            className={cn(
              "flex items-center gap-3 rounded-xl border px-4 py-3.5 text-left text-lg font-medium transition-all",
              cardBorder,
              "hover:translate-x-1",
              dark ? "bg-neutral-900 hover:bg-neutral-800" : "bg-white hover:border-neutral-300",
            )}
            style={checked ? { borderColor: brand, background: "var(--brand-soft)" } : undefined}
          >
            <span
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 text-xs font-bold text-white"
              style={{ borderColor: checked ? brand : undefined, background: checked ? brand : undefined }}
            >
              {checked && "✓"}
            </span>
            {opt}
          </button>
        );
      })}
      <p className="mt-1 text-xs opacity-60">Enter toggles the focused option · press Next when done</p>
    </div>
  );
}

function RatingPicker({
  q,
  value,
  onChange,
  onAdvance,
  brand,
  muted,
}: {
  q: Question;
  value: number | undefined;
  onChange: (v: number) => void;
  onAdvance: () => void;
  brand: string;
  muted: string;
}) {
  const max = q.maxRating ?? 5;
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: max }, (_, i) => i + 1).map((n) => {
          const selected = value === n;
          return (
            <button
              key={n}
              autoFocus={n === 1}
              onClick={() => {
                onChange(n);
                setTimeout(onAdvance, 160);
              }}
              onKeyDown={(e) => {
                if (/^[1-9]$/.test(e.key) && Number(e.key) <= max) {
                  onChange(Number(e.key));
                  setTimeout(onAdvance, 160);
                }
              }}
              className={cn(
                "h-12 w-12 rounded-xl border text-lg font-bold transition-all hover:scale-105",
                selected ? "text-white" : muted,
              )}
              style={selected ? { background: brand, borderColor: brand } : undefined}
            >
              {n}
            </button>
          );
        })}
      </div>
      <div className={cn("mt-2 flex justify-between text-xs", muted)}>
        <span>Not great</span>
        <span>Love it</span>
      </div>
    </div>
  );
}
