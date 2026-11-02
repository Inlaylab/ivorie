// The no-dom-globals grep rule. Its own module so a test can import it without running every gate.

/** `window.x`, `window?.x`, `window[x]`, `globalThis.window`, `fromEvent(window)`, and the same for `document`. */
export const DOM_GLOBALS =
  /(?<![\w.$])(window|document)\s*(\?\.|\.|\[)|globalThis\s*(\?\.|\.)\s*(window|document)\b|fromEvent\(\s*(window|document)\b/;

/** The code part of one line: '' for a comment line, text before a trailing `//` comment otherwise. */
export function codeOf(line: string): string {
  const t = line.trim();
  if (t.startsWith('//') || t.startsWith('/*') || t.startsWith('*')) return '';
  // shortcut: a `//` inside a string (a URL) cuts the line early; fine for a grep rule.
  return line.replace(/(^|\s)\/\/.*$/, '');
}
