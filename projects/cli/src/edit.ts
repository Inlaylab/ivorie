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
