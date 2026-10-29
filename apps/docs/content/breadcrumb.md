---
title: Breadcrumb
description: Show the path to the current page.
section: component
entry: '@ivorie/ui/breadcrumb'
---

Ports the shadcn/ui `Breadcrumb`. Each part is an attribute selector on a native element, so there are no wrapper elements.

## Usage

```ts
import { IV_BREADCRUMB_IMPORTS } from '@ivorie/ui/breadcrumb';
```

```html
<nav ivBreadcrumb>
  <ol ivBreadcrumbList>
    <li ivBreadcrumbItem><a ivBreadcrumbLink routerLink="/home">Home</a></li>
    <li ivBreadcrumbSeparator></li>
    <li ivBreadcrumbItem><span ivBreadcrumbPage>Profile</span></li>
  </ol>
</nav>
```

## Examples

### Ellipsis

<!-- demo: breadcrumb-ellipsis -->

### Custom separator

<!-- demo: breadcrumb-custom-separator -->

## API

Every part also accepts `class`.

### nav[ivBreadcrumb]

Root `<nav>`. No own inputs.

### ol[ivBreadcrumbList]

Wrapping flex list. No own inputs.

### li[ivBreadcrumbItem]

One crumb. No own inputs.

### a[ivBreadcrumbLink]

A navigable crumb. Works with `href` and `routerLink`. No own inputs.

### span[ivBreadcrumbPage]

The current page. Not navigable. No own inputs.

### li[ivBreadcrumbSeparator]

Place it between items. Shows a chevron by default.

| Name | Type | Default | Description |
|---|---|---|---|
| `showDefault` | `boolean` | `true` | Show the built-in chevron. Set `false` when you project your own separator. |

### span[ivBreadcrumbEllipsis]

Marks collapsed crumbs. Put it inside an `li[ivBreadcrumbItem]`. No own inputs.

## Accessibility

- The root `<nav>` has `aria-label="breadcrumb"`.
- The current page has `role="link"`, `aria-disabled="true"` and `aria-current="page"`.
- Separators have `role="presentation"` and `aria-hidden="true"`. The chevron flips in RTL.
- The ellipsis is `aria-hidden` and holds a screen-reader-only "More" text.

## Notes

- The separator is a sibling `li`, not a child of the item.
