// The changelog page's data: CHANGELOG.md, one entry per release, newest first.
// Each release is `## X.Y.Z — YYYY-MM-DD`, a one-line title, then its notes under
// `### New`, `### Changed`, `### Improvements` and `### Fixes`, in that order (each optional).

export type ChangelogKind = 'new' | 'changed' | 'improvements' | 'fixes';

export interface ChangelogSection {
  kind: ChangelogKind;
  label: string;
  /** The section's notes in Markdown. */
  body: string;
}

export interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  sections: ChangelogSection[];
}

const KINDS: Record<string, ChangelogKind> = { New: 'new', Changed: 'changed', Improvements: 'improvements', Fixes: 'fixes' };
const ORDER = Object.values(KINDS);

/** A section's notes, one HTML string per list item. Notes are flat lists; anything else stays one item. */
export function splitItems(html: string): string[] {
  const items = [...html.matchAll(/<li>([\s\S]*?)<\/li>/g)].map((m) => m[1].trim());
  return items.length ? items : [html.trim()];
}

const xml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** The changelog as an RSS 2.0 feed: one item per release, linked to its anchor on the changelog page. */
export function changelogRss(
  releases: { version: string; date: string; title: string; sections: { label: string; html: string }[] }[],
  site: string,
): string {
  const page = new URL('changelog/', site).href;
  const items = releases.map((r) => {
    const link = `${page}#v${r.version.replaceAll('.', '-')}`;
    const notes = r.sections.map((s) => `<h3>${s.label}</h3>${s.html}`).join('');
    return (
      `  <item>\n    <title>${xml(`${r.version} — ${r.title}`)}</title>\n    <link>${link}</link>\n` +
      `    <guid isPermaLink="true">${link}</guid>\n    <pubDate>${new Date(`${r.date}T00:00:00Z`).toUTCString()}</pubDate>\n` +
      `    <description>${xml(notes)}</description>\n  </item>`
    );
  });
  return (
    `<?xml version="1.0" encoding="utf-8"?>\n<rss version="2.0">\n<channel>\n  <title>Ivorie changelog</title>\n  <link>${page}</link>\n` +
    `  <description>Releases of @inlaylab/ivorie and the ivorie CLI.</description>\n${items.join('\n')}\n</channel>\n</rss>\n`
  );
}

export function parseChangelog(md: string): ChangelogEntry[] {
  return md
    .replace(/\r\n/g, '\n')
    .split(/^## /m)
    .slice(1)
    .map((block) => {
      const [heading, ...rest] = block.split('\n');
      const m = /^(\d+\.\d+\.\d+) — (\d{4}-\d{2}-\d{2})$/.exec(heading.trim());
      if (!m) throw new Error(`CHANGELOG.md: "## ${heading}" must be "## X.Y.Z — YYYY-MM-DD"`);
      const [intro, ...parts] = rest.join('\n').split(/^### /m);
      const paragraphs = intro.trim().split(/\n{2,}/);
      const title = paragraphs.shift()!.trim().replace(/\.$/, '');
      // Only the title and the "Both packages" line may sit before the first section.
      if (paragraphs.some((p) => !p.startsWith('Both packages:'))) throw new Error(`CHANGELOG.md ${m[1]}: notes outside a section`);
      const sections = parts.map((part) => {
        const [label, ...lines] = part.split('\n');
        const kind = KINDS[label.trim()];
        if (!kind) throw new Error(`CHANGELOG.md ${m[1]}: unknown section "${label.trim()}" (use ${Object.keys(KINDS).join(', ')})`);
        return { kind, label: label.trim(), body: lines.join('\n').trim() };
      });
      const order = sections.map((s) => ORDER.indexOf(s.kind));
      if (order.some((o, i) => i > 0 && o <= order[i - 1])) throw new Error(`CHANGELOG.md ${m[1]}: sections out of order (${ORDER.join(', ')})`);
      return { version: m[1], date: m[2], title, sections };
    });
}
