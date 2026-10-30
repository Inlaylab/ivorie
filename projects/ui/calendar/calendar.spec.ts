import { Component, LOCALE_ID, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms'
import { describe, expect, it, vi } from 'vitest'
import { IvCalendar, IvDateRange } from '@ivorie/ui/calendar'

const JAN = new Date(2026, 0, 1)

@Component({
  imports: [IvCalendar, FormsModule],
  template: `
    <iv-calendar
      [(ngModel)]="date"
      [defaultMonth]="month()"
      [minDate]="min()"
      [maxDate]="max()"
      [disabledDate]="skip()"
      (selectedChange)="changes.push($event)"
      class="ml-1"
    />
  `,
})
class SingleHost {
  date = signal<Date | null>(null)
  month = signal<Date | null>(JAN)
  min = signal<Date | null>(null)
  max = signal<Date | null>(null)
  skip = signal<((d: Date) => boolean) | null>(null)
  changes: (Date | null)[] = []
}

@Component({
  imports: [IvCalendar, FormsModule],
  template: `<iv-calendar mode="range" [(ngModel)]="range" [defaultMonth]="month" (rangeChange)="changes.push($event)" />`,
})
class RangeHost {
  range = signal<IvDateRange>({ from: null, to: null })
  month = JAN
  changes: IvDateRange[] = []
}

@Component({
  imports: [IvCalendar, ReactiveFormsModule],
  template: `<iv-calendar [formControl]="control" [defaultMonth]="month" [disabled]="disabled()" (selectedChange)="changes.push($event)" />`,
})
class FormHost {
  control = new FormControl<Date | null>(null)
  month = JAN
  disabled = signal(false)
  changes: (Date | null)[] = []
}

async function render<T>(host: new () => T) {
  const fixture = TestBed.createComponent(host)
  await fixture.whenStable()
  const el = fixture.nativeElement as HTMLElement
  const day = (iso: string) =>
    el.querySelector(`[data-slot="calendar"] button[data-day="${iso}"]:not([data-outside])`) as HTMLButtonElement
  const cell = (iso: string) => day(iso).closest('td') as HTMLElement
  const caption = () => el.querySelector('.cn-calendar-caption')!.textContent!.trim()
  const tabbable = () => [...el.querySelectorAll<HTMLButtonElement>('button[data-day][tabindex="0"]')]
  const key = async (key: string) => {
    const target = (document.activeElement as HTMLElement) ?? tabbable()[0]
    const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
    target.dispatchEvent(event)
    await fixture.whenStable()
    return event
  }
  return { fixture, el, day, cell, caption, tabbable, key, host: fixture.componentInstance }
}

describe('IvCalendar', () => {
  it('carries hooks, roles and the user class', async () => {
    const { el, day, caption } = await render(SingleHost)
    const root = el.querySelector('iv-calendar')!
    expect(root.getAttribute('data-slot')).toBe('calendar')
    expect(root.classList).toContain('cn-calendar')
    expect(root.classList).toContain('ml-1')
    expect(el.querySelector('table')!.getAttribute('role')).toBe('grid')
    expect(day('2026-01-15').classList).toContain('cn-calendar-day-button')
    expect(day('2026-01-15').closest('td')!.getAttribute('role')).toBe('gridcell')
    expect(el.querySelector('.cn-calendar-caption')!.getAttribute('aria-live')).toBe('polite')
    expect(el.querySelectorAll('.cn-rtl-flip').length).toBe(2)
    expect(caption()).toBe('January 2026')
  })

  it('en-US starts weeks on Sunday', async () => {
    const { el } = await render(SingleHost)
    expect(el.querySelector('th')!.getAttribute('aria-label')).toBe('Sunday')
  })

  it('LOCALE_ID de starts weeks on Monday', async () => {
    TestBed.configureTestingModule({ providers: [{ provide: LOCALE_ID, useValue: 'de' }] })
    const { el } = await render(SingleHost)
    expect(el.querySelector('th')!.getAttribute('aria-label')).toBe('Montag')
  })

  it('LOCALE_ID de starts weeks on Monday even without Intl.Locale.getWeekInfo (H1: Firefox has no getWeekInfo; must match what SSR on Node renders)', async () => {
    const proto = Intl.Locale.prototype as unknown as { getWeekInfo?: () => { firstDay: number } }
    const original = proto.getWeekInfo
    delete proto.getWeekInfo
    try {
      TestBed.configureTestingModule({ providers: [{ provide: LOCALE_ID, useValue: 'de' }] })
      const { el } = await render(SingleHost)
      expect(el.querySelector('th')!.getAttribute('aria-label')).toBe('Montag')
    } finally {
      proto.getWeekInfo = original
    }
  })

  it('ngModel → view, click → model at local midnight, emits once', async () => {
    const { fixture, day, cell, host } = await render(SingleHost)
    host.date.set(new Date(2026, 0, 10))
    await fixture.whenStable()
    expect(cell('2026-01-10').getAttribute('aria-selected')).toBe('true')
    day('2026-01-20').click()
    await fixture.whenStable()
    expect(host.date()).toEqual(new Date(2026, 0, 20))
    expect(host.date()!.getHours()).toBe(0)
    expect(host.changes).toEqual([new Date(2026, 0, 20)])
    expect(cell('2026-01-10').getAttribute('aria-selected')).toBe('false')
  })

  it('range: ngModel → view, two clicks → model, one emit each', async () => {
    const { fixture, day, cell, host } = await render(RangeHost)
    host.range.set({ from: new Date(2026, 0, 3), to: new Date(2026, 0, 5) })
    await fixture.whenStable()
    expect(cell('2026-01-04').getAttribute('aria-selected')).toBe('true')
    day('2026-01-12').click()
    await fixture.whenStable()
    day('2026-01-08').click()
    await fixture.whenStable()
    expect(host.range()).toEqual({ from: new Date(2026, 0, 8), to: new Date(2026, 0, 12) })
    expect(host.changes.length).toBe(2)
  })

  it('setValue updates the view and does not emit', async () => {
    const { fixture, cell, host } = await render(FormHost)
    const onChange = vi.fn()
    host.control.valueChanges.subscribe(onChange)
    host.control.setValue(new Date(2026, 0, 7))
    await fixture.whenStable()
    expect(cell('2026-01-07').getAttribute('aria-selected')).toBe('true')
    expect(host.changes).toEqual([])
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('stays disabled when the form disables it, even if [disabled] changes', async () => {
    const { fixture, day, host } = await render(FormHost)
    host.control.disable()
    await fixture.whenStable()
    expect(day('2026-01-07').disabled).toBe(true)
    host.disabled.set(true)
    await fixture.whenStable()
    host.disabled.set(false)
    await fixture.whenStable()
    expect(day('2026-01-07').disabled).toBe(true)
    day('2026-01-07').click()
    expect(host.control.value).toBe(null)
    host.control.enable()
    await fixture.whenStable()
    expect(day('2026-01-07').disabled).toBe(false)
  })

  it('focus leaving the calendar marks the control touched', async () => {
    const { fixture, day, host } = await render(FormHost)
    day('2026-01-07').dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: day('2026-01-08') }))
    expect(host.control.touched).toBe(false)
    day('2026-01-07').dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: null }))
    await fixture.whenStable()
    expect(host.control.touched).toBe(true)
  })

  it('one day is tabbable: selected, else the 1st', async () => {
    const { fixture, tabbable, host } = await render(SingleHost)
    expect(tabbable().map((b) => b.dataset['day'])).toEqual(['2026-01-01'])
    host.date.set(new Date(2026, 0, 9))
    await fixture.whenStable()
    expect(tabbable().map((b) => b.dataset['day'])).toEqual(['2026-01-09'])
  })

  it('with minDate = tomorrow and nothing selected, exactly one enabled day has tabindex=0', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 0, 15, 10, 30))
    try {
      const { fixture, tabbable, host } = await render(SingleHost)
      host.min.set(new Date(2026, 0, 16))
      await fixture.whenStable()
      const stops = tabbable()
      expect(stops.map((b) => b.dataset['day'])).toEqual(['2026-01-16'])
      expect(stops[0].disabled).toBe(false)
    } finally {
      vi.useRealTimers()
    }
  })

  it('on the server, today is never marked and nothing errors (H1: afterNextRender is a no-op when `provideServerRendering()` sets `ngServerMode`, so the server and the client first paint agree)', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 0, 15, 10, 30))
    const globals = globalThis as Record<string, unknown>
    globals['ngServerMode'] = true
    try {
      const { cell } = await render(SingleHost)
      expect(cell('2026-01-15').className).not.toContain('text-foreground')
    } finally {
      delete globals['ngServerMode']
      vi.useRealTimers()
    }
  })

  it('a selected day disabled by disabledDate does not keep the tab stop', async () => {
    const { fixture, tabbable, host } = await render(SingleHost)
    host.date.set(new Date(2026, 0, 9))
    host.skip.set((d) => d.getDate() === 9 || d.getDate() === 1)
    await fixture.whenStable()
    const stops = tabbable()
    expect(stops.map((b) => b.dataset['day'])).toEqual(['2026-01-02'])
    expect(stops[0].disabled).toBe(false)
  })

  it('if every day in view is disabled, no day is a tab stop and prev/next stay reachable', async () => {
    const { fixture, el, tabbable, host } = await render(SingleHost)
    host.skip.set(() => true)
    await fixture.whenStable()
    expect(tabbable()).toEqual([])
    expect((el.querySelector('[aria-label="Previous month"]') as HTMLButtonElement).disabled).toBe(false)
    expect((el.querySelector('[aria-label="Next month"]') as HTMLButtonElement).disabled).toBe(false)
  })

  it('ArrowRight from Jan 31 moves to Feb 1 and changes the month', async () => {
    const { fixture, day, key, caption, host } = await render(SingleHost)
    host.date.set(new Date(2026, 0, 31))
    await fixture.whenStable()
    day('2026-01-31').focus()
    expect((await key('ArrowRight')).defaultPrevented).toBe(true)
    expect(caption()).toBe('February 2026')
    expect((document.activeElement as HTMLElement).dataset['day']).toBe('2026-02-01')
    await key('ArrowUp')
    expect((document.activeElement as HTMLElement).dataset['day']).toBe('2026-01-25')
    await key('End')
    expect((document.activeElement as HTMLElement).dataset['day']).toBe('2026-01-31')
    await key('Home')
    expect((document.activeElement as HTMLElement).dataset['day']).toBe('2026-01-25')
    await key('Enter')
    // Enter activates the native button in a browser; jsdom does not, so check the focus only.
    expect((document.activeElement as HTMLElement).dataset['day']).toBe('2026-01-25')
  })

  it('PageDown from December goes to January of the next year', async () => {
    const { fixture, day, key, caption, host } = await render(SingleHost)
    host.month.set(new Date(2025, 11, 1))
    await fixture.whenStable()
    day('2025-12-15').focus()
    await key('PageDown')
    expect(caption()).toBe('January 2026')
    expect((document.activeElement as HTMLElement).dataset['day']).toBe('2026-01-15')
    await key('PageUp')
    expect(caption()).toBe('December 2025')
  })

  it('min/max days are disabled and arrows skip them', async () => {
    const { fixture, day, key, host } = await render(SingleHost)
    host.min.set(new Date(2026, 0, 5))
    host.max.set(new Date(2026, 0, 20))
    await fixture.whenStable()
    expect(day('2026-01-04').disabled).toBe(true)
    expect(day('2026-01-21').disabled).toBe(true)
    day('2026-01-20').focus()
    await key('ArrowRight')
    expect((document.activeElement as HTMLElement).dataset['day']).toBe('2026-01-20')
    day('2026-01-06').focus()
    await key('ArrowUp')
    expect((document.activeElement as HTMLElement).dataset['day']).toBe('2026-01-06')
    host.skip.set((d) => d.getDate() === 13)
    await fixture.whenStable()
    day('2026-01-12').focus()
    await key('ArrowRight')
    expect((document.activeElement as HTMLElement).dataset['day']).toBe('2026-01-14')
  })

  it('has no axe violations', async () => {
    const { fixture } = await render(SingleHost)
    await expect(fixture.nativeElement).toHaveNoViolations()
  })
})
