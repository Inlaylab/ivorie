import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IvButton } from '@ivorie/ui/button';

@Component({
  selector: 'demo-button-variants',
  imports: [IvButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-wrap gap-2">
      <button ivButton>Default</button>
      <button ivButton variant="outline">Outline</button>
      <button ivButton variant="secondary">Secondary</button>
      <button ivButton variant="ghost">Ghost</button>
      <button ivButton variant="destructive">Destructive</button>
      <button ivButton variant="link">Link</button>
    </div>
  `,
})
export default class ButtonVariantsDemo {}
