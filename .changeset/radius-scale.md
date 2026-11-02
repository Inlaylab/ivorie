---
"@inlaylab/ivorie": patch
"ivorie": patch
---

Every radius token now follows `--radius`, as in shadcn/ui: `--radius-sm` to `--radius-4xl` are 0.6x to 2.6x of it. Before, `rounded-2xl`, `rounded-3xl` and `rounded-4xl` (used by the luma, maia and rhea styles) kept Tailwind's fixed sizes, so a smaller radius, even `none`, still left those corners round. At the default radius, `sm`, `md`, `lg` and `xl` are unchanged; `2xl` to `4xl` move to shadcn's current values.
