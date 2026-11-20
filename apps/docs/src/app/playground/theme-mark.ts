import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * A small picture of a theme's material, drawn with the theme's own tokens (the tile carries its style
 * class and colors): glass panes, bento tiles, midnight glow, clay wells, slate keys, a mono prompt,
 * tint washes, and shadcn's Classic shapes.
 */
@Component({
  selector: 'docs-theme-mark',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block size-full', 'aria-hidden': 'true' },
  template: `
    <svg viewBox="0 0 120 80" class="size-full" fill="none">
      @switch (theme()) {
        @case ('glass') {
          <rect x="18" y="14" width="56" height="40" rx="10" class="fill-primary" opacity=".35" />
          <rect x="40" y="26" width="62" height="42" rx="11" class="fill-card stroke-white" stroke-width="1.5" opacity=".72" />
          <path d="M51 27h40" class="stroke-white" stroke-width="2" stroke-linecap="round" />
          <rect x="50" y="52" width="22" height="7" rx="3.5" class="fill-primary" />
        }
        @case ('bento') {
          <rect x="18" y="12" width="40" height="26" rx="9" class="fill-primary" />
          <rect x="62" y="12" width="40" height="26" rx="9" class="fill-card" />
          <rect x="18" y="42" width="84" height="26" rx="9" class="fill-card" />
          <rect x="26" y="50" width="30" height="10" rx="5" class="fill-foreground" />
        }
        @case ('midnight') {
          <rect x="14" y="10" width="92" height="60" rx="8" class="fill-card stroke-border" />
          <ellipse cx="60" cy="72" rx="44" ry="20" class="fill-primary" opacity=".35" />
          <rect x="24" y="22" width="34" height="5" rx="2.5" class="fill-foreground" opacity=".7" />
          <rect x="70" y="40" width="7" height="22" rx="1.5" class="fill-primary" />
          <rect x="81" y="32" width="7" height="30" rx="1.5" class="fill-primary" />
          <rect x="92" y="46" width="7" height="16" rx="1.5" class="fill-primary" opacity=".6" />
        }
        @case ('clay') {
          <rect x="14" y="10" width="92" height="60" rx="14" class="fill-card stroke-border" stroke-width="1.5" />
          <rect x="24" y="20" width="72" height="24" rx="9" class="fill-muted stroke-border" />
          <rect x="24" y="52" width="30" height="9" rx="4.5" class="fill-primary" />
          <rect x="60" y="52" width="22" height="9" rx="4.5" class="fill-muted" />
        }
        @case ('slate') {
          <rect x="16" y="14" width="40" height="22" rx="4" class="fill-card stroke-border" />
          <path d="M18 15h36" class="stroke-white" stroke-width="1.5" />
          <rect x="64" y="14" width="40" height="22" rx="4" class="fill-card stroke-border" />
          <path d="M66 15h36" class="stroke-white" stroke-width="1.5" />
          <rect x="16" y="44" width="88" height="22" rx="4" class="fill-muted stroke-border" />
          <rect x="22" y="51" width="24" height="8" rx="2" class="fill-foreground" />
        }
        @case ('mono') {
          <path d="M22 28l12 10-12 10" class="stroke-primary" stroke-width="4" stroke-linecap="square" />
          <rect x="42" y="44" width="14" height="5" class="fill-foreground" />
          <rect x="62" y="30" width="9" height="16" class="fill-primary">
            <animate attributeName="opacity" values="1;0;1" dur="1.2s" calcMode="discrete" repeatCount="indefinite" />
          </rect>
          <path d="M16 62h88" class="stroke-border" stroke-dasharray="3 3" />
        }
        @case ('tint') {
          <circle cx="60" cy="40" r="32" class="fill-primary" opacity=".12" />
          <circle cx="60" cy="40" r="22" class="fill-primary" opacity=".22" />
          <circle cx="60" cy="40" r="12" class="fill-primary" />
        }
        @case ('nova') {
          <rect x="22" y="16" width="76" height="48" rx="6" class="fill-card stroke-border" />
          <rect x="30" y="26" width="34" height="5" rx="2.5" class="fill-foreground" />
          <rect x="30" y="48" width="24" height="8" rx="4" class="fill-primary" />
        }
        @case ('luma') {
          <rect x="16" y="22" width="88" height="36" rx="18" class="fill-card stroke-border" />
          <circle cx="40" cy="40" r="10" class="fill-primary" />
          <rect x="56" y="36" width="34" height="8" rx="4" class="fill-muted-foreground" opacity=".5" />
        }
        @case ('mira') {
          @for (r of [0, 1, 2]; track r) {
            @for (c of [0, 1, 2, 3, 4]; track c) {
              <rect [attr.x]="20 + c * 17" [attr.y]="16 + r * 17" width="13" height="13" rx="2" [attr.class]="r === 1 && c === 2 ? 'fill-primary' : 'fill-muted stroke-border'" />
            }
          }
        }
        @case ('sera') {
          <text x="18" y="54" class="fill-foreground" font-size="38" font-family="var(--font-heading, serif)">Aa</text>
          <path d="M70 30h34M70 40h34M70 50h22" class="stroke-muted-foreground" stroke-width="2" />
          <path d="M18 62h86" class="stroke-primary" stroke-width="2" />
        }
      }
    </svg>
  `,
})
export class ThemeMark {
  readonly theme = input.required<string>();
}
