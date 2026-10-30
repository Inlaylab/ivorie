import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { IvCalendar } from '@ivorie/ui/calendar';

@Component({
  selector: 'demo-calendar',
  imports: [IvCalendar],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<iv-calendar [(selected)]="date" class="rounded-md border" />`,
})
export default class CalendarDemo {
  protected readonly date = signal<Date | null>(new Date(2026, 0, 15));
}
