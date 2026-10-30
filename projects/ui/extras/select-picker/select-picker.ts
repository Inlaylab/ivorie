import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  afterRenderEffect,
  computed,
  forwardRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core'
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms'
import { LucideChevronDown } from '@lucide/angular'
import { firstValueFrom } from 'rxjs'
import { IvDialog } from '@ivorie/ui/dialog'
import { cn } from '@ivorie/ui/core'
import { fitChips } from './chip-fit'
import { SelectPickerDialogData, SelectPickerRow } from './select-picker.model'
import { IvSelectPickerDialog } from './select-picker-dialog'

/**
 * A multi-select that shows the selection as chips on one line ("+N more" for the rest) and
 * picks in a dialog with a searchable checkbox table.
 *
 * Binds as a `ControlValueAccessor` over `string[]`, so `[(ngModel)]` and `formControlName`
 * work. Items can be any shape: `valueFn` / `labelFn` / `descriptionFn` turn them into rows.
 */
@Component({
  selector: 'iv-select-picker',
  standalone: true,
  imports: [LucideChevronDown],
  templateUrl: './select-picker.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'data-slot': 'select-picker',
    class: 'block',
    // `id` is forwarded to the inner button (label[for]); keep it off the host.
    '[attr.id]': 'null',
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => IvSelectPicker),
      multi: true,
    },
  ],
})
export class IvSelectPicker<T = unknown> implements ControlValueAccessor {
  readonly items = input<T[]>([])
  readonly valueFn = input<(item: T) => string>((item) => String(item))
  readonly labelFn = input<(item: T) => string>((item) => String(item))
  readonly descriptionFn = input<(item: T) => string>()

  readonly placeholder = input('Select…')
  readonly dialogTitle = input('Select items')
  readonly dialogDescription = input('')
  readonly searchPlaceholder = input('Search')
  readonly valueColumnHeader = input('Name')
  readonly descriptionColumnHeader = input('')
  readonly emptyMessage = input('No data found')

  readonly minSelection = input(0)
  readonly disabled = input(false)
  readonly ariaLabel = input('')
  readonly id = input<string | null>(null)
  readonly class = input('')

  readonly selectionChange = output<string[]>()

  private readonly trigger = viewChild<ElementRef<HTMLElement>>('trigger')
  private readonly chipRow = viewChild<ElementRef<HTMLElement>>('chipRow')
  private readonly measureRow = viewChild<ElementRef<HTMLElement>>('measureRow')

  private readonly value = signal<string[]>([])
  // Two sources (Batch B rule): a later [disabled]="false" must not re-enable a form-disabled control.
  private readonly formDisabled = signal(false)
  readonly isDisabled = computed(() => this.disabled() || this.formDisabled())
  readonly isOpen = signal(false)

  /** Labels for the current value, in value order; a value with no matching item shows as itself. */
  readonly chipLabels = computed(() => {
    const valueFn = this.valueFn()
    const labelFn = this.labelFn()
    const labels = new Map<string, string>()
    for (const item of this.items() ?? []) {
      const value = valueFn(item) ?? ''
      if (value) labels.set(value, labelFn(item) ?? '')
    }
    return this.value().map((value) => labels.get(value) ?? value)
  })

  /**
   * Chips that fit on one line. "All" (server render, first paint) until measured. Only the
   * measure writes it: a reset on new labels would stick when the next measure is unchanged.
   */
  readonly visibleChipCount = signal(Infinity)
  readonly hiddenChipCount = computed(() => Math.max(0, this.chipLabels().length - this.visibleChipCount()))
  readonly selectedCount = computed(() => this.value().length)

  readonly triggerClasses = computed(() =>
    cn('cn-select-trigger relative flex h-9 w-full items-center overflow-hidden text-left disabled:cursor-not-allowed disabled:opacity-50', this.class()),
  )

  /** Bumped by the ResizeObserver: the chip row changed width. */
  private readonly resized = signal(0)
  private destroyed = false
  private onChange: (value: string[]) => void = () => {}
  private onTouched: () => void = () => {}

  private readonly dialog = inject(IvDialog)

