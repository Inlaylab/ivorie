import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IV_INPUT_IMPORTS } from '@ivorie/ui/input';
import { LucideSearch } from '@lucide/angular';

@Component({
  selector: 'demo-input-group-icon',
  imports: [IV_INPUT_IMPORTS, LucideSearch],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-input-group class="w-full max-w-sm">
      <iv-input-group-addon>
        <svg lucideSearch></svg>
      </iv-input-group-addon>
      <input ivInputGroupInput placeholder="Search users" aria-label="Search users" />
    </iv-input-group>
  `,
})
export default class InputGroupIconDemo {}
