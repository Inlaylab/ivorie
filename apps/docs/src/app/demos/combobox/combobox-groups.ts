import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { IV_COMBOBOX_IMPORTS } from '@ivorie/ui/combobox';

@Component({
  selector: 'demo-combobox-groups',
  imports: [IV_COMBOBOX_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-combobox [(value)]="selected" placeholder="Search…" class="w-56">
      <iv-combobox-input aria-label="Produce" />
      <iv-combobox-content>
        <iv-combobox-list>
          <iv-combobox-group>
            <iv-combobox-label>Fruits</iv-combobox-label>
            <iv-combobox-item value="apple" label="Apple">Apple</iv-combobox-item>
            <iv-combobox-item value="pear" label="Pear">Pear</iv-combobox-item>
          </iv-combobox-group>
          <iv-combobox-separator />
          <iv-combobox-group>
            <iv-combobox-label>Vegetables</iv-combobox-label>
            <iv-combobox-item value="carrot" label="Carrot">Carrot</iv-combobox-item>
            <iv-combobox-item value="leek" label="Leek">Leek</iv-combobox-item>
          </iv-combobox-group>
          <iv-combobox-empty>Nothing found.</iv-combobox-empty>
        </iv-combobox-list>
      </iv-combobox-content>
    </iv-combobox>
  `,
})
export default class ComboboxGroupsDemo {
  protected readonly selected = signal<string | string[] | null>(null);
}
