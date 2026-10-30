import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IV_HOVER_CARD_IMPORTS } from '@inlaylab/ivorie/hover-card';

@Component({
  selector: 'demo-hover-card',
  imports: [IV_HOVER_CARD_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-hover-card>
      <a ivHoverCardTrigger href="#" class="text-primary underline underline-offset-4">&#64;nextjs</a>
      <iv-hover-card-content class="w-72">
        <p class="text-sm font-medium">Next.js</p>
        <p class="text-xs text-muted-foreground">The React Framework, created and maintained by Vercel.</p>
      </iv-hover-card-content>
    </iv-hover-card>
  `,
})
export default class HoverCardDemo {}
