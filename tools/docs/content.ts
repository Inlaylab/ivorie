// Markdown → DocPage. Pure functions; build.ts does the file IO.
import { Marked, Renderer, type Tokens } from 'marked';
import { createHighlighter as shiki, type Highlighter } from 'shiki';
import type {
  DocDemoSource,
  DocPage,
  DocSection,
  DocSegment,
  TocItem,
} from '../../apps/docs/src/app/content/types.ts';

export interface Frontmatter {
  title: string;
  description: string;
  section: DocSection;
  entry?: string;
  order?: number;
}

export type Render = (md: string, slugs?: Map<string, number>) => { html: string; toc: TocItem[] };

const DEMO_MARKER = /^<!-- demo: ([a-z0-9-]+) -->$/;
const FENCE = /^(```|~~~)/;
const LANGS = ['ts', 'html', 'css', 'bash', 'json'];

export function createHighlighter(): Promise<Highlighter> {
  return shiki({ themes: ['github-light', 'github-dark'], langs: LANGS });
}

export function parseFrontmatter(md: string, file: string): { data: Frontmatter; body: string } {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(md);
  if (!m) throw new Error(`${file}: missing frontmatter`);
  const raw: Record<string, string> = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = /^(\w+):\s*(.*)$/.exec(line);
    if (kv) raw[kv[1]] = kv[2].trim().replace(/^(['"])(.*)\1$/, '$2');
  }
  const need = (key: string) => {
    if (!raw[key]) throw new Error(`${file}: missing ${key}`);
    return raw[key];
  };
  const section = need('section');
  if (section !== 'guide' && section !== 'component') {
    throw new Error(`${file}: section must be guide or component`);
  }
  const data: Frontmatter = { title: need('title'), description: need('description'), section };
  if (section === 'component') data.entry = need('entry');
  else {
    data.order = Number(need('order'));
    if (Number.isNaN(data.order)) throw new Error(`${file}: order must be a number`);
  }
  return { data, body: md.slice(m[0].length) };
}

export function splitDemos(
  body: string,
): Array<{ kind: 'md'; md: string } | { kind: 'demo'; name: string }> {
  const parts: Array<{ kind: 'md'; md: string } | { kind: 'demo'; name: string }> = [];
  let buf: string[] = [];
  let fence = '';
  const flush = () => {
    const md = buf.join('\n');
    if (md.trim()) parts.push({ kind: 'md', md });
    buf = [];
  };
  for (const line of body.split(/\r?\n/)) {
    const f = FENCE.exec(line.trim());
    if (f) fence = fence ? (line.trim().startsWith(fence) ? '' : fence) : f[1];
    const demo = fence ? null : DEMO_MARKER.exec(line.trim());
    if (demo) {
      flush();
      parts.push({ kind: 'demo', name: demo[1] });
    } else buf.push(line);
  }
  flush();
  return parts;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s-]+/g, '-')
    .replace(/^-|-$/g, '');
}

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'" };
const plain = (html: string) =>
  html.replace(/<[^>]+>/g, '').replace(/&(amp|lt|gt|quot|#39);/g, (_, e: string) => ENTITIES[e]);

export function createRenderer(highlighter: Highlighter): Render {
  const loaded = new Set(highlighter.getLoadedLanguages());
  return (md, slugs = new Map()) => {
    const toc: TocItem[] = [];
    const marked = new Marked({
      renderer: {
        heading({ tokens, depth }: Tokens.Heading) {
          const inner = this.parser.parseInline(tokens);
          const text = plain(inner);
          const base = slugify(text) || 'section';
          const n = slugs.get(base) ?? 0;
          slugs.set(base, n + 1);
          const id = n ? `${base}-${n}` : base;
          if (depth === 2 || depth === 3) toc.push({ id, text, level: depth });
          return `<h${depth} id="${id}">${inner}</h${depth}>\n`;
        },
        code({ text, lang }: Tokens.Code) {
          const name = (lang ?? '').split(/\s/)[0];
          return highlighter.codeToHtml(text, {
            lang: loaded.has(name) ? name : 'text',
            themes: { light: 'github-light', dark: 'github-dark' },
            defaultColor: false,
          });
        },
        table(token: Tokens.Table) {
          return `<div class="docs-table">${Renderer.prototype.table.call(this, token)}</div>\n`;
        },
      },
    });
    return { html: marked.parse(md, { async: false }), toc };
  };
}

export function buildPage(input: {
  slug: string;
  file: string;
  md: string;
  demos: Map<string, string>;
  render: Render;
}): DocPage {
  const { slug, file, render } = input;
  const { data, body } = parseFrontmatter(input.md, file);
  const parts = splitDemos(body);
  if (data.section === 'component') {
    if (!input.demos.has(slug)) {
      throw new Error(`missing main demo: apps/docs/src/app/demos/${slug}/${slug}.ts`);
    }
    parts.unshift({ kind: 'demo', name: slug });
  }
  const slugs = new Map<string, number>();
  const segments: DocSegment[] = [];
  const toc: TocItem[] = [];
  const demos: Record<string, DocDemoSource> = {};
  for (const part of parts) {
    if (part.kind === 'md') {
      const out = render(part.md, slugs);
      segments.push({ kind: 'html', html: out.html });
      toc.push(...out.toc);
      continue;
    }
    const raw = input.demos.get(part.name);
    if (raw === undefined) throw new Error(`unknown demo "${part.name}" in ${file}`);
    // A fence longer than any backtick run in the source, so the source cannot close it.
    const fence = '`'.repeat(Math.max(3, ...(raw.match(/`+/g) ?? []).map((r) => r.length + 1)));
    demos[part.name] ??= { code: render(`${fence}ts\n${raw}\n${fence}`).html, raw };
    segments.push(part);
    // Install tabs (CLI / npm) right after the main demo.
    if (part.name === slug && data.entry && segments.length === 1) {
      segments.push({ kind: 'install', slug, entry: data.entry });
    }
  }
  return {
    slug,
    title: data.title,
    description: data.description,
    section: data.section,
    entry: data.entry ?? null,
    segments,
    toc,
    demos,
  };
}
