import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { IvButton } from '@inlaylab/ivorie/button';
import { IvToastService } from '@inlaylab/ivorie/toast';

@Component({
  selector: 'demo-toast-variants',
  imports: [IvButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-wrap gap-2">
      <button ivButton variant="outline" (click)="toast.show('Changes saved', 'success', { description: 'Your profile is up to date.' })">Success</button>
      <button ivButton variant="outline" (click)="toast.show('New version available', 'info', { description: 'Reload to get 1.6.0.' })">Info</button>
      <button ivButton variant="outline" (click)="toast.show('Storage almost full', 'warning', { description: '92 GB of 100 GB used.' })">Warning</button>
      <button ivButton variant="outline" (click)="toast.show('Could not save', 'destructive', { description: 'Check your connection and try again.' })">Destructive</button>
    </div>
  `,
})
export default class ToastVariantsDemo {
  protected readonly toast = inject(IvToastService);
}
