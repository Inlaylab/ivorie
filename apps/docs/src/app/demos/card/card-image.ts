import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IV_CARD_IMPORTS } from '@inlaylab/ivorie/card';

@Component({
  selector: 'demo-card-image',
  imports: [IV_CARD_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-card class="w-full max-w-sm">
      <img src="app.svg" alt="Ivorie" class="h-32 w-full object-contain p-4" />
      <iv-card-header>
        <iv-card-title>Ivorie Pro</iv-card-title>
      </iv-card-header>
      <iv-card-content>
        <p class="text-muted-foreground text-sm">Unlimited projects, custom themes and priority support.</p>
      </iv-card-content>
    </iv-card>
  `,
})
export default class CardImageDemo {}
