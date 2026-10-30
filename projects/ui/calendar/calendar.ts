import {
  Component,
  ChangeDetectionStrategy,
  Injector,
  LOCALE_ID,
  afterNextRender,
  computed,
  forwardRef,
  inject,
  input,
  linkedSignal,
  output,
  signal,
} from '@angular/core'
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms'
import { LucideChevronLeft, LucideChevronRight } from '@lucide/angular'
import { IvButton } from '@ivorie/ui/button'
import { cn, IvIdGenerator } from '@ivorie/ui/core'

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

function addMonths(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + n, 1)
}

function addDays(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
}

/** Same day of the month `n` months later, clamped to that month's last day. */
function addMonthsKeepDay(d: Date, n: number): Date {
  const last = new Date(d.getFullYear(), d.getMonth() + n + 1, 0).getDate()
  return new Date(d.getFullYear(), d.getMonth() + n, Math.min(d.getDate(), last))
}

function isoDay(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// CLDR weekData: Monday is the default first day; these regions differ.
// `Intl.Locale.prototype.getWeekInfo` would give this directly, but Firefox does not implement it
// (Node/Chrome do) — reading it would make the server and a Firefox client render a different grid
// for the same locale, which Angular hydration then flags as a mismatch. `region`/`maximize()` are
// supported everywhere `Intl.Locale` is, so this table gives the same answer on every engine.
const WEEK_START_SUNDAY = new Set(['AG', 'AS', 'AU', 'BR', 'BS', 'BT', 'BW', 'BZ', 'CA', 'CO', 'DM', 'DO', 'ET', 'GT', 'GU', 'HK', 'HN', 'ID', 'IL', 'IN', 'JM', 'JP', 'KE', 'KR', 'LA', 'MH', 'MM', 'MO', 'MT', 'MX', 'MZ', 'NI', 'NP', 'PA', 'PE', 'PH', 'PK', 'PR', 'PT', 'PY', 'SA', 'SG', 'SV', 'TH', 'TT', 'TW', 'UM', 'US', 'VE', 'VI', 'WS', 'YE', 'ZA', 'ZW'])
const WEEK_START_SATURDAY = new Set(['AE', 'AF', 'BH', 'DJ', 'DZ', 'EG', 'IQ', 'IR', 'JO', 'KW', 'LY', 'OM', 'QA', 'SD', 'SY'])
const WEEK_START_FRIDAY = new Set(['MV'])

/** First day of the week for a locale (0 = Sunday), the same on every engine and on the server. */
function localeWeekStart(locale: string): IvWeekday {
  let region: string | undefined
  try {
    region = new Intl.Locale(locale).maximize().region
  } catch {
    region = undefined
  }
  if (region && WEEK_START_SATURDAY.has(region)) return 6
  if (region && WEEK_START_FRIDAY.has(region)) return 5
  if (region && WEEK_START_SUNDAY.has(region)) return 0
  return 1
}

export type IvCalendarMode = 'single' | 'range'

/** Day of the week, 0 = Sunday. */
export type IvWeekday = 0 | 1 | 2 | 3 | 4 | 5 | 6

export interface IvDateRange {
  from: Date | null
  to: Date | null
}

interface DayCell {
  date: Date
  key: string
  outside: boolean
  hidden: boolean
  today: boolean
  selected: boolean
  rangeStart: boolean
  rangeMiddle: boolean
  rangeEnd: boolean
  disabled: boolean
}

interface MonthView {
  label: string
  captionId: string
  weeks: DayCell[][]
}

const KEY_STEP: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }

