import { ChangeDetectionStrategy, Component } from '@angular/core';

/** The 404 drawing: a path of nodes where one segment is missing, its gap marked in the accent. */
@Component({
  selector: 'docs-line-lost',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block text-foreground' },
  template: `
    <svg viewBox="0 0 400 160" width="100%" role="img" aria-label="A path of nodes with one segment missing">
      <path class="docs-draw" d="M30 110C80 110 80 50 130 50H180" fill="none" stroke="currentColor" stroke-width="1.25" vector-effect="non-scaling-stroke" />
      <path class="docs-draw" style="--d: 0.6s" d="M240 50H270C320 50 320 110 370 110" fill="none" stroke="currentColor" stroke-width="1.25" vector-effect="non-scaling-stroke" />
      <!-- The missing segment: a dashed hint in the accent between the two loose ends. -->
      <path class="docs-flow stroke-(--brand)" d="M186 50H234" fill="none" stroke-width="1" />
      <g class="fill-(--docs-ground)" stroke="currentColor" stroke-width="1.25">
        <circle cx="30" cy="110" r="4" /><circle cx="130" cy="50" r="4" /><circle cx="270" cy="50" r="4" /><circle cx="370" cy="110" r="4" />
      </g>
      <g class="fill-(--docs-ground) stroke-(--brand)" stroke-width="1.25">
        <circle class="docs-node" style="--d: 1.4s" cx="180" cy="50" r="4" />
        <circle class="docs-node" style="--d: 1.6s" cx="240" cy="50" r="4" />
      </g>
      <text x="210" y="84" text-anchor="middle" font-size="11" class="fill-(--docs-ink-muted) font-mono">404</text>
    </svg>
  `,
})
export class DocsLineLost {}
