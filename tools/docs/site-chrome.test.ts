// The site chrome's CSS rules that a review would miss: preview pages keep their real theme,
// Geist is the only family, line-art keeps its finished drawing under reduced motion, no header blur.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../../apps/docs/src/styles.css', import.meta.url), 'utf8');

/** The body of the first rule whose selector line is exactly `selector`. */
function block(selector: string): string {
  const start = css.indexOf(`\n${selector} {`);
  assert.notEqual(start, -1, `no rule for ${selector}`);
  return css.slice(start, css.indexOf('\n}', start));
}

/** Every rule body whose selector line is exactly `selector`, joined. */
function blocks(selector: string): string {
  return css.split(`\n${selector} {`).slice(1).map((b) => b.slice(0, b.indexOf('\n}'))).join('\n');
}

test('the warm palette applies only inside the site shell (preview pages have none, on server and client)', () => {
  for (const sel of ['body:has(.docs-shell)', '.dark body:has(.docs-shell)']) {
    assert.match(block(sel), /--background:/);
    // The chrome aliases are declared again here, so they resolve against the warm tokens, not :root's slate.
    assert.match(block(sel), /--docs-line: var\(--border\)/);
  }
  assert.doesNotMatch(css, /body:not\(\.docs-preview\)/);
});

test('stages start in the default palette until the picked theme attaches', () => {
  assert.match(block(':where(.docs-stage)'), /--background: var\(--docs-default-background\)/);
  assert.match(block(':root'), /--docs-default-background: var\(--background\)/);
});

test('the page never scrolls sideways: the shell clips the rail marks', () => {
  assert.match(blocks('.docs-shell'), /overflow-x: clip/);
});

test('reduced motion shows the finished drawing at once', () => {
  const reduce = css.split('@media (prefers-reduced-motion: reduce)').slice(1).map((b) => b.slice(0, b.indexOf('\n}')));
  assert.ok(reduce.some((b) => /\.docs-draw,\s*\.docs-node\s*\{\s*animation: none;/.test(b)));
});

test('the docs sidebar is warm too, and stages reset it to the default preset', () => {
  for (const sel of ['body:has(.docs-shell)', '.dark body:has(.docs-shell)']) {
    for (const t of ['--sidebar', '--sidebar-foreground', '--sidebar-accent', '--sidebar-accent-foreground', '--sidebar-border']) {
      assert.match(block(sel), new RegExp(`\\n  ${t}:`), `${sel} sets ${t}`);
    }
  }
  assert.match(block(':where(.docs-stage)'), /--sidebar: var\(--docs-default-sidebar\)/);
});

test('docs pages sit on the rails', () => {
  const html = readFileSync(new URL('../../apps/docs/src/app/app.html', import.meta.url), 'utf8');
  assert.match(html, /docs\(\) \? '[^']*docs-rail/);
  // Beside the sidebar its own border is the left rail: no second line next to it. The rails run to the footer.
  assert.match(html, /docs\(\) \? '[^']*md:border-l-0/);
  assert.match(html, /docs\(\) \? '[^']*flex-1/);
  // In the components layer, so a utility like md:border-l-0 can override it (unlayered CSS beats every layer).
  assert.match(css, /@layer components \{\s*\/\*[^*]*\*\/\s*\.docs-rail \{/);
});

test('the docs sidebar hydrates eagerly; only its nav is deferred', () => {
  const html = readFileSync(new URL('../../apps/docs/src/app/app.html', import.meta.url), 'utf8');
  const deferred = html.slice(html.indexOf('@defer'), html.indexOf('}', html.indexOf('@defer')));
  assert.doesNotMatch(deferred, /<iv-sidebar/);
  assert.match(deferred, /<docs-site-nav/);
});

test('Geist is the only family', () => {
  assert.doesNotMatch(css, /google-sans-flex/);
  assert.match(css, /--font-display: "Geist Variable"/);
});

test('line-art animations keep the finished drawing under reduced motion', () => {
  for (const sel of ['.docs-draw', '.docs-node']) {
    const anim = block(sel).match(/animation:[^;]+;/);
    assert.ok(anim, `${sel} has an animation`);
    assert.match(anim[0], /\bboth\b/, `${sel} keeps its end state`);
  }
});

test('the header stays unblurred', () => {
  assert.doesNotMatch(block('.docs-header'), /backdrop-filter/);
});
