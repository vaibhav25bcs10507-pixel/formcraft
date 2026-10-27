# Contributing to FormCraft 🤝

Thanks for considering it — FormCraft is intentionally small enough to hold in
your head over an afternoon.

## Getting set up

```bash
git clone https://github.com/vaibhav25bcs10507-pixel/formcraft && cd formcraft
npm install
npm run dev        # http://localhost:3000
```

Login with the dev defaults: `admin@formcraft.local` / `formcraft-admin`.
Set `SEED_DEMO=true` if you want the workspace pre-filled with sample forms.

## Before opening a PR

```bash
npx tsc --noEmit     # types clean
npx eslint src       # lint clean
npm run build        # production build clean
BASE_URL=http://localhost:3000 npm run test:e2e   # 23 end-to-end checks
```

The E2E suite runs a real browser against a running server — start one first
(`npm run build && npm start` on any port, then point `BASE_URL` at it).
If the bundled Playwright browser is missing, set `CHROME_PATH=/usr/bin/chromium`.

## Code map

- `src/components/ConversationalForm.tsx` — the one-question-at-a-time renderer
- `src/components/builder/FormBuilder.tsx` — the editor + live preview + share kit
- `src/app/dashboard/FormList.tsx` — workspace list with search, filters, sorting
- `src/app/api/` — route handlers (forms, submissions, AI, settings, exports)
- `src/lib/` — types, auth, AI generation, templates, utilities
- `src/db/` — SQLite schema (Drizzle); tables auto-create on boot
- `scripts/e2e.mjs` — browser-driven end-to-end suite

## Good first issues

File upload questions, partial response capture, multi-user teams, and
Slack/Discord notification channels are all open for a champion.

## Ground rules

- Match the existing style — Tailwind classes inline, small components, no new
  dependencies unless genuinely needed.
- AGPL-3.0: by contributing you agree your code ships under the same license.
