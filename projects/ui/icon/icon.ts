import { ChangeDetectionStrategy, Component, computed, input, numberAttribute } from '@angular/core'
import { ICONS, IconNode } from './icons'

export { ICONS }
export type { IconNode }
export type IconName = keyof typeof ICONS

/**
 * An icon the components use, drawn like Lucide (24px grid, 2px stroke, currentColor).
 * Decorative: hidden from screen readers. Give the button or link its own label.
 *
 *   <svg ivIcon="chevron-down" class="size-4"></svg>
 */
@Component({
  selector: 'svg[ivIcon]',
  host: {
    'xmlns': 'http://www.w3.org/2000/svg',
    'viewBox': '0 0 24 24',
    'fill': 'none',
    'stroke': 'currentColor',
    'stroke-width': '2',
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    'aria-hidden': 'true',
    '[attr.width]': 'size()',
    '[attr.height]': 'size()',
    '[attr.data-icon]': 'name()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @for (node of nodes(); track $index) {
      @let a = node[1];
      @switch (node[0]) {
        @case ('path') {
          <svg:path [attr.d]="a['d']" />
        }
        @case ('circle') {
          <svg:circle [attr.cx]="a['cx']" [attr.cy]="a['cy']" [attr.r]="a['r']" />
        }
        @case ('line') {
          <svg:line [attr.x1]="a['x1']" [attr.y1]="a['y1']" [attr.x2]="a['x2']" [attr.y2]="a['y2']" />
        }
        @case ('rect') {
          <svg:rect [attr.x]="a['x']" [attr.y]="a['y']" [attr.width]="a['width']" [attr.height]="a['height']" [attr.rx]="a['rx']" />
        }
      }
    }
  `,
})
export class IvIcon {
  readonly name = input.required<IconName>({ alias: 'ivIcon' })
  /** Width and height in px. CSS (`size-4`) wins over it. */
  readonly size = input(24, { transform: numberAttribute })

  protected readonly nodes = computed<IconNode>(() => ICONS[this.name()])
}
