import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IV_HOVER_CARD_IMPORTS } from '@ivorie/ui/hover-card';

@Component({
  selector: 'demo-hover-card-side-align',
  imports: [IV_HOVER_CARD_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-hover-card>
      <span ivHoverCardTrigger tabindex="0" class="underline underline-offset-4">Hover for a card above</span>
      <iv-hover-card-content side="top" align="start" class="w-64">
        <p class="text-sm">Appears above, aligned to the start.</p>
      </iv-hover-card-content>
    </iv-hover-card>
  `,
})
export default class HoverCardSideAlignDemo {}
