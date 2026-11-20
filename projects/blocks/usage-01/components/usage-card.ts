import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core'
import { NgIcon } from '@ng-icons/core'
import { lucideZap } from '@ng-icons/lucide'
import { IV_ALERT_IMPORTS } from '@inlaylab/ivorie/alert'
import { IvBadge } from '@inlaylab/ivorie/badge'
import { IvButton } from '@inlaylab/ivorie/button'
import { IV_CARD_IMPORTS } from '@inlaylab/ivorie/card'
import { IvMeter } from '@inlaylab/ivorie/meter'
import { NEAR_LIMIT, type Plan, type Quota } from '../data'

/** Plan usage: a meter per limit, a note when one is nearly full, and an upgrade button. */
@Component({
  selector: 'app-usage-01-card',
  imports: [NgIcon, IV_ALERT_IMPORTS, IvBadge, IvButton, IV_CARD_IMPORTS, IvMeter],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-card>
      <iv-card-header>
        <iv-card-title>Plan usage</iv-card-title>
        <iv-card-description>Counters reset on {{ plan().resets }}.</iv-card-description>
        <iv-card-action><iv-badge variant="secondary">{{ plan().name }}</iv-badge></iv-card-action>
      </iv-card-header>
      <iv-card-content class="flex flex-col gap-5">
        @for (q of quotas(); track q.label) {
          <iv-meter
            [label]="q.label"
            [value]="q.used"
            [max]="q.limit"
            [high]="q.limit * near"
            [optimum]="0"
            [valueText]="format(q.used) + ' of ' + format(q.limit) + ' ' + q.unit"
            [ticks]="20"
          />
        }
        @if (full().length) {
          <iv-alert>
            <iv-alert-title>{{ full().join(' and ') }} nearly used up</iv-alert-title>
            <iv-alert-description>Upgrade before the limit, or new work waits until the reset.</iv-alert-description>
          </iv-alert>
        }
      </iv-card-content>
      <iv-card-footer class="justify-end gap-2">
        <button ivButton variant="ghost" (click)="details.emit()">View details</button>
        <button ivButton (click)="upgrade.emit()"><ng-icon [svg]="icons.zap" />Upgrade</button>
      </iv-card-footer>
    </iv-card>
  `,
})
export class UsageCard {
  readonly plan = input.required<Plan>()
  readonly quotas = input.required<Quota[]>()
  readonly upgrade = output<void>()
  readonly details = output<void>()

  protected readonly near = NEAR_LIMIT
  protected readonly icons = { zap: lucideZap }
  /** Labels of the limits past NEAR_LIMIT: the meter turns there too (above `high`). */
  protected readonly full = computed(() => this.quotas().filter((q) => q.used > q.limit * NEAR_LIMIT).map((q) => q.label))

  protected format(n: number): string {
    return n.toLocaleString('en-US')
  }
}
