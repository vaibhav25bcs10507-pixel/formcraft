# FormCraft — Demo Video Script (3–5 minutes)

**Live app:** https://formcraft-4sqx.onrender.com
**Sign-in:** `demo@formcraft.local` / `formcraft-demo`
**Tip:** the Render free tier sleeps when idle — open the link ~1 minute before recording
so the first paint is instant (otherwise the evaluator sees a ~40s cold start).

---

## Shot list

### 0:00 – 0:25 — The problem
> "Classic forms dump a wall of questions on the respondent, so people bounce.
> The polished alternatives — Typeform, Qualtrics — cost $35–$100 a month, cap
> your responses, paywall conditional branching, and keep your data on their
> cloud. FormCraft is a self-hosted conversational form engine: one question at
> a time, smart skip logic, live analytics, and your data stays in your own
> SQLite file."

*Show: the landing page hero, point at the live demo card.*

### 0:25 – 1:10 — Product in action (the runner)
*Show: the landing demo card. Click an option, press `Enter` to advance, use `Esc`
to go back.*

> "This is a real form, running in the browser. One question at a time, a live
> completion percentage, keyboard-first navigation — `Enter` moves forward,
> `Esc` steps back. The respondent never sees a wall of inputs."

### 1:10 – 2:10 — Builder + branching
*Show: Dashboard → New form → "Developer Bug Report" template → edit a question
title → show the live preview panel → Design tab (brand colour) → Share tab.*

> "I'm the operator. I pick a template or start blank, add questions of nine
> types, and the preview on the right updates as I type. Every change autosaves.
> I can set a brand colour, a dark theme, welcome and thank-you screens, and
> conditional skip logic — for example, if the reporter says 'No' to the bonus
> question, the form jumps straight to submit. That's the branching engine at
> the core: the server replays the respondent's path when validating, so a
> skipped question is never wrongly flagged as missing."

### 2:10 – 3:00 — Publish + collect a response
*Show: Publish → open the public `/f/<slug>` link in a second tab → fill it →
submit → Thank-you screen.*

> "Published forms get a public slug URL, a QR code, an iframe embed, and a
> floating popup button that drops onto any site with a single script tag.
> Submissions are validated server-side — the same skip logic, plus a honeypot
> field, a minimum-time trap and per-IP rate limiting to keep bots out."

### 3:00 – 4:00 — Analytics + export
*Show: Responses page for the seeded "End-Term Project Submission" form → per-question
summary cards → expand a response → click CSV then JSON.*

> "Responses land instantly. The dashboard gives per-question analytics —
> rating averages, choice distributions — and every individual response is
> drillable. One click exports CSV for Excel or Pandas, or structured JSON for
> any pipeline. The workspace itself has search, Live/Draft filters and sorting."

### 4:00 – 4:40 — Engineering decisions
*Show: GitHub repo tree, README architecture diagram, the 23-check e2e suite output.*

> "The stack is Next.js 16, React 19, TypeScript, Tailwind 4, SQLite through
> Drizzle ORM and Zod validation. The whole backend is a single file-backed
> database, so it self-hosts in one command on a four-dollar VPS. Auth is an
> HMAC-signed session cookie over admin credentials from environment variables —
> no credentials in the repo. There's a 23-check Playwright suite that drives a
> real browser through login, builder autosave, publishing, submission, skip
> logic, export, and deletion."

### 4:40 – 5:00 — Close
> "FormCraft — build forms people actually finish, own every response, pay
> nothing per month. Repo and live link are in the description. Thanks."

---

## Quick checklist before you hit record

- [ ] Open the live URL once so the free-tier instance is awake
- [ ] Sign in to the dashboard in a second tab (so you can jump straight to it)
- [ ] Open a second tab on `/f/product-feedback-q4` to show a real published form
- [ ] Hide notifications / close Discord / Loom's tab strip
- [ ] Record at 1920×1080, 30fps; keep each shot ≤ 20 seconds so cuts stay crisp
- [ ] Show real data — do not read code on camera
