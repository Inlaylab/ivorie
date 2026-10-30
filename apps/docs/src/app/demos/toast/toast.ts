import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { IvButton } from '@inlaylab/ivorie/button';
import { IvToastService } from '@inlaylab/ivorie/toast';

@Component({
  selector: 'demo-toast',
  imports: [IvButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button ivButton variant="outline" (click)="toast.show('Saved', 'success')">Show toast</button>
  `,
})
export default class ToastDemo {
  protected readonly toast = inject(IvToastService);
}
