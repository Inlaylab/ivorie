import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IV_BUTTON_GROUP_IMPORTS } from '@inlaylab/ivorie/button-group';
import { IvButton } from '@inlaylab/ivorie/button';

@Component({
  selector: 'demo-button-group-nested',
  imports: [IV_BUTTON_GROUP_IMPORTS, IvButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-button-group>
      <iv-button-group>
        <button ivButton variant="outline">B</button>
        <button ivButton variant="outline">I</button>
      </iv-button-group>
      <button ivButton variant="outline">Clear</button>
    </iv-button-group>
  `,
})
export default class ButtonGroupNestedDemo {}
