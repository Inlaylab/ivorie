import { Component, LOCALE_ID, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { describe, expect, it } from 'vitest'
import { IvDelta } from '@inlaylab/ivorie/delta'

@Component({
  imports: [IvDelta],
  template: `<iv-delta [value]="value()" [invert]="invert()" [format]="format()" />`,
})
class Host {
  value = signal(12)
  invert = signal(false)
  format = signal<'percent' | 'number'>('percent')
}

async function setup(value: number, invert = false, format: 'percent' | 'number' = 'percent') {
  const fixture = TestBed.createComponent(Host)
  fixture.componentInstance.value.set(value)
  fixture.componentInstance.invert.set(invert)
  fixture.componentInstance.format.set(format)
  await fixture.whenStable()
  return fixture.nativeElement.querySelector('[data-slot="delta"]') as HTMLElement
}

describe('IvDelta', () => {
  it.each([
    [12, false, 'up', 'good', '+12%', 'Up 12%'],
    [-3.5, false, 'down', 'bad', '−3.5%', 'Down 3.5%'],
    [-3.5, true, 'down', 'good', '−3.5%', 'Down 3.5%'],
    [8, true, 'up', 'bad', '+8%', 'Up 8%'],
    [0, false, 'flat', 'neutral', '0%', 'No change'],
    // Shown rounded to 0%: no green "+0%".
    [0.04, false, 'flat', 'neutral', '0%', 'No change'],
    [-0.04, false, 'flat', 'neutral', '0%', 'No change'],
  ])('%s (invert %s): %s, %s', async (value, invert, trend, tone, shown, spoken) => {
    const el = await setup(value, invert)
    expect(el.dataset['trend']).toBe(trend)
    expect(el.dataset['tone']).toBe(tone)
    expect(el.querySelector('[aria-hidden="true"]:not(svg)')!.textContent!.trim()).toBe(shown)
    expect(el.querySelector('.sr-only')!.textContent!.trim()).toBe(spoken)
    await expect(el).toHaveNoViolations()
  })

  it('format="number" has no percent sign', async () => {
    const el = await setup(1250, false, 'number')
    expect(el.querySelector('[aria-hidden="true"]:not(svg)')!.textContent!.trim()).toBe('+1,250')
  })

  it('numbers follow the app locale (LOCALE_ID)', async () => {
    TestBed.configureTestingModule({ providers: [{ provide: LOCALE_ID, useValue: 'de-DE' }] })
    const el = await setup(1250.5, false, 'number')
    expect(el.querySelector('[aria-hidden="true"]:not(svg)')!.textContent!.trim()).toBe('+1.250,5')
  })

  it('with valueText, the sign of the raw value sets the arrow (no rounding): 0.042 shown as "+4.2%" is up', async () => {
    TestBed.overrideTemplate(Host, `<iv-delta [value]="0.042" valueText="+4.2%" />`)
    const fixture = TestBed.createComponent(Host)
    await fixture.whenStable()
    const el = fixture.nativeElement.querySelector('[data-slot="delta"]') as HTMLElement
    expect(el.dataset['trend']).toBe('up')
    expect(el.dataset['tone']).toBe('good')
  })
})
