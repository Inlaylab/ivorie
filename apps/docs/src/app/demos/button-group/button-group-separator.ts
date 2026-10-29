import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IV_BUTTON_GROUP_IMPORTS } from '@ivorie/ui/button-group';
import { IvButton } from '@ivorie/ui/button';

@Component({
  selector: 'demo-button-group-separator',
  imports: [IV_BUTTON_GROUP_IMPORTS, IvButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-button-group>
      <button ivButton variant="secondary">Cut</button>
      <iv-button-group-separator />
      <button ivButton variant="secondary">Copy</button>
      <iv-button-group-separator />
      <button ivButton variant="secondary">Paste</button>
    </iv-button-group>
  `,
})
export default class ButtonGroupSeparatorDemo {}
