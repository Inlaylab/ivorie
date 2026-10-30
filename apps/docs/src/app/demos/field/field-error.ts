import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IV_FIELD_IMPORTS } from '@inlaylab/ivorie/field';
import { IV_INPUT_IMPORTS } from '@inlaylab/ivorie/input';

@Component({
  selector: 'demo-field-error',
  imports: [IV_FIELD_IMPORTS, IV_INPUT_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-field [invalid]="true" class="w-full max-w-sm">
      <label ivLabel for="field-user">Username</label>
      <input ivInput id="field-user" aria-invalid="true" value="ab" />
      <iv-field-error message="Use at least 3 characters." />
    </iv-field>
  `,
})
export default class FieldErrorDemo {}
