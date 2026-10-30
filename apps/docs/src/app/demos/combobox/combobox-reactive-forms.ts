import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { IV_COMBOBOX_IMPORTS } from '@ivorie/ui/combobox';

@Component({
  selector: 'demo-combobox-reactive-forms',
  imports: [ReactiveFormsModule, IV_COMBOBOX_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form [formGroup]="form" class="flex flex-col items-center gap-3">
      <iv-combobox formControlName="country" placeholder="Search country…" class="w-56">
        <iv-combobox-input aria-label="Country" />
        <iv-combobox-content>
          <iv-combobox-list>
            @for (c of countries; track c.value) {
              <iv-combobox-item [value]="c.value" [label]="c.label">{{ c.label }}</iv-combobox-item>
            }
            <iv-combobox-empty>No country found.</iv-combobox-empty>
          </iv-combobox-list>
        </iv-combobox-content>
      </iv-combobox>
      <p class="text-muted-foreground text-sm">Value: {{ form.value.country }}</p>
    </form>
  `,
})
export default class ComboboxReactiveFormsDemo {
  protected readonly countries = [
    { value: 'fr', label: 'France' },
    { value: 'de', label: 'Germany' },
    { value: 'jp', label: 'Japan' },
  ];
  protected readonly form = new FormGroup({ country: new FormControl<string | null>('de') });
}
