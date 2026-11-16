# Launch posts

Drafts for the first public announcement. Copy, adjust the voice, post.

## Before you post
- npm has the version the posts describe (`npm view @inlaylab/ivorie version`).
- The docs site is live and shows that version: https://inlaylab.github.io/ivorie/
- `npx ivorie init` works in a fresh `ng new` app (run `npm run smoke:cli`).
- Add one screenshot or a short clip of the playground to each post. Posts with a picture get read.
- Post on a weekday morning (US time). Stay around for two hours to answer.
- Read each community's self-promotion rule first. Most ask that you take part in the community, not only post links.

## Facts (keep every post in step with these)
- Angular 22 and up. Tailwind CSS 4. Signals, zoneless, OnPush, server rendering.
- 54 components, one import path each: `@inlaylab/ivorie/button`.
- 22 blocks: login, sign-up, sidebar and dashboard pages.
- 13 styles. Eight are shadcn/ui's (vega, nova, maia, luma, rhea, lyra, mira, sera). Five are ours (glass, bento, mono, graphite, tint).
- 17 accent colors, 7 base colors, 5 icon libraries.
- Charts: line, area, bar, pie, radar, radial. SVG, rendered on the server, keyboard support. About 41 kB gzipped with d3-scale and d3-shape.
- Two ways to use it: the npm package, or the `ivorie` CLI that copies the source into your app.
- MIT. The look and behavior come from shadcn/ui (MIT). Keyboard and ARIA patterns follow Radix UI.
- Links: docs https://inlaylab.github.io/ivorie/ · code https://github.com/Inlaylab/ivorie · npm `@inlaylab/ivorie`

Say plainly what it is not: it needs Angular 22, it needs Tailwind 4, and it is new.

---

## Reddit: r/Angular2 (r/angular)

**Title:** Ivorie: shadcn/ui-style components for Angular 22, as an npm package or as source you own

I have been building an Angular component library for a few months and it is ready for other people to try.

**What it is.** 54 components with the shadcn/ui look and behavior, written for Angular 22: signal inputs and models, OnPush, zoneless, and server rendering without hydration warnings. Each component has its own import path, so you ship only what you use.

**Two ways to use it.**

```bash
# as a package: updates come with npm
npm i @inlaylab/ivorie @angular/cdk

# or as source: the CLI copies the files into your app and you edit them
npx ivorie init
npx ivorie add button dialog
npx ivorie add dashboard-01
```

**What else is in it.**
- 22 blocks: login, sign-up, sidebar and dashboard pages, wired to forms and a data table.
- Charts (line, area, bar, pie, radar, radial) that follow your theme, render on the server and work with the keyboard.
- 13 styles, 17 accent colors and 5 icon libraries. A playground lets you pick a look and gives you the one command that installs it.

**What it is not.** It needs Angular 22 and Tailwind CSS 4, with no support for older versions. It is new, so expect rough edges and please tell me about them.

Credit where it is due: the look and behavior come from shadcn/ui, and the keyboard and ARIA patterns follow Radix UI. Both are MIT, and so is this.

- Docs and playground: https://inlaylab.github.io/ivorie/
- Code: https://github.com/Inlaylab/ivorie

I would like to hear what is missing for your app, and where the API feels wrong for Angular. Issues decide what I build next.

---

## dev.to

**Title:** I built shadcn/ui for Angular 22. You can install it, or own the source.

**Tags:** angular, webdev, opensource, tailwindcss

**Cover:** a screenshot of the playground with two styles side by side.

Angular changed a lot in a short time: signals, zoneless change detection, a new control flow, better server rendering. Most component libraries carry years of older patterns. I wanted one that starts from where Angular is now. So I built Ivorie.

### What you get

- **54 components** with the shadcn/ui look and behavior: buttons, dialogs, selects, a data table, a command menu, a sidebar and more.
- **22 blocks**: whole pages for login, sign-up, sidebars and dashboards.
- **Charts**: line, area, bar, pie, radar and radial. They are SVG, they render on the server, and you can move through them with the keyboard.
- **13 styles**, 17 accent colors and 5 icon libraries.

