# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project

Arcade Vault — a platform for playing games online and competing for the highest score. Currently a fresh `create-next-app` scaffold (App Router) with no game logic implemented yet.

Development follows Spec Driven Design using the `/spec` and `/spec-impl` commands from the [fernando-skills](https://github.com/Klerith/fernando-skills) skill pack (installed via `npx skills@latest add Klerith/fernando-skills`). Check for specs before implementing features they cover.

## Stack

- Next.js 16.2.11 (App Router)
- React 19.2.4 / React DOM 19.2.4
- TypeScript 5
- Tailwind CSS 4 (via `@tailwindcss/postcss`, CSS-first config)
- ESLint 9 (`eslint-config-next`)

No test runner is configured yet.

## Skills

Usa simpre /frontend-design para diseñar la interfaz de usuario.

## Architecture

- **App Router** under `app/` — `app/layout.tsx` defines the root HTML shell (Geist fonts via `next/font/google`), `app/page.tsx` is the home route. This is a real App Router project, not Pages Router.
- Styling is Tailwind CSS v4 via `@tailwindcss/postcss` (see `postcss.config.mjs`), configured with no separate `tailwind.config` file (Tailwind v4 CSS-first config lives in `app/globals.css`).
- Path alias `@/*` maps to the repo root (`tsconfig.json`).
- **Next.js version is 16.2.11 — newer than this model's training data.** Before using any Next.js API (routing conventions, config options, caching/data-fetching APIs, etc.), consult `node_modules/next/dist/docs/` (organized into `01-app`, `02-pages`, `03-architecture`, `04-community`) rather than relying on memorized Next.js behavior, since APIs and conventions may have changed.
