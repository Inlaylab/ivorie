import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IV_FIELD_IMPORTS } from '@inlaylab/ivorie/field';
import { IV_INPUT_IMPORTS } from '@inlaylab/ivorie/input';
import { IvButton } from '@inlaylab/ivorie/button';

@Component({
  selector: 'demo-field-separator',
  imports: [IV_FIELD_IMPORTS, IV_INPUT_IMPORTS, IvButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-field-group class="w-full max-w-sm">
      <iv-field>
        <label ivLabel for="field-sep-email">Email</label>
        <input ivInput id="field-sep-email" type="email" />
      </iv-field>
      <iv-field-separator>Or continue with</iv-field-separator>
      <button ivButton variant="outline">GitHub</button>
    </iv-field-group>
  `,
})
export default class FieldSeparatorDemo {}
