import { ChangeDetectionStrategy, Component } from '@angular/core'
import { KpiCard } from './components/kpi-card'
import { kpis } from './data'

export const meta = {
  title: 'Stats 01',
  description: 'A row of KPI cards: icon, value, change and a sparkline. One, two or four columns as the page widens.',
}

/** The KPI row. Replace `kpis` with your numbers. */
@Component({
  selector: 'app-stats-01',
  imports: [KpiCard],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: '@container/main block w-full p-4 md:p-6' },
  template: `
    <div class="mx-auto flex max-w-6xl flex-col gap-4">
      <header>
        <h1 class="text-xl font-semibold">Overview</h1>
        <p class="text-muted-foreground text-sm">The last 30 days, against the 30 days before.</p>
      </header>
      <div class="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        @for (k of kpis; track k.label) {
          <app-stats-01-kpi-card [kpi]="k" />
        }
      </div>
    </div>
  `,
})
export class Stats01 {
  protected readonly kpis = kpis
}
