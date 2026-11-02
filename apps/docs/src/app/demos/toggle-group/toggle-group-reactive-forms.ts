import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { IV_TOGGLE_GROUP_IMPORTS, ToggleGroupValue } from '@inlaylab/ivorie/toggle-group';

@Component({
  selector: 'demo-toggle-group-reactive-forms',
  imports: [IV_TOGGLE_GROUP_IMPORTS, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col items-center gap-3">
      <iv-toggle-group type="multiple" size="sm" aria-label="Days" [formControl]="days">
        @for (d of week; track d) {
          <button ivToggleGroupItem [value]="d">{{ d }}</button>
        }
      </iv-toggle-group>
      <p class="text-muted-foreground text-sm">Value: {{ days.value }}</p>
    </div>
  `,
})
export default class ToggleGroupReactiveFormsDemo {
  protected readonly week = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  protected readonly days = new FormControl<ToggleGroupValue>(['Mon', 'Wed']);
}
