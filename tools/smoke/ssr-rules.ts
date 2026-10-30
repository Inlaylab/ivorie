// Pure rules for the SSR smoke: which browser messages and server lines count as failures.

const NG_CODE = /NG0\d{3}/;

/** A browser console message → failure text, or null when it is fine. */
export function failureOf(msg: { type: string; text: string }): string | null {
  if (msg.type === 'error') return `console error: ${msg.text}`;
  if (msg.type === 'warning' && NG_CODE.test(msg.text)) return `console warning: ${msg.text}`;
  return null;
}

/** A server stderr/stdout line → failure text, or null when it is fine. */
export function serverFailure(line: string): string | null {
  // Angular's ErrorHandler logs `ERROR <name>: …` and keeps rendering, so any error line fails.
  return /^ERROR\b|\b\w*Error:|NG0\d{3}/.test(line) ? `server: ${line}` : null;
}
