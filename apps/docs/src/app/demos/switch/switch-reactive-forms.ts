import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { IvSwitch } from '@inlaylab/ivorie/switch';

@Component({
  selector: 'demo-switch-reactive-forms',
  imports: [ReactiveFormsModule, IvSwitch],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form [formGroup]="form" class="flex flex-col items-center gap-3">
      <label class="flex w-72 cursor-pointer items-center justify-between gap-4 text-sm">
        <span class="grid gap-0.5">
          <span class="font-medium">Dark mode</span>
          <span class="text-muted-foreground">Use a dark theme across the app.</span>
        </span>
        <iv-switch formControlName="darkMode" />
      </label>
      <p class="text-muted-foreground text-sm">Value: {{ form.value.darkMode }}</p>
    </form>
  `,
})
export default class SwitchReactiveFormsDemo {
  protected readonly form = new FormGroup({ darkMode: new FormControl(false) });
}
