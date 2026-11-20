import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IvDelta } from '@inlaylab/ivorie/delta';

@Component({
  selector: 'demo-delta-invert',
  imports: [IvDelta],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <dl class="grid gap-3 text-sm">
      <div class="flex items-center gap-3"><dt class="text-muted-foreground w-28">Response time</dt><dd class="flex items-center gap-2">182 ms <iv-delta [value]="-8.4" invert /></dd></div>
      <div class="flex items-center gap-3"><dt class="text-muted-foreground w-28">Error rate</dt><dd class="flex items-center gap-2">0.9% <iv-delta [value]="0.3" invert /></dd></div>
    </dl>
  `,
})
export default class DeltaInvertDemo {}
