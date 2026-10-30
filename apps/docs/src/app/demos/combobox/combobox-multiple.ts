import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { IV_COMBOBOX_IMPORTS } from '@ivorie/ui/combobox';

@Component({
  selector: 'demo-combobox-multiple',
  imports: [IV_COMBOBOX_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-combobox [(value)]="selected" [multiple]="true" class="w-64">
      <iv-combobox-chips aria-label="Fruits">
        @for (v of selected(); track v) {
          <iv-combobox-chip [value]="v" [label]="labelFor(v)" />
        }
      </iv-combobox-chips>
      <iv-combobox-content>
        <iv-combobox-list>
          @for (f of fruits; track f.value) {
            <iv-combobox-item [value]="f.value" [label]="f.label">{{ f.label }}</iv-combobox-item>
          }
          <iv-combobox-empty>No fruit found.</iv-combobox-empty>
        </iv-combobox-list>
      </iv-combobox-content>
    </iv-combobox>
  `,
})
export default class ComboboxMultipleDemo {
  protected readonly fruits = [
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
    { value: 'orange', label: 'Orange' },
  ];
  protected readonly selected = signal<string[]>(['apple']);

  protected labelFor(value: string) {
    return this.fruits.find((f) => f.value === value)?.label ?? value;
  }
}
