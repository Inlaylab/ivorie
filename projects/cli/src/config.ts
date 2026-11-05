// components.json: where components go and how they are named.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ICON_LIBRARIES, type IconLibrary } from './icons.ts';

export interface ComponentsJson {
  $schema: string;
  path: string;
  prefix: string;
  style: string;
  tailwind: { css: string; baseColor: string };
  font: string;
  /** Left out when the heading font is the body font. */
  fontHeading?: string;
  radius: string;
  iconLibrary: IconLibrary;
  /** Where blocks go. Default: next to `path` (`src/app/ui` → `src/app/blocks`). */
  blocksPath?: string;
  registry?: string;
}

export const CONFIG_FILE = 'components.json';
// Placeholder until the docs domain is set.
export const SCHEMA_URL = 'https://ivorie.dev/schema/components.json';
const PREFIX = /^[a-z][a-z0-9]*$/;

export function readConfig(root: string): ComponentsJson {
  const file = join(root, CONFIG_FILE);
  if (!existsSync(file)) throw new Error('components.json not found — run "ivorie init"');
  let value: unknown;
  try {
    value = JSON.parse(readFileSync(file, 'utf8').replace(/^﻿/, ''));
  } catch (err) {
    throw new Error(`components.json is not valid JSON: ${(err as Error).message}`);
  }
  return validateConfig(value);
}

export function validateConfig(value: unknown): ComponentsJson {
  if (!value || typeof value !== 'object') throw new Error('components.json: expected an object');
  const v = value as Record<string, unknown>;
  const str = (obj: Record<string, unknown>, key: string, name = key) => {
    if (typeof obj[key] !== 'string' || obj[key] === '') {
      throw new Error(`components.json: "${name}" must be a non-empty string`);
    }
    return obj[key] as string;
  };
  for (const key of ['path', 'style', 'font', 'radius']) str(v, key);
  if (!PREFIX.test(str(v, 'prefix'))) {
    throw new Error(`components.json: "prefix" must match ${PREFIX.source}`);
  }
  const tw = v['tailwind'];
  if (!tw || typeof tw !== 'object') throw new Error('components.json: "tailwind" must be an object');
  str(tw as Record<string, unknown>, 'css', 'tailwind.css');
  str(tw as Record<string, unknown>, 'baseColor', 'tailwind.baseColor');
  if (!ICON_LIBRARIES.includes(v['iconLibrary'] as IconLibrary)) {
    throw new Error(`components.json: "iconLibrary" must be one of ${ICON_LIBRARIES.join(', ')}`);
  }
  if (v['registry'] !== undefined) str(v, 'registry');
  if (v['fontHeading'] !== undefined) str(v, 'fontHeading');
  return v as unknown as ComponentsJson;
}
