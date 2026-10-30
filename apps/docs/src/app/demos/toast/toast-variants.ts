import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { IvButton } from '@ivorie/ui/button';
import { IvToastService } from '@ivorie/ui/toast';

@Component({
  selector: 'demo-toast-variants',
  imports: [IvButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-wrap gap-2">
      <button ivButton variant="outline" (click)="toast.show('Saved', 'success')">Success</button>
      <button ivButton variant="outline" (click)="toast.show('Heads up', 'info')">Info</button>
      <button ivButton variant="outline" (click)="toast.show('Disk almost full', 'warning')">Warning</button>
      <button ivButton variant="outline" (click)="toast.show('Could not save', 'destructive')">Destructive</button>
    </div>
  `,
})
export default class ToastVariantsDemo {
  protected readonly toast = inject(IvToastService);
}
