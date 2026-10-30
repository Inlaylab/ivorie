import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IV_FIELD_IMPORTS } from '@inlaylab/ivorie/field';
import { IV_INPUT_IMPORTS } from '@inlaylab/ivorie/input';
import { IvButton } from '@inlaylab/ivorie/button';

@Component({
  selector: 'demo-field',
  imports: [IV_FIELD_IMPORTS, IV_INPUT_IMPORTS, IvButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <fieldset ivFieldSet class="w-full max-w-sm">
      <legend ivFieldLegend>Create account</legend>
      <iv-field-group>
        <iv-field>
          <label ivLabel for="signup-name">Full name</label>
          <input ivInput id="signup-name" />
          <p ivFieldDescription>As it appears on your profile.</p>
        </iv-field>
        <iv-field>
          <label ivLabel for="signup-email">Email</label>
          <input ivInput id="signup-email" type="email" />
          <p ivFieldDescription>We'll send a confirmation link.</p>
        </iv-field>
        <iv-field [invalid]="true">
          <label ivLabel for="signup-password">Password</label>
          <input ivInput id="signup-password" type="password" aria-invalid="true" value="abc" />
          <iv-field-error message="Must be at least 8 characters." />
        </iv-field>
        <iv-field orientation="horizontal">
          <input type="checkbox" id="signup-updates" class="mt-1 size-4" checked />
          <iv-field-content>
            <iv-field-title>
              <label for="signup-updates">Email me about product updates</label>
            </iv-field-title>
            <p ivFieldDescription>Occasional, no spam.</p>
          </iv-field-content>
        </iv-field>
      </iv-field-group>
      <button ivButton class="w-full">Create account</button>
    </fieldset>
  `,
})
export default class FieldDemo {}
