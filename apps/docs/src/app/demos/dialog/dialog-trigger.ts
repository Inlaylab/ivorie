import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { IvButton } from '@ivorie/ui/button';
import { DialogCloseEvent, IV_DIALOG_IMPORTS } from '@ivorie/ui/dialog';

@Component({
  selector: 'demo-dialog-trigger',
  imports: [IV_DIALOG_IMPORTS, IvButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col items-center gap-2">
      <button ivButton variant="outline" [ivDialogTrigger]="tpl" (closed)="reason.set($event.reason)">
        Open dialog
      </button>
      @if (reason()) {
        <p class="text-sm text-muted-foreground">Closed: {{ reason() }}</p>
      }
    </div>

    <ng-template #tpl>
      <iv-dialog-header>
        <iv-dialog-title>Hello</iv-dialog-title>
        <iv-dialog-description>Opened with the trigger directive. No handler code.</iv-dialog-description>
      </iv-dialog-header>
      <iv-dialog-footer>
        <button ivButton ivDialogClose>Close</button>
      </iv-dialog-footer>
    </ng-template>
  `,
})
export default class DialogTriggerDemo {
  protected readonly reason = signal<DialogCloseEvent['reason'] | ''>('');
}
