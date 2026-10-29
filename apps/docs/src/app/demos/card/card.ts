import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IV_CARD_IMPORTS } from '@ivorie/ui/card';

@Component({
  selector: 'demo-card',
  imports: [IV_CARD_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-card class="w-full max-w-sm">
      <iv-card-header>
        <iv-card-title>Account</iv-card-title>
        <iv-card-description>Manage your preferences.</iv-card-description>
      </iv-card-header>
      <iv-card-content>
        <p class="text-sm">Card content goes here.</p>
      </iv-card-content>
    </iv-card>
  `,
})
export default class CardDemo {}
