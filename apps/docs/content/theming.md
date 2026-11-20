---
title: Theming
description: Pick a theme, tune it, set its dials, change colors with CSS variables.
section: guide
order: 2
---

Ivorie colors are CSS variables set in `theme.css`. Change a variable and every component follows.

## Themes and dials

A theme is what you pick. Each comes with its own accent, base color, font and radius. Change any of them, and set the dials.

```
Theme   slate, glass, bento …   the look of every component, plus its own defaults
Change  accent, base color, chart color, menu highlight, font, heading font, radius, icons
Dials   density, contrast, motion …   tune the theme inside its signature
```

`npx ivorie init` gives the slate theme with the blue accent. Slate was called graphite in 1.5; `graphite` still works until 2.0. Pass another with `--theme <name>`, or switch later with `npx ivorie apply <name>`.

| Theme | Base color, accent | Font | Radius | Dials |
|---|---|---|---|---|
| `slate` | zinc, blue | Geist | small | none |
| `glass` | neutral, violet | Inter | large | none |
| `bento` | neutral, lime | Outfit | large | none |
| `midnight` | zinc, sky | Geist | medium | none |
| `clay` | taupe, rose, accent menus | Figtree | medium | none |
| `mono` | neutral, amber | Geist Mono | none | motion snappy |
| `tint` | mauve, fuchsia | Figtree | default | none |
| `nova` | zinc, indigo | DM Sans | default | none |
| `luma` | mist, cyan | Nunito Sans | large | none |
| `mira` | neutral, emerald | IBM Plex Sans | small | density compact |
| `sera` | taupe, red | Source Sans 3, Playfair Display headings | none | none |

Each theme has a signature that no dial removes, and takes only the dials that fit it:

| Theme | Signature | Dials |
|---|---|---|
| Glass | Translucent panes. Edges drawn with light. Page light from the accent and its chart colors. | density, contrast, motion, panels, rim, shadow, blur, ambient |
| Bento | Tonal tiles, no outlines. The chosen item is an ink pill. The hero card is filled. | density, contrast, motion, panels, rim, shadow |
| Clay | Warm tiles with a fine inner rim and light titles. The chosen item takes the accent. The hero card is a well. | density, contrast, motion, panels, rim, shadow |
| Midnight | Deep panes and hairlines. The accent shows as light under the hero card, the primary button and chart bars. | density, contrast, motion, panels, rim, shadow, blur |
| Slate | Matte and solid. A lit top edge, pressed-in fields. | density, contrast, motion, rim, shadow |
| Tint | Every surface takes a wash of `--primary`. | density, contrast, motion, panels, shadow |
| Mono | A terminal. Flat hairlines, a block caret. | density, contrast, motion |
| Classic | shadcn/ui's own looks: nova, luma, mira, sera. | density, contrast, motion |

| Dial | Values (default first) | What it does |
|---|---|---|
| `density` | `default`, `compact`, `roomy` | Sets `--spacing` to 0.8 or 1.2 times Tailwind's. |
| `contrast` | `default`, `soft`, `high` | Remixes `--border` and `--input` toward the background (soft) or the text (high). High also darkens muted text. |
| `motion` | `calm`, `snappy`, `off` | Snappy: shorter, springy transitions. Off: no transitions or animations. |
| `panels` | `default`, `solid`, `translucent` | Solid or see-through panes (`--iv-panel-solid`). |
| `rim` | `default`, `none`, `subtle`, `strong` | Scales the edge light (`--iv-rim`). |
| `shadow` | `default`, `none`, `soft`, `deep` | Scales the shadows (`--iv-shadow`). |
| `blur` | `default`, `low`, `high` | Scales the backdrop blur (`--iv-blur`). |
| `ambient` | `default`, `off`, `soft`, `vivid` | Scales the light on the page behind the panes (`--iv-ambient`). Light mode only; a dark Glass page stays unlit. |

Density sets `--spacing` on `:root`, so it scales every Tailwind spacing value in your app, your own `p-*` and `gap-*` too, not only Ivorie parts. That is what a compact mode means in most apps. The default theme leaves it at `default`.

