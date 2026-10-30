import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { IvCalendar } from '@ivorie/ui/calendar';

@Component({
  selector: 'demo-calendar-locale',
  imports: [IvCalendar],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-calendar
      [(selected)]="date"
      locale="fr-FR"
      [weekStartsOn]="1"
      [defaultMonth]="month"
      class="rounded-md border"
    />
  `,
})
export default class CalendarLocaleDemo {
  protected readonly month = new Date(2026, 0, 1);
  protected readonly date = signal<Date | null>(new Date(2026, 0, 15));
}
