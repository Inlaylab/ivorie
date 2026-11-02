import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IV_TOGGLE_GROUP_IMPORTS } from '@inlaylab/ivorie/toggle-group';
import { LucideBold, LucideItalic, LucideUnderline } from '@lucide/angular';

@Component({
  selector: 'demo-toggle-group',
  imports: [IV_TOGGLE_GROUP_IMPORTS, LucideBold, LucideItalic, LucideUnderline],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-toggle-group type="multiple" aria-label="Text format">
      <button ivToggleGroupItem value="bold" aria-label="Bold"><svg lucideBold aria-hidden="true"></svg></button>
      <button ivToggleGroupItem value="italic" aria-label="Italic"><svg lucideItalic aria-hidden="true"></svg></button>
      <button ivToggleGroupItem value="underline" aria-label="Underline"><svg lucideUnderline aria-hidden="true"></svg></button>
    </iv-toggle-group>
  `,
})
export default class ToggleGroupDemo {}
