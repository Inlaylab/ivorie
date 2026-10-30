import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IvButton } from '@inlaylab/ivorie/button';

@Component({
  selector: 'demo-button',
  imports: [IvButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button ivButton>Button</button>
  `,
})
export default class ButtonDemo {}
