import { ChangeDetectionStrategy, Component } from '@angular/core';

/** How it works, 4: focus stepping through a menu, the keys that move it beside. */
@Component({
  selector: 'docs-line-keys',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block text-foreground' },
  template: `
    <svg viewBox="0 0 480 200" width="100%" role="img" aria-label="Focus moves through menu items with the arrow keys">
      <rect x="40" y="30" width="200" height="140" rx="12" class="fill-(--docs-pane-solid) stroke-(--docs-line)" stroke-width="1" />
      <rect x="52" y="78" width="176" height="28" rx="6" fill="currentColor" />
      <g class="font-mono" font-size="11">
        <text x="60" y="64" class="fill-(--docs-ink-muted)">Rename</text>
        <text x="60" y="96" class="fill-(--docs-ground)">Duplicate</text>
        <text x="60" y="128" class="fill-(--docs-ink-muted)">Copy link</text>
        <text x="60" y="156" class="fill-(--docs-ink-muted)">Invite people</text>
      </g>
      <path class="docs-flow stroke-(--brand)" d="M250 60C300 60 300 92 250 92M250 92C300 92 300 124 250 124" fill="none" stroke-width="1.25" />
      <g class="fill-(--docs-pane-solid)" stroke="currentColor" stroke-width="1">
        <rect x="330" y="52" width="40" height="32" rx="6" />
        <rect x="330" y="96" width="40" height="32" rx="6" />
        <rect x="380" y="74" width="64" height="32" rx="6" />
      </g>
      <g class="font-mono" font-size="11" fill="currentColor" text-anchor="middle">
        <text x="350" y="72">↑</text><text x="350" y="116">↓</text><text x="412" y="94">Enter</text>
      </g>
    </svg>
  `,
})
export class DocsLineKeys {}
