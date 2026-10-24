# Contributing to Formo 🤝

Thanks for considering it — Formo is intentionally small (~2.5k LOC) so you can
hold the whole codebase in your head in an afternoon.

## Getting set up

```bash
git clone https://github.com/Abhishekpundir23/formo && cd formo
npm install
npm run dev        # http://localhost:3000
```

Login with the dev defaults: `admin@formo.local` / `formo-admin`.

## Before opening a PR

```bash
npx tsc --noEmit     # types clean
npx eslint src       # lint clean
npm run build        # production build clean
BASE_URL=http://localhost:3000 npm run test:e2e   # 23 end-to-end checks
```

The E2E suite runs a real browser against a running server — start one first
(`npm run build && npm start` on any port, then point `BASE_URL` at it).

## Code map

- `src/components/ConversationalForm.tsx` — the one-question-at-a-time renderer
- `src/components/builder/FormBuilder.tsx` — the editor + live preview + share kit
- `src/app/api/` — route handlers (forms, submissions, AI, settings)
- `src/lib/` — types, auth, AI generation, utilities
- `src/db/` — SQLite schema (Drizzle); tables auto-create on boot

## Good first issues

Check the [issue tracker](../../issues) for `good first issue` labels. Popular
requests waiting for a champion: file upload questions, partial response
capture, multi-user teams.

## Ground rules

- Match the existing style — Tailwind classes inline, small components, no new
  dependencies unless genuinely needed.
- AGPL-3.0: by contributing you agree your code ships under the same license.
