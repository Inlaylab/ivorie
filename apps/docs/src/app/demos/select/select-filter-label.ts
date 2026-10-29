import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { IV_SELECT_IMPORTS } from '@ivorie/ui/select';

@Component({
  selector: 'demo-select-filter-label',
  imports: [IV_SELECT_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-select [(value)]="status" placeholder="All">
      <iv-select-trigger label="Status" resetValue="all" class="w-52" aria-label="Status filter" />
      <iv-select-content>
        <iv-select-item value="all">All</iv-select-item>
        <iv-select-item value="active">Active</iv-select-item>
        <iv-select-item value="archived">Archived</iv-select-item>
      </iv-select-content>
    </iv-select>
  `,
})
export default class SelectFilterLabelDemo {
  protected readonly status = signal<string | null>('active');
}
