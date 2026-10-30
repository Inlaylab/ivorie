import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { IvCalendar } from '@inlaylab/ivorie/calendar';

@Component({
  selector: 'demo-calendar-two-months',
  imports: [IvCalendar],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-calendar
      [(selected)]="date"
      [numberOfMonths]="2"
      [defaultMonth]="month"
      class="rounded-md border"
    />
  `,
})
export default class CalendarTwoMonthsDemo {
  protected readonly month = new Date(2026, 0, 1);
  protected readonly date = signal<Date | null>(new Date(2026, 0, 15));
}
