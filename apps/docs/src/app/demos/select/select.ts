import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { IV_SELECT_IMPORTS } from '@inlaylab/ivorie/select';

@Component({
  selector: 'demo-select',
  imports: [IV_SELECT_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col items-center gap-3">
      <iv-select [(value)]="fruit" placeholder="Pick a fruit">
        <iv-select-trigger class="w-48" aria-label="Fruit" />
        <iv-select-content>
          <iv-select-item value="apple">Apple</iv-select-item>
          <iv-select-item value="banana">Banana</iv-select-item>
          <iv-select-item value="orange">Orange</iv-select-item>
        </iv-select-content>
      </iv-select>
      <p class="text-muted-foreground text-sm">Value: {{ fruit() }}</p>
    </div>
  `,
})
export default class SelectDemo {
  protected readonly fruit = signal<string | null>(null);
}
