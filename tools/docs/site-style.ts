// The docs site's own nova, kept out of previews. The site sets `style-nova` on <body>, and a preview
// (Home wall, playground stage, their overlays) is a `.docs-preview.style-<name>` element inside it.
// Library nova would still match inside, and fill in what the previewed style leaves out
// (a rounded thumb in sera, nova's thumb travel in luma). Every rule here skips those previews.
import { readFileSync } from 'node:fs';

const NOT_PREVIEW = ':not(.docs-preview:not(.style-nova) *)';

export function siteNova(css = readFileSync('projects/ui/styles/style-nova.css', 'utf8')): string {
  return css.replace(/^( {4}\.cn-[a-z0-9-]+) \{$/gm, `$1${NOT_PREVIEW} {`);
}
