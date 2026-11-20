---
title: Bar List
description: Ranked rows, each name on a bar as long as its share, its number at the end.
section: component
entry: '@inlaylab/ivorie/bar-list'
---

For top pages, countries and referrers.

## Usage

```ts
import { IvBarList, type IvBarListItem } from '@inlaylab/ivorie/bar-list';
```

```html
<iv-bar-list [data]="pages" aria-label="Top pages" />
```

## API

Every part also accepts `class`.

### iv-bar-list

| Name | Type | Default | Description |
|---|---|---|---|
| `data` | `IvBarListItem[]` | `[]` | Rows: `name`, `value`, optional `href`. |
| `sort` | `'descending' \| 'ascending' \| 'none'` | `'descending'` | Row order. |
| `format` | `(value: number) => string` | `toLocaleString` | How each number reads. |

## Accessibility

A list of list items. Name it with `aria-label`. The bars are hidden; the number is text. A row with `href` is a link.

## Notes

Bars are sized against the largest value. A small value still shows a sliver.
