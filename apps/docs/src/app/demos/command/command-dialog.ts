import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { IvButton } from '@inlaylab/ivorie/button';
import { IV_COMMAND_IMPORTS } from '@inlaylab/ivorie/command';
import { IV_DIALOG_IMPORTS } from '@inlaylab/ivorie/dialog';

@Component({
  selector: 'demo-command-dialog',
  imports: [IV_COMMAND_IMPORTS, IV_DIALOG_IMPORTS, IvButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col items-center gap-2">
      <button ivButton variant="outline" [ivDialogTrigger]="palette" [ivDialogConfig]="{ ariaLabel: 'Command palette', showCloseButton: false }">
        Open command palette
      </button>
      <p class="text-muted-foreground text-sm">Last pick: {{ picked() || 'none' }}</p>
    </div>
    <ng-template #palette let-ref>
      <iv-command>
        <iv-command-input placeholder="Search actions..." />
        <iv-command-list>
          <iv-command-empty>No results found.</iv-command-empty>
          @for (action of actions; track action) {
            <iv-command-item (select)="picked.set($event); ref.close($event)">{{ action }}</iv-command-item>
          }
        </iv-command-list>
      </iv-command>
    </ng-template>
  `,
})
export default class CommandDialogDemo {
  readonly actions = ['New file', 'Open recent', 'Toggle sidebar', 'Sign out'];
  readonly picked = signal('');
}
