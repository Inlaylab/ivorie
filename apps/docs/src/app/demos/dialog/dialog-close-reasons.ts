import { ChangeDetectionStrategy, Component, TemplateRef, inject, signal, viewChild } from '@angular/core';
import { IvButton } from '@ivorie/ui/button';
import { DialogCloseEvent, IV_DIALOG_IMPORTS, IvDialog } from '@ivorie/ui/dialog';

@Component({
  selector: 'demo-dialog-close-reasons',
  imports: [IV_DIALOG_IMPORTS, IvButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col items-center gap-2">
      <button ivButton variant="outline" (click)="open()">Open dialog</button>
      <p class="text-sm text-muted-foreground">Last close: {{ last()?.reason ?? 'none' }}</p>
    </div>

    <ng-template #tpl>
      <iv-dialog-header>
        <iv-dialog-title>How will you close this?</iv-dialog-title>
        <iv-dialog-description>
          Click outside, press Escape, use the corner button, or pick an action.
        </iv-dialog-description>
      </iv-dialog-header>
      <iv-dialog-footer>
        <button ivButton variant="outline" ivDialogClose>Cancel</button>
        <button ivButton [ivDialogClose]="'ok'" reason="programmatic">Confirm</button>
      </iv-dialog-footer>
    </ng-template>
  `,
})
export default class DialogCloseReasonsDemo {
  private readonly dialog = inject(IvDialog);
  private readonly tpl = viewChild.required<TemplateRef<unknown>>('tpl');
  protected readonly last = signal<DialogCloseEvent | null>(null);

  open() {
    this.dialog
      .open(this.tpl())
      .afterClosed()
      .subscribe((event) => this.last.set(event));
  }
}
