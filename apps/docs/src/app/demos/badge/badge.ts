import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IvBadge } from '@inlaylab/ivorie/badge';

@Component({
  selector: 'demo-badge',
  imports: [IvBadge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-badge>New</iv-badge>
  `,
})
export default class BadgeDemo {}
