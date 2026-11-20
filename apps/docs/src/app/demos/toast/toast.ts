import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { IvButton } from '@inlaylab/ivorie/button';
import { IvToastService } from '@inlaylab/ivorie/toast';

@Component({
  selector: 'demo-toast',
  imports: [IvButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<button ivButton variant="outline" (click)="schedule()">Schedule release</button>`,
})
export default class ToastDemo {
  private readonly toast = inject(IvToastService);

  protected schedule(): void {
    this.toast.show('Release 1.6.0 scheduled', 'success', {
      description: 'Friday, November 28 at 9:00',
      action: { label: 'Undo', onClick: () => this.toast.show('Release unscheduled', 'info') },
    });
  }
}
