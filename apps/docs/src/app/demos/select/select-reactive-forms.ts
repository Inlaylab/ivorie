import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { IV_SELECT_IMPORTS } from '@inlaylab/ivorie/select';

@Component({
  selector: 'demo-select-reactive-forms',
  imports: [ReactiveFormsModule, IV_SELECT_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form [formGroup]="form" class="flex flex-col items-center gap-3">
      <iv-select formControlName="fruit" placeholder="Pick a fruit">
        <iv-select-trigger class="w-48" aria-label="Fruit" />
        <iv-select-content>
          <iv-select-item value="apple">Apple</iv-select-item>
          <iv-select-item value="banana">Banana</iv-select-item>
          <iv-select-item value="orange">Orange</iv-select-item>
        </iv-select-content>
      </iv-select>
      <p class="text-muted-foreground text-sm">Value: {{ form.value.fruit }}</p>
    </form>
  `,
})
export default class SelectReactiveFormsDemo {
  protected readonly form = new FormGroup({ fruit: new FormControl<string | null>('apple') });
}
