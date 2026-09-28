# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — dev server on **port 4000** (not the Next.js default 3000)
- `npm run build` — static export to `./out`
- `npm run lint` — ESLint (flat config, `eslint-config-next` core-web-vitals + typescript)

There is no test suite.

## Architecture

Personal grab-bag site built with Next.js 16 (App Router), React 19, Tailwind CSS v4, TypeScript. Each top-level folder under `app/` is an independent mini-page (`panini`, `aoc`, `playground`); `aoc` and `playground` are placeholders.

**Deployment:** Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds and publishes to GitHub Pages. `next.config.ts` uses `output: 'export'` (fully static — no server features, API routes, or dynamic rendering) and, in production only, sets `basePath`/`assetPrefix` to `/etc`. Internal links and asset paths must work under that base path.

**Panini sticker tracker (`app/panini/`):** The main feature — tracks a Panini World Cup sticker album.
- `data.ts` is hand-edited data, not generated: `swap` (duplicates available to trade, `have` maps sticker number → duplicate count) and `need` (missing stickers per team). Each `StickerSet` is a team code with an `order` and `group`; sticker numbers run 1–20.
- `page.tsx` renders the swap and need tables with totals; teams with nothing left in `need` are shown struck-through in grey. The "last updated" timestamp and the "Most wanted" list are hardcoded strings in this file and are updated by hand alongside `data.ts`.
- `have/page.tsx` is a simpler swap-only view.
