import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { IV_COMBOBOX_IMPORTS } from '@inlaylab/ivorie/combobox';

@Component({
  selector: 'demo-combobox-no-trigger',
  imports: [IV_COMBOBOX_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-combobox [(value)]="fruit" placeholder="Type to search…" class="w-56">
      <iv-combobox-input [showTrigger]="false" [showClear]="true" aria-label="Fruit" />
      <iv-combobox-content>
        <iv-combobox-list>
          <iv-combobox-item value="apple" label="Apple">Apple</iv-combobox-item>
          <iv-combobox-item value="banana" label="Banana">Banana</iv-combobox-item>
          <iv-combobox-item value="orange" label="Orange">Orange</iv-combobox-item>
          <iv-combobox-empty>No fruit found.</iv-combobox-empty>
        </iv-combobox-list>
      </iv-combobox-content>
    </iv-combobox>
  `,
})
export default class ComboboxNoTriggerDemo {
  protected readonly fruit = signal<string | string[] | null>(null);
}
