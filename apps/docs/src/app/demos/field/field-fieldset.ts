import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IV_FIELD_IMPORTS } from '@ivorie/ui/field';
import { IV_INPUT_IMPORTS } from '@ivorie/ui/input';

@Component({
  selector: 'demo-field-fieldset',
  imports: [IV_FIELD_IMPORTS, IV_INPUT_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <fieldset ivFieldSet class="w-full max-w-sm">
      <legend ivFieldLegend>Address</legend>
      <iv-field-group>
        <iv-field>
          <label ivLabel for="field-street">Street</label>
          <input ivInput id="field-street" />
        </iv-field>
        <iv-field>
          <label ivLabel for="field-city">City</label>
          <input ivInput id="field-city" />
        </iv-field>
      </iv-field-group>
    </fieldset>
  `,
})
export default class FieldFieldsetDemo {}
