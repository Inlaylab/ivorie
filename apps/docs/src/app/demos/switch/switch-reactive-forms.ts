import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { IvSwitch } from '@inlaylab/ivorie/switch';

@Component({
  selector: 'demo-switch-reactive-forms',
  imports: [ReactiveFormsModule, IvSwitch],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form [formGroup]="form" class="flex flex-col items-center gap-3">
      <iv-switch formControlName="darkMode" aria-label="Dark mode" />
      <p class="text-muted-foreground text-sm">Value: {{ form.value.darkMode }}</p>
    </form>
  `,
})
export default class SwitchReactiveFormsDemo {
  protected readonly form = new FormGroup({ darkMode: new FormControl(false) });
}
