import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal } from '@angular/core'
import { IV_CARD_IMPORTS } from '@inlaylab/ivorie/card'
import { IV_CHART_IMPORTS, IvChartConfig } from '@inlaylab/ivorie/chart'
import { IV_SELECT_IMPORTS } from '@inlaylab/ivorie/select'
import { IvSidebarService } from '@inlaylab/ivorie/sidebar'
import { IV_TOGGLE_GROUP_IMPORTS } from '@inlaylab/ivorie/toggle-group'
import { Visit } from '../data'

const RANGES: Record<string, { days: number; label: string }> = {
  '90d': { days: 90, label: 'Last 3 months' },
  '30d': { days: 30, label: 'Last 30 days' },
  '7d': { days: 7, label: 'Last 7 days' },
}

/** Total visitors as a stacked area, for the last 90, 30 or 7 days. Phones start at 7 days. */
@Component({
  selector: 'app-dashboard-01-chart-area-interactive',
  imports: [IV_CARD_IMPORTS, IV_CHART_IMPORTS, IV_SELECT_IMPORTS, IV_TOGGLE_GROUP_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <iv-card class="@container/card">
      <iv-card-header>
        <iv-card-title>Total Visitors</iv-card-title>
        <iv-card-description>
          <span class="hidden @[540px]/card:block">Total for the {{ label().toLowerCase() }}</span>
          <span class="@[540px]/card:hidden">{{ label() }}</span>
        </iv-card-description>
        <iv-card-action>
          <iv-toggle-group
            variant="outline"
            [value]="range()"
            (valueChange)="range.set($any($event))"
            class="hidden *:data-[slot=toggle-group-item]:px-4! @[767px]/card:flex"
          >
            <button ivToggleGroupItem value="90d">Last 3 months</button>
            <button ivToggleGroupItem value="30d">Last 30 days</button>
            <button ivToggleGroupItem value="7d">Last 7 days</button>
          </iv-toggle-group>
          <iv-select [(value)]="range" placeholder="Last 3 months">
            <iv-select-trigger size="sm" aria-label="Select a range" class="flex w-40 @[767px]/card:hidden" />
            <iv-select-content class="rounded-xl">
              <iv-select-item value="90d" class="rounded-lg">Last 3 months</iv-select-item>
              <iv-select-item value="30d" class="rounded-lg">Last 30 days</iv-select-item>
              <iv-select-item value="7d" class="rounded-lg">Last 7 days</iv-select-item>
            </iv-select-content>
          </iv-select>
        </iv-card-action>
      </iv-card-header>
      <iv-card-content class="px-2 pt-4 sm:px-6 sm:pt-6">
        <iv-chart [config]="config" class="aspect-auto h-[250px] w-full">
          <svg ivAreaChart [data]="filtered()" [margin]="{ left: 12, right: 12 }">
            <defs>
              <linearGradient id="dashboard-01-fill-desktop" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stop-color="var(--color-desktop)" stop-opacity="1" />
                <stop offset="95%" stop-color="var(--color-desktop)" stop-opacity="0.1" />
              </linearGradient>
              <linearGradient id="dashboard-01-fill-mobile" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stop-color="var(--color-mobile)" stop-opacity="0.8" />
                <stop offset="95%" stop-color="var(--color-mobile)" stop-opacity="0.1" />
              </linearGradient>
            </defs>
            <g ivCartesianGrid [vertical]="false" />
            <g ivXAxis dataKey="date" [tickLine]="false" [axisLine]="false" [tickMargin]="8" [minTickGap]="32" [tickFormatter]="day" />
            <g ivArea dataKey="mobile" curve="natural" fill="url(#dashboard-01-fill-mobile)" stackId="a" />
            <g ivArea dataKey="desktop" curve="natural" fill="url(#dashboard-01-fill-desktop)" stackId="a" />
          </svg>
          <iv-chart-tooltip [cursor]="false" [labelFormatter]="day" indicator="dot" />
        </iv-chart>
      </iv-card-content>
    </iv-card>
  `,
})
export class ChartAreaInteractive {
  readonly data = input.required<Visit[]>()
  private readonly sidebar = inject(IvSidebarService)

  protected readonly config: IvChartConfig = {
    visitors: { label: 'Visitors' },
    desktop: { label: 'Desktop', color: 'var(--chart-1)' },
    mobile: { label: 'Mobile', color: 'var(--chart-2)' },
  }

  /** The picked range. Starts at 7 days on phones; null (a toggle pressed again) means 90 days. */
  protected readonly range = linkedSignal<string | null>(() => (this.sidebar.isMobile() ? '7d' : '90d'))
  protected readonly label = computed(() => RANGES[this.range() ?? '90d'].label)

  /** The last N days up to the newest row. Dates are UTC days. */
  protected readonly filtered = computed(() => {
    const rows = this.data()
    if (!rows.length) return rows
    const start = new Date(rows[rows.length - 1].date)
    start.setUTCDate(start.getUTCDate() - RANGES[this.range() ?? '90d'].days)
    return rows.filter((row) => new Date(row.date) > start)
  })

  /** Format in UTC, so the server and the browser print the same day. */
  protected readonly day = (value: string) =>
    new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
}
