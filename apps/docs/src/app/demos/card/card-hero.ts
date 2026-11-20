import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IV_CARD_IMPORTS } from '@inlaylab/ivorie/card';

@Component({
  selector: 'demo-card-hero',
  imports: [IV_CARD_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-card emphasis="hero" class="w-full max-w-sm">
      <iv-card-header>
        <iv-card-title>Revenue</iv-card-title>
        <iv-card-description>This month.</iv-card-description>
      </iv-card-header>
      <iv-card-content>
        <p class="text-3xl font-semibold tabular-nums">$48,210</p>
      </iv-card-content>
    </iv-card>
  `,
})
export default class CardHeroDemo {}
