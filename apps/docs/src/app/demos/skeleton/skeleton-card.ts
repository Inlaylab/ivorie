import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IvSkeleton } from '@inlaylab/ivorie/skeleton';

@Component({
  selector: 'demo-skeleton-card',
  imports: [IvSkeleton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center gap-4" aria-busy="true">
      <iv-skeleton class="size-12 rounded-full" />
      <div class="space-y-2">
        <iv-skeleton class="h-4 w-48" />
        <iv-skeleton class="h-4 w-32" />
      </div>
    </div>
  `,
})
export default class SkeletonCardDemo {}
