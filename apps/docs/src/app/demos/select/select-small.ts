import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { IV_SELECT_IMPORTS } from '@inlaylab/ivorie/select';

@Component({
  selector: 'demo-select-small',
  imports: [IV_SELECT_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-select [(value)]="fruit" size="sm" placeholder="Pick a fruit">
      <iv-select-trigger class="w-48" aria-label="Fruit" />
      <iv-select-content>
        <iv-select-item value="apple">Apple</iv-select-item>
        <iv-select-item value="banana">Banana</iv-select-item>
        <iv-select-item value="orange">Orange</iv-select-item>
      </iv-select-content>
    </iv-select>
  `,
})
export default class SelectSmallDemo {
  protected readonly fruit = signal<string | null>(null);
}
