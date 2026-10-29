import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IV_SELECT_PICKER_IMPORTS } from '@ivorie/ui/extras/select-picker';

@Component({
  selector: 'demo-select-picker',
  imports: [FormsModule, IV_SELECT_PICKER_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-72">
      <iv-select-picker
        [items]="fruits"
        [(ngModel)]="selected"
        placeholder="Select fruits"
        dialogTitle="Select fruits"
        searchPlaceholder="Search fruits"
        valueColumnHeader="Fruit"
      />
    </div>
  `,
})
export default class SelectPickerDemo {
  readonly fruits = ['Apple', 'Banana', 'Cherry', 'Grape', 'Mango', 'Orange'];
  readonly selected = signal<string[]>(['Apple', 'Mango']);
}
