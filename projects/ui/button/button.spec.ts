import { Component, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { describe, expect, it } from 'vitest'
import { ButtonVariants, IvButton, buttonVariants } from '@ivorie/ui/button'

@Component({
  imports: [IvButton],
  template: `
    <form>
      <button ivButton id="b" [variant]="variant()" [size]="size()" class="w-full">Save</button>
      <button ivButton id="submit" type="submit">Send</button>
      <button ivButton id="off" disabled>Off</button>
    </form>
    <a ivButton id="a" href="/docs">Docs</a>
  `,
})
class Host {
  variant = signal<ButtonVariants['variant']>('default')
  size = signal<ButtonVariants['size']>('default')
}

async function setup() {
  const fixture = TestBed.createComponent(Host)
  await fixture.whenStable()
  const el = (id: string) => fixture.nativeElement.querySelector(`#${id}`) as HTMLElement
  return { fixture, el }
}

describe('buttonVariants', () => {
  it('is exported with its type', () => {
    const v: ButtonVariants = { variant: 'outline' }
    expect(v.variant).toBe('outline')
    expect(buttonVariants({ variant: 'destructive' })).toContain('cn-button-variant-destructive')
  })
})

describe('IvButton', () => {
  it('puts hooks and data attributes on the native button', async () => {
    const { el } = await setup()
    const b = el('b')
    expect(b.tagName).toBe('BUTTON')
    expect(b.dataset['slot']).toBe('button')
    expect(b.dataset['variant']).toBe('default')
    expect(b.dataset['size']).toBe('default')
    expect(b.classList).toContain('cn-button')
    expect(b.classList).toContain('cn-button-variant-default')
    expect(b.classList).toContain('cn-button-size-default')
  })

  it('switches hooks with variant and size', async () => {
    const { fixture, el } = await setup()
    fixture.componentInstance.variant.set('outline')
    fixture.componentInstance.size.set('sm')
    await fixture.whenStable()
    expect(el('b').classList).toContain('cn-button-variant-outline')
    expect(el('b').classList).toContain('cn-button-size-sm')
    expect(el('b').classList).not.toContain('cn-button-variant-default')
    expect(el('b').dataset['variant']).toBe('outline')
  })

  it('keeps the user class', async () => {
    const { el } = await setup()
    expect(el('b').classList).toContain('w-full')
  })

  it('defaults to type="button" so it does not submit a form', async () => {
    const { el } = await setup()
    expect(el('b').getAttribute('type')).toBe('button')
    expect(el('submit').getAttribute('type')).toBe('submit')
  })

  it('works on an anchor without a type attribute', async () => {
    const { el } = await setup()
    expect(el('a').tagName).toBe('A')
    expect(el('a').hasAttribute('type')).toBe(false)
    expect(el('a').classList).toContain('cn-button')
  })

  it('uses the native disabled attribute', async () => {
    const { el } = await setup()
    expect((el('off') as HTMLButtonElement).disabled).toBe(true)
  })

  it('has no axe violations', async () => {
    const { fixture } = await setup()
    await expect(fixture.nativeElement).toHaveNoViolations()
  })
})
