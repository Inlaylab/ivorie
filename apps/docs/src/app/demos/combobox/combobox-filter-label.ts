import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { IV_COMBOBOX_IMPORTS } from '@inlaylab/ivorie/combobox';

@Component({
  selector: 'demo-combobox-filter-label',
  imports: [IV_COMBOBOX_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-combobox [(value)]="user" placeholder="All" class="w-64">
      <iv-combobox-input label="User" aria-label="User filter" />
      <iv-combobox-content>
        <iv-combobox-list>
          <iv-combobox-item value="ada" label="Ada">Ada</iv-combobox-item>
          <iv-combobox-item value="grace" label="Grace">Grace</iv-combobox-item>
          <iv-combobox-item value="linus" label="Linus">Linus</iv-combobox-item>
          <iv-combobox-empty>No user found.</iv-combobox-empty>
        </iv-combobox-list>
      </iv-combobox-content>
    </iv-combobox>
  `,
})
export default class ComboboxFilterLabelDemo {
  protected readonly user = signal<string | string[] | null>('grace');
}
