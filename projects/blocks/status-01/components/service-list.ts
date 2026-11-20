import { ChangeDetectionStrategy, Component, input } from '@angular/core'
import { IvBadge } from '@inlaylab/ivorie/badge'
import { IV_CARD_IMPORTS } from '@inlaylab/ivorie/card'
import { IvTracker } from '@inlaylab/ivorie/tracker'
import { DAYS, type Service } from '../data'

/** Each service: its name, status and uptime, then a bar per day. */
@Component({
  selector: 'app-status-01-services',
  imports: [IvBadge, IV_CARD_IMPORTS, IvTracker],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-card class="h-full">
      <iv-card-header>
        <iv-card-title>Services</iv-card-title>
        <iv-card-description>The last {{ days }} days. Hover or focus a bar for the day.</iv-card-description>
      </iv-card-header>
      <iv-card-content class="flex flex-col gap-6">
        @for (s of services(); track s.name) {
          <section class="flex flex-col gap-2" [attr.aria-label]="s.name">
            <div class="flex items-center gap-2 text-sm">
              <span class="font-medium">{{ s.name }}</span>
              <iv-badge [variant]="s.status === 'outage' ? 'destructive' : s.status === 'degraded' ? 'outline' : 'secondary'">{{ s.status }}</iv-badge>
              <span class="text-muted-foreground ml-auto tabular-nums">{{ s.uptime }}% up</span>
            </div>
            <iv-tracker [data]="s.days" [label]="s.name + ' uptime, last ' + days + ' days'" />
          </section>
        }
        <div class="text-muted-foreground -mt-4 flex justify-between text-xs" aria-hidden="true"><span>{{ days }} days ago</span><span>Today</span></div>
      </iv-card-content>
    </iv-card>
  `,
})
export class ServiceList {
  readonly services = input.required<Service[]>()
  protected readonly days = DAYS
}