A dial a theme does not take is greyed out in the [playground](playground). The CLI drops it and says so.

`IvCard` takes `emphasis="hero"` for the lead card. Each Ivorie theme gives it its own treatment; Classic themes show a normal card.

## Tokens

The `:root` block holds the light values. The `.dark` block holds the dark values for the same names, except `--radius`. The values are the shadcn/ui `neutral` base color.

| Name | Light value | Use |
|---|---|---|
| `--radius` | `0.625rem` | Base corner radius. |
| `--background` | `oklch(1 0 0)` | Page background. |
| `--foreground` | `oklch(0.145 0 0)` | Default text. |
| `--card` | `oklch(1 0 0)` | Card background. |
| `--card-foreground` | `oklch(0.145 0 0)` | Text on cards. |
| `--popover` | `oklch(1 0 0)` | Popover, menu and dialog background. |
| `--popover-foreground` | `oklch(0.145 0 0)` | Text on popovers. |
| `--primary` | `oklch(0.205 0 0)` | Primary buttons and accents. |
| `--primary-foreground` | `oklch(0.985 0 0)` | Text on primary. |
| `--secondary` | `oklch(0.97 0 0)` | Secondary surfaces. |
| `--secondary-foreground` | `oklch(0.205 0 0)` | Text on secondary. |
| `--muted` | `oklch(0.97 0 0)` | Muted surfaces. |
| `--muted-foreground` | `oklch(0.556 0 0)` | Muted and placeholder text. |
| `--accent` | `oklch(0.97 0 0)` | Hover and active surfaces. |
| `--accent-foreground` | `oklch(0.205 0 0)` | Text on accent. |
| `--destructive` | `oklch(0.577 0.245 27.325)` | Errors and destructive actions. |
| `--border` | `oklch(0.922 0 0)` | Borders and dividers. |
| `--input` | `oklch(0.922 0 0)` | Input borders. |
| `--ring` | `oklch(0.708 0 0)` | Focus ring. |
| `--chart-1` | `oklch(0.87 0 0)` | Chart color 1. |
| `--chart-2` | `oklch(0.556 0 0)` | Chart color 2. |
| `--chart-3` | `oklch(0.439 0 0)` | Chart color 3. |
| `--chart-4` | `oklch(0.371 0 0)` | Chart color 4. |
| `--chart-5` | `oklch(0.269 0 0)` | Chart color 5. |
| `--sidebar` | `oklch(0.985 0 0)` | Sidebar background. |
| `--sidebar-foreground` | `oklch(0.145 0 0)` | Sidebar text. |
| `--sidebar-primary` | `oklch(0.205 0 0)` | Sidebar primary accent. |
| `--sidebar-primary-foreground` | `oklch(0.985 0 0)` | Text on sidebar primary. |
| `--sidebar-accent` | `oklch(0.97 0 0)` | Sidebar hover surface. |
| `--sidebar-accent-foreground` | `oklch(0.205 0 0)` | Text on sidebar accent. |
| `--sidebar-border` | `oklch(0.922 0 0)` | Sidebar borders. |
| `--sidebar-ring` | `oklch(0.708 0 0)` | Sidebar focus ring. |

## Dark mode

Add the class `dark` to `<html>`.

```html
<html class="dark">
```

## Theme class

A theme class on `<body>` (or any element) turns the theme on: spacing, radius, borders and shadows. Ivorie ships seven themes of its own and shadcn/ui's, copied rule for rule. Vega, Maia, Rhea and Lyra are legacy: they still work, are hidden from pickers, and leave in 2.0.

