import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IV_INPUT_IMPORTS } from '@ivorie/ui/input';

@Component({
  selector: 'demo-input-group-text',
  imports: [IV_INPUT_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-input-group class="w-full max-w-sm">
      <iv-input-group-addon>
        <iv-input-group-text>https://</iv-input-group-text>
      </iv-input-group-addon>
      <input ivInputGroupInput placeholder="example" aria-label="Domain" />
      <iv-input-group-addon align="inline-end">
        <iv-input-group-text>.app</iv-input-group-text>
      </iv-input-group-addon>
    </iv-input-group>
  `,
})
export default class InputGroupTextDemo {}
