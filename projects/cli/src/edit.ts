// Small, idempotent edits to user files. Line endings and a BOM are kept.
import path from 'node:path';

const importTarget = (line: string) => /^\s*@import\s+(?:url\(\s*)?["']([^"']+)["']/.exec(line)?.[1];

/** Adds each missing `@import` after the last existing one (else at the top). */
export function ensureCssImports(css: string, imports: string[]): string {
  const bom = css.startsWith('﻿') ? '﻿' : '';
  const body = css.slice(bom.length);
  const eol = body.includes('\r\n') ? '\r\n' : '\n';
  const lines = body === '' ? [] : body.split(/\r?\n/);
  const present = new Set(lines.map(importTarget).filter(Boolean));
  const missing = imports.filter((i) => !present.has(importTarget(i)));
  if (!missing.length) return css;
  if (!lines.length) return bom + missing.join(eol) + eol;
  let last = -1;
  lines.forEach((l, i) => {
    if (importTarget(l)) last = i;
  });
  lines.splice(last + 1, 0, ...missing);
  return bom + lines.join(eol);
}

/** Sets one `style-<name>` class on `<body>`, replacing any other style-* class. */
export function setBodyStyleClass(html: string, style: string): string {
  return html.replace(/<body\b([^>]*)>/i, (_tag, attrs: string) => {
    const want = `style-${style}`;
    const cls = /\sclass\s*=\s*"([^"]*)"/i.exec(attrs);
    if (!cls) return `<body${attrs} class="${want}">`;
    const kept = cls[1].split(/\s+/).filter((c) => c && !/^style-[a-z0-9-]+$/.test(c));
    return `<body${attrs.replace(cls[0], ` class="${[...kept, want].join(' ')}"`)}>`;
  });
}

/** A CSS/TS import path from one file to another: always '/', always starting with '.'. */
export function relativeImport(fromFile: string, toFile: string, p: typeof path = path): string {
  const rel = p.relative(p.dirname(fromFile), toFile).split(p.sep).join('/');
  return rel.startsWith('.') ? rel : `./${rel}`;
}

const IMPORT_END = /^import\s+['"]|\bfrom\s+['"][^'"]+['"];?\s*$/;

/**
 * Points app.config.ts at one icon set: two imports and `provideIvIcons(COMPONENT_ICONS)` first in `providers`.
 * No `setImport` removes them (lucide is the default). Unchanged when there is no `providers: [`.
 */
export function setIconProvider(ts: string, iconImport: string, setImport?: string): string {
  const eol = ts.includes('\r\n') ? '\r\n' : '\n';
  const out = ts
    .replace(/^import \{ (?:provideIvIcons|COMPONENT_ICONS) \} from '[^']*';\r?\n/gm, '')
    .replace(/provideIvIcons\(COMPONENT_ICONS\)(,\s*)?/, '');
  if (!setImport) return out;
  if (!/providers:\s*\[/.test(out)) return ts;
  const lines = out.split(/\r?\n/);
  let last = -1;
  lines.forEach((l, i) => {
    if (IMPORT_END.test(l)) last = i;
  });
  lines.splice(last + 1, 0, `import { provideIvIcons } from '${iconImport}';`, `import { COMPONENT_ICONS } from '${setImport}';`);
  return lines
    .join(eol)
    .replace(/(providers:\s*\[)(\s*\])?/, (_m, open: string, close?: string) => `${open}provideIvIcons(COMPONENT_ICONS)${close ? ']' : ', '}`);
}
