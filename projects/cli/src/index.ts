#!/usr/bin/env node
// ivorie: copy Ivorie Angular components into your app.
import { readFileSync } from 'node:fs';
import { parseArgs, type ParseArgsConfig } from 'node:util';
import { runAdd } from './commands/add.ts';
import { runInit } from './commands/init.ts';
import { runMigrate } from './commands/migrate.ts';
import { printReport, red } from './log.ts';

const HELP = `Usage: ivorie <command> [options]

Commands:
  init               Set up theme, style and components.json in an Angular 22 app
  add <names...>     Copy components into your app (add --all for every one)
  migrate [paths...] Update code written for the old ui-* components (default: src)

Common options:
  --registry <dir|url>  Use another registry (default: the bundled one)
  --skip-install        Print the install command instead of running it
  --dry-run             Show what would change, write nothing
  -h, --help            Show help
  -v, --version         Show the version

init options:
  --project <name>      App in angular.json (needed when there are several)
  --path <dir>          Where components go (default: src/app/ui)
  --prefix <prefix>     Selector prefix (default: iv)
  --preset <name|code>  Theme preset (default: default)
  --style <name>        Override the preset style
  --base-color <name>   Override the preset base color
  --force               Run again over an existing setup
  -y, --yes             No prompts, use the defaults

add options:
  --overwrite           Replace files you changed
  --all                 Add every component

migrate options:
  --rename-map <file>   Use another rename map
`;

const common = {
  registry: { type: 'string' },
  'skip-install': { type: 'boolean' },
  'dry-run': { type: 'boolean' },
  help: { type: 'boolean', short: 'h' },
} as const satisfies ParseArgsConfig['options'];

const OPTIONS = {
  init: {
    ...common,
    project: { type: 'string' },
    path: { type: 'string' },
    prefix: { type: 'string' },
    preset: { type: 'string' },
    style: { type: 'string' },
    'base-color': { type: 'string' },
    force: { type: 'boolean' },
    yes: { type: 'boolean', short: 'y' },
  },
  add: { ...common, overwrite: { type: 'boolean' }, all: { type: 'boolean' } },
  migrate: { 'dry-run': { type: 'boolean' }, 'rename-map': { type: 'string' }, help: { type: 'boolean', short: 'h' } },
} as const satisfies Record<string, ParseArgsConfig['options']>;

function version(): string {
  return JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')).version;
}

async function main(argv: string[]): Promise<number> {
  const [command, ...rest] = argv;
  if (command === '--version' || command === '-v') {
    console.log(version());
    return 0;
  }
  if (!command || command === '--help' || command === '-h' || command === 'help') {
    console.log(HELP);
    return 0;
  }
  if (!(command in OPTIONS)) {
    console.error(`${red('error:')} unknown command "${command}"\n`);
    console.error(HELP);
    return 1;
  }
  const { values: v, positionals } = parseArgs({
    args: rest,
    options: OPTIONS[command as keyof typeof OPTIONS],
    allowPositionals: true,
    strict: true,
  }) as { values: Record<string, string | boolean | undefined>; positionals: string[] };
  if (v['help']) {
    console.log(HELP);
    return 0;
  }
  const cwd = process.cwd();
  const dryRun = v['dry-run'] === true;
  const common = { cwd, dryRun, registry: v['registry'] as string | undefined, skipInstall: v['skip-install'] === true };

  if (command === 'init') {
    const r = await runInit({
      ...common,
      project: v['project'] as string | undefined,
      path: v['path'] as string | undefined,
      prefix: v['prefix'] as string | undefined,
      preset: v['preset'] as string | undefined,
      style: v['style'] as string | undefined,
      baseColor: v['base-color'] as string | undefined,
      force: v['force'] === true,
      yes: v['yes'] === true,
    });
    printReport(r, dryRun);
  } else if (command === 'add') {
    const r = await runAdd(positionals, { ...common, overwrite: v['overwrite'] === true, all: v['all'] === true });
    printReport(r, dryRun);
  } else {
    const r = await runMigrate(positionals, { cwd, dryRun, renameMap: v['rename-map'] as string | undefined });
    printReport(r, dryRun);
  }
  return 0;
}

main(process.argv.slice(2)).then(
  (code) => process.exit(code),
  (err: Error) => {
    console.error(`${red('error:')} ${err.message}`);
    if (process.env['DEBUG'] === 'ivorie') console.error(err.stack);
    process.exit(1);
  },
);
