import { Directive, TemplateRef, inject } from '@angular/core'
import { IvSectorShape } from './chart-label'
import { IvSeriesItem } from './types'

/**
 * The active item, given to an `ivActiveShape` template. `d` is its default path.
 * A pie sector has its center, radii and angles; a bar has no sector, so those are 0.
 */
export type IvActiveShapeProps = IvSeriesItem & IvSectorShape & { d: string }

export interface IvActiveShapeContext {
  $implicit: IvActiveShapeProps
}

/**
 * Draws the active item instead of its default shape (Recharts' `activeShape`), inside
 * `g[ivBar]` or `g[ivPie]`. The active item is `activeIndex`, or the one under the cursor.
 *
 * ```html
 * <ng-template ivActiveShape let-shape>
 *   <svg:path [attr.d]="grow(shape)" [attr.fill]="shape.fill" />
 * </ng-template>
 * ```
 */
@Directive({ selector: 'ng-template[ivActiveShape]' })
export class IvActiveShape {
  readonly template = inject<TemplateRef<IvActiveShapeContext>>(TemplateRef)

  static ngTemplateContextGuard(_dir: IvActiveShape, ctx: unknown): ctx is IvActiveShapeContext {
    return true
  }
}