@Component({
  selector: 'iv-calendar',
  imports: [LucideChevronLeft, LucideChevronRight, IvButton],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => IvCalendar),
      multi: true,
    },
  ],
  host: {
    'data-slot': 'calendar',
    '[class]': 'classes()',
    '(focusout)': 'onFocusOut($event)',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative flex flex-col gap-4 md:flex-row">
      <div class="absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1">
        <button
          ivButton
          variant="ghost"
          class="size-(--cell-size) p-0 select-none aria-disabled:opacity-50"
          (click)="prev()"
          [disabled]="prevDisabled()"
          aria-label="Previous month"
        >
          <svg lucideChevronLeft class="cn-rtl-flip size-4 rtl:rotate-180" aria-hidden="true"></svg>
        </button>
        <button
          ivButton
          variant="ghost"
          class="size-(--cell-size) p-0 select-none aria-disabled:opacity-50"
          (click)="next()"
          [disabled]="nextDisabled()"
          aria-label="Next month"
        >
          <svg lucideChevronRight class="cn-rtl-flip size-4 rtl:rotate-180" aria-hidden="true"></svg>
        </button>
      </div>

      @for (m of months(); track m.captionId) {
        <div class="flex w-full flex-col gap-4">
          <div class="flex h-(--cell-size) w-full items-center justify-center px-(--cell-size)">
            <span [id]="m.captionId" aria-live="polite" class="cn-calendar-caption text-sm font-medium select-none">{{ m.label }}</span>
          </div>
          <table role="grid" [attr.aria-labelledby]="m.captionId" class="w-full border-collapse" (keydown)="onKeydown($event)">
            <thead>
              <tr class="flex">
                @for (w of weekdays(); track $index) {
                  <th
                    scope="col"
                    [attr.aria-label]="w.long"
                    class="flex-1 rounded-(--cell-radius) text-[0.8rem] font-normal text-muted-foreground select-none"
                  >
                    {{ w.narrow }}
                  </th>
                }
              </tr>
            </thead>
            <tbody>
              @for (week of m.weeks; track $index) {
                <tr class="mt-2 flex w-full">
                  @for (cell of week; track cell.key) {
                    <td
                      role="gridcell"
                      [attr.aria-selected]="isPicked(cell)"
                      [attr.data-selected]="isPicked(cell) || null"
                      [class]="dayCellClass(cell)"
                    >
                      <button
                        ivButton
                        variant="ghost"
                        size="icon"
                        [attr.data-day]="cell.key"
                        [attr.data-outside]="cell.outside || null"
                        [attr.data-selected-single]="cell.selected || null"
                        [attr.data-range-start]="cell.rangeStart || null"
                        [attr.data-range-end]="cell.rangeEnd || null"
                        [attr.data-range-middle]="cell.rangeMiddle || null"
                        [attr.tabindex]="!cell.outside && cell.key === tabbableKey() ? 0 : -1"
                        [attr.aria-label]="dayLabel(cell)"
                        [disabled]="cell.disabled || cell.hidden || isDisabled()"
                        class="cn-calendar-day-button relative isolate z-10 flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 border-0 leading-none font-normal data-[range-end=true]:rounded-(--cell-radius) data-[range-end=true]:rounded-r-(--cell-radius) data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground data-[range-middle=true]:rounded-none data-[range-middle=true]:bg-muted data-[range-middle=true]:text-foreground data-[range-start=true]:rounded-(--cell-radius) data-[range-start=true]:rounded-l-(--cell-radius) data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground dark:hover:text-foreground [&>span]:text-xs [&>span]:opacity-70"
                        (click)="selectDay(cell)"
                        (focus)="_active.set(cell.date)"
                      >
                        {{ cell.date.getDate() }}
                      </button>
                    </td>
                  }
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
})
export class IvCalendar implements ControlValueAccessor {
  readonly class = input('');
  readonly mode = input<IvCalendarMode>('single');
  readonly numberOfMonths = input<1 | 2>(1);
  readonly showOutsideDays = input(true);
  /** First column, 0 = Sunday. Default: from the locale. */
  readonly weekStartsOn = input<IvWeekday>();
  /** BCP 47 tag. Default: `LOCALE_ID`. */
  readonly locale = input<string>();
  readonly disabled = input(false);

  readonly selected = input<Date | null>()
  readonly selectedChange = output<Date | null>();

  readonly range = input<IvDateRange | null>()
  readonly rangeChange = output<IvDateRange>();

  readonly minDate = input<Date | null>(null);
  readonly maxDate = input<Date | null>(null);
  readonly disabledDate = input<((d: Date) => boolean) | null>(null);

  readonly defaultMonth = input<Date | null>()

  // First class literal in the file, so the style conflict check sees this hook before the day classes.
  protected readonly classes = computed(() =>
    cn(
      'cn-calendar group/calendar block w-fit bg-background in-data-[slot=card-content]:bg-transparent in-data-[slot=popover-content]:bg-transparent',
      this.class()
    )
  )

  private readonly injector = inject(Injector)
  private readonly localeId = inject(LOCALE_ID)
  private readonly ids = inject(IvIdGenerator)
  private readonly captionIds = [this.ids.next('iv-calendar-caption'), this.ids.next('iv-calendar-caption')]
  // Midnight, so a maxDate of today does not disable today. Starts null and is read after the first
  // render (afterNextRender never runs during SSR), so the server and the client always agree on the
  // first paint — a server/client clock or timezone gap can no longer trigger a hydration mismatch.
  private readonly today = signal<Date | null>(null)

  constructor() {
    afterNextRender(() => this.today.set(new Date(new Date().setHours(0, 0, 0, 0))), { injector: this.injector })
  }

  // Local state: clicks and the form write here; a new input value resets it.
  private readonly _selected = linkedSignal(() => this.selected() ?? null)
  private readonly _range = linkedSignal<IvDateRange>(() => this.range() ?? { from: null, to: null })
  // A new [defaultMonth] moves the view; an empty one keeps the current month.
  private readonly _viewMonth = linkedSignal<Date | null | undefined, Date>({
    source: this.defaultMonth,
    computation: (v, prev) => (v ? startOfMonth(v) : (prev?.value ?? startOfMonth(new Date()))),
  })
  // Two sources, so a later [disabled] change cannot re-enable a form-disabled control.
  private readonly _formDisabled = signal(false)
  protected readonly isDisabled = computed(() => this.disabled() || this._formDisabled())
  /** The day the keyboard is on. */
  protected readonly _active = signal<Date | null>(null)

  private readonly _locale = computed(() => this.locale() ?? this.localeId)
  private readonly _weekStart = computed(() => this.weekStartsOn() ?? localeWeekStart(this._locale()))

  protected readonly weekdays = computed(() => {
    const sunday = new Date(2024, 0, 7)
    return Array.from({ length: 7 }, (_, i) => {
      const d = addDays(sunday, (i + this._weekStart()) % 7)
      return {
        narrow: d.toLocaleDateString(this._locale(), { weekday: 'narrow' }),
        long: d.toLocaleDateString(this._locale(), { weekday: 'long' }),
      }
    })
  })

  protected readonly months = computed<MonthView[]>(() =>
    Array.from({ length: this.numberOfMonths() }, (_, i) => {
      const month = addMonths(this._viewMonth(), i)
      return {
        label: month.toLocaleDateString(this._locale(), { month: 'long', year: 'numeric' }),
        captionId: this.captionIds[i],
        weeks: this.buildWeeks(month),
      }
    })
  )

  /** The one tabbable day: the first enabled of keyboard's day, selected, today, the 1st; else the first enabled day. */
  protected readonly tabbableKey = computed(() => {
    const picked = this.mode() === 'single' ? this._selected() : this._range().from
    const day = [this._active(), picked, this.today(), this._viewMonth()].find(
      (d) => d && this.inView(d) && !this.isDayDisabled(d)
    )
    if (day) return isoDay(day)
    return this.months().flatMap((m) => m.weeks.flat()).find((c) => !c.outside && !c.disabled)?.key ?? null
  })

  private inView(d: Date): boolean {
    const first = this._viewMonth()
    return d >= first && d < addMonths(first, this.numberOfMonths())
  }

  private buildWeeks(month: Date): DayCell[][] {
    const first = startOfMonth(month)
    const startOffset = (first.getDay() - this._weekStart() + 7) % 7
    const gridStart = addDays(first, -startOffset)

    const single = this.mode() === 'single'
    const sel = this._selected()
    const r = this._range()
    const today = this.today()
    const weeks: DayCell[][] = []

    for (let w = 0; w < 6; w++) {
      const row: DayCell[] = []
      for (let d = 0; d < 7; d++) {
        const date = addDays(gridStart, w * 7 + d)
        const outside = date.getMonth() !== month.getMonth()
        row.push({
          date,
          key: isoDay(date),
          outside,
          hidden: outside && !this.showOutsideDays(),
          today: today !== null && isSameDay(date, today),
          selected: single && !!sel && isSameDay(date, sel),
          rangeStart: !single && !!r.from && isSameDay(date, r.from),
          rangeEnd: !single && !!r.to && isSameDay(date, r.to),
          rangeMiddle: !single && !!r.from && !!r.to && date > r.from && date < r.to,
          disabled: this.isDayDisabled(date),
        })
      }
      weeks.push(row)
    }

    return weeks
  }

  prev(): void {
    this._viewMonth.set(addMonths(this._viewMonth(), -1))
  }

  next(): void {
    this._viewMonth.set(addMonths(this._viewMonth(), 1))
  }

  prevDisabled(): boolean {
    const minDate = this.minDate();
    if (this.isDisabled()) return true
    if (!minDate) return false
    const prevLast = addDays(startOfMonth(this._viewMonth()), -1)
    return prevLast < startOfMonth(minDate)
  }

  nextDisabled(): boolean {
    const maxDate = this.maxDate();
    if (this.isDisabled()) return true
    if (!maxDate) return false
    const nextFirst = addMonths(this._viewMonth(), this.numberOfMonths())
    return nextFirst > startOfMonth(maxDate)
  }

  selectDay(cell: DayCell): void {
    if (cell.disabled || cell.hidden || this.isDisabled()) return
    this._active.set(cell.date)

    if (this.mode() === 'single') {
      this._selected.set(cell.date)
      this._onChange(cell.date)
      this.selectedChange.emit(cell.date)
      return
    }

    const r = this._range()
    const next: IvDateRange =
      !r.from || r.to ? { from: cell.date, to: null }
        : cell.date < r.from ? { from: cell.date, to: r.from }
        : { from: r.from, to: cell.date }
    this._range.set(next)
    this._onChange(next)
    this.rangeChange.emit(next)
  }

  // WAI-ARIA date grid. Enter and Space reach the native button as a click.
  protected onKeydown(event: KeyboardEvent): void {
    const from = this._active()
    if (!from) return
    const weekday = (from.getDay() - this._weekStart() + 7) % 7
    let target: Date
    let step: number
    if (event.key in KEY_STEP) {
      step = KEY_STEP[event.key]
      target = addDays(from, step)
    } else if (event.key === 'Home') {
      step = 1
      target = addDays(from, -weekday)
    } else if (event.key === 'End') {
      step = -1
      target = addDays(from, 6 - weekday)
    } else if (event.key === 'PageUp' || event.key === 'PageDown') {
      step = event.key === 'PageUp' ? -1 : 1
      target = addMonthsKeepDay(from, event.shiftKey ? step * 12 : step)
    } else {
      return
    }
    event.preventDefault()

    // Skip disabled days in the key's direction; stay put past min/max or after a year of them.
    const min = this.minDate()
    const max = this.maxDate()
    for (let i = 0; i < 366 && this.isDayDisabled(target); i++) {
      if ((min && step < 0 && target < min) || (max && step > 0 && target > max)) return
      target = addDays(target, step)
    }
    if (this.isDayDisabled(target)) return

    this._active.set(target)
    if (target < this._viewMonth()) this._viewMonth.set(startOfMonth(target))
    else if (!this.inView(target)) this._viewMonth.set(addMonths(startOfMonth(target), 1 - this.numberOfMonths()))

    const host = (event.currentTarget as HTMLElement).closest('[data-slot="calendar"]')
    afterNextRender(
      () => host?.querySelector<HTMLElement>(`button[data-day="${isoDay(target)}"]:not([data-outside])`)?.focus(),
      { injector: this.injector }
    )
  }

  protected onFocusOut(event: FocusEvent): void {
    if (!(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node | null)) this._onTouched()
  }

  private isDayDisabled(d: Date): boolean {
    const minDate = this.minDate();
    if (minDate) {
      const min = new Date(
        minDate.getFullYear(),
        minDate.getMonth(),
        minDate.getDate()
      )
      if (d < min) return true
    }
    const maxDate = this.maxDate();
    if (maxDate) {
      const max = new Date(
        maxDate.getFullYear(),
        maxDate.getMonth(),
        maxDate.getDate()
      )
      if (d > max) return true
    }
    const disabledDate = this.disabledDate();
    return disabledDate ? disabledDate(d) : false
  }

  protected isPicked(cell: DayCell): boolean {
    return cell.selected || cell.rangeStart || cell.rangeMiddle || cell.rangeEnd
  }

  protected dayLabel(cell: DayCell): string {
    return cell.date.toLocaleDateString(this._locale(), { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  }

  // The radix base's day + react-day-picker modifier classes.
  dayCellClass(cell: DayCell): string {
    return cn(
      'group/day relative aspect-square h-full w-full rounded-(--cell-radius) p-0 text-center select-none [&:last-child[data-selected=true]_button]:rounded-r-(--cell-radius) [&:first-child[data-selected=true]_button]:rounded-l-(--cell-radius)',
      cell.today && 'rounded-(--cell-radius) bg-muted text-foreground data-[selected=true]:rounded-none',
      cell.outside && 'text-muted-foreground aria-selected:text-muted-foreground',
      cell.disabled && 'text-muted-foreground opacity-50',
      cell.rangeStart && 'relative isolate z-0 rounded-l-(--cell-radius) bg-muted after:absolute after:inset-y-0 after:right-0 after:w-4 after:bg-muted',
      cell.rangeMiddle && 'rounded-none',
      cell.rangeEnd && 'relative isolate z-0 rounded-r-(--cell-radius) bg-muted after:absolute after:inset-y-0 after:left-0 after:w-4 after:bg-muted',
      cell.hidden && 'invisible',
    )
  }

  private _onChange: (value: Date | IvDateRange | null) => void = () => {}
  private _onTouched = () => {}

  writeValue(value: Date | IvDateRange | null): void {
    if (this.mode() === 'single') this._selected.set(value instanceof Date ? value : null)
    else this._range.set(value && !(value instanceof Date) ? value : { from: null, to: null })
  }
  registerOnChange(fn: (value: Date | IvDateRange | null) => void) { this._onChange = fn }
  registerOnTouched(fn: () => void) { this._onTouched = fn }
  setDisabledState(isDisabled: boolean) { this._formDisabled.set(isDisabled) }
}
