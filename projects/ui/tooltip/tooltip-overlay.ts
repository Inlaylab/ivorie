import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core'
import { Align, Side, cn } from '@inlaylab/ivorie/core'

export type TooltipSide = Side
export type TooltipAlign = Align

export function tooltipPanelClasses(extra = ''): string {
  return cn(
    'cn-tooltip-content relative z-50 w-fit max-w-xs bg-foreground text-background whitespace-normal break-words pointer-events-auto',
    extra,
  )
}

export function tooltipArrowClasses(side: TooltipSide, align: TooltipAlign = 'center'): string {
  // Positioned here, not by the hook's translate (no Radix arrow measuring).
  const base = 'cn-tooltip-arrow absolute z-50 block bg-foreground fill-foreground'

  if (side === 'top' || side === 'bottom') {
    const sideOffset = side === 'top' ? '-bottom-1' : '-top-1'
    const horizontal =
      align === 'start'
        ? 'left-3'
        : align === 'end'
          ? 'right-3'
          : 'left-1/2 -translate-x-1/2'
    return cn(base, 'translate-y-0', sideOffset, horizontal)
  }

  const sideOffset = side === 'left' ? '-right-1' : '-left-1'
  const vertical =
    align === 'start'
      ? 'top-2'
      : align === 'end'
        ? 'bottom-2'
        : 'top-1/2 -translate-y-1/2'
  return cn(base, 'translate-x-0', sideOffset, vertical)
}

@Component({
  selector: 'iv-tooltip-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div [class]="panelClass()" data-slot="tooltip-content" data-state="open" data-side="top" role="tooltip">{{ text() }}</div>`,
})
export class TooltipPanelComponent {
  readonly text = input('')
  readonly extraClass = input('');

  readonly panelClass = computed(() => tooltipPanelClasses(this.extraClass()))
}
