import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IvBadge } from '@ivorie/ui/badge';

@Component({
  selector: 'demo-badge',
  imports: [IvBadge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-badge>New</iv-badge>
  `,
})
export default class BadgeDemo {}
