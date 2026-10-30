import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IV_BUTTON_GROUP_IMPORTS } from '@inlaylab/ivorie/button-group';
import { IvButton } from '@inlaylab/ivorie/button';

@Component({
  selector: 'demo-button-group',
  imports: [IV_BUTTON_GROUP_IMPORTS, IvButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-button-group aria-label="Text style">
      <button ivButton variant="outline">Bold</button>
      <button ivButton variant="outline">Italic</button>
      <button ivButton variant="outline">Underline</button>
    </iv-button-group>
  `,
})
export default class ButtonGroupDemo {}
