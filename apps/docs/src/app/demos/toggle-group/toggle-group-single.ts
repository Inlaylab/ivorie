import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { IV_TOGGLE_GROUP_IMPORTS, ToggleGroupValue } from '@inlaylab/ivorie/toggle-group';

@Component({
  selector: 'demo-toggle-group-single',
  imports: [IV_TOGGLE_GROUP_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col items-center gap-3">
      <iv-toggle-group type="single" variant="outline" [spacing]="0" aria-label="View" [(value)]="view">
        <button ivToggleGroupItem value="list">List</button>
        <button ivToggleGroupItem value="grid">Grid</button>
        <button ivToggleGroupItem value="board">Board</button>
      </iv-toggle-group>
      <p class="text-muted-foreground text-sm">Value: {{ view() ?? 'none' }}</p>
    </div>
  `,
})
export default class ToggleGroupSingleDemo {
  protected readonly view = signal<ToggleGroupValue>('grid');
}
