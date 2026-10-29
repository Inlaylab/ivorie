---
title: Theming
description: Change colors, radius and dark mode with CSS variables.
section: guide
order: 2
---

Ivorie colors are CSS variables set in `theme.css`. Change a variable and every component follows.

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

## Style class

A style class on `<body>` selects the component look: spacing, radius, borders and shadows. Ivorie ships the shadcn/ui styles, copied rule for rule:

| Style | Class | Look |
|---|---|---|
| Vega | `style-vega` | Clean, neutral and familiar. |
| Nova | `style-nova` | Reduced padding and margins. |
| Maia | `style-maia` | Rounded, with generous spacing. |
| Luma | `style-luma` | Fluid, luminous and soft. |
| Rhea | `style-rhea` | Like Luma, but compact. |

Import the file for each style you use, then set its class:

```css
@import "@ivorie/ui/styles/style-nova.css";
```

```html
<body class="style-nova">
```

Use the docs header menu to switch styles on this site.

## Override a token

Declare your values after the imports. Use `:root` for light and `.dark` for dark.

```css
@import "@ivorie/ui/styles/theme.css";
@import "@ivorie/ui/styles/style-maia.css";

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
| `--radius-sm` | `calc(var(--radius) - 4px)` |
| `--radius-md` | `calc(var(--radius) - 2px)` |
| `--radius-lg` | `var(--radius)` |
| `--radius-xl` | `calc(var(--radius) + 4px)` |

```css
:root {
  --radius: 0.5rem;
}
```

More base colors and fonts come later. shadcn pairs each style with a font (Maia uses Figtree, Nova uses Geist); Ivorie sets no font, so add your own.
