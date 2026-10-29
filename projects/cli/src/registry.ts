// Registry access: the bundled dir or a hosted copy (http/https).
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Preset } from './preset.ts';

export type ItemKind = 'component' | 'lib' | 'style' | 'base-color' | 'theme-base';

export interface RegistryIndex {
  version: string;
  items: { name: string; kind: ItemKind; registryDependencies: string[] }[];
  styles: string[];
  baseColors: string[];
  fonts: string[];
  radii: string[];
  presets: Record<string, Preset>;
}

export interface RegistryFile {
  path: string;
  type: 'registry:file';
  target: string;
  content: string;
}

export interface RegistryItem {
  $schema: string;
  name: string;
  type: 'registry:item' | 'registry:theme';
  title: string;
  description: string;
  dependencies?: string[];
  registryDependencies?: string[];
  files?: RegistryFile[];
  cssVars?: { light: Record<string, string>; dark: Record<string, string> };
  meta: { ivorie: { kind: ItemKind } };
}

export interface Registry {
  index(): Promise<RegistryIndex>;
  item(name: string): Promise<RegistryItem>;
}

const TIMEOUT_MS = 10_000;

/** The registry shipped next to the compiled CLI (dist/cli/registry/). */
export const bundledRegistry = () => fileURLToPath(new URL('./registry/', import.meta.url));

/** A directory path, or an http(s) URL of a hosted copy. */
export function openRegistry(source: string): Registry {
  const remote = /^https?:\/\//.test(source);
  const base = remote ? source.replace(/\/+$/, '') : source;
  const read = async (rel: string): Promise<any> => {
    if (remote) {
      const url = `${base}/${rel}`;
      let res: Response;
      try {
        res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
      } catch (err) {
        throw new Error(`${url}: ${(err as Error).message}`);
      }
      if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
      return res.json();
    }
    const file = join(base, rel);
    if (!existsSync(file)) throw new Error(`registry file not found: ${file}`);
    return JSON.parse(readFileSync(file, 'utf8'));
  };
  let index: Promise<RegistryIndex> | undefined;
  const items = new Map<string, Promise<RegistryItem>>();
  return {
    index: () => (index ??= read('index.json')),
    item: (name) => {
      if (!items.has(name)) items.set(name, read(`r/${name}.json`));
      return items.get(name)!;
    },
  };
}

/** The items and all their registry dependencies, dependencies first, each once, `core` first. */
export async function resolveTree(reg: Registry, names: string[]): Promise<RegistryItem[]> {
  const out = new Map<string, RegistryItem>();
  const visiting = new Set<string>();
  const visit = async (name: string): Promise<void> => {
    if (out.has(name) || visiting.has(name)) return;
    visiting.add(name);
    const item = await reg.item(name);
    for (const dep of item.registryDependencies ?? []) await visit(dep);
    out.set(name, item);
  };
  for (const n of names) await visit(n);
  const list = [...out.values()];
  return [...list.filter((i) => i.name === 'core'), ...list.filter((i) => i.name !== 'core')];
}

/** `@scope/pkg@^1.0.0` → `@scope/pkg`. */
export const packageName = (dep: string) => dep.replace(/(?<=.)@[^@/]*$/, '');
