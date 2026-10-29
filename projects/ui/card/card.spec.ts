import { Component, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { describe, expect, it } from 'vitest'
import { IV_CARD_IMPORTS } from '@ivorie/ui/card'

@Component({
  imports: [IV_CARD_IMPORTS],
  template: `
    <iv-card [size]="size()" class="max-w-sm">
      <iv-card-header>
        <iv-card-title>Title</iv-card-title>
        <iv-card-description>Text</iv-card-description>
        <iv-card-action>Act</iv-card-action>
      </iv-card-header>
      <iv-card-content>Body</iv-card-content>
      <iv-card-footer>Foot</iv-card-footer>
    </iv-card>
  `,
})
class Host {
  size = signal<'default' | 'sm'>('default')
}

async function setup() {
  const fixture = TestBed.createComponent(Host)
  await fixture.whenStable()
  const part = (slot: string) => fixture.nativeElement.querySelector(`[data-slot="${slot}"]`) as HTMLElement
  return { fixture, part }
}

describe('IvCard', () => {
  it.each(['card', 'card-header', 'card-title', 'card-description', 'card-action', 'card-content', 'card-footer'])(
    '%s has its data-slot and cn-%s hook',
    async (slot) => {
      const { part } = await setup()
      expect(part(slot).classList).toContain(`cn-${slot}`)
    },
  )

  it('sets data-size and keeps the user class', async () => {
    const { fixture, part } = await setup()
    expect(part('card').dataset['size']).toBe('default')
    expect(part('card').classList).toContain('max-w-sm')
    fixture.componentInstance.size.set('sm')
    await fixture.whenStable()
    expect(part('card').dataset['size']).toBe('sm')
  })

  it('has no axe violations', async () => {
    const { fixture } = await setup()
    await expect(fixture.nativeElement).toHaveNoViolations()
  })
})