| Theme | Class | Signature |
|---|---|---|
| Glass | `theme-glass` | Thick panes of neutral glass. Edges drawn with light: a rim on top, a hairline, a shadow below. The faint light under the glass follows `--primary`. Solid when the browser has no backdrop blur or the user asks for less transparency. |
| Bento | `theme-bento` | Tonal tiles on a toned page, no outlines, big type. The chosen tab, toggle and page are ink pills. |
| Clay | `theme-clay` | Bento's tiles and wells, with a fine inner rim, light titles, accent pills for the chosen item and a hero card sunk into a well. |
| Midnight | `theme-midnight` | Deep neutral panes and hairlines. The accent shows as light: it pools under the hero card, glows under the primary button, lights the top of chart bars. Made for dark; light mode is a calm dusk. |
| Slate | `theme-slate` | Matte solid panes, no blur. A fine line of light on the top edge, a hairline round, a short shadow below. Fields and tracks are pressed in. |
| Tint | `theme-tint` | Page, panes, lines and states take a light wash of `--primary`. Pick an accent and the whole UI carries its hue. |
| Mono | `theme-mono` | A terminal: flat, with hairlines, a block caret, inverted selection and spaced capital labels. Made for a mono font (the playground picks Geist Mono). |
| Nova | `theme-nova` | Reduced padding and margins. |
| Luma | `theme-luma` | Fluid, luminous and soft. |
| Mira | `theme-mira` | Made for compact interfaces. |
| Sera | `theme-sera` | Editorial and typographic. |
| Vega (legacy) | `theme-vega` | Clean, neutral and familiar. |
| Maia (legacy) | `theme-maia` | Rounded, with generous spacing. |
| Rhea (legacy) | `theme-rhea` | Like Luma, but compact. |
| Lyra (legacy) | `theme-lyra` | Boxy and sharp. For mono fonts. |

Import the file for each theme you use, then set its class:

```css
@import "@inlaylab/ivorie/styles/theme-nova.css";
```

```html
<body class="theme-nova">
```

Before 1.6 these were called styles: `style-nova.css` and `class="style-nova"`. Both still work until 2.0.

Try each theme, with your colors and radius, in the [playground](playground).

## Override a token

Declare your values after the imports. Use `:root` for light and `.dark` for dark.

```css
@import "@inlaylab/ivorie/styles/theme.css";
@import "@inlaylab/ivorie/styles/theme-nova.css";

:root {
  --primary: oklch(0.55 0.2 260);
  --primary-foreground: oklch(0.98 0 0);
}

.dark {
  --primary: oklch(0.75 0.15 260);
  --primary-foreground: oklch(0.2 0.04 260);
}
```

## Radius

Set `--radius` once. Other radii derive from it in `theme.css`.

| Token | Value |
|---|---|
| `--radius-sm` | `calc(var(--radius) * 0.6)` |
| `--radius-md` | `calc(var(--radius) * 0.8)` |
| `--radius-lg` | `var(--radius)` |
| `--radius-xl` | `calc(var(--radius) * 1.4)` |
| `--radius-2xl` | `calc(var(--radius) * 1.8)` |
| `--radius-3xl` | `calc(var(--radius) * 2.2)` |
| `--radius-4xl` | `calc(var(--radius) * 2.6)` |

```css
:root {
  --radius: 0.5rem;
}
```

## Accent and chart colors

The base colors are near-gray, so charts are gray too. An accent adds color: it sets `--primary`, `--secondary`, `--sidebar-primary` and the chart colors `--chart-1` to `--chart-5` over the base color. The 17 accents are shadcn/ui's: red, orange, amber, yellow, lime, green, emerald, teal, cyan, sky, blue, indigo, violet, purple, fuchsia, pink and rose.

- **Chart color** picks where `--chart-1…5` come from: the accent (default), the base color's grays, or another accent.
- **Menu accent** `bold` paints menu and list highlights (`--accent`) in the primary color. `subtle` keeps the base color's.

```bash
npx ivorie init --accent blue --chart-color emerald --menu-accent bold
```

## Share codes

The [playground](playground) turns your theme and every change you made into one code (`ivp1_…`). Run `npx ivorie init --theme ivp1_…` in a new app or `npx ivorie apply ivp1_…` in an existing one.

| Radius | `--radius` |
|---|---|
| `default` | `0.625rem` (theme value) |
| `none` | `0` |
| `small` | `0.45rem` |
| `medium` | `0.625rem` |
| `large` | `0.875rem` |

A font sets `--font-sans`. A heading font sets `--font-heading`, used by card, dialog, sheet, drawer and empty titles (`.cn-font-heading`). With no heading font, titles use `--font-sans`. Fonts come from `@fontsource-variable` packages.
