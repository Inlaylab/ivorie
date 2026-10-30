// Builds the shadcn-format registry from the library sources.
// Usage: node tools/registry/build.ts [--out dist/registry]
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { fileURLToPath } from 'node:url';
import { parseFrontmatter } from '../docs/content.ts';
import { parseTheme } from '../../projects/cli/src/theme.ts';
import { DEFAULT_PRESET } from '../../projects/cli/src/preset.ts';
import { collectDeps, listEntries, registryDeps, rewriteImports } from './items.ts';

const ITEM_SCHEMA = 'https://ui.shadcn.com/schema/registry-item.json';
const REGISTRY_SCHEMA = 'https://ui.shadcn.com/schema/registry.json';
const STYLES_DIR = 'projects/ui/styles';
const BASE_COLOR = DEFAULT_PRESET.baseColor;

type Kind = 'component' | 'lib' | 'style' | 'base-color' | 'theme-base';
interface File {
  path: string;
  type: 'registry:file';
  target: string;
  content: string;
}
interface Item {
  $schema: string;
  name: string;
  type: 'registry:item' | 'registry:theme';
  title: string;
  description: string;
  dependencies?: string[];
  registryDependencies?: string[];
  files?: File[];
  cssVars?: { light: Record<string, string>; dark: Record<string, string> };
  meta: { ivorie: { kind: Kind } };
}

const file = (path: string, content: string): File => ({
  path,
  type: 'registry:file',
  target: `src/app/${path}`,
  content,
});

function docsMeta(name: string): { title: string; description: string } {
  const md = `apps/docs/content/${name}.md`;
  if (!existsSync(md)) return { title: 'Core', description: 'cn, ids, positions and the Ivorie config.' };
  const { data } = parseFrontmatter(readFileSync(md, 'utf8'), md);
  return { title: data.title, description: data.description };
}

/** Recursively sorted keys, so output is deterministic. */
function stable(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((k) => [k, stable((value as Record<string, unknown>)[k])]),
    );
  }
  return value;
}

const json = (v: unknown) => JSON.stringify(stable(v), null, 2) + '\n';

export function buildItems(): Item[] {
  const items: Item[] = listEntries().map((e) => {
    const deps = collectDeps(e);
    const reg = registryDeps(e);
    return {
      $schema: ITEM_SCHEMA,
      name: e.name,
      type: 'registry:item',
      ...docsMeta(e.name),
      ...(deps.length && { dependencies: deps }),
      ...(reg.length && { registryDependencies: reg }),
      files: e.files.map((f) => file(`ui/${e.name}/${f.name}`, rewriteImports(f.content))),
      meta: { ivorie: { kind: e.name === 'core' ? 'lib' : 'component' } },
    };
  });

  for (const f of readdirSync(STYLES_DIR).filter((f) => /^style-[a-z]+\.css$/.test(f)).sort()) {
    const style = f.slice('style-'.length, -'.css'.length);
    items.push({
      $schema: ITEM_SCHEMA,
      name: `style-${style}`,
      type: 'registry:item',
      title: `Style ${style}`,
      description: `The ${style} component style (cn-* rules).`,
      files: [file(`ui/styles/${f}`, readFileSync(join(STYLES_DIR, f), 'utf8').replace(/\r\n/g, '\n'))],
      meta: { ivorie: { kind: 'style' } },
    });
  }

  const theme = parseTheme(readFileSync(join(STYLES_DIR, 'theme.css'), 'utf8'));
  items.push(
    {
      $schema: ITEM_SCHEMA,
      name: `theme-${BASE_COLOR}`,
      type: 'registry:theme',
      title: `Theme ${BASE_COLOR}`,
      description: `The ${BASE_COLOR} base color: light and dark CSS variables.`,
      cssVars: { light: theme.light, dark: theme.dark },
      meta: { ivorie: { kind: 'base-color' } },
    },
    {
      $schema: ITEM_SCHEMA,
      name: 'theme-base',
      type: 'registry:item',
      title: 'Theme base',
      description: 'Tailwind theme mapping, variants and utilities, without color values.',
      files: [file('ui/styles/theme-base.css', theme.base)],
      meta: { ivorie: { kind: 'theme-base' } },
    },
  );
  return items.sort((a, b) => a.name.localeCompare(b.name));
}

export function build(out: string): void {
  const items = buildItems();
  rmSync(out, { recursive: true, force: true });
  mkdirSync(join(out, 'r'), { recursive: true });
  for (const item of items) writeFileSync(join(out, 'r', `${item.name}.json`), json(item));

  const kinds = (k: Kind) => items.filter((i) => i.meta.ivorie.kind === k).map((i) => i.name);
  const version = JSON.parse(readFileSync('projects/ui/package.json', 'utf8')).version;
  writeFileSync(
    join(out, 'index.json'),
    json({
      version,
      items: items.map((i) => ({
        name: i.name,
        kind: i.meta.ivorie.kind,
        registryDependencies: i.registryDependencies ?? [],
      })),
      styles: kinds('style').map((n) => n.slice('style-'.length)),
      baseColors: kinds('base-color').map((n) => n.slice('theme-'.length)),
      fonts: ['system'],
      radii: ['default'],
      presets: { default: DEFAULT_PRESET },
    }),
  );
  writeFileSync(
    join(out, 'registry.json'),
    json({
      $schema: REGISTRY_SCHEMA,
      name: 'ivorie',
      homepage: 'https://github.com/marvelousdev99/ivorie-ui',
      items: items.map(({ $schema: _, files, ...rest }) => ({
        ...rest,
        ...(files && { files: files.map(({ content: _c, ...f }) => f) }),
      })),
    }),
  );
  console.log(`registry: ${items.length} items → ${out}`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const { values } = parseArgs({ options: { out: { type: 'string', default: 'dist/registry' } } });
  build(values.out!);
}
