import { ChangeDetectionStrategy, Component } from '@angular/core';

/** How it works, 2: one source, two ways in: the npm package or source files the CLI writes. */
@Component({
  selector: 'docs-line-install',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block text-foreground' },
  template: `
    <svg viewBox="0 0 480 200" width="100%" role="img" aria-label="One source splits into the npm package or copied files in your app">
      <circle cx="60" cy="100" r="26" class="fill-(--docs-pane-solid)" stroke="currentColor" stroke-width="1" />
      <path class="docs-flow" d="M86 100C170 100 170 50 250 50H300" fill="none" stroke="currentColor" stroke-width="1.25" />
      <path class="docs-flow stroke-(--brand)" d="M86 100C170 100 170 150 250 150H300" fill="none" stroke-width="1.25" />
      <rect x="300" y="30" width="160" height="40" rx="8" class="fill-(--docs-pane-solid)" stroke="currentColor" stroke-width="1" />
      <rect x="300" y="130" width="160" height="40" rx="8" class="fill-(--docs-pane-solid) stroke-(--brand)" stroke-width="1" />
      <g class="fill-(--docs-ground)" stroke="currentColor" stroke-width="1.25">
        <circle cx="86" cy="100" r="3.5" /><circle cx="300" cy="50" r="3.5" />
      </g>
      <circle cx="300" cy="150" r="3.5" class="fill-(--docs-ground) stroke-(--brand)" stroke-width="1.25" />
      <g class="font-mono" text-anchor="middle" font-size="11">
        <text x="60" y="104" fill="currentColor">ivorie</text>
        <text x="380" y="54" fill="currentColor">node_modules/…</text>
        <text x="380" y="154" class="fill-(--brand)">src/ui/dialog.ts</text>
        <text x="200" y="40" font-size="10" class="fill-(--docs-ink-muted)">npm i</text>
        <text x="200" y="176" font-size="10" class="fill-(--brand)">ivorie add</text>
      </g>
    </svg>
  `,
})
export class DocsLineInstall {}
