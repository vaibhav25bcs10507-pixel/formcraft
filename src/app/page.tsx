import Link from "next/link";
import {
  MessageSquareText,
  ListChecks,
  BarChart3,
  Code2,
  Sparkles,
  Palette,
  ShieldCheck,
  ArrowRight,
  Server,
} from "lucide-react";
import LandingDemo from "@/components/LandingDemo";
import GitHubStars from "@/components/GitHubStars";
import Tilt from "@/components/Tilt";
import Reveal from "@/components/Reveal";
import { REPO_URL } from "@/lib/constants";

function GithubIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.72-1.54-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.25 5.67.41.35.77 1.05.77 2.12 0 1.53-.01 2.76-.01 3.14 0 .3.2.66.8.55A11.52 11.52 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}

const FEATURES = [
  {
    icon: MessageSquareText,
    title: "Conversational by default",
    text: "One question at a time, keyboard-first, buttery animations. Completion rates that flat forms can only dream of.",
    span: "sm:col-span-2",
    glow: "from-indigo-500/30",
  },
  {
    icon: ListChecks,
    title: "9 question types",
    text: "Text, email, numbers, choice, checkboxes, dropdowns, ratings, yes/no.",
    span: "",
    glow: "from-cyan-400/30",
  },
  {
    icon: Sparkles,
    title: "AI form generation",
    text: "Describe it in plain language, get a polished draft instantly. Bring your own API key — any OpenAI-compatible provider.",
    span: "",
    glow: "from-fuchsia-400/30",
  },
  {
    icon: BarChart3,
    title: "Live results & CSV",
    text: "Responses land in real time with per-question breakdowns. One-click CSV export, always.",
    span: "",
    glow: "from-emerald-400/30",
  },
  {
    icon: Code2,
    title: "Embed anywhere",
    text: "Public link, QR code, iframe, or a floating popup button — one line of HTML on any site.",
    span: "sm:col-span-2",
    glow: "from-violet-500/30",
  },
  {
    icon: Palette,
    title: "Make it yours",
    text: "Brand colors, dark mode, welcome screens. No “remove branding” upsell — there's no branding to remove.",
    span: "",
    glow: "from-amber-400/30",
  },
];

