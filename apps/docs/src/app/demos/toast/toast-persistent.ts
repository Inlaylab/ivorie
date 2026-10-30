import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { IvButton } from '@ivorie/ui/button';
import { IvToastService } from '@ivorie/ui/toast';

@Component({
  selector: 'demo-toast-persistent',
  imports: [IvButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex gap-2">
      <button ivButton variant="outline" (click)="show()">Show until dismissed</button>
      <button ivButton variant="ghost" (click)="dismiss()">Dismiss</button>
    </div>
  `,
})
export default class ToastPersistentDemo {
  private readonly toast = inject(IvToastService);
  private readonly id = signal<string | null>(null);

  show() {
    this.id.set(this.toast.show('Upload failed', 'destructive', { duration: 0 }));
  }

  dismiss() {
    const id = this.id();
    if (id) this.toast.dismiss(id);
  }
}
