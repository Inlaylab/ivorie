import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  InjectionToken,
  Provider,
  computed,
  inject,
  input,
  numberAttribute,
} from '@angular/core'
import { ICONS, IconNode, LUCIDE_SVG } from './icons'

export { ICONS, LUCIDE_SVG }
export type { IconNode }
export type IconName = keyof typeof ICONS

/** The `<svg>` attributes of one icon library: grid, fill or stroke. */
export interface IconSvg {
  readonly viewBox: string
  readonly fill: string
  readonly stroke?: string
  readonly 'stroke-width'?: string
  readonly 'stroke-linecap'?: string
  readonly 'stroke-linejoin'?: string
}

/** One icon of a library: its shapes plus the library's `<svg>` attributes. */
export interface IconData {
  readonly svg: IconSvg
  readonly nodes: IconNode
}

/** The icons the components draw, by name. One per icon library. */
export type IconSet = Readonly<Record<IconName, IconData>>

/** The Lucide shapes in `ICONS` as a set. The default. */
export const LUCIDE_ICONS: IconSet = Object.fromEntries(
  Object.entries(ICONS).map(([name, nodes]) => [name, { svg: LUCIDE_SVG, nodes }]),
) as unknown as IconSet

/** The set that named icons (`ivIcon="chevron-down"`) come from. */
export const IV_ICONS = new InjectionToken<IconSet>('IV_ICONS', { factory: () => LUCIDE_ICONS })

/**
 * Picks the icon library the components draw with:
 *
 *   providers: [provideIvIcons(COMPONENT_ICONS)]   (COMPONENT_ICONS from the tabler, phosphor, hugeicons or remix icons entry)
 *
 * Works in app providers and in a component's `providers`.
 */
export function provideIvIcons(set: IconSet): Provider {
  return { provide: IV_ICONS, useValue: set }
}

/**
 * Binds one shape's attributes. Static bindings, no effect: a shape costs one change-detection check.
 * Only these attributes are drawn, so event handlers and links in icon data never reach the DOM.
 */
@Directive({
  selector: '[ivIconShape]',
  host: {
    '[attr.d]': 'a()["d"]',
    '[attr.cx]': 'a()["cx"]',
    '[attr.cy]': 'a()["cy"]',
    '[attr.r]': 'a()["r"]',
    '[attr.rx]': 'a()["rx"]',
    '[attr.ry]': 'a()["ry"]',
    '[attr.x]': 'a()["x"]',
    '[attr.y]': 'a()["y"]',
    '[attr.x1]': 'a()["x1"]',
    '[attr.x2]': 'a()["x2"]',
    '[attr.y1]': 'a()["y1"]',
    '[attr.y2]': 'a()["y2"]',
    '[attr.width]': 'a()["width"]',
    '[attr.height]': 'a()["height"]',
    '[attr.points]': 'a()["points"]',
    '[attr.fill]': 'a()["fill"]',
    '[attr.fill-rule]': 'a()["fill-rule"]',
    '[attr.clip-rule]': 'a()["clip-rule"]',
    '[attr.fill-opacity]': 'a()["fill-opacity"]',
    '[attr.stroke]': 'a()["stroke"]',
    '[attr.stroke-width]': 'a()["stroke-width"]',
    '[attr.stroke-linecap]': 'a()["stroke-linecap"]',
    '[attr.stroke-linejoin]': 'a()["stroke-linejoin"]',
    '[attr.stroke-miterlimit]': 'a()["stroke-miterlimit"]',
    '[attr.stroke-dasharray]': 'a()["stroke-dasharray"]',
    '[attr.opacity]': 'a()["opacity"]',
    '[attr.transform]': 'a()["transform"]',
  },
})
export class IvIconShape {
  readonly a = input.required<IconNode[number][1]>({ alias: 'ivIconShape' })
}

/**
 * An icon. `ivIcon` takes:
 *
 *   <svg ivIcon="chevron-down" class="size-4"></svg>    a component icon, from the provided set (lucide by default)
 *   <svg [ivIcon]="data"></svg>                        IconData
 *   <svg [ivIcon]="house" class="size-4"></svg>         a Lucide IconNode (e.g. from the lucide package)
 *
 * Decorative: hidden from screen readers. Give the button or link its own label.
 */
@Component({
  selector: 'svg[ivIcon]',
  imports: [IvIconShape],
  host: {
    'xmlns': 'http://www.w3.org/2000/svg',
    'aria-hidden': 'true',
    '[attr.viewBox]': 'svg().viewBox',
    '[attr.fill]': 'svg().fill',
    '[attr.stroke]': 'svg().stroke',
    '[attr.stroke-width]': 'svg()["stroke-width"]',
    '[attr.stroke-linecap]': 'svg()["stroke-linecap"]',
    '[attr.stroke-linejoin]': 'svg()["stroke-linejoin"]',
    '[attr.width]': 'size()',
    '[attr.height]': 'size()',
    '[attr.data-icon]': 'nameOf()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- track $index: a new icon rebinds the shapes in place; old attributes unbind to null. -->
    @for (node of data().nodes; track $index) {
      @switch (node[0]) {
        @case ('path') { <svg:path [ivIconShape]="node[1]" /> }
        @case ('circle') { <svg:circle [ivIconShape]="node[1]" /> }
        @case ('ellipse') { <svg:ellipse [ivIconShape]="node[1]" /> }
        @case ('line') { <svg:line [ivIconShape]="node[1]" /> }
        @case ('polygon') { <svg:polygon [ivIconShape]="node[1]" /> }
        @case ('polyline') { <svg:polyline [ivIconShape]="node[1]" /> }
        @case ('rect') { <svg:rect [ivIconShape]="node[1]" /> }
      }
    }
  `,
})
export class IvIcon {
  readonly icon = input.required<IconName | IconData | IconNode>({ alias: 'ivIcon' })
  /** Width and height in px. CSS (`size-4`) wins over it. */
  readonly size = input(24, { transform: numberAttribute })

  private readonly set = inject(IV_ICONS)

  protected readonly data = computed<IconData>(() => {
    const icon = this.icon()
    if (typeof icon === 'string') return this.set[icon]
    return Array.isArray(icon) ? { svg: LUCIDE_SVG, nodes: icon as IconNode } : (icon as IconData)
  })
  protected readonly svg = computed(() => this.data().svg)
  protected readonly nameOf = computed(() => {
    const icon = this.icon()
    return typeof icon === 'string' ? icon : null
  })
}
