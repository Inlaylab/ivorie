import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { IvCalendar } from '@inlaylab/ivorie/calendar';

@Component({
  selector: 'demo-calendar-default-month',
  imports: [IvCalendar],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-calendar [(selected)]="date" [defaultMonth]="month" class="rounded-md border" />
  `,
})
export default class CalendarDefaultMonthDemo {
  protected readonly month = new Date(2026, 1, 1);
  protected readonly date = signal<Date | null>(null);
}
