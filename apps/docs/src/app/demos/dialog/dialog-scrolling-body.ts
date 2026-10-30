import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IvButton } from '@inlaylab/ivorie/button';
import { IV_DIALOG_IMPORTS } from '@inlaylab/ivorie/dialog';

@Component({
  selector: 'demo-dialog-scrolling-body',
  imports: [IV_DIALOG_IMPORTS, IvButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button ivButton variant="outline" [ivDialogTrigger]="tpl" [ivDialogConfig]="{ height: 'tall' }">
      Terms of service
    </button>

    <ng-template #tpl>
      <iv-dialog-header>
        <iv-dialog-title>Terms of service</iv-dialog-title>
        <iv-dialog-description>Scroll the body. The header and footer stay put.</iv-dialog-description>
      </iv-dialog-header>
      <iv-dialog-body>
        @for (n of sections; track n) {
          <p class="text-sm text-muted-foreground">
            {{ n }}. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua.
          </p>
        }
      </iv-dialog-body>
      <iv-dialog-footer>
        <button ivButton variant="outline" ivDialogClose>Decline</button>
        <button ivButton ivDialogClose>Accept</button>
      </iv-dialog-footer>
    </ng-template>
  `,
})
export default class DialogScrollingBodyDemo {
  protected readonly sections = Array.from({ length: 12 }, (_, i) => i + 1);
}
