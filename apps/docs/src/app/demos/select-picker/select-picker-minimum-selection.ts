import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IV_SELECT_PICKER_IMPORTS } from '@ivorie/ui/extras/select-picker';

@Component({
  selector: 'demo-select-picker-minimum-selection',
  imports: [FormsModule, IV_SELECT_PICKER_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex w-72 flex-col gap-2">
      <iv-select-picker
        [items]="channels"
        [(ngModel)]="selected"
        [minSelection]="1"
        placeholder="Select channels"
        dialogDescription="Pick at least one channel."
      />
      <p class="text-sm text-muted-foreground">Save stays disabled until one is checked.</p>
    </div>
  `,
})
export default class SelectPickerMinimumSelectionDemo {
  readonly channels = ['Email', 'SMS', 'Push', 'Slack'];
  readonly selected = signal<string[]>(['Email']);
}
