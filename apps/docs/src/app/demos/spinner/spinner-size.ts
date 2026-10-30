import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IvSpinner } from '@inlaylab/ivorie/spinner';

@Component({
  selector: 'demo-spinner-size',
  imports: [IvSpinner],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center gap-4">
      <iv-spinner [size]="16" />
      <iv-spinner [size]="24" class="text-primary" />
      <iv-spinner [size]="32" class="text-muted-foreground" label="Saving" />
    </div>
  `,
})
export default class SpinnerSizeDemo {}
