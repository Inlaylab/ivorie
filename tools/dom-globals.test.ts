import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DOM_GLOBALS, codeOf } from './dom-globals.ts';

const hit = (line: string) => DOM_GLOBALS.test(codeOf(line));

test('catches every way to reach window or document', () => {
  for (const line of [
    'window.scrollTo(0, 0)',
    'const w = window?.innerWidth',
    "window['foo']",
    'globalThis.window.addEventListener(x)',
    'globalThis.document.body',
    'fromEvent(window, "resize")',
    'fromEvent(document, "click")',
    'x = document.body',
  ]) {
    assert.ok(hit(line), line);
  }
});

test('ignores injected documents, other names and comments', () => {
  for (const line of [
    'this.document.body',
    'private readonly document = inject(DOCUMENT)',
    'const myWindow = 1',
    'windowSize.width',
    '// window.scrollTo is not SSR safe',
    ' * uses document.body in the browser',
    '/* window.x */',
    'foo() // see window.open',
  ]) {
    assert.ok(!hit(line), line);
  }
});
