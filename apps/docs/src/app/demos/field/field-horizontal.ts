import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IV_FIELD_IMPORTS } from '@inlaylab/ivorie/field';
import { IV_INPUT_IMPORTS } from '@inlaylab/ivorie/input';

@Component({
  selector: 'demo-field-horizontal',
  imports: [IV_FIELD_IMPORTS, IV_INPUT_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-field orientation="horizontal" class="w-full max-w-sm">
      <input type="checkbox" id="field-news" class="mt-1 size-4" />
      <iv-field-content>
        <iv-field-title>
          <label for="field-news">Marketing emails</label>
        </iv-field-title>
        <p ivFieldDescription>Once a month, at most.</p>
      </iv-field-content>
    </iv-field>
  `,
})
export default class FieldHorizontalDemo {}
