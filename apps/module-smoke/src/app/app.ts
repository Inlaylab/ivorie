import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ivDataTable } from '@inlaylab/ivorie/data-table';
import { IvToastService } from '@inlaylab/ivorie/toast';

@Component({
  selector: 'app-root',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.html',
})
export class App {
  readonly people = ivDataTable({
    data: signal([{ name: 'Grace' }, { name: 'Ada' }, { name: 'Alan' }]),
    columns: [
      { id: 'name', header: 'Name', accessor: (p: { name: string }) => p.name, sortable: true },
    ],
    getRowId: (p) => p.name,
  });

  private readonly toast = inject(IvToastService);

  plan = 'pro';
  fruit: string | null = null;
  combo: string | string[] | null = null;
  agree = true;
  notify = false;
  date = new Date(2026, 0, 15);
  picked = ['Apple'];
  size = 'm';
  align: string | string[] | null = 'left';
  volume = [40];
  otp = '';
  readonly fruits = ['Apple', 'Banana', 'Cherry'];

  notifySaved() {
    this.toast.show('Saved', 'success');
  }
}
