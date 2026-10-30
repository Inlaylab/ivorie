import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input } from '@angular/core'
import { cn } from '@inlaylab/ivorie/core'

export type ScrollAreaType = 'auto' | 'always' | 'scroll-x' | 'scroll-y'

const OVERFLOW: Record<ScrollAreaType, string> = {
  auto: 'overflow-auto',
  always: 'overflow-scroll',
  'scroll-x': 'overflow-x-auto',
  'scroll-y': 'overflow-y-auto',
}

/**
 * Native scrolling with a thin, themed scrollbar. Radix draws its own scrollbar and thumb;
 * we keep the browser's (no measuring, works with SSR), so the scrollbar / thumb hooks are unused.
 */
@Component({
  selector: 'iv-scroll-area',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  styles: [`
    .iv-scroll-area-viewport::-webkit-scrollbar {
      width: 10px;
      height: 10px;
    }
    .iv-scroll-area-viewport::-webkit-scrollbar-track {
      background: transparent;
    }
    .iv-scroll-area-viewport::-webkit-scrollbar-thumb {
      background-color: var(--border, #e2e8f0);
      border-radius: 9999px;
      border: 2px solid transparent;
      background-clip: content-box;
    }
    .iv-scroll-area-viewport::-webkit-scrollbar-corner {
      background: transparent;
    }
    .iv-scroll-area-viewport {
      scrollbar-width: thin;
      scrollbar-color: var(--border, #e2e8f0) transparent;
    }
  `],
  host: {
    'data-slot': 'scroll-area',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      data-slot="scroll-area-viewport"
      tabindex="0"
      [class]="viewportClasses()"
      [style.maxHeight]="maxHeight() || null"
      [style.maxWidth]="maxWidth() || null"
    >
      <ng-content />
    </div>
  `,
})
export class IvScrollArea {
  readonly type = input<ScrollAreaType>('auto')
  readonly maxHeight = input('')
  readonly maxWidth = input('')
  readonly class = input('')

  readonly classes = computed(() => cn('cn-scroll-area relative block overflow-hidden', this.class()))

  // tabindex="0": keyboard users can scroll the region (axe scrollable-region-focusable).
  readonly viewportClasses = computed(() =>
    cn(
      'cn-scroll-area-viewport iv-scroll-area-viewport size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1',
      OVERFLOW[this.type()],
    ),
  )
}

export const IV_SCROLL_AREA_IMPORTS = [IvScrollArea] as const
