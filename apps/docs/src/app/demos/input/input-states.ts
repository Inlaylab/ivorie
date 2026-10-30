import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IV_INPUT_IMPORTS } from '@ivorie/ui/input';

@Component({
  selector: 'demo-input-states',
  imports: [IV_INPUT_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="grid w-full max-w-sm gap-3">
      <input ivInput placeholder="Disabled" disabled aria-label="Disabled" />
      <input ivInput placeholder="Invalid" aria-invalid="true" aria-label="Invalid" />
    </div>
  `,
})
export default class InputStatesDemo {}
