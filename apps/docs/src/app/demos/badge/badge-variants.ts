import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IvBadge } from '@inlaylab/ivorie/badge';

@Component({
  selector: 'demo-badge-variants',
  imports: [IvBadge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-wrap gap-2">
      <iv-badge>Default</iv-badge>
      <iv-badge variant="secondary">Secondary</iv-badge>
      <iv-badge variant="destructive">Failed</iv-badge>
      <iv-badge variant="outline">Outline</iv-badge>
      <iv-badge variant="ghost">Ghost</iv-badge>
      <iv-badge variant="link">Link</iv-badge>
    </div>
  `,
})
export default class BadgeVariantsDemo {}