### Built for today's Angular

Every component uses signal inputs and models and OnPush. Nothing needs zone.js. Everything renders on the server and hydrates without warnings. Each component is its own entry point:

```ts
import { IvButton } from '@inlaylab/ivorie/button';
```

```html
<button ivButton variant="outline">Save</button>
```

### Install it, or own it

This is the part I care most about. There are two ways to use Ivorie, and both come from the same source.

**The package**, when you want updates:

```bash
npm i @inlaylab/ivorie @angular/cdk
npm i -D tailwindcss @tailwindcss/postcss tw-animate-css
```

**The source**, when you want control. The CLI copies the component files into your app. You read them, change them and keep them:

```bash
npx ivorie init
npx ivorie add button dialog
npx ivorie add dashboard-01
```

A test in the repo builds two fresh apps, one each way, and checks that they match.

### Pick a look, get one command

The playground lets you choose a style, base color, accent, font, radius and icon library, and shows real components changing as you pick. When you like it, it gives you one command with a short code:

```bash
npx ivorie init --preset ivp1_…
```

That code is the whole look. Share the link and a teammate gets the same thing.

The styles are more than colors. Glass draws its edges with light. Graphite is matte and dense, like a pro tool. Tint washes every surface with your accent. Mono is a terminal. The eight shadcn/ui styles are all there too.

### Accessibility

Keyboard and ARIA patterns follow Radix UI. Components are tested with axe. For our own five styles, text contrast is checked against every base color, in light and dark.

### What it is not

- It needs **Angular 22**. Older versions are not supported.
- It needs **Tailwind CSS 4**.
- It is **new**. You will find rough edges. Please open an issue when you do.

### Thanks

The look and behavior come from [shadcn/ui](https://github.com/shadcn-ui/ui). The patterns follow [Radix UI](https://github.com/radix-ui/primitives). Both are MIT. Ivorie is MIT too.

### Try it

- Docs and playground: https://inlaylab.github.io/ivorie/
- Code: https://github.com/Inlaylab/ivorie

Tell me what your app needs that is not here. That list decides what comes next.

---

## Hacker News

**Title:** Show HN: Ivorie – shadcn/ui-style components for Angular 22, package or source

**URL:** https://inlaylab.github.io/ivorie/

**First comment:**

I built this because Angular's recent changes (signals, zoneless, the new control flow) made it worth starting a component library from scratch instead of adapting an older one.

It is 54 components, 22 page blocks and a chart set, with the shadcn/ui look. You can install the npm package, or run a CLI that copies the source into your app so you own it. Both paths come from the same source, and a test builds an app each way and compares them.

The part that took the most work is styling. Components carry plain class hooks and a style file gives them their look, so one set of components has 13 looks. The playground turns your picks into a short code you can install with one command.

Limits: Angular 22 only, Tailwind CSS 4 only, and it is young. MIT. The design comes from shadcn/ui and the accessibility patterns from Radix UI.

I would value feedback on the API and on what is missing.

---

## Short post (X, Bluesky, LinkedIn)

Ivorie is out: shadcn/ui-style components for Angular 22.

- 54 components, 22 blocks, charts
- signals, zoneless, server rendering
- install the package, or copy the source and own it
- 13 styles, and a playground that gives you one install command

MIT. Angular 22 and Tailwind 4 only.

https://inlaylab.github.io/ivorie/

---

## Other places
- r/webdev: Showoff Saturday only. Use the Reddit post, shorter.
- Angular Discord, #showcase: the short post plus one screenshot.
- Angular newsletters and blogs (for example ng-news, Angular Addicts): send the dev.to link with two lines.

## After posting
- Answer every comment on day one, also the critical ones. Thank people for bug reports and fix fast.
- Do not ask for upvotes or stars. Communities remove posts for it.
- Collect requests as GitHub issues, and update `ROADMAP.md` when the order changes.
