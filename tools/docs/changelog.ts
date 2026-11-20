// The changelog page's data: CHANGELOG.md, one entry per release, newest first.
// Each release is `## X.Y.Z — YYYY-MM-DD`, then a one-line title, then the notes.

export interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  /** The notes in Markdown, without the title and the "Both packages" line. */
  body: string;
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
      const paragraphs = rest.join('\n').trim().split(/\n{2,}/);
      const title = paragraphs.shift()!.trim().replace(/\.$/, '');
      const body = paragraphs.filter((p) => !p.startsWith('Both packages:')).join('\n\n').trim();
      return { version: m[1], date: m[2], title, body };
    });
}
