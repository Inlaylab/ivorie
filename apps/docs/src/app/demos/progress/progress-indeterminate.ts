import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IvProgress } from '@ivorie/ui/progress';

@Component({
  selector: 'demo-progress-indeterminate',
  imports: [IvProgress],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-progress class="w-full max-w-sm" [value]="null" aria-label="Loading" />
  `,
})
export default class ProgressIndeterminateDemo {}
