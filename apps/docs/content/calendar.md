---
title: Calendar
description: A month grid for picking a date or a date range.
section: component
entry: '@inlaylab/ivorie/calendar'
---

A date picker grid with previous/next navigation. It picks one date or a range, and works with `ngModel` and reactive forms. It uses native `Date` and has no date library dependency.

## Usage

```ts
import { IvCalendar } from '@inlaylab/ivorie/calendar';
```

```html
<iv-calendar [(selected)]="date" />
```

## Examples

### Range

<!-- demo: calendar-range -->

### Min and max

<!-- demo: calendar-min-max -->

### Disabled dates

<!-- demo: calendar-disabled-dates -->

### Two months

<!-- demo: calendar-two-months -->

### Default month

<!-- demo: calendar-default-month -->

### Locale

<!-- demo: calendar-locale -->

### Reactive forms

<!-- demo: calendar-reactive-forms -->

## API

Every part also accepts `class`.

### iv-calendar

| Name | Type | Default | Description |
|---|---|---|---|
| `mode` | `'single' \| 'range'` | `'single'` | Selection model. |
| `selected` | `Date \| null` | `null` | Selected date in single mode. Bind with `[(selected)]`. |
| `range` | `IvDateRange \| null` | `{ from: null, to: null }` | Selected range in range mode. Bind with `[(range)]`. |
| `numberOfMonths` | `1 \| 2` | `1` | Months shown side by side. |
| `minDate` | `Date \| null` | `null` | Earliest selectable day. |
| `maxDate` | `Date \| null` | `null` | Latest selectable day. |
| `disabledDate` | `((d: Date) => boolean) \| null` | `null` | Returns true for days that cannot be picked. |
| `defaultMonth` | `Date \| null` | current month | Visible month. A new value moves the view. |
| `showOutsideDays` | `boolean` | `true` | Shows leading and trailing days of nearby months. |
| `weekStartsOn` | `0 \| 1 \| 2 \| 3 \| 4 \| 5 \| 6` | from `locale` | First column. `0` is Sunday. Falls back to Sunday where the browser has no week info. |
| `locale` | `string` | `LOCALE_ID` | BCP 47 tag for month, weekday and day labels. |
| `disabled` | `boolean` | `false` | Disables every day and the navigation. Also disabled when the form control is disabled. |

Outputs:

| Name | Payload | Description |
|---|---|---|
| `selectedChange` | `Date \| null` | Emits in single mode when a day is picked. |
| `rangeChange` | `IvDateRange` | Emits in range mode on each pick. |

Types: `IvCalendarMode` is `'single' | 'range'`. `IvDateRange` is `{ from: Date | null; to: Date | null }`. `IvWeekday` is `0` to `6`.

With forms, the value is `Date | null` in single mode and `IvDateRange` in range mode.

## Accessibility

- Each month is a `role="grid"` table labelled by its caption. The caption is `aria-live="polite"`. Column headers carry the long weekday name.
- Each day is a button labelled with the full date, such as "Monday, March 3, 2025". Picked days have `aria-selected`.
- Only one day is in the tab order: the keyboard's day, else the selected day, today, or the first of the month.
- Arrow keys move by day (left/right) or week (up/down). `Home` and `End` go to the start or end of the week. `PageUp` and `PageDown` change the month. `Shift` with `PageUp` or `PageDown` changes the year. Disabled days are skipped.
- `Enter` and `Space` pick the focused day.
- The previous and next buttons are labelled "Previous month" and "Next month". They disable at `minDate` and `maxDate`.
- The form control is marked touched when focus leaves the calendar.

## Notes

- Range picking: the first click sets `from` and clears `to`. The second click sets `to`, or moves `from` if it is earlier. The third click starts a new range.
- Day buttons carry `data-range-start`, `data-range-middle`, `data-range-end` and `data-selected-single`.
- The grid always shows 6 weeks, so its height does not jump between months.
- There are no year or month dropdowns. To add them, put a separate control above the calendar and bind it to `defaultMonth`.
- The host has `bg-background`, but is transparent inside card or popover content.
