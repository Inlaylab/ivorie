import { Component, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { describe, expect, it } from 'vitest'
import { IV_AVATAR_IMPORTS } from '@inlaylab/ivorie/avatar'

@Component({
  imports: [IV_AVATAR_IMPORTS],
  template: `
    <iv-avatar-group>
      <iv-avatar [size]="size()" class="ml-1">
        <iv-avatar-image src="/ada.png" alt="Ada" />
        <iv-avatar-fallback>AL</iv-avatar-fallback>
        <iv-avatar-badge />
      </iv-avatar>
      <iv-avatar-group-count>+3</iv-avatar-group-count>
    </iv-avatar-group>
  `,
})
class Host {
  size = signal<'default' | 'sm' | 'lg'>('default')
}

async function setup() {
  const fixture = TestBed.createComponent(Host)
  await fixture.whenStable()
  const part = (slot: string) => fixture.nativeElement.querySelector(`[data-slot="${slot}"]`) as HTMLElement
  const img = () => part('avatar-image') as HTMLImageElement
  return { fixture, part, img }
}

describe('IvAvatar', () => {
  it('renders a real img with src and alt', async () => {
    const { img } = await setup()
    expect(img().tagName).toBe('IMG')
    expect(img().getAttribute('src')).toBe('/ada.png')
    expect(img().getAttribute('alt')).toBe('Ada')
  })

  it('shows the image and hides the fallback after load', async () => {
    const { fixture, part, img } = await setup()
    img().dispatchEvent(new Event('load'))
    await fixture.whenStable()
    expect(img().hidden).toBe(false)
    expect(part('avatar-fallback').hidden).toBe(true)
  })

  it('hides the image and shows the fallback on error', async () => {
    const { fixture, part, img } = await setup()
    img().dispatchEvent(new Event('load'))
    await fixture.whenStable()
    img().dispatchEvent(new Event('error'))
    await fixture.whenStable()
    expect(img().hidden).toBe(true)
    expect(part('avatar-fallback').hidden).toBe(false)
  })

  it('every part carries its hook; avatar has data-size and the user class', async () => {
    const { fixture, part } = await setup()
    for (const slot of ['avatar', 'avatar-image', 'avatar-fallback', 'avatar-badge', 'avatar-group', 'avatar-group-count']) {
      expect(part(slot).classList, slot).toContain(`cn-${slot}`)
    }
    expect(part('avatar').classList).toContain('ml-1')
    fixture.componentInstance.size.set('lg')
    await fixture.whenStable()
    expect(part('avatar').dataset['size']).toBe('lg')
  })

  it('has no axe violations', async () => {
    const { fixture } = await setup()
    await expect(fixture.nativeElement).toHaveNoViolations()
  })
})
