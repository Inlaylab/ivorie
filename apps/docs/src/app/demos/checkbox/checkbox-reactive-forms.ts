import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { IvCheckbox } from '@inlaylab/ivorie/checkbox';

@Component({
  selector: 'demo-checkbox-reactive-forms',
  imports: [ReactiveFormsModule, IvCheckbox],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form [formGroup]="form" class="flex flex-col items-center gap-3">
      <iv-checkbox formControlName="terms" aria-label="Accept terms" />
      <p class="text-muted-foreground text-sm">Value: {{ form.value.terms }}</p>
    </form>
  `,
})
export default class CheckboxReactiveFormsDemo {
  protected readonly form = new FormGroup({ terms: new FormControl(false) });
}
