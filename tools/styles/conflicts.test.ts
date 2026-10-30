// shadcn inlines a hook's rule where the hook sits, so a later hook's rule beats an earlier base utility.
// Ours sit in @layer components and always lose to base utilities. Flag every case where that differs.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { twMerge } from 'tailwind-merge';
import { STYLES, UI } from './hooks.ts';

const css = readFileSync(join(STYLES, 'style-maia.css'), 'utf8');
const rules = new Map(
  [...css.matchAll(/\.(cn-[a-z0-9-]+) \{\s*@apply ([^;]+);/g)].map((m) => [m[1], m[2].split(/\s+/)]),
);

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return name === 'styles' || name === 'testing' ? [] : files(path);
    return name.endsWith('.ts') && !name.endsWith('.spec.ts') ? [path] : [];
  });
}

/** Class literals of each top-level statement (a cva call or a component), each split into tokens. */
function units(source: string): string[][][] {
  return source
    .split(/\n(?=@Component\(|@Directive\(|export const |const )/)
    .map((unit) =>
      [...unit.matchAll(/(['"`])((?:(?!\1)[^])*)\1/g)]
        // Templates style inner elements, not the host; "display: contents" is CSS, not classes.
        .filter((m) => !m[2].includes('<') && !/^[a-z-]+: /.test(m[2]))
        .map((m) => m[2].split(/\s+/).filter(Boolean)),
    )
    .filter((literals) => literals.flat().some((t) => t.startsWith('cn-')));
}

// A cva option ("cn-badge-variant-destructive …"): two different options never apply together.
const isOption = (literal: string[]) => /^cn-.+-(variant|size|orientation|align)-/.test(literal[0] ?? '');

export function conflicts(literals: string[][], ruleOf: (hook: string) => string[] | undefined): string[] {
  const found: string[] = [];
  literals.forEach((literal, i) =>
    literal.forEach((base, k) => {
      if (base.startsWith('cn-')) return;
      const later = literals.flatMap((other, j) =>
        j === i ? other.slice(k + 1) : j > i && !(isOption(literal) && isOption(other)) ? other : [],
      );
      for (const hook of later.filter((t) => t.startsWith('cn-'))) {
        for (const rule of ruleOf(hook) ?? []) {
          if (!twMerge(`${base} ${rule}`).split(' ').includes(base)) found.push(`${base} < ${hook} { ${rule} }`);
        }
      }
    }),
  );
  return found;
}

test('conflicts() flags a base utility a later hook rule overrides', () => {
  const ruleOf = (h: string) => ({ 'cn-x': ['bg-input'], 'cn-x-variant-b': ['bg-input'] })[h];
  assert.deepEqual(conflicts([['bg-border', 'cn-x']], ruleOf), ['bg-border < cn-x { bg-input }']);
  assert.deepEqual(conflicts([['bg-border'], ['cn-x-variant-b']], ruleOf), ['bg-border < cn-x-variant-b { bg-input }']);
  assert.deepEqual(conflicts([['cn-x', 'bg-border']], ruleOf), []);
  assert.deepEqual(conflicts([['flex', 'cn-x']], ruleOf), []);
});

test('conflicts() skips sibling cva options', () => {
  const ruleOf = (h: string) => ({ 'cn-x-variant-b': ['bg-input'] })[h];
  assert.deepEqual(conflicts([['cn-x-variant-a', 'bg-border'], ['cn-x-variant-b']], ruleOf), []);
});

test('no base utility hides a maia rule shadcn would apply', () => {
  const found = files(UI).flatMap((file) =>
    units(readFileSync(file, 'utf8')).flatMap((tokens) => conflicts(tokens, (h) => rules.get(h)).map((c) => `${file}: ${c}`)),
  );
  assert.deepEqual(found, []);
});
