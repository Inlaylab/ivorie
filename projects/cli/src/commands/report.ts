// What a command did, for printing and for tests.

export interface Report {
  written: string[];
  unchanged: string[];
  skipped: { file: string; reason: string }[];
  installed: string[];
  notes: string[];
}

export interface CommonOptions {
  cwd: string;
  registry?: string;
  skipInstall?: boolean;
  dryRun?: boolean;
}

export const emptyReport = (): Report => ({ written: [], unchanged: [], skipped: [], installed: [], notes: [] });
