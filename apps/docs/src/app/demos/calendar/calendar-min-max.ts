import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { IvCalendar } from '@ivorie/ui/calendar';

@Component({
  selector: 'demo-calendar-min-max',
  imports: [IvCalendar],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-calendar
      [(selected)]="date"
      [minDate]="min"
      [maxDate]="max"
      [defaultMonth]="min"
      class="rounded-md border"
    />
  `,
})
export default class CalendarMinMaxDemo {
  protected readonly min = new Date(2026, 0, 10);
  protected readonly max = new Date(2026, 1, 20);
  protected readonly date = signal<Date | null>(new Date(2026, 0, 15));
}
