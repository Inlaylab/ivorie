import { ChangeDetectionStrategy, Component } from '@angular/core';

/** How it works, 3: the markup, its cn-* hook and a theme file, stacked: the look lives in the bottom layer. */
@Component({
  selector: 'docs-line-themes',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block text-foreground' },
  template: `
    <svg viewBox="0 0 480 200" width="100%" role="img" aria-label="Three stacked layers: markup, style hooks and a theme file">
      <g class="fill-(--docs-pane-solid)" stroke-width="1" vector-effect="non-scaling-stroke">
        <path class="stroke-(--docs-line)" d="M140 150L240 180L400 140L300 110Z" />
        <path class="stroke-(--docs-ink-muted)" d="M140 110L240 140L400 100L300 70Z" />
        <path stroke="currentColor" d="M140 70L240 100L400 60L300 30Z" />
      </g>
      <g class="stroke-(--docs-line)" stroke-width="1" stroke-dasharray="2 4">
        <path d="M140 70V150M400 60V140" />
      </g>
      <rect class="docs-pulse fill-(--brand)" x="262" y="56" width="36" height="14" rx="4" opacity="0.5" />
      <rect class="fill-(--brand)" x="262" y="56" width="36" height="14" rx="4" />
      <g class="font-mono" font-size="11">
        <text x="20" y="74" fill="currentColor">&lt;button ivButton&gt;</text>
        <text x="20" y="114" class="fill-(--docs-ink-muted)">.cn-button</text>
        <text x="20" y="154" class="fill-(--docs-ink-muted)">theme-clay.css</text>
      </g>
    </svg>
  `,
})
export class DocsLineThemes {}
