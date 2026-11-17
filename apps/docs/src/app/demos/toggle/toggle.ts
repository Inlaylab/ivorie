import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IvToggle } from '@inlaylab/ivorie/toggle';
import { LucideBold } from '@lucide/angular';

@Component({
  selector: 'demo-toggle',
  imports: [IvToggle, LucideBold],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col items-center gap-3">
      <button ivToggle aria-label="Toggle bold"><svg lucideBold aria-hidden="true"></svg></button>
      <p class="text-muted-foreground text-sm">Press to toggle bold.</p>
    </div>
  `,
})
export default class ToggleDemo {}
