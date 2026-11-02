import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IvToggle } from '@inlaylab/ivorie/toggle';
import { LucideBold } from '@lucide/angular';

@Component({
  selector: 'demo-toggle',
  imports: [IvToggle, LucideBold],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button ivToggle aria-label="Toggle bold"><svg lucideBold aria-hidden="true"></svg></button>
  `,
})
export default class ToggleDemo {}
