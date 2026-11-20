import { Component, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { describe, expect, it } from 'vitest'
import { UsageCard } from './components/usage-card'
import { plan, type Quota } from './data'
import { Usage01, meta } from './usage-01'

@Component({
  imports: [UsageCard],
  template: `<app-usage-01-card [plan]="plan" [quotas]="quotas()" (upgrade)="upgrades = upgrades + 1" />`,
})
class Host {
  readonly plan = plan
  readonly quotas = signal<Quota[]>([
    { label: 'Storage', used: 20, limit: 100, unit: 'GB' },
    { label: 'Seats', used: 3, limit: 10, unit: 'seats' },
  ])
  upgrades = 0
}

async function render() {
  const fixture = TestBed.createComponent(Host)
  await fixture.whenStable()
  return { fixture, el: fixture.nativeElement as HTMLElement, host: fixture.componentInstance }
}

describe('usage-01', () => {
  it('has meta for the registry', () => {
    expect(meta.title).toBe('Usage 01')
    expect(meta.description.length).toBeGreaterThan(10)
  })

  it('renders a labelled meter per quota', async () => {
    const { el } = await render()
    const meters = el.querySelectorAll('[role="meter"]')
    expect(meters.length).toBe(2)
    expect(meters[0].getAttribute('aria-valuenow')).toBe('20')
    expect(meters[0].getAttribute('aria-valuetext')).toBe('20 of 100 GB')
    await expect(el).toHaveNoViolations()
  })

  it('shows the limit note only near a limit, and the meter turns', async () => {
    const { el, host, fixture } = await render()
    expect(el.querySelector('iv-alert')).toBeNull()
    host.quotas.set([{ label: 'Seats', used: 9, limit: 10, unit: 'seats' }])
    await fixture.whenStable()
    expect(el.querySelector('iv-alert')!.textContent).toContain('Seats nearly used up')
    expect(el.querySelector('iv-meter')!.getAttribute('data-status')).toBe('warn')
  })

  it('at exactly the limit mark (80%) the note and the meter agree: both still fine', async () => {
    const { el, host, fixture } = await render()
    host.quotas.set([{ label: 'Seats', used: 8, limit: 10, unit: 'seats' }])
    await fixture.whenStable()
    expect(el.querySelector('iv-meter')!.getAttribute('data-status')).toBe('good')
    expect(el.querySelector('iv-alert')).toBeNull()
  })

  it('upgrade emits', async () => {
    const { el, host } = await render()
    ;[...el.querySelectorAll<HTMLButtonElement>('button')].find((b) => b.textContent!.includes('Upgrade'))!.click()
    expect(host.upgrades).toBe(1)
  })

  it('the page renders the card with the sample data', async () => {
    const fixture = TestBed.createComponent(Usage01)
    await fixture.whenStable()
    expect((fixture.nativeElement as HTMLElement).querySelectorAll('iv-meter').length).toBe(3)
  })
})
