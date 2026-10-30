import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IvButton } from '@ivorie/ui/button';
import { IV_DIALOG_IMPORTS, IvDialog, IvDialogRef } from '@ivorie/ui/dialog';
import { IvInput } from '@ivorie/ui/input';

@Component({
  imports: [IV_DIALOG_IMPORTS, ReactiveFormsModule, IvButton, IvInput],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form [formGroup]="form" (ngSubmit)="save()" class="contents">
      <iv-dialog-header>
        <iv-dialog-title>Invite member</iv-dialog-title>
        <iv-dialog-description>They get an email with a link to join.</iv-dialog-description>
      </iv-dialog-header>
      <iv-dialog-body>
        <input ivInput type="email" formControlName="email" placeholder="Email" aria-label="Email" />
      </iv-dialog-body>
      <iv-dialog-footer>
        <button ivButton type="button" variant="outline" ivDialogClose>Cancel</button>
        <button ivButton type="submit" [disabled]="form.invalid">Invite</button>
      </iv-dialog-footer>
    </form>
  `,
})
class InviteDialog {
  private readonly ref = inject<IvDialogRef<InviteDialog, string>>(IvDialogRef);
  protected readonly form = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
  });

  save() {
    if (this.form.valid) this.ref.close(this.form.controls.email.value);
  }
}

@Component({
  selector: 'demo-dialog-form',
  imports: [IvButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col items-center gap-2">
      <button ivButton variant="outline" (click)="open()">Invite member</button>
      @if (invited()) {
        <p class="text-sm text-muted-foreground">Invited {{ invited() }}</p>
      }
    </div>
  `,
})
export default class DialogFormDemo {
  private readonly dialog = inject(IvDialog);
  protected readonly invited = signal('');

  open() {
    this.dialog
      .open<InviteDialog, string>(InviteDialog)
      .afterClosed()
      .subscribe(({ result }) => {
        if (result) this.invited.set(result);
      });
  }
}
