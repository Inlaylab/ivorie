import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IvButton } from '@ivorie/ui/button';

@Component({
  selector: 'demo-button-sizes',
  imports: [IvButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-wrap items-center gap-2">
      <button ivButton size="xs">Extra small</button>
      <button ivButton size="sm">Small</button>
      <button ivButton>Default</button>
      <button ivButton size="lg">Large</button>
    </div>
  `,
})
export default class ButtonSizesDemo {}
