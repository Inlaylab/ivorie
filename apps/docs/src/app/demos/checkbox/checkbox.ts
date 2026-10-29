import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { IvCheckbox } from '@ivorie/ui/checkbox';

@Component({
  selector: 'demo-checkbox',
  imports: [IvCheckbox],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col items-center gap-3">
      <iv-checkbox [(checked)]="agreed" aria-label="Accept terms" />
      <p class="text-muted-foreground text-sm">Checked: {{ agreed() }}</p>
    </div>
  `,
})
export default class CheckboxDemo {
  protected readonly agreed = signal(false);
}
