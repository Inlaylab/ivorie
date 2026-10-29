import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IvButton } from '@ivorie/ui/button';

@Component({
  selector: 'demo-button-link',
  imports: [IvButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a ivButton variant="outline" href="https://angular.dev">Angular docs</a>
  `,
})
export default class ButtonLinkDemo {}
