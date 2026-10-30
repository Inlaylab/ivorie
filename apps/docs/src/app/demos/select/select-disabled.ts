import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IV_SELECT_IMPORTS } from '@inlaylab/ivorie/select';

@Component({
  selector: 'demo-select-disabled',
  imports: [IV_SELECT_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-select value="apple" [disabled]="true">
      <iv-select-trigger class="w-48" aria-label="Fruit" />
      <iv-select-content>
        <iv-select-item value="apple">Apple</iv-select-item>
        <iv-select-item value="banana">Banana</iv-select-item>
      </iv-select-content>
    </iv-select>
  `,
})
export default class SelectDisabledDemo {}
