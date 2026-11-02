import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  forwardRef,
  inject,
  input,
  linkedSignal,
  numberAttribute,
  output,
  signal,
  viewChildren,
} from '@angular/core'
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms'
import { cn } from '@inlaylab/ivorie/core'

/**
 * One thumb per value: `[50]` is a single slider, `[20, 80]` a range.
 * Thumbs never cross. Pointer and keyboard both snap to `step`.
 */
@Component({
  selector: 'iv-slider',
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => IvSlider), multi: true }],
  host: {
    'data-slot': 'slider',
    '[attr.data-orientation]': 'orientation()',
    '[attr.data-disabled]': 'isDisabled() ? "" : null',
    '[attr.aria-label]': 'null',
    '[class]': 'classes()',
    '(pointerdown)': 'onPointerDown($event)',
    '(pointermove)': 'onPointerMove($event)',
    '(pointerup)': 'onPointerUp($event)',
    '(pointercancel)': 'onPointerUp($event)',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      #track
      data-slot="slider-track"
      class="cn-slider-track relative grow overflow-hidden data-horizontal:w-full data-vertical:h-full"
      [attr.data-orientation]="orientation()"
    >
      <span
        data-slot="slider-range"
        class="cn-slider-range absolute select-none data-horizontal:h-full data-vertical:w-full"
        [attr.data-orientation]="orientation()"
        [style]="rangeStyle()"
      ></span>
    </span>
    @for (v of values(); track $index) {
      <span
        #thumb
        role="slider"
        data-slot="slider-thumb"
        class="cn-slider-thumb absolute block shrink-0 select-none data-disabled:pointer-events-none"
        [attr.tabindex]="isDisabled() ? null : 0"
        [attr.aria-label]="ariaLabel()"
        [attr.aria-labelledby]="ariaLabelledby()"
        [attr.aria-valuemin]="min()"
        [attr.aria-valuemax]="max()"
        [attr.aria-valuenow]="v"
        [attr.aria-orientation]="orientation()"
        [attr.aria-disabled]="isDisabled() || null"
        [attr.data-disabled]="isDisabled() ? '' : null"
        [attr.data-orientation]="orientation()"
        [style]="thumbStyle(v)"
        (keydown)="onKeydown($event, $index)"
        (blur)="onTouched()"
      ></span>
    }
  `,
})
export class IvSlider implements ControlValueAccessor {
  readonly value = input<number[] | null>(null)
  readonly min = input(0, { transform: numberAttribute })
  readonly max = input(100, { transform: numberAttribute })
  readonly step = input(1, { transform: numberAttribute })
  readonly disabled = input(false)
  readonly orientation = input<'horizontal' | 'vertical'>('horizontal')
  // Moved to every thumb: the thumbs are the focusable sliders.
  readonly ariaLabel = input<string | null>(null, { alias: 'aria-label' })
  readonly ariaLabelledby = input<string | null>(null, { alias: 'aria-labelledby' })
  readonly class = input('')

  readonly valueChange = output<number[]>()

  readonly values = linkedSignal(() => this.value() ?? [this.min()])
  private readonly formDisabled = signal(false)
  readonly isDisabled = computed(() => this.disabled() || this.formDisabled())

  private readonly host: ElementRef<HTMLElement> = inject(ElementRef)
  private readonly thumbs = viewChildren<ElementRef<HTMLElement>>('thumb')
  /** Index of the thumb the pointer drags, or -1. */
  private dragging = -1

  protected readonly classes = computed(() =>
    cn(
      'cn-slider relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-vertical:h-full data-vertical:w-auto data-vertical:flex-col',
      this.class()
    )
  )

  protected readonly rangeStyle = computed(() => {
    const v = this.values()
    const start = v.length > 1 ? this.percent(Math.min(...v)) : 0
    const end = this.percent(Math.max(...v))
    return this.orientation() === 'vertical'
      ? { bottom: `${start}%`, top: `${100 - end}%` }
      : { left: `${start}%`, right: `${100 - end}%` }
  })

  private onChange = (_: number[]) => {}
  onTouched = () => {}

  protected thumbStyle(value: number) {
    const p = this.percent(value)
    return this.orientation() === 'vertical'
      ? { bottom: `${p}%`, transform: 'translateY(50%)' }
      : { left: `${p}%`, transform: 'translateX(-50%)' }
  }

  private percent(value: number): number {
    const span = this.max() - this.min()
    return span > 0 ? ((value - this.min()) / span) * 100 : 0
  }

  /** Snaps to the step grid, clamps to min/max and to the neighbouring thumbs. */
  private setThumb(index: number, raw: number) {
    const v = [...this.values()]
    const snapped = Math.round((raw - this.min()) / this.step()) * this.step() + this.min()
    const lo = index > 0 ? v[index - 1] : this.min()
    const hi = index < v.length - 1 ? v[index + 1] : this.max()
    // Round away float noise from the step math (0.1 + 0.2).
    const next = Number(Math.min(hi, Math.max(lo, snapped)).toFixed(10))
    if (next === v[index]) return
    v[index] = next
    this.values.set(v)
    this.onChange(v)
    this.valueChange.emit(v)
  }

  protected onKeydown(event: KeyboardEvent, index: number) {
    if (this.isDisabled()) return
    const step = this.step()
    const big = step * 10
    const current = this.values()[index]
    // Up/right raise and down/left lower in both orientations, like Radix.
    const next = ({
      ArrowRight: current + step,
      ArrowUp: current + step,
      ArrowLeft: current - step,
      ArrowDown: current - step,
      PageUp: current + big,
      PageDown: current - big,
      Home: this.min(),
      End: this.max(),
    } as Record<string, number>)[event.key]
    if (next === undefined) return
    event.preventDefault()
    this.setThumb(index, next)
  }

  private valueAt(event: PointerEvent): number {
    const rect = this.host.nativeElement.getBoundingClientRect()
    const ratio =
      this.orientation() === 'vertical'
        ? (rect.bottom - event.clientY) / (rect.height || 1)
        : (event.clientX - rect.left) / (rect.width || 1)
    return this.min() + Math.min(1, Math.max(0, ratio)) * (this.max() - this.min())
  }

  protected onPointerDown(event: PointerEvent) {
    if (this.isDisabled() || event.button !== 0) return
    const value = this.valueAt(event)
    const v = this.values()
    // Nearest thumb; on a tie (thumbs stacked) the one that can still move that way.
    let index = 0
    v.forEach((t, i) => {
      if (Math.abs(t - value) < Math.abs(v[index] - value) || (t === v[index] && value > t)) index = i
    })
    this.dragging = index
    this.host.nativeElement.setPointerCapture?.(event.pointerId)
    event.preventDefault()
    this.thumbs()[index]?.nativeElement.focus()
    this.setThumb(index, value)
  }

  protected onPointerMove(event: PointerEvent) {
    if (this.dragging >= 0) this.setThumb(this.dragging, this.valueAt(event))
  }

  protected onPointerUp(event: PointerEvent) {
    if (this.dragging < 0) return
    this.dragging = -1
    this.host.nativeElement.releasePointerCapture?.(event.pointerId)
  }

  writeValue(value: number[] | null) { this.values.set(value ?? [this.min()]) }
  registerOnChange(fn: (_: number[]) => void) { this.onChange = fn }
  registerOnTouched(fn: () => void) { this.onTouched = fn }
  setDisabledState(isDisabled: boolean) { this.formDisabled.set(isDisabled) }
}
