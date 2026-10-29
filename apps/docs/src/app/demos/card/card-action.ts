import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IV_CARD_IMPORTS } from '@ivorie/ui/card';
import { IvButton } from '@ivorie/ui/button';

@Component({
  selector: 'demo-card-action',
  imports: [IV_CARD_IMPORTS, IvButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-card class="w-full max-w-sm">
      <iv-card-header>
        <iv-card-title>API keys</iv-card-title>
        <iv-card-description>Keys used to authenticate requests.</iv-card-description>
        <iv-card-action>
          <button ivButton size="sm" variant="outline">Add key</button>
        </iv-card-action>
      </iv-card-header>
    </iv-card>
  `,
})
export default class CardActionDemo {}
