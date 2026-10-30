import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IV_BUTTON_GROUP_IMPORTS } from '@inlaylab/ivorie/button-group';
import { IvButton } from '@inlaylab/ivorie/button';

@Component({
  selector: 'demo-button-group-vertical',
  imports: [IV_BUTTON_GROUP_IMPORTS, IvButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-button-group orientation="vertical" aria-label="Alignment">
      <button ivButton variant="outline">Top</button>
      <button ivButton variant="outline">Middle</button>
      <button ivButton variant="outline">Bottom</button>
    </iv-button-group>
  `,
})
export default class ButtonGroupVerticalDemo {}
