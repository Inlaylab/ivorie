---
title: Pagination
description: Page navigation links with previous, next and ellipsis.
section: component
entry: '@inlaylab/ivorie/pagination'
---

Ports the shadcn/ui `Pagination`. It is presentational only. You own the page state, the range and the navigation.

## Usage

```ts
import { IV_PAGINATION_IMPORTS } from '@inlaylab/ivorie/pagination';
```

```html
<nav ivPagination>
  <ul ivPaginationContent>
    <li ivPaginationItem><a ivPaginationPrevious href="#" (click)="prev()"></a></li>
    @for (page of pages; track page) {
      <li ivPaginationItem>
        <a ivPaginationLink href="#" [isActive]="page === currentPage" (click)="goTo(page)">{{ page }}</a>
      </li>
    }
    <li ivPaginationItem><a ivPaginationNext href="#" (click)="next()"></a></li>
  </ul>
</nav>
```

## Examples

### Ellipsis

<!-- demo: pagination-ellipsis -->

### Router links

<!-- demo: pagination-router-links -->

### Custom labels

<!-- demo: pagination-custom-labels -->

## API

Every part also accepts `class`.

### nav[ivPagination]

Root `<nav>`. No own inputs.

### ul[ivPaginationContent]

Flex list. No own inputs.

### li[ivPaginationItem]

One entry. No inputs. It has no `class` input.

### a[ivPaginationLink]

| Name | Type | Default | Description |
|---|---|---|---|
| `isActive` | `boolean` | `false` | Marks the current page. Uses the `outline` button look. Others use `ghost`. |
| `size` | `ButtonVariants['size']` | `'icon'` | Any button size. |

### a[ivPaginationPrevious]

| Name | Type | Default | Description |
|---|---|---|---|
| `text` | `string` | `'Previous'` | Label. Hidden below the `sm` breakpoint. |

### a[ivPaginationNext]

| Name | Type | Default | Description |
|---|---|---|---|
| `text` | `string` | `'Next'` | Label. Hidden below the `sm` breakpoint. |

### span[ivPaginationEllipsis]

Gap marker. No own inputs.

## Accessibility

- The root has `role="navigation"` and `aria-label="pagination"`.
- The active link has `aria-current="page"` and `data-active`.
- Previous and Next have `aria-label` "Go to previous page" and "Go to next page".
- The ellipsis is `aria-hidden` and holds a screen-reader-only "More pages" text.
- Parts are native `nav`, `ul`, `li` and `a`. Give links an `href` or `routerLink` so they are focusable and keyboard-operable.

## Notes

- Selectors sit on native elements. No wrapper divs.
- Disabled state is yours. At the first or last page, add `pointer-events-none opacity-50` and set `aria-disabled` on the link.
- Previous and Next chevrons flip in RTL.
