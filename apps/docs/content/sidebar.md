---
title: Sidebar
description: A collapsible app sidebar with a mobile drawer and saved state.
section: component
entry: '@ivorie/ui/sidebar'
---

Ports the shadcn/ui `Sidebar`. Desktop modes: slide off-screen, collapse to icons, or fixed. Below 768px it is a modal drawer. The open state is saved in a cookie and works with SSR.

## Usage

```ts
import { IV_SIDEBAR_IMPORTS } from '@ivorie/ui/sidebar';
```

```html
<iv-sidebar-provider>
  <iv-sidebar>
    <iv-sidebar-content>
      <iv-sidebar-group>
        <iv-sidebar-group-label>Navigation</iv-sidebar-group-label>
        <iv-sidebar-group-content>
          <ul ivSidebarMenu>
            <li ivSidebarMenuItem>
              <iv-sidebar-menu-button [isActive]="true" tooltip="Dashboard">
                <span>Dashboard</span>
              </iv-sidebar-menu-button>
            </li>
          </ul>
        </iv-sidebar-group-content>
      </iv-sidebar-group>
    </iv-sidebar-content>
  </iv-sidebar>

  <main ivSidebarInset>
    <iv-sidebar-trigger />
    <!-- page content -->
  </main>
</iv-sidebar-provider>
```

## Examples

### Collapse to icons

<!-- demo: sidebar-collapse-to-icons -->

### Floating and inset

<!-- demo: sidebar-floating-and-inset -->

### Right side

Set `side="right"` and place `iv-sidebar` after `main[ivSidebarInset]`, so its layout gap is on the right.

<!-- demo: sidebar-right-side -->

### Sub-menus

<!-- demo: sidebar-sub-menus -->

### Programmatic control

<!-- demo: sidebar-programmatic-control -->

## API

Every part also accepts `class`, except where noted.

### iv-sidebar-provider

Root. Provides `IvSidebarService` (one per provider), sets `--sidebar-width: 16rem` and `--sidebar-width-icon: 3rem`, and listens for Ctrl+B / Cmd+B.

| Name | Type | Default | Description |
|---|---|---|---|
| `defaultOpen` | `boolean` | `true` | Open state when no `sidebar_state` cookie is saved. A saved cookie wins. |
| `cookieName` | `string` | `'sidebar_state'` | Cookie that saves open/closed. Give each sidebar on a page its own name; `''` saves nothing. |

### iv-sidebar

| Name | Type | Default | Description |
|---|---|---|---|
| `side` | `'left' \| 'right'` | `'left'` | Edge the sidebar sits on. |
| `variant` | `'sidebar' \| 'floating' \| 'inset'` | `'sidebar'` | `sidebar` fills the edge. `floating` and `inset` are padded and rounded. |
| `collapsible` | `'offcanvas' \| 'icon' \| 'none'` | `'offcanvas'` | `offcanvas` slides out. `icon` shrinks to icon width. `none` is always fixed open and never a drawer. |

`class` goes on the fixed container on desktop, and on the panel when `collapsible="none"`.

### iv-sidebar-trigger

Icon button that calls `toggle()`. Has an `aria-expanded` state and a screen-reader label "Toggle Sidebar".

### iv-sidebar-rail

Thin clickable strip on the sidebar edge. Toggles the sidebar. No inputs, no `class`.

### main[ivSidebarInset]

Main content area next to the sidebar. Also matches any `[ivSidebarInset]`.

### iv-sidebar-header, iv-sidebar-footer, iv-sidebar-content

Top, bottom and scrollable middle regions. No inputs, no `class`.

### iv-sidebar-separator

Horizontal rule with `role="separator"`. No inputs, no `class`.

### iv-sidebar-group, iv-sidebar-group-content

Group wrapper and its content area. No inputs, no `class`.

### iv-sidebar-group-label

Muted group heading. Hidden when collapsed to icons. No own inputs.

### iv-sidebar-group-action

Action button in the group header. Hidden when collapsed to icons. No own inputs.

### ul[ivSidebarMenu], li[ivSidebarMenuItem]

Menu list and item. No inputs, no `class`.

### iv-sidebar-menu-button

| Name | Type | Default | Description |
|---|---|---|---|
| `isActive` | `boolean` | `false` | Marks the current page. Sets `data-active` and `aria-current="page"`. |
| `variant` | `'default' \| 'outline'` | `'default'` | Button style. |
| `size` | `'default' \| 'sm' \| 'lg'` | `'default'` | Height. |
| `tooltip` | `string` | `''` | Label shown on hover only while the sidebar is collapsed to icons on desktop. |

### iv-sidebar-menu-action

| Name | Type | Default | Description |
|---|---|---|---|
| `showOnHover` | `boolean` | `false` | Hide until the item is hovered or focused (from `md` up). |

### iv-sidebar-menu-badge

Count or label at the item end. Hidden when collapsed to icons. No own inputs.

### iv-sidebar-menu-skeleton

Loading placeholder with a deterministic width, so server and client match. No `class`.

| Name | Type | Default | Description |
|---|---|---|---|
| `showIcon` | `boolean` | `false` | Show an icon placeholder. |

### ul[ivSidebarMenuSub], li[ivSidebarMenuSubItem]

Nested list and item. Sub-menus hide when collapsed to icons. No inputs, no `class`.

### a[ivSidebarMenuSubButton]

| Name | Type | Default | Description |
|---|---|---|---|
| `size` | `'sm' \| 'md'` | `'md'` | Text size. |
| `isActive` | `boolean` | `false` | Marks the current page. Sets `data-active` and `aria-current="page"`. |

### IvSidebarService

Inject it inside a provider to read or drive the sidebar. State is signals.

| Name | Type | Description |
|---|---|---|
| `state` | `Signal<'expanded' \| 'collapsed'>` | Desktop state. |
| `open` | `WritableSignal<boolean>` | Desktop open state. Starts from the cookie, else `defaultOpen`. |
| `openMobile` | `WritableSignal<boolean>` | Drawer open state. |
| `isMobile` | `WritableSignal<boolean>` | True below 768px. |
| `expanded` | `Signal<boolean>` | Open state of the form showing: drawer on mobile, panel on desktop. |
| `toggle()` | `() => void` | Flip the visible form. |
| `setOpen(value)` | `(boolean) => void` | Set the visible form. On desktop it also writes the cookie. |

## Accessibility

- Ctrl+B or Cmd+B toggles the sidebar from anywhere on the page.
- On mobile the sidebar is a modal drawer with `role="dialog"`, `aria-modal="true"` and `aria-label="Sidebar"`.
- Focus is trapped in the open drawer and moves into it. Escape or a click on the backdrop closes it. Focus returns to the element that had it before.
- The trigger is a `<button>` with `aria-expanded` and `aria-controls` (the sidebar id).
- The rail is a button with `aria-label="Toggle Sidebar"` and is out of the Tab order.
- The active menu button and sub button have `aria-current="page"`.

## Notes

- Mobile breakpoint is `max-width: 767px`. The viewport is checked after the first render.
- To render the server HTML in mobile mode already, set `provideIvorie({ sidebarMobile: true })`, for example from a user-agent hint.
- The desktop state is saved in the `sidebar_state` cookie for 7 days. The server reads it from the request `Cookie` header, so the first HTML has the right state. The cookie is written only in the browser. The mobile drawer is not saved.
- Colors come from the `--sidebar*` tokens in `projects/ui/styles/theme.css`, which map to the main tokens by default.
- Each provider has its own service. Nested providers are independent sidebars.
- `sidebarMenuButtonVariants` and `SidebarMenuButtonVariants` are exported.
