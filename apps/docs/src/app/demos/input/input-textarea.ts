import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IV_INPUT_IMPORTS } from '@ivorie/ui/input';

@Component({
  selector: 'demo-input-textarea',
  imports: [IV_INPUT_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="grid w-full max-w-sm gap-2">
      <label ivLabel for="input-bio">Bio</label>
      <textarea ivTextarea id="input-bio" rows="4" placeholder="Tell us about yourself"></textarea>
    </div>
  `,
})
export default class InputTextareaDemo {}
