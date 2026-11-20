import { ChangeDetectionStrategy, Component } from '@angular/core'
import { UsageCard } from './components/usage-card'
import { plan, quotas } from './data'

export const meta = {
  title: 'Usage 01',
  description: 'Plan usage in a card: a meter for storage, seats and build minutes, a note near the limit, and an upgrade button.',
}

/** The page. Replace the handlers with your billing calls. */
@Component({
  selector: 'app-usage-01',
  imports: [UsageCard],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex min-h-svh w-full items-center justify-center p-6 md:p-10' },
  template: `
    <div class="w-full max-w-md">
      <app-usage-01-card [plan]="plan" [quotas]="quotas" (upgrade)="upgrade()" (details)="details()" />
    </div>
  `,
})
export class Usage01 {
  protected readonly plan = plan
  protected readonly quotas = quotas

  protected upgrade(): void {
    // Open your checkout here.
  }

  protected details(): void {
    // Navigate to your billing page here.
  }
}
