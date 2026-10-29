import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { IvButton } from '@ivorie/ui/button';
import { IvToastService } from '@ivorie/ui/toast';

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
