// Every style file must compile with Tailwind: an unknown utility in an @apply fails the build of every app.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { compile } from '@tailwindcss/node';
import { STYLES } from './hooks.ts';

const base = resolve(STYLES);

for (const file of readdirSync(STYLES).filter((f) => /^style-[a-z]+\.css$/.test(f))) {
  test(`${file} compiles`, async () => {
    const css = `@import "./theme.css";\n@import "./${file}";\n`;
    const compiler = await compile(css, { base, onDependency: () => {} });
    const out = compiler.build([]);
    assert.ok(out.includes(`.style-${file.slice(6, -4)}`), 'the style scope is in the output');
  });
}
