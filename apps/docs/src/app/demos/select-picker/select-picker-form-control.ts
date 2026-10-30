import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { IV_SELECT_PICKER_IMPORTS } from '@inlaylab/ivorie/extras/select-picker';

@Component({
  selector: 'demo-select-picker-form-control',
  imports: [ReactiveFormsModule, IV_SELECT_PICKER_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex w-72 flex-col gap-2">
      <iv-select-picker [items]="roles" [formControl]="roles$" placeholder="Select roles" ariaLabel="Roles" />
      <p class="text-sm text-muted-foreground">Value: {{ roles$.value.join(', ') || 'none' }}</p>
    </div>
  `,
})
export default class SelectPickerFormControlDemo {
  readonly roles = ['Admin', 'Editor', 'Viewer', 'Billing'];
  readonly roles$ = new FormControl<string[]>(['Editor'], { nonNullable: true });
}
