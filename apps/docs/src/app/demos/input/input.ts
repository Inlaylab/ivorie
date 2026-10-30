import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IV_INPUT_IMPORTS } from '@inlaylab/ivorie/input';

@Component({
  selector: 'demo-input',
  imports: [IV_INPUT_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="grid w-full max-w-sm gap-2">
      <label ivLabel for="input-email">Email</label>
      <input ivInput id="input-email" type="email" placeholder="you@example.com" />
    </div>
  `,
})
export default class InputDemo {}