  constructor() {
    const destroyRef = inject(DestroyRef)
    destroyRef.onDestroy(() => (this.destroyed = true))

    // Browser only, after the first render: the chip row exists and has a real width.
    afterNextRender(() => {
      const row = this.chipRow()?.nativeElement
      if (!row || typeof ResizeObserver === 'undefined') return
      const observer = new ResizeObserver(() => this.resized.update((n) => n + 1))
      observer.observe(row)
      destroyRef.onDestroy(() => observer.disconnect())
    })

    // Measure after the new chips are in the offscreen row (they render before this runs),
    // and again on every resize. Reads in earlyRead, writes in write: no layout thrash.
    afterRenderEffect({
      earlyRead: () => {
        this.resized()
        return this.measure()
      },
      write: (count) => this.visibleChipCount.set(count()),
    })
  }

  // ─── ControlValueAccessor ──────────────────────────────────────────────────

  writeValue(value: string[] | null): void {
    this.value.set(Array.isArray(value) ? value : [])
  }

  registerOnChange(fn: (value: string[]) => void): void {
    this.onChange = fn
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled)
  }

  // ─── Dialog ────────────────────────────────────────────────────────────────

  async openPicker(): Promise<void> {
    if (this.isDisabled() || this.isOpen()) return
    this.isOpen.set(true)

    const data: SelectPickerDialogData = {
      rows: this.toRows(),
      selectedValues: [...this.value()],
      title: this.dialogTitle(),
      description: this.dialogDescription(),
      searchPlaceholder: this.searchPlaceholder(),
      valueColumnHeader: this.valueColumnHeader(),
      descriptionColumnHeader: this.descriptionColumnHeader(),
      minSelection: this.minSelection(),
      emptyMessage: this.emptyMessage(),
    }

    try {
      const ref = this.dialog.open<IvSelectPickerDialog, string[], SelectPickerDialogData>(IvSelectPickerDialog, {
        disableBackdropClose: true,
        size: 'default',
        data,
      })
      // defaultValue: a dialog disposed by navigation completes without a close event.
      const closed = await firstValueFrom(ref.afterClosed(), { defaultValue: undefined })

      // Cancel / Escape close without a result: the value stays.
      if (this.destroyed || !closed?.result) return
      this.value.set(closed.result)
      this.onChange(closed.result)
      this.selectionChange.emit(closed.result)
    } finally {
      this.isOpen.set(false)
      // Touched on close (overlay rule), once the user is done with the picker.
      if (!this.destroyed) this.onTouched()
    }
  }

  private toRows(): SelectPickerRow[] {
    const valueFn = this.valueFn()
    const labelFn = this.labelFn()
    const descriptionFn = this.descriptionFn()
    return (this.items() ?? []).map((item) => ({
      value: valueFn(item) ?? '',
      label: labelFn(item) ?? '',
      description: descriptionFn?.(item),
    }))
  }

  /** Reads the real widths from the offscreen measuring row (same classes as the chips). */
  private measure(): number {
    const total = this.chipLabels().length
    const row = this.measureRow()?.nativeElement
    const widths = row
      ? Array.from(row.querySelectorAll<HTMLElement>('[data-measure-chip]')).map((el) => el.offsetWidth)
      : []
    const overflow = row?.querySelector<HTMLElement>('[data-measure-overflow]')?.offsetWidth ?? 0
    // The full trigger, not the chip row: that's a flex child already narrowed by the chevron and
    // padding sibling, so its own width is chrome-free — fitChips would subtract TRIGGER_CHROME_PX
    // a second time.
    return fitChips(this.trigger()?.nativeElement.clientWidth ?? 0, widths, overflow, total)
  }
}

// Re-exported so consumers can reference the dialog type without a second import path.
export { IvSelectPickerDialog } from './select-picker-dialog'

/**
 * Only the trigger belongs here. The dialog is instantiated dynamically by IvDialog and
 * never appears in a template, so listing it in an NgModule's `imports` is both unnecessary and
 * a compile error (NG3004) — the class is not declared in this file.
 */
export const IV_SELECT_PICKER_IMPORTS = [IvSelectPicker] as const