const COMPARISON: [string, string, string][] = [
  ["Monthly cost", "$0 — self-hosted", "From $35/mo"],
  ["Response limits", "Unlimited", "Capped per plan"],
  ["Where responses live", "Your SQLite file", "Their cloud"],
  ["Self-hosting", "One command", "Not available"],
  ["License", "AGPL-3.0, forever", "Proprietary"],
];

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-clip bg-neutral-950 text-white">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-neutral-950/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-xs shadow-lg shadow-indigo-500/30">
              ⚡
            </span>
            FormCraft
          </Link>
          <nav className="flex items-center gap-2 sm:gap-4">
            <GitHubStars />
            <Link
              href="/login"
              className="rounded-lg px-3 py-2 text-sm font-semibold text-neutral-300 transition hover:text-white"
            >
              Sign in
            </Link>
            <a
              href="#quickstart"
              className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:brightness-110"
            >
              Self-host
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="orb left-[8%] top-[-10%] h-96 w-96 bg-indigo-600/25" />
        <div className="orb right-[4%] top-[16%] h-80 w-80 bg-violet-600/20" style={{ animationDelay: "-5s" }} />
        <div className="orb bottom-[-10%] left-[40%] h-72 w-72 bg-cyan-500/15" style={{ animationDelay: "-9s" }} />
        <div className="grid-floor absolute inset-x-0 bottom-[-40%] h-[80%]" aria-hidden="true" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-6 py-20 lg:grid-cols-2 lg:py-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-neutral-300 backdrop-blur">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              Open source · High Conversion · Self-Hostable
            </span>
            <h1 className="mt-6 text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
              Forms designed for flow, built to be{" "}
              <span className="text-gradient">finished</span>.
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-neutral-400">
              FormCraft is an open-source conversational form engine. Build fluid one-question-at-a-time
              forms with smart skip-logic, real-time analytics, and zero response limits — fully self-hosted on SQLite.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#quickstart"
                className="pulse-glow group flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-6 py-3.5 font-semibold text-white transition hover:brightness-110"
              >
                <Server size={17} /> Deploy your own
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </a>
              <Link
                href="/login"
                className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 font-semibold text-neutral-200 backdrop-blur transition hover:border-white/30 hover:bg-white/10"
              >
                Try the builder <ArrowRight size={16} />
              </Link>
            </div>
            <p className="mt-5 text-sm text-neutral-500">
              Demo login: <code className="rounded bg-white/5 px-1.5 py-0.5">admin@formcraft.local</code> /{" "}
              <code className="rounded bg-white/5 px-1.5 py-0.5">formcraft-admin</code>
            </p>
          </div>

          <div className="relative" style={{ perspective: "1200px" }}>
            <div className="pointer-events-none absolute -inset-8 rounded-[32px] bg-gradient-to-br from-indigo-500/20 via-transparent to-cyan-500/20 blur-2xl" aria-hidden="true" />
            <Tilt max={7} className="relative">
              <LandingDemo />
            </Tilt>
            <div className="float-chip glass-strong absolute -left-6 top-8 hidden rounded-xl px-3 py-2 text-xs font-semibold text-neutral-200 sm:block" style={{ ["--fr" as string]: "-6deg", animationDelay: "-1.2s" }}>
              $0 / month
            </div>
            <div className="float-chip glass-strong absolute -right-4 top-1/3 hidden rounded-xl px-3 py-2 text-xs font-semibold text-neutral-200 sm:block" style={{ ["--fr" as string]: "5deg", animationDelay: "-3s" }}>
              ⚡ 60s self-host
            </div>
            <div className="float-chip glass-strong absolute -bottom-5 left-1/4 hidden rounded-xl px-3 py-2 text-xs font-semibold text-neutral-200 sm:block" style={{ ["--fr" as string]: "-3deg", animationDelay: "-4.5s" }}>
              🔒 Your SQLite
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-y border-white/5 bg-white/[0.02]">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 py-8 text-center sm:grid-cols-3">
          {[
            ["$0/mo", "unlimited forms & responses"],
            ["1 file", "SQLite — your data, portable"],
            ["~60s", "from zero to self-hosted"],
          ].map(([stat, label]) => (
            <div key={stat}>
              <p className="text-gradient text-3xl font-bold">{stat}</p>
              <p className="mt-0.5 text-sm text-neutral-400">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative mx-auto max-w-6xl px-6 py-24">
        <div className="orb right-[10%] top-[20%] h-72 w-72 bg-violet-600/15" />
        <Reveal>
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
            Everything the paid tools charge for
          </h2>
          <p className="mt-3 text-center text-neutral-400">Minus the invoice.</p>
        </Reveal>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, text, span, glow }, i) => (
            <Reveal key={title} delay={i * 70} className={span}>
              <Tilt max={6} className="h-full">
                <div className="glass group relative h-full overflow-hidden rounded-2xl p-6 transition-colors hover:border-white/20">
                  <div className={`pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br ${glow} to-transparent blur-2xl opacity-60 transition-opacity group-hover:opacity-100`} />
                  <span className="glass-strong relative flex h-11 w-11 items-center justify-center rounded-xl text-indigo-300">
                    <Icon size={20} />
                  </span>
                  <h3 className="relative mt-4 font-bold">{title}</h3>
                  <p className="relative mt-2 text-sm leading-relaxed text-neutral-400">{text}</p>
                </div>
              </Tilt>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Comparison */}
      <section className="relative border-y border-white/5 bg-white/[0.02]">
        <div className="mx-auto max-w-3xl px-6 py-24">
          <Reveal>
            <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
              The math is not subtle
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <div className="grad-border mt-12 overflow-hidden rounded-2xl shadow-2xl shadow-indigo-950/50">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-white/[0.04] text-left">
                    <th className="px-5 py-3.5 font-semibold text-neutral-400">&nbsp;</th>
                    <th className="bg-gradient-to-r from-indigo-500/15 to-violet-500/15 px-5 py-3.5 font-bold text-indigo-300">
                      FormCraft (self-hosted)
                    </th>
                    <th className="px-5 py-3.5 font-semibold text-neutral-400">Typical SaaS forms</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {COMPARISON.map(([label, ours, theirs]) => (
                    <tr key={label}>
                      <td className="px-5 py-3.5 font-medium text-neutral-300">{label}</td>
                      <td className="bg-gradient-to-r from-indigo-500/10 to-violet-500/10 px-5 py-3.5 font-semibold text-white">
                        {ours}
                      </td>
                      <td className="px-5 py-3.5 text-neutral-500">{theirs}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Quickstart */}
      <section id="quickstart" className="relative mx-auto max-w-3xl px-6 py-24">
        <div className="orb left-[-10%] bottom-[0%] h-72 w-72 bg-cyan-500/15" />
        <Reveal>
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
            Running in under a minute
          </h2>
          <p className="mt-3 text-center text-neutral-400">
            Docker on a VPS, local development, or cloud container — anywhere.
          </p>
        </Reveal>
        <Reveal delay={140}>
          <div className="mt-12" style={{ perspective: "1400px" }}>
            <div
              className="grad-border shine relative overflow-hidden rounded-2xl shadow-2xl shadow-indigo-950/60"
              style={{ transform: "rotateX(7deg)" }}
            >
              <div className="flex items-center gap-1.5 border-b border-white/5 bg-white/[0.04] px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-red-400/80" />
                <span className="h-3 w-3 rounded-full bg-amber-400/80" />
                <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
                <span className="ml-3 text-xs text-neutral-500">terminal — formcraft</span>
              </div>
              <div className="p-6 font-mono text-sm leading-loose">
                <p className="text-neutral-500"># Clone and run</p>
                <p>
                  <span className="text-emerald-400">$</span> git clone {REPO_URL.replace("https://", "")} && cd formcraft
                </p>
                <p>
                  <span className="text-emerald-400">$</span> docker compose up -d
                </p>
                <p className="text-gradient font-semibold">Open http://localhost:3000 — done. 🎉</p>
              </div>
            </div>
          </div>
        </Reveal>
        <Reveal delay={220}>
          <p className="mt-8 text-center text-sm text-neutral-500">
            No Docker?{" "}
            <code className="rounded bg-white/5 px-1.5 py-0.5">npm install && npm run build && npm start</code>{" "}
            works too — it&apos;s just Node + SQLite.
          </p>
        </Reveal>
      </section>

      {/* FAQ */}
      <section className="relative border-t border-white/5 bg-white/[0.02]">
        <div className="mx-auto max-w-3xl px-6 py-24">
          <Reveal>
            <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">Fair questions</h2>
          </Reveal>
          <div className="mt-10 space-y-3">
            {[
              [
                "Is it really free?",
                "Yes. Open-source, self-host it on your own hardware forever. Unlimited forms, unlimited responses, unlimited everything.",
              ],
              [
                "Can I use it for my business or projects?",
                "Absolutely — client forms, internal surveys, event RSVPs, project submissions, and lead capture. You own your data completely.",
              ],
              [
                "Where does response data live?",
                "In a single SQLite file inside the container/volume you control. Back it up by copying one file. No third parties involved.",
              ],
              [
                "What features are supported?",
                "Conversational interface, question skip logic, real-time response analytics, CSV export, Slack/Discord webhooks, QR codes, iframe embeds, and AI form generation.",
              ],
            ].map(([q, a], i) => (
              <Reveal key={q} delay={i * 70}>
                <details className="glass group rounded-xl">
                  <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 font-semibold">
                    {q}
                    <span className="text-neutral-500 transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="px-5 pb-5 text-sm leading-relaxed text-neutral-400">{a}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden border-t border-white/5">
        <div className="orb bottom-[-40%] left-1/2 h-[420px] w-[820px] -translate-x-1/2 bg-indigo-600/25" />
        <div className="relative mx-auto max-w-3xl px-6 py-28 text-center">
          <Reveal>
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Stop <span className="text-gradient">renting</span> your forms.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-neutral-400">
              Own the whole stack — builder, responses, data. It takes about a minute.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <a
                href="#quickstart"
                className="pulse-glow flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-7 py-3.5 font-semibold transition hover:brightness-110"
              >
                <ShieldCheck size={17} /> Self-host now
              </a>
              <a
                href={REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-7 py-3.5 font-semibold text-neutral-200 backdrop-blur transition hover:border-white/30 hover:bg-white/10"
              >
                <GithubIcon size={17} /> Star the repo
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <footer className="border-t border-white/5">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-neutral-500 sm:flex-row">
          <p className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-violet-600 text-[10px]">⚡</span>
            FormCraft — Open Source Software Project
          </p>
          <p>
            Engineered for high conversion and complete data ownership.{" "}
            <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="text-neutral-300 hover:text-white">
              GitHub
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
