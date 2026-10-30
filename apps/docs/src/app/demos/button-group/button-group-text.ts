import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IV_BUTTON_GROUP_IMPORTS } from '@inlaylab/ivorie/button-group';
import { IvButton } from '@inlaylab/ivorie/button';

@Component({
  selector: 'demo-button-group-text',
  imports: [IV_BUTTON_GROUP_IMPORTS, IvButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-button-group>
      <iv-button-group-text>Page</iv-button-group-text>
      <button ivButton variant="outline">1</button>
      <button ivButton variant="outline">2</button>
      <button ivButton variant="outline">3</button>
    </iv-button-group>
  `,
})
export default class ButtonGroupTextDemo {}
