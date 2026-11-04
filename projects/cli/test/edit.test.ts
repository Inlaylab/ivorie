import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { ensureCssImports, relativeImport, setBodyStyleClass, setIconProvider } from '../src/edit.ts';

const IMPORTS = ['@import "tailwindcss";', '@import "tw-animate-css";'];

test('ensureCssImports adds missing lines after the last @import', () => {
  const css = '@import "./a.css";\n\nbody { color: red; }\n';
  assert.equal(
    ensureCssImports(css, IMPORTS),
    '@import "./a.css";\n@import "tailwindcss";\n@import "tw-animate-css";\n\nbody { color: red; }\n',
  );
});

test('ensureCssImports adds at the top when there is no @import', () => {
  assert.equal(ensureCssImports('body {}\n', IMPORTS), '@import "tailwindcss";\n@import "tw-animate-css";\nbody {}\n');
  assert.equal(ensureCssImports('', IMPORTS), '@import "tailwindcss";\n@import "tw-animate-css";\n');
});

test('single quotes and import options count as present', () => {
  const css = "@import 'tailwindcss';\n@import \"tw-animate-css\" layer(x);\n";
  assert.equal(ensureCssImports(css, IMPORTS), css);
  const pre = '@import "tailwindcss" prefix(tw);\n';
  assert.equal(ensureCssImports(pre, ['@import "tailwindcss";']), pre);
});

test('CRLF and BOM are kept', () => {
  const css = '﻿@import "./a.css";\r\nbody {}\r\n';
  const out = ensureCssImports(css, IMPORTS);
  assert.ok(out.startsWith('﻿@import "./a.css";\r\n@import "tailwindcss";\r\n'));
  assert.doesNotMatch(out.replace(/\r\n/g, ''), /\n/);
});

test('ensureCssImports is idempotent', () => {
  const once = ensureCssImports('body {}\n', IMPORTS);
  assert.equal(ensureCssImports(once, IMPORTS), once);
});

test('setBodyStyleClass adds, appends and replaces the style class', () => {
  assert.equal(setBodyStyleClass('<body>', 'maia'), '<body class="style-maia">');
  assert.equal(setBodyStyleClass('<body class="mat-typography">', 'maia'), '<body class="mat-typography style-maia">');
  assert.equal(setBodyStyleClass('<body class="a style-luma b">', 'maia'), '<body class="a b style-maia">');
  const once = setBodyStyleClass('<html><body id="x">\n</body></html>', 'maia');
  assert.equal(once, '<html><body id="x" class="style-maia">\n</body></html>');
  assert.equal(setBodyStyleClass(once, 'maia'), once);
});

test('relativeImport uses / and ./ on every OS', () => {
  assert.equal(relativeImport('src\\styles.css', 'src\\app\\ui\\styles\\theme.css', path.win32), './app/ui/styles/theme.css');
  assert.equal(relativeImport('src/a/styles.css', 'src/x/y.css', path.posix), '../x/y.css');
});

test('setIconProvider adds, swaps and removes the icon set provider', () => {
  const base = "import { ApplicationConfig } from '@angular/core';\n\nexport const appConfig: ApplicationConfig = {\n  providers: [provideRouter(routes)],\n};\n";
  const tabler = setIconProvider(base, './ui/icon/public-api', './ui/icons-tabler/public-api');
  assert.equal(
    tabler,
    "import { ApplicationConfig } from '@angular/core';\nimport { provideIvIcons } from './ui/icon/public-api';\nimport { COMPONENT_ICONS } from './ui/icons-tabler/public-api';\n\nexport const appConfig: ApplicationConfig = {\n  providers: [provideIvIcons(COMPONENT_ICONS), provideRouter(routes)],\n};\n",
  );
  assert.equal(setIconProvider(tabler, './ui/icon/public-api', './ui/icons-tabler/public-api'), tabler);
  assert.match(setIconProvider(tabler, './ui/icon/public-api', './ui/icons-remix/public-api'), /from '\.\/ui\/icons-remix\/public-api';\n\n/);
  assert.equal(setIconProvider(tabler, './ui/icon/public-api'), base);
  assert.equal(setIconProvider('providers: []', 'a', 'b').endsWith('providers: [provideIvIcons(COMPONENT_ICONS)]'), true);
  assert.equal(setIconProvider('export const x = 1;\n', 'a', 'b'), 'export const x = 1;\n');
});
