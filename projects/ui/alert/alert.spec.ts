import { Component, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { describe, expect, it } from 'vitest'
import { AlertVariants, IV_ALERT_IMPORTS, alertVariants } from '@inlaylab/ivorie/alert'

@Component({
  imports: [IV_ALERT_IMPORTS],
  template: `
    <iv-alert [variant]="variant()" class="mb-4">
      <iv-alert-title>Heads up</iv-alert-title>
      <iv-alert-description>Text</iv-alert-description>
      <iv-alert-action>Act</iv-alert-action>
    </iv-alert>
  `,
})
class Host {
  variant = signal<AlertVariants['variant']>('default')
}

async function setup() {
  const fixture = TestBed.createComponent(Host)
  await fixture.whenStable()
  const part = (slot: string) => fixture.nativeElement.querySelector(`[data-slot="${slot}"]`) as HTMLElement
  return { fixture, part }
}

describe('alertVariants', () => {
  it('is exported with its type and uses the destructive hook', () => {
    const v: AlertVariants = { variant: 'destructive' }
    expect(v.variant).toBe('destructive')
    expect(alertVariants({ variant: 'destructive' })).toContain('cn-alert-variant-destructive')
  })
})

describe('IvAlert', () => {
  it.each([
    ['warning', 'bg-yellow-50'],
    ['success', 'bg-green-50'],
    ['info', 'bg-blue-50'],
  ] as const)('keeps the Ivorie %s variant', async (variant, cls) => {
    const { fixture, part } = await setup()
    fixture.componentInstance.variant.set(variant)
    await fixture.whenStable()
    expect(part('alert').classList).toContain(cls)
  })

  it('is role alert with the variant hook and the user class', async () => {
    const { fixture, part } = await setup()
    const a = part('alert')
    expect(a.getAttribute('role')).toBe('alert')
    expect(a.classList).toContain('cn-alert')
    expect(a.classList).toContain('cn-alert-variant-default')
    expect(a.classList).toContain('mb-4')
    fixture.componentInstance.variant.set('destructive')
    await fixture.whenStable()
    expect(a.classList).toContain('cn-alert-variant-destructive')
  })

  it.each(['alert-title', 'alert-description', 'alert-action'])('%s has its hook', async (slot) => {
    const { part } = await setup()
    expect(part(slot).classList).toContain(`cn-${slot}`)
  })

  it('has no axe violations', async () => {
    const { fixture } = await setup()
    await expect(fixture.nativeElement).toHaveNoViolations()
  })
})
