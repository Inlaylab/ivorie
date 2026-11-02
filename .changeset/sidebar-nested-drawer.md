---
"@inlaylab/ivorie": patch
---

Sidebar: the mobile drawer works when `iv-sidebar` sits inside a layout element of the provider (for example a row next to `ivSidebarInset`). Before, that element was made inert with the rest of the page, so the drawer's links could not be clicked.
