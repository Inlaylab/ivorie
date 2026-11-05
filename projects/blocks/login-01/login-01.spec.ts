import { Component, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { describe, expect, it } from 'vitest'
import { LoginForm, LoginValue } from './components/login-form'
import { Login01, meta } from './login-01'

@Component({
  imports: [LoginForm],
  template: `<app-login-01-form [pending]="pending()" [error]="error()" (submitted)="values.push($event)" (provider)="providers.push($event)" />`,
})
class Host {
  readonly pending = signal(false)
  readonly error = signal<string | null>(null)
  readonly values: LoginValue[] = []
  readonly providers: string[] = []
}

async function render() {
  const fixture = TestBed.createComponent(Host)
  await fixture.whenStable()
  const el = fixture.nativeElement as HTMLElement
  const type = (id: string, value: string) => {
    const input = el.querySelector<HTMLInputElement>(`#${id}`)!
    input.value = value
    input.dispatchEvent(new Event('input'))
    input.dispatchEvent(new Event('blur'))
  }
  const submit = async () => {
    el.querySelector<HTMLButtonElement>('button[type="submit"]')!.click()
    await fixture.whenStable()
  }
  return { fixture, el, host: fixture.componentInstance, type, submit }
}

describe('login-01', () => {
  it('has meta for the registry', () => {
    expect(meta.title).toBe('Login 01')
    expect(meta.description.length).toBeGreaterThan(10)
  })

  it('renders the form with labelled fields', async () => {
    const { el } = await render()
    expect(el.querySelector('label[for="login-01-email"]')!.textContent).toContain('Email')
    expect(el.querySelector('label[for="login-01-password"]')!.textContent).toContain('Password')
    await expect(el).toHaveNoViolations()
  })

  it('invalid submit shows errors and emits nothing', async () => {
    const { el, host, submit } = await render()
    await submit()
    expect(el.querySelectorAll('[data-slot="field-error"]:not(:empty)').length).toBe(2)
    expect(host.values).toEqual([])
  })

  it('valid submit emits the value', async () => {
    const { host, type, submit } = await render()
    type('login-01-email', 'ada@example.com')
    type('login-01-password', 'password1')
    await submit()
    expect(host.values).toEqual([{ email: 'ada@example.com', password: 'password1' }])
  })

  it('pending disables submit', async () => {
    const { el, host, fixture } = await render()
    host.pending.set(true)
    await fixture.whenStable()
    expect(el.querySelector<HTMLButtonElement>('button[type="submit"]')!.disabled).toBe(true)
  })

  it('error shows in an alert', async () => {
    const { el, host, fixture } = await render()
    host.error.set('Wrong password')
    await fixture.whenStable()
    expect(el.querySelector('iv-alert')!.textContent).toContain('Wrong password')
  })

  it('provider buttons emit the provider', async () => {
    const { el, host } = await render()
    ;[...el.querySelectorAll<HTMLButtonElement>('button')].find((b) => b.textContent!.includes('Login with Google'))!.click()
    expect(host.providers).toEqual(['google'])
  })

  it('the page renders the form', async () => {
    const fixture = TestBed.createComponent(Login01)
    await fixture.whenStable()
    expect((fixture.nativeElement as HTMLElement).querySelector('app-login-01-form')).not.toBeNull()
  })
})
