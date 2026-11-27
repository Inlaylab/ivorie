import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** The home hero: the Ivorie mark drawn like a pen-tool outline, its anchor points, then the brand dot. */
@Component({
  selector: 'docs-hero-mark',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block text-foreground' },
  template: `
    <svg viewBox="0 0 400 400" width="100%" class="overflow-visible" role="img" aria-label="The Ivorie mark drawn as a vector outline with anchor points">
      <!-- Bezier handles at the corners, in the hairline color. -->
      <g fill="none" class="stroke-(--docs-line)" stroke-width="1" vector-effect="non-scaling-stroke">
        <path d="M60 140V60h80M260 60h80v80M340 260v80h-80M140 340H60v-80" />
      </g>
      <path
        class="docs-draw"
        d="M140 60H260C305 60 340 95 340 140V260C340 305 305 340 260 340H140C95 340 60 305 60 260V140C60 95 95 60 140 60Z"
        fill="none"
        stroke="currentColor"
        stroke-width="1.25"
        vector-effect="non-scaling-stroke"
      />
      <circle class="docs-draw" style="--d: 0.9s" cx="200" cy="200" r="54" fill="none" stroke="currentColor" stroke-width="1.25" vector-effect="non-scaling-stroke" />
      <g class="fill-(--docs-ground) stroke-(--brand)" stroke-width="1.25">
        @for (n of nodes; track $index) {
          <circle class="docs-node" [style.--d]="n.d" [attr.cx]="n.x" [attr.cy]="n.y" r="4" />
        }
      </g>
      <g class="fill-(--brand)">
        @for (h of handles; track $index) {
          <rect class="docs-node" [style.--d]="h.d" [attr.x]="h.x - 4" [attr.y]="h.y - 4" width="8" height="8" />
        }
      </g>
      <circle class="docs-pulse fill-(--brand)" cx="200" cy="200" r="20" opacity="0.4" />
      <circle cx="200" cy="200" r="20" fill="currentColor" />
      <text x="200" y="384" text-anchor="middle" font-size="11" class="fill-(--docs-ink-muted) font-mono">rx 24 · stroke 1.25 · {{ count() }} parts</text>
    </svg>
  `,
})
export class DocsHeroMark {
  /** The component count shown in the caption. */
  readonly count = input.required<number>();
  protected readonly nodes = [
    [140, 60], [260, 60], [340, 140], [340, 260], [260, 340], [140, 340], [60, 260], [60, 140],
  ].map(([x, y], i) => ({ x, y, d: `${1.4 + i * 0.1}s` }));
  protected readonly handles = [
    [60, 60], [340, 60], [340, 340], [60, 340],
  ].map(([x, y], i) => ({ x, y, d: `${1.4 + i * 0.2}s` }));
}
