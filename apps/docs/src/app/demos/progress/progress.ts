import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IvProgress } from '@ivorie/ui/progress';

@Component({
  selector: 'demo-progress',
  imports: [IvProgress],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-progress class="w-full max-w-sm" [value]="60" aria-label="Upload progress" />
  `,
})
export default class ProgressDemo {}
