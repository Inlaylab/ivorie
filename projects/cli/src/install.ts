// Installs npm packages with the project's package manager.
import { spawn } from 'node:child_process';
import type { Project } from './project.ts';

export function installCommand(pm: Project['pm'], deps: string[], dev = false): string[] {
  const verb = pm === 'npm' ? 'install' : 'add';
  return [pm, verb, ...(dev ? ['-D'] : []), ...deps];
}

export function runInstall(project: Project, deps: string[], dev = false): Promise<void> {
  if (!deps.length) return Promise.resolve();
  const [cmd, ...args] = installCommand(project.pm, deps, dev);
  return new Promise((resolve, reject) => {
    // shell on win32: npm/pnpm are .cmd shims there.
    const child = spawn(cmd, args, { stdio: 'inherit', shell: process.platform === 'win32', cwd: project.root });
    child.on('error', reject);
    child.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} ${args.join(' ')} failed (exit ${code})`))));
  });
}
