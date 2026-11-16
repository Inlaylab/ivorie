// The docs site's own copy of its default style, kept out of previews of another style. The site sets
// `style-<default>` on <body>, and a preview (Home wall, playground stage, their overlays) is a
// `.docs-preview.style-<name>` element inside it, marked `docs-other` when its style is not the site's (PlaygroundLook). The library style would still match inside, and fill in
// what the previewed style leaves out (a rounded thumb in sera, glass panes under nova). Every rule here
// skips those previews. A component page's demo card is a `.docs-preview` with no mark: it keeps the site style.
// The mark is one short class on purpose: it is repeated on every generated rule, and the initial CSS has a budget.
import { readFileSync } from 'node:fs';

/** A preview in another style than the site's. */
export const OTHER_PREVIEW = '.docs-other';
export const NOT_PREVIEW = `:not(${OTHER_PREVIEW} *)`;
/** Own styles set tokens on every element; inside another style's preview nothing may be set, the root included. */
export const EVERY_ELEMENT = `& :where(*:not(${OTHER_PREVIEW}, ${OTHER_PREVIEW} *)) {`;

// A selector line that ends on a hook: `.cn-x {`, `& .cn-x {`, `& .cn-a .cn-b {`, or an item of a list (`.cn-x,`).
const HOOK_SELECTOR = /^(\s+(?:& )?[^@\n]*\.cn-[a-z0-9-]+)( \{|,)$/gm;

export function siteStyle(name: string, css = readFileSync(`projects/ui/styles/style-${name}.css`, 'utf8')): string {
  return css.replace(HOOK_SELECTOR, `$1${NOT_PREVIEW}$2`).replaceAll('& :where(*) {', EVERY_ELEMENT);
}
