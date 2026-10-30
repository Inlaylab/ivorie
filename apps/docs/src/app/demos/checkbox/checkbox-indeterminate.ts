import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { IvCheckbox } from '@inlaylab/ivorie/checkbox';

@Component({
  selector: 'demo-checkbox-indeterminate',
  imports: [IvCheckbox],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col gap-2 text-sm">
      <label class="flex cursor-pointer items-center gap-2 font-medium">
        <iv-checkbox [checked]="all()" [indeterminate]="some()" (checkedChange)="toggleAll($event)" />
        Select all
      </label>
      @for (item of items; track item) {
        <label class="flex cursor-pointer items-center gap-2 pl-6">
          <iv-checkbox [checked]="selected().includes(item)" (checkedChange)="toggle(item)" />
          {{ item }}
        </label>
      }
    </div>
  `,
})
export default class CheckboxIndeterminateDemo {
  protected readonly items = ['Email', 'SMS', 'Push'];
  protected readonly selected = signal<string[]>(['Email']);
  protected readonly all = computed(() => this.selected().length === this.items.length);
  protected readonly some = computed(() => this.selected().length > 0 && !this.all());

  protected toggleAll(checked: boolean) {
    this.selected.set(checked ? [...this.items] : []);
  }

  protected toggle(item: string) {
    this.selected.update((s) => (s.includes(item) ? s.filter((i) => i !== item) : [...s, item]));
  }
}
