import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { IvCheckbox } from '@inlaylab/ivorie/checkbox';

@Component({
  selector: 'demo-checkbox-with-label',
  imports: [IvCheckbox],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <label class="flex cursor-pointer items-center gap-2 text-sm">
      <iv-checkbox [(checked)]="remember" />
      Remember me
    </label>
  `,
})
export default class CheckboxWithLabelDemo {
  protected readonly remember = signal(true);
}
