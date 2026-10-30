import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { IvButton } from '@inlaylab/ivorie/button';
import { IV_DIALOG_DATA, IV_DIALOG_IMPORTS, IvDialog, IvDialogRef } from '@inlaylab/ivorie/dialog';
import { IvInput } from '@inlaylab/ivorie/input';

interface User {
  name: string;
  email: string;
}

@Component({
  imports: [IV_DIALOG_IMPORTS, IvButton, IvInput],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-dialog-header>
      <iv-dialog-title>Edit user</iv-dialog-title>
      <iv-dialog-description>Update the email for {{ data.name }}.</iv-dialog-description>
    </iv-dialog-header>
    <input ivInput aria-label="Email" [value]="email()" (input)="email.set($any($event.target).value)" />
    <iv-dialog-footer>
      <button ivButton variant="outline" ivDialogClose>Cancel</button>
      <button ivButton (click)="save()">Save</button>
    </iv-dialog-footer>
  `,
})
class EditUserDialog {
  private readonly ref = inject<IvDialogRef<EditUserDialog, User>>(IvDialogRef);
  protected readonly data = inject<User>(IV_DIALOG_DATA);
  protected readonly email = signal(this.data.email);

  save() {
    this.ref.close({ name: this.data.name, email: this.email() });
  }
}

@Component({
  selector: 'demo-dialog-component',
  imports: [IvButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col items-center gap-2">
      <button ivButton variant="outline" (click)="open()">Edit user</button>
      <p class="text-sm text-muted-foreground">{{ user().name }}: {{ user().email }}</p>
    </div>
  `,
})
export default class DialogComponentDemo {
  private readonly dialog = inject(IvDialog);
  protected readonly user = signal<User>({ name: 'Alex', email: 'alex@acme.com' });

  open() {
    this.dialog
      .open<EditUserDialog, User, User>(EditUserDialog, { data: this.user() })
      .afterClosed()
      .subscribe(({ result }) => {
        if (result) this.user.set(result);
      });
  }
}
