import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  LOCALE_ID,
  TemplateRef,
  Type,
  booleanAttribute,
  computed,
  contentChild,
  inject,
  input,
} from '@angular/core'
import { NgComponentOutlet, NgTemplateOutlet } from '@angular/common'
import { cn } from '@inlaylab/ivorie/core'
import { IV_CHART, IvChartPayload } from './types'
import { ivConfigEntry, ivPayloadConfig } from './scales'

export type IvChartTooltipIndicator = 'dot' | 'line' | 'dashed'

/** Formats the tooltip label. `label` is the category value, or the config label it names. */
export type IvChartTooltipLabelFormatter = (label: any, payload: IvChartPayload[]) => string

/** Replaces a tooltip row with text. */
export type IvChartTooltipFormatter = (
  value: any,
  name: string,
  item: IvChartPayload,
  index: number,
) => string

export interface IvChartTooltipContentContext {
  /** The rows under the cursor. */
  $implicit: IvChartPayload[]
  /** The category value (Recharts' `label`). */
  label: unknown
}

/**
 * A custom tooltip body, inside the `cn-chart-tooltip` card:
 * `<ng-template ivChartTooltipContent let-payload let-label="label">`.
 */
@Directive({ selector: 'ng-template[ivChartTooltipContent]' })
export class IvChartTooltipContent {
  readonly template = inject<TemplateRef<IvChartTooltipContentContext>>(TemplateRef)

  static ngTemplateContextGuard(
    _dir: IvChartTooltipContent,
    ctx: unknown,
  ): ctx is IvChartTooltipContentContext {
    return true
  }
}

export interface IvChartTooltipItemContext {
  /** The row's payload item. */
  $implicit: IvChartPayload
  value: unknown
  /** The series key (a pie: the sector name). */
  name: string
  /** The config label, or `name`. */
  label: string
  /** The indicator color. */
  color: string
  /** The row's position in the tooltip. */
  index: number
  /** All rows, e.g. for a total after the last one. */
  payload: IvChartPayload[]
}

/**
 * A custom tooltip row (Recharts' `formatter` returning markup): replaces the indicator, name and
 * value of each row, inside the row's flex box.
 * `<ng-template ivChartTooltipItem let-item let-label="label" let-index="index">`.
 */
@Directive({ selector: 'ng-template[ivChartTooltipItem]' })
export class IvChartTooltipItem {
  readonly template = inject<TemplateRef<IvChartTooltipItemContext>>(TemplateRef)

  static ngTemplateContextGuard(
    _dir: IvChartTooltipItem,
    ctx: unknown,
  ): ctx is IvChartTooltipItemContext {
    return true
  }
}

interface Row {
  /** `ivChartTooltipItem` context, when the template is given. */
  context: IvChartTooltipItemContext | null
  /** `formatter` output: replaces the indicator, name and value. */
  text: string | null
  icon: Type<unknown> | null
  color: string
  name: string
  value: string | null
}

/** Recharts' tooltip offset from the pointer. */
const OFFSET = 10
const px = (n: number) => `${Math.round(n * 100) / 100}px`

/**
 * Places the tooltip `OFFSET` px past the point, on the side with more room, and clamps it to
 * the chart box with CSS: `100%` in `translate` is the tooltip's own size, so nothing is measured
 * and the server places it the same way.
 */
function place(at: number, size: number): string {
  return at < size / 2
    ? `min(${px(at + OFFSET)}, calc(${px(size)} - 100%))`
    : `max(0px, calc(${px(at - OFFSET)} - 100%))`
}

/**
 * shadcn's `ChartTooltipContent`, shown while a row is active (pointer, touch, keyboard or
 * `defaultIndex`). Put it inside `iv-chart`, after the chart root. Labels, icons and colors come
 * from the chart config.
 */
