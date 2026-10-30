import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { IvCalendar, IvDateRange } from '@inlaylab/ivorie/calendar';

@Component({
  selector: 'demo-calendar-range',
  imports: [IvCalendar],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-calendar mode="range" [(range)]="range" [defaultMonth]="month" class="rounded-md border" />
  `,
})
export default class CalendarRangeDemo {
  protected readonly month = new Date(2026, 0, 1);
  protected readonly range = signal<IvDateRange>({
    from: new Date(2026, 0, 12),
    to: new Date(2026, 0, 18),
  });
}
