import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IV_CARD_IMPORTS } from '@ivorie/ui/card';

@Component({
  selector: 'demo-card-small',
  imports: [IV_CARD_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-card size="sm" class="w-full max-w-sm">
      <iv-card-header>
        <iv-card-title>Quick stats</iv-card-title>
        <iv-card-description>Last 7 days.</iv-card-description>
      </iv-card-header>
      <iv-card-content>
        <p class="text-sm">1,284 visits</p>
      </iv-card-content>
    </iv-card>
  `,
})
export default class CardSmallDemo {}
