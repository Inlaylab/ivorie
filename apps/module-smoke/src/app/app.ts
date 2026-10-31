import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { IvToastService } from '@inlaylab/ivorie/toast';

@Component({
  selector: 'app-root',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.html',
})
export class App {
  private readonly toast = inject(IvToastService);

  plan = 'pro';
  fruit: string | null = null;
  combo: string | string[] | null = null;
  agree = true;
  notify = false;
  date = new Date(2026, 0, 15);
  picked = ['Apple'];
  size = 'm';
  readonly fruits = ['Apple', 'Banana', 'Cherry'];

  notifySaved() {
    this.toast.show('Saved', 'success');
  }
}