@Component({
  selector: 'iv-chart-tooltip',
  host: {
    'data-slot': 'chart-tooltip',
    '[class]': 'hostClasses',
    '[attr.data-state]': "open() ? 'open' : 'closed'",
    '[attr.aria-live]': "chart.focused() ? 'polite' : null",
    'aria-atomic': 'true',
    '[style.transform]': 'transform()',
  },
  imports: [NgComponentOutlet, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (open()) {
      <div data-slot="chart-tooltip-content" [class]="classes()">
        @if (content(); as custom) {
          <ng-container
            [ngTemplateOutlet]="custom.template"
            [ngTemplateOutletContext]="{ $implicit: payload(), label: rawLabel() }"
          />
        } @else {
          @if (!nest() && title() !== null) {
            <div data-slot="chart-tooltip-label" class="font-medium">{{ title() }}</div>
          }
          <div class="grid gap-1.5">
            @for (row of rows(); track $index) {
              <div data-slot="chart-tooltip-item" [class]="rowClass()">
                @if (row.context && item(); as tpl) {
                  <ng-container
                    [ngTemplateOutlet]="tpl.template"
                    [ngTemplateOutletContext]="row.context"
                  />
                } @else if (row.text !== null) {
                  {{ row.text }}
                } @else {
                  @if (row.icon) {
                    <ng-container *ngComponentOutlet="row.icon" />
                  } @else if (!hideIndicator()) {
                    <div
                      data-slot="chart-tooltip-indicator"
                      [class]="indicatorClass()"
                      [style.--color-bg]="row.color"
                      [style.--color-border]="row.color"
                    ></div>
                  }
                  <div [class]="bodyClass()">
                    <div class="grid gap-1.5">
                      @if (nest() && title() !== null) {
                        <div data-slot="chart-tooltip-label" class="font-medium">{{ title() }}</div>
                      }
                      <span class="text-muted-foreground">{{ row.name }}</span>
                    </div>
                    @if (row.value !== null) {
                      <span class="font-mono font-medium text-foreground tabular-nums">{{
                        row.value
                      }}</span>
                    }
                  </div>
                }
              </div>
            }
          </div>
        }
      </div>
    }
  `,
})
export class IvChartTooltip {
  readonly indicator = input<IvChartTooltipIndicator>('dot')
  readonly hideLabel = input(false, { transform: booleanAttribute })
  readonly hideIndicator = input(false, { transform: booleanAttribute })
  /** Row key whose string value names the config entry of each row (a pie's sector names). */
  readonly nameKey = input<string>()
  /** Config key of the label. Default: the category value, or the first row's series. */
  readonly labelKey = input<string>()
  readonly labelFormatter = input<IvChartTooltipLabelFormatter>()
  readonly formatter = input<IvChartTooltipFormatter>()
  /** Draws the band (bar), line (line, area) or spoke (radar) under the active row. */
  readonly cursor = input(true, { transform: booleanAttribute })
  /** Opens on this row at start, before any pointer (also on the server). */
  readonly defaultIndex = input<number>()
  readonly class = input('')

  protected readonly chart = inject(IV_CHART)
  private readonly locale = inject(LOCALE_ID)
  protected readonly content = contentChild(IvChartTooltipContent)
  protected readonly item = contentChild(IvChartTooltipItem)

  protected readonly hostClasses = 'pointer-events-none absolute top-0 left-0 z-10'

  protected readonly payload = this.chart.payload
  protected readonly open = computed(() => this.payload().length > 0)

  protected readonly rawLabel = computed(() => {
    const active = this.chart.active()
    return active ? this.chart.source()?.activeLabel(active) : undefined
  })

  /** One row with a line or dashed indicator: the label moves into the row. */
  protected readonly nest = computed(
    () => this.payload().length === 1 && this.indicator() !== 'dot',
  )

  /** shadcn's tooltip label. */
  protected readonly title = computed<string | null>(() => {
    const payload = this.payload()
    if (this.hideLabel() || !payload.length) return null
    const config = this.chart.config()
    const [item] = payload
    const labelKey = this.labelKey()
    const label = this.rawLabel()
    const value =
      !labelKey && typeof label === 'string'
        ? (ivConfigEntry(config, label)?.label ?? label)
        : ivPayloadConfig(config, item, labelKey ?? item.key ?? item.name ?? 'value')?.label
    const format = this.labelFormatter()
    if (format) return format(value, payload)
    return value ? value : null
  })

  protected readonly rows = computed<Row[]>(() => {
    const config = this.chart.config()
    const nameKey = this.nameKey()
    const format = this.formatter()
    const custom = this.item() !== undefined
    const payload = this.payload()
    return payload.map((item, index) => {
      const entry = ivPayloadConfig(config, item, nameKey ?? item.name ?? item.key ?? 'value')
      const fill = item.row['fill']
      const value = item.value
      const color = typeof fill === 'string' ? fill : item.color
      return {
        // Like Recharts' formatter: only rows with a value and a name.
        context:
          custom && value !== undefined && item.name
            ? {
                $implicit: item,
                value,
                name: item.name,
                label: entry?.label ?? item.name,
                color,
                index,
                payload,
              }
            : null,
        text:
          format && value !== undefined && item.name ? format(value, item.name, item, index) : null,
        icon: entry?.icon ?? null,
        color,
        name: entry?.label ?? item.name,
        value:
          value === null || value === undefined
            ? null
            : typeof value === 'number'
              ? value.toLocaleString(this.locale)
              : String(value),
      }
    })
  })

  protected readonly transform = computed(() => {
    const active = this.chart.active()
    const source = this.chart.source()
    if (!this.open() || !active || !source) return null
    const { x, y } = source.anchor(active)
    const { width, height } = this.chart.size()
    return `translate(${place(x, width)}, ${place(y, height)})`
  })

  protected readonly classes = computed(() =>
    cn('cn-chart-tooltip grid min-w-32 items-start', this.class()),
  )

  protected readonly rowClass = computed(() =>
    cn(
      'flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground',
      this.indicator() === 'dot' && 'items-center',
    ),
  )

  protected readonly indicatorClass = computed(() => {
    const indicator = this.indicator()
    return cn(
      'shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)',
      indicator === 'dot' && 'h-2.5 w-2.5',
      indicator === 'line' && 'w-1',
      indicator === 'dashed' && 'w-0 border-[1.5px] border-dashed bg-transparent',
      this.nest() && indicator === 'dashed' && 'my-0.5',
    )
  })

  protected readonly bodyClass = computed(() =>
    cn('flex flex-1 justify-between leading-none', this.nest() ? 'items-end' : 'items-center'),
  )
}
