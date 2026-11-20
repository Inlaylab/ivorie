import { ChangeDetectionStrategy, Component, input } from '@angular/core'
import { IvBadge } from '@inlaylab/ivorie/badge'
import { IV_CARD_IMPORTS } from '@inlaylab/ivorie/card'
import type { Incident } from '../data'

/** Recent incidents, each with its updates on a timeline, newest first. */
@Component({
  selector: 'app-status-01-incidents',
  imports: [IvBadge, IV_CARD_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-card>
      <iv-card-header>
        <iv-card-title>Incidents</iv-card-title>
        <iv-card-description>What went wrong and what we did.</iv-card-description>
      </iv-card-header>
      <iv-card-content class="flex flex-col gap-6">
        @for (i of incidents(); track i.title) {
          <article class="flex flex-col gap-3">
            <header class="flex flex-wrap items-center gap-2">
              <h2 class="text-sm font-medium">{{ i.title }}</h2>
              <iv-badge [variant]="i.status === 'resolved' ? 'secondary' : 'outline'">{{ i.status }}</iv-badge>
              <span class="text-muted-foreground ml-auto text-xs">{{ i.date }}</span>
            </header>
            <ol class="border-border ml-1 flex flex-col gap-3 border-l pl-4">
              @for (u of i.updates; track u.time) {
                <li class="relative text-sm">
                  <span class="bg-primary ring-card absolute top-1.5 -left-[1.3rem] size-2 rounded-full ring-4" aria-hidden="true"></span>
                  <span class="text-muted-foreground block font-mono text-xs">{{ u.time }}</span>
                  {{ u.text }}
                </li>
              }
            </ol>
          </article>
        } @empty {
          <p class="text-muted-foreground text-sm">No incidents. All quiet.</p>
        }
      </iv-card-content>
    </iv-card>
  `,
})
export class IncidentList {
  readonly incidents = input.required<Incident[]>()
}
