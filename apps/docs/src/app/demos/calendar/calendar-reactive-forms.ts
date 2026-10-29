import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { IvCalendar } from '@ivorie/ui/calendar';

@Component({
  selector: 'demo-calendar-reactive-forms',
  imports: [ReactiveFormsModule, IvCalendar],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-calendar [formControl]="date" [defaultMonth]="month" class="rounded-md border" />
  `,
})
export default class CalendarReactiveFormsDemo {
  protected readonly month = new Date(2026, 0, 1);
  protected readonly date = new FormControl<Date | null>(new Date(2026, 0, 15));
}
