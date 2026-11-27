import { ChangeDetectionStrategy, Component } from '@angular/core';

/** How it works, 1: a parent and a switch bound both ways, the value in, the change out. */
@Component({
  selector: 'docs-line-signals',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block text-foreground' },
  template: `
    <svg viewBox="0 0 480 200" width="100%" role="img" aria-label="A parent component and a switch bound both ways with a signal">
      <g class="fill-(--docs-pane-solid)" stroke="currentColor" stroke-width="1" vector-effect="non-scaling-stroke">
        <rect x="20" y="60" width="150" height="80" rx="12" />
        <rect x="310" y="60" width="150" height="80" rx="12" />
      </g>
      <path class="docs-flow stroke-(--brand)" d="M170 88H310" fill="none" stroke-width="1.25" />
      <path class="docs-flow docs-flow-back" d="M170 112H310" fill="none" stroke="currentColor" stroke-width="1.25" />
      <g class="fill-(--docs-ground) stroke-(--brand)" stroke-width="1.25">
        <circle cx="170" cy="88" r="3.5" /><circle cx="310" cy="88" r="3.5" />
      </g>
      <g class="fill-(--docs-ground)" stroke="currentColor" stroke-width="1.25">
        <circle cx="170" cy="112" r="3.5" /><circle cx="310" cy="112" r="3.5" />
      </g>
      <g class="font-mono" text-anchor="middle">
        <text x="95" y="96" font-size="12" fill="currentColor">Settings</text>
        <text x="95" y="114" font-size="10" class="fill-(--docs-ink-muted)">signal(true)</text>
        <text x="385" y="96" font-size="12" fill="currentColor">iv-switch</text>
        <text x="385" y="114" font-size="10" class="fill-(--docs-ink-muted)">input + output</text>
        <text x="240" y="80" font-size="10" class="fill-(--brand)">[checked]</text>
        <text x="240" y="132" font-size="10" fill="currentColor">(checkedChange)</text>
      </g>
    </svg>
  `,
})
export class DocsLineSignals {}
