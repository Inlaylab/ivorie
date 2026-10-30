import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { IV_INPUT_IMPORTS } from '@inlaylab/ivorie/input';
import { LucideEye } from '@lucide/angular';
import { LucideEyeOff } from '@lucide/angular';

@Component({
  selector: 'demo-input-group-button',
  imports: [IV_INPUT_IMPORTS, LucideEye, LucideEyeOff],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-input-group class="w-full max-w-sm">
      <input ivInputGroupInput [type]="show() ? 'text' : 'password'" placeholder="Password" aria-label="Password" />
      <iv-input-group-addon align="inline-end">
        <iv-input-group-button size="icon-xs" aria-label="Toggle password" (click)="show.set(!show())">
          @if (show()) {
            <svg lucideEyeOff></svg>
          } @else {
            <svg lucideEye></svg>
          }
        </iv-input-group-button>
      </iv-input-group-addon>
    </iv-input-group>
  `,
})
export default class InputGroupButtonDemo {
  protected readonly show = signal(false);
}
