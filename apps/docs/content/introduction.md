---
title: Introduction
description: What Ivorie is, what it gives you, and how to add it.
section: guide
group: start
order: 0
---

Ivorie is a set of Angular components with the classes, variants and behavior of [shadcn/ui](https://ui.shadcn.com). It is built for Angular 22: signals, OnPush, no zone.js, and server rendering.

## What you get

- **Components.** Forms, overlays, menus, layout, data tables, charts and metrics. Each one follows its ARIA pattern and works with the keyboard.
- **Themes.** Every component reads CSS variables and theme hooks, so one theme file changes the whole look. Your markup does not change. See [Theming](docs/theming).
- **Blocks.** Login, sign up, sidebar, dashboard and data pages, built from the components. See [Blocks](blocks).

## Two ways to add it

| | The npm package | The CLI |
|---|---|---|
| What you get | `@inlaylab/ivorie` in `node_modules` | The component source in your app |
| Updates | `npm update` | Run `npx ivorie add` again, or edit the files yourself |
| Change a component | Override classes and tokens | Change the code |
| Start | `npm i @inlaylab/ivorie` | `npx ivorie init` |

Both use the same components and themes. You can start with one and move to the other.

## When to use it

Use Ivorie when you build an Angular app and want shadcn/ui's look and behavior without writing the components yourself. If you want Material Design, use Angular Material instead.

## Next

1. [Install Ivorie](docs/installation).
2. Pick a theme in the [playground](playground).
3. Read a component page, for example [Button](docs/button).
