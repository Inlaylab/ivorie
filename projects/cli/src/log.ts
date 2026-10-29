// Terminal output. Colors are off with NO_COLOR or when stdout is not a TTY.
import type { Report } from './commands/report.ts';

const color = !process.env['NO_COLOR'] && process.stdout.isTTY;
const paint = (code: number) => (s: string) => (color ? `\x1b[${code}m${s}\x1b[0m` : s);
export const green = paint(32);
export const yellow = paint(33);
export const red = paint(31);
export const dim = paint(2);

export function printReport(r: Report, dryRun = false): void {
  const verb = dryRun ? 'would write' : 'wrote';
  for (const f of r.written) console.log(`${green(verb)}  ${f}`);
  for (const f of r.unchanged) console.log(`${dim('unchanged')}  ${f}`);
  for (const s of r.skipped) console.log(`${yellow('skipped')}  ${s.file}: ${s.reason}`);
  for (const d of r.installed) console.log(`${green('installed')}  ${d}`);
  for (const n of r.notes) console.log(`${yellow('note')}  ${n}`);
}
