import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IV_FIELD_IMPORTS } from '@ivorie/ui/field';
import { IV_INPUT_IMPORTS } from '@ivorie/ui/input';

@Component({
  selector: 'demo-field',
  imports: [IV_FIELD_IMPORTS, IV_INPUT_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-field class="w-full max-w-sm">
      <label ivLabel for="field-email">Email</label>
      <input ivInput id="field-email" type="email" />
      <p ivFieldDescription>We never share this address.</p>
    </iv-field>
  `,
})
export default class FieldDemo {}
