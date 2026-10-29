import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IV_HOVER_CARD_IMPORTS } from '@ivorie/ui/hover-card';

@Component({
  selector: 'demo-hover-card-delays',
  imports: [IV_HOVER_CARD_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-hover-card [openDelay]="0" [closeDelay]="500">
      <span ivHoverCardTrigger tabindex="0" class="underline underline-offset-4">Opens at once</span>
      <iv-hover-card-content class="w-64">
        <p class="text-sm">Opens with no delay and stays for 500ms after you leave.</p>
      </iv-hover-card-content>
    </iv-hover-card>
  `,
})
export default class HoverCardDelaysDemo {}
