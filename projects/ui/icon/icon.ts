import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  Renderer2,
  computed,
  effect,
  inject,
  input,
  numberAttribute,
} from '@angular/core'
import { ICONS, IconNode } from './icons'

export { ICONS }
export type { IconNode }
export type IconName = keyof typeof ICONS

/** Event handlers and links never come from icon data. */
const UNSAFE_ATTR = /^on|href$/i

/** Copies one shape's attributes onto its element. Shapes come from the template, so hydration matches. */
@Directive({ selector: '[ivIconAttrs]' })
export class IvIconAttrs {
  readonly attrs = input.required<IconNode[number][1]>({ alias: 'ivIconAttrs' })

  constructor() {
    const el = inject(ElementRef).nativeElement as Element
    const renderer = inject(Renderer2)
    effect(() => {
      for (const [name, value] of Object.entries(this.attrs())) {
        if (value != null && name !== 'key' && !UNSAFE_ATTR.test(name)) renderer.setAttribute(el, name, String(value))
      }
    })
  }
}

/**
 * An icon drawn like Lucide (24px grid, 2px stroke, currentColor).
 * `ivIcon` is a built-in name (the icons the components use) or any Lucide shape:
 *
 *   <svg ivIcon="chevron-down" class="size-4"></svg>
 *   <svg [ivIcon]="House" class="size-4"></svg>   (House: an export of the lucide package)
 *
 * Decorative: hidden from screen readers. Give the button or link its own label.
 */
@Component({
  selector: 'svg[ivIcon]',
  imports: [IvIconAttrs],
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
    '[attr.data-icon]': 'nameOf()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @for (node of nodes(); track node) {
      @switch (node[0]) {
        @case ('path') { <svg:path [ivIconAttrs]="node[1]" /> }
        @case ('circle') { <svg:circle [ivIconAttrs]="node[1]" /> }
        @case ('ellipse') { <svg:ellipse [ivIconAttrs]="node[1]" /> }
        @case ('line') { <svg:line [ivIconAttrs]="node[1]" /> }
        @case ('polygon') { <svg:polygon [ivIconAttrs]="node[1]" /> }
        @case ('polyline') { <svg:polyline [ivIconAttrs]="node[1]" /> }
        @case ('rect') { <svg:rect [ivIconAttrs]="node[1]" /> }
      }
    }
  `,
})
export class IvIcon {
  readonly icon = input.required<IconName | IconNode>({ alias: 'ivIcon' })
  /** Width and height in px. CSS (`size-4`) wins over it. */
  readonly size = input(24, { transform: numberAttribute })

  protected readonly nodes = computed<IconNode>(() => {
    const icon = this.icon()
    return typeof icon === 'string' ? ICONS[icon] : icon
  })
  protected readonly nameOf = computed(() => (typeof this.icon() === 'string' ? this.icon() : null))
}
