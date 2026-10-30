import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IvSkeleton } from '@ivorie/ui/skeleton';

@Component({
  selector: 'demo-skeleton',
  imports: [IvSkeleton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full max-w-sm space-y-2" aria-busy="true">
      <iv-skeleton class="h-4 w-3/4" />
      <iv-skeleton class="h-4 w-1/2" />
    </div>
  `,
})
export default class SkeletonDemo {}
