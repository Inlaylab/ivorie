import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  contentChildren,
  forwardRef,
  inject,
  input,
  linkedSignal,
  numberAttribute,
  output,
} from '@angular/core'
import { LucideGripVertical } from '@lucide/angular'
import { IvIdGenerator, cn } from '@inlaylab/ivorie/core'

/** Panels and handles alternate: panel, handle, panel, … Sizes are percentages of the group. */
@Component({
  selector: 'iv-resizable-panel-group',
  host: {
    'data-slot': 'resizable-panel-group',
    '[attr.data-orientation]': 'orientation()',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvResizablePanelGroup {
  readonly orientation = input<'horizontal' | 'vertical'>('horizontal')
  readonly class = input('')
  /** Sizes after a drag or key press, in percent. */
  readonly layoutChange = output<number[]>()

  readonly el: ElementRef<HTMLElement> = inject(ElementRef)
  readonly panels = contentChildren(forwardRef(() => IvResizablePanel))
  readonly handles = contentChildren(forwardRef(() => IvResizableHandle))

  /** Panels without a defaultSize share what the others leave. */
  readonly sizes = linkedSignal(() => {
    const panels = this.panels()
    const fixed = panels.reduce((sum, p) => sum + (p.defaultSize() ?? 0), 0)
    const free = panels.filter((p) => p.defaultSize() == null).length
    return panels.map((p) => p.defaultSize() ?? (free ? Math.max(0, 100 - fixed) / free : 0))
  })

  protected readonly classes = computed(() =>
    cn('cn-resizable-panel-group flex h-full w-full data-vertical:flex-col', this.class())
  )

  /** Moves the boundary after panel `index` by `delta` percent, within both panels' min and max. */
  resize(index: number, delta: number) {
    const sizes = [...this.sizes()]
    const a = this.panels()[index]
    const b = this.panels()[index + 1]
    if (!a || !b) return
    const total = sizes[index] + sizes[index + 1]
    const lo = Math.max(a.minSize(), total - b.maxSize())
    const hi = Math.min(a.maxSize(), total - b.minSize())
    const next = Math.min(hi, Math.max(lo, sizes[index] + delta))
    if (next === sizes[index]) return
    sizes[index] = next
    sizes[index + 1] = total - next
    this.sizes.set(sizes)
    this.layoutChange.emit(sizes)
  }
}

@Component({
  selector: 'iv-resizable-panel',
  host: {
    'data-slot': 'resizable-panel',
    '[id]': 'id',
    '[style.flex]': 'flex()',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvResizablePanel {
  private readonly group = inject(IvResizablePanelGroup)
  /** Start size in percent. Default: an equal share of what is left. */
  readonly defaultSize = input<number | undefined, unknown>(undefined, {
    transform: (v: unknown) => (v == null || v === '' ? undefined : numberAttribute(v)),
  })
  readonly minSize = input(0, { transform: numberAttribute })
  readonly maxSize = input(100, { transform: numberAttribute })
  readonly class = input('')

  readonly id = inject(IvIdGenerator).next('iv-resizable-panel')
  readonly size = computed(() => this.group.sizes()[this.group.panels().indexOf(this)] ?? 0)
  // Grow by size from a zero basis: the panels split the group by their percentages.
  protected readonly flex = computed(() => `${this.size()} 1 0px`)
  protected readonly classes = computed(() => cn('block min-h-0 min-w-0 overflow-hidden', this.class()))
}

@Component({
  selector: 'iv-resizable-handle',
  imports: [LucideGripVertical],
  host: {
    'role': 'separator',
    'tabindex': '0',
    'data-slot': 'resizable-handle',
    // The handle runs across the group's direction.
    '[attr.aria-orientation]': 'group.orientation() === "horizontal" ? "vertical" : "horizontal"',
    '[attr.aria-controls]': 'before()?.id',
    '[attr.aria-valuenow]': 'round(before()?.size())',
    '[attr.aria-valuemin]': 'before()?.minSize()',
    '[attr.aria-valuemax]': 'before()?.maxSize()',
    '[attr.aria-label]': 'ariaLabel()',
    '[class]': 'classes()',
    '(pointerdown)': 'onPointerDown($event)',
    '(pointermove)': 'onPointerMove($event)',
    '(pointerup)': 'onPointerUp($event)',
    '(pointercancel)': 'onPointerUp($event)',
    '(keydown)': 'onKeydown($event)',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (withHandle()) {
      <div class="cn-resizable-handle-icon z-10 flex shrink-0"><svg lucideGripVertical aria-hidden="true"></svg></div>
    }
  `,
})
export class IvResizableHandle {
  protected readonly group = inject(IvResizablePanelGroup)
  private readonly el: ElementRef<HTMLElement> = inject(ElementRef)
  readonly withHandle = input(false)
  readonly ariaLabel = input<string | null>('Resize', { alias: 'aria-label' })
  readonly class = input('')

  private readonly index = computed(() => this.group.handles().indexOf(this))
  protected readonly before = computed(() => this.group.panels()[this.index()])
  private last: number | null = null

  protected readonly classes = computed(() =>
    cn(
      'cn-resizable-handle relative flex w-px touch-none items-center justify-center bg-border ring-offset-background after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-hidden aria-[orientation=horizontal]:h-px aria-[orientation=horizontal]:w-full aria-[orientation=horizontal]:after:left-0 aria-[orientation=horizontal]:after:h-1 aria-[orientation=horizontal]:after:w-full aria-[orientation=horizontal]:after:translate-x-0 aria-[orientation=horizontal]:after:-translate-y-1/2 [&[aria-orientation=horizontal]>div]:rotate-90',
      this.class()
    )
  )

  protected round(v: number | undefined) {
    return v == null ? null : Math.round(v)
  }

  private pos(event: PointerEvent) {
    return this.group.orientation() === 'horizontal' ? event.clientX : event.clientY
  }

  protected onPointerDown(event: PointerEvent) {
    if (event.button !== 0) return
    event.preventDefault()
    this.last = this.pos(event)
    this.el.nativeElement.setPointerCapture?.(event.pointerId)
    this.el.nativeElement.focus()
  }

  protected onPointerMove(event: PointerEvent) {
    if (this.last === null) return
    const rect = this.group.el.nativeElement.getBoundingClientRect()
    const length = (this.group.orientation() === 'horizontal' ? rect.width : rect.height) || 1
    const pos = this.pos(event)
    this.group.resize(this.index(), ((pos - this.last) / length) * 100)
    this.last = pos
  }

  protected onPointerUp(event: PointerEvent) {
    if (this.last === null) return
    this.last = null
    this.el.nativeElement.releasePointerCapture?.(event.pointerId)
  }

  // Arrows move 10%; Home / End go to the panel's min / max.
  protected onKeydown(event: KeyboardEvent) {
    const horizontal = this.group.orientation() === 'horizontal'
    const step = ({ [horizontal ? 'ArrowRight' : 'ArrowDown']: 10, [horizontal ? 'ArrowLeft' : 'ArrowUp']: -10 } as Record<string, number>)[event.key]
    const before = this.before()
    if (!before) return
    let delta = step
    if (event.key === 'Home') delta = -1000
    if (event.key === 'End') delta = 1000
    if (!delta) return
    event.preventDefault()
    this.group.resize(this.index(), delta)
  }
}

export const IV_RESIZABLE_IMPORTS = [IvResizablePanelGroup, IvResizablePanel, IvResizableHandle] as const
