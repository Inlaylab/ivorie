import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IvSpinner } from '@inlaylab/ivorie/spinner';
import { IvButton } from '@inlaylab/ivorie/button';

@Component({
  selector: 'demo-spinner-button',
  imports: [IvSpinner, IvButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button ivButton disabled>
      <iv-spinner label="Saving" />
      Saving
    </button>
  `,
})
export default class SpinnerButtonDemo {}
