import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IvCheckbox } from '@ivorie/ui/checkbox';

@Component({
  selector: 'demo-checkbox-ngmodel',
  imports: [FormsModule, IvCheckbox],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col items-center gap-3">
      <iv-checkbox [(ngModel)]="agreed" aria-label="Accept terms" />
      <p class="text-muted-foreground text-sm">Value: {{ agreed() }}</p>
    </div>
  `,
})
export default class CheckboxNgmodelDemo {
  protected readonly agreed = signal(false);
}
