import { ChangeDetectionStrategy, Component, computed } from '@angular/core'
import { IvButton } from '@inlaylab/ivorie/button'
import { IV_CARD_IMPORTS } from '@inlaylab/ivorie/card'
import { IvGauge } from '@inlaylab/ivorie/gauge'
import { IncidentList } from './components/incident-list'
import { ServiceList } from './components/service-list'
import { DAYS, incidents, services } from './data'

export const meta = {
  title: 'Status 01',
  description: 'A status page: a day-by-day tracker per service, an overall uptime gauge, and incidents with their updates.',
}

const HEADLINE = {
  operational: 'All systems operational',
  degraded: 'Some systems degraded',
  outage: 'Outage in progress',
}

/** The status page. Replace the data with your monitor's. */
@Component({
  selector: 'app-status-01',
  imports: [IvButton, IV_CARD_IMPORTS, IvGauge, IncidentList, ServiceList],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: '@container/main block w-full p-4 md:p-6' },
  template: `
    <div class="mx-auto flex max-w-5xl flex-col gap-4">
      <header class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 class="text-xl font-semibold">Acme status</h1>
          <p class="text-muted-foreground text-sm" data-testid="headline">{{ headline() }}</p>
        </div>
        <button ivButton variant="outline" (click)="subscribe()">Subscribe to updates</button>
      </header>
      <div class="grid grid-cols-1 gap-4 @3xl/main:grid-cols-[1fr_16rem]">
        <app-status-01-services [services]="services" />
        <iv-card>
          <iv-card-header>
            <iv-card-title>Uptime</iv-card-title>
            <iv-card-description>All services, {{ days }} days.</iv-card-description>
          </iv-card-header>
          <iv-card-content class="flex justify-center">
            <iv-gauge [value]="uptime()" [min]="99" minLabel="99%" maxLabel="100%" [valueText]="uptime() + '%'" caption="Uptime" label="Overall uptime" />
          </iv-card-content>
        </iv-card>
      </div>
      <app-status-01-incidents [incidents]="incidents" />
    </div>
  `,
})
export class Status01 {
  protected readonly services = services
  protected readonly incidents = incidents
  protected readonly days = DAYS
  protected readonly uptime = computed(() => +(services.reduce((s, x) => s + x.uptime, 0) / services.length).toFixed(1))
  /** The worst service status sets the headline. */
  protected readonly headline = computed(() => {
    const worst = services.some((s) => s.status === 'outage') ? 'outage' : services.some((s) => s.status === 'degraded') ? 'degraded' : 'operational'
    return HEADLINE[worst]
  })

  protected subscribe(): void {
    // Open your subscribe form or RSS feed here.
  }
}
