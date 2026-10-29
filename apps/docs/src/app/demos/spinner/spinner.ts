import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IvSpinner } from '@ivorie/ui/spinner';

@Component({
  selector: 'demo-spinner',
  imports: [IvSpinner],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-spinner />
  `,
})
export default class SpinnerDemo {}
