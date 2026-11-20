import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IV_AVATAR_IMPORTS } from '@inlaylab/ivorie/avatar';
import { IV_HOVER_CARD_IMPORTS } from '@inlaylab/ivorie/hover-card';

@Component({
  selector: 'demo-hover-card',
  imports: [IV_HOVER_CARD_IMPORTS, IV_AVATAR_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-hover-card>
      <a ivHoverCardTrigger href="https://github.com/Inlaylab/ivorie" target="_blank" rel="noreferrer" class="text-primary font-medium underline underline-offset-4">&#64;inlaylab/ivorie</a>
      <iv-hover-card-content class="w-80">
        <div class="flex gap-4">
          <iv-avatar>
            <iv-avatar-image src="app.svg" alt="Ivorie" />
            <iv-avatar-fallback>IV</iv-avatar-fallback>
          </iv-avatar>
          <div class="flex flex-col gap-1">
            <p class="text-sm font-semibold">&#64;inlaylab/ivorie</p>
            <p class="text-sm">Angular components with shadcn/ui behavior. Signals, zoneless, server rendering.</p>
            <p class="text-muted-foreground text-xs">Built for Angular 22. MIT license.</p>
          </div>
        </div>
      </iv-hover-card-content>
    </iv-hover-card>
  `,
})
export default class HoverCardDemo {}
