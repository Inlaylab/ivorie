# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two audiences, equal weight:

- **Evaluators:** Angular developers starting or reworking an Angular 22 app. They compare Ivorie with Angular Material, PrimeNG and shadcn ports, then install it if it fits. The home page, playground and blocks serve them.
- **Daily users:** developers who already use Ivorie. They come for component docs, API, theming and copy-paste code. Docs pages serve them; reading speed comes first.

## Product Purpose

The site explains what Ivorie is, proves it with live components, and gets a developer from "what is this" to a working install. Success: a visitor installs (`npx ivorie init` or `npm i @inlaylab/ivorie`) and finds any component's usage in seconds.

## Positioning

- shadcn/ui's classes, variants and behaviour, ported to signals and zoneless Angular 22.
- Two ways in: the npm package for updates, or the CLI copies the source into the app.
- Finished themes, tuned by accent, font, radius and dials. The component code is the same in every theme.
- Ready blocks (login, sign up, sidebar, dashboard, stats, usage, status), added with one command.

## Operating Context

Developers read the site beside their editor. They copy commands and code, try themes in the playground, and share looks by `?preset=` code. The site is prerendered (SSR) and deployed to GitHub Pages.

## Capabilities and Constraints

- Angular 22, Tailwind 4.3, zoneless, signals. Docs pages are Markdown in `apps/docs/content/`.
- Routes, prerendered pages and share codes (`ivp1_`) must keep working.
- The site look is its own skin. Shipped themes (`projects/ui/styles/theme-*.css`) show only inside previews; they change only in 2.0.
- Fonts are self-hosted; checks run offline.

## Brand Commitments

- Name: Ivorie, by Inlaylab. MIT license. Credits shadcn/ui and Radix UI.
- No violet on the site (user decision, 2026-11-23).
- Voice: short sentences, plain words, no filler (CLAUDE.md).

## Evidence on Hand

- Live components, blocks and themes in the repo. Component count and theme count come from generated data.
- No testimonials, user counts, download numbers or benchmarks. Do not invent any.

## Product Principles

1. Show the real component, never a picture of one.
2. One look for the site, many looks inside previews; they never mix.
3. Copyable first: every command and snippet has a copy button.
4. Calm beats clever: no decoration that does not explain something.

## Accessibility & Inclusion

Components follow ARIA patterns and are tested with axe. The site meets WCAG 2.2 AA: keyboard reach, visible focus, reduced motion respected.
