// The cn-* hook classes used by the library sources.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

export const UI = 'projects/ui';
export const STYLES = join(UI, 'styles');
export const HOOK = /(?<![\w-])cn-[a-z0-9-]*[a-z0-9]/g;

function sources(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return name === 'styles' || name === 'testing' ? [] : sources(path);
    return /\.(ts|html)$/.test(name) && !name.endsWith('.spec.ts') ? [path] : [];
  });
}

export function uiHooks(): Set<string> {
  return new Set(sources(UI).flatMap((file) => readFileSync(file, 'utf8').match(HOOK) ?? []));
}
