import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { IvCalendar } from '@ivorie/ui/calendar';

@Component({
  selector: 'demo-calendar-disabled-dates',
  imports: [IvCalendar],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-calendar
      [(selected)]="date"
      [disabledDate]="isWeekend"
      [defaultMonth]="month"
      class="rounded-md border"
    />
  `,
})
export default class CalendarDisabledDatesDemo {
  protected readonly month = new Date(2026, 0, 1);
  protected readonly date = signal<Date | null>(new Date(2026, 0, 15));
  protected readonly isWeekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6;
}
