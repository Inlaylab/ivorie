import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IV_CARD_IMPORTS } from '@ivorie/ui/card';

@Component({
  selector: 'demo-card-image',
  imports: [IV_CARD_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-card class="w-full max-w-sm">
      <img src="avatar.svg" alt="Banner" class="h-32 w-full object-cover" />
      <iv-card-header>
        <iv-card-title>Product name</iv-card-title>
      </iv-card-header>
      <iv-card-content>
        <p class="text-sm text-muted-foreground">Description goes here.</p>
      </iv-card-content>
    </iv-card>
  `,
})
export default class CardImageDemo {}
