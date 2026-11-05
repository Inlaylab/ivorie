// Shared spec for the login and signup blocks: not a block, never shipped.
import { Type } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { describe, expect, it } from 'vitest'

interface AuthForm {
  submitted: { subscribe(fn: (v: unknown) => void): unknown }
  provider: { subscribe(fn: (v: string) => void): unknown }
}

export interface AuthFormSpec {
  name: string
  meta: { title: string; description: string }
  page: Type<unknown>
  form: Type<AuthForm>
  /** Field id → value for a valid submit. */
  fill: Record<string, string>
  expected: Record<string, string>
  /** Field errors shown on an empty submit. */
  errors: number
  provider?: { label: string; value: string }
  /** The confirm field id, when the form has one. */
  confirm?: string
}

export function describeAuthForm(spec: AuthFormSpec): void {
  async function render() {
    const fixture = TestBed.createComponent(spec.form)
    const values: unknown[] = []
    const providers: string[] = []
    fixture.componentInstance.submitted.subscribe((v) => values.push(v))
    fixture.componentInstance.provider.subscribe((v) => providers.push(v))
    await fixture.whenStable()
    const el = fixture.nativeElement as HTMLElement
    const type = (id: string, value: string) => {
      const input = el.querySelector<HTMLInputElement>(`#${id}`)
      if (!input) throw new Error(`no field #${id}`)
      input.value = value
      input.dispatchEvent(new Event('input'))
      input.dispatchEvent(new Event('blur'))
    }
    const submit = async () => {
      el.querySelector<HTMLButtonElement>('button[type="submit"]')!.click()
      await fixture.whenStable()
    }
    const errors = () => el.querySelectorAll('[data-slot="field-error"]:not(:empty)').length
    return { fixture, el, values, providers, type, submit, errors }
  }

  describe(spec.name, () => {
    it('has meta for the registry', () => {
      expect(spec.meta.title.length).toBeGreaterThan(0)
      expect(spec.meta.description.length).toBeGreaterThan(10)
    })

    it('the page renders and has no axe violations', async () => {
      const fixture = TestBed.createComponent(spec.page)
      await fixture.whenStable()
      await expect(fixture.nativeElement).toHaveNoViolations()
    })

    it('invalid submit shows errors and emits nothing', async () => {
      const { values, submit, errors } = await render()
      await submit()
      expect(errors()).toBe(spec.errors)
      expect(values).toEqual([])
    })

    it('each invalid field names its error', async () => {
      const { el, submit } = await render()
      await submit()
      const invalid = [...el.querySelectorAll<HTMLInputElement>('input[aria-invalid="true"]')]
      expect(invalid.length).toBe(spec.errors)
      for (const input of invalid) {
        const error = el.querySelector(`#${input.getAttribute('aria-describedby')}`)
        expect(error?.textContent?.trim().length, input.id).toBeGreaterThan(0)
      }
    })

    it('valid submit emits the value', async () => {
      const { values, type, submit, errors } = await render()
      for (const [id, value] of Object.entries(spec.fill)) type(id, value)
      await submit()
      expect(errors()).toBe(0)
      expect(values).toEqual([spec.expected])
    })

    it('pending disables submit', async () => {
      const { fixture, el } = await render()
      fixture.componentRef.setInput('pending', true)
      await fixture.whenStable()
      expect(el.querySelector<HTMLButtonElement>('button[type="submit"]')!.disabled).toBe(true)
    })

    it('error shows in an alert', async () => {
      const { fixture, el } = await render()
      fixture.componentRef.setInput('error', 'Something went wrong')
      await fixture.whenStable()
      expect(el.querySelector('iv-alert')!.textContent).toContain('Something went wrong')
    })

    if (spec.provider) {
      const provider = spec.provider
      it('a provider button emits the provider', async () => {
        const { el, providers } = await render()
        const button = [...el.querySelectorAll<HTMLButtonElement>('button')].find((b) => b.textContent!.includes(provider.label))
        button!.click()
        expect(providers).toEqual([provider.value])
      })
    }

    if (spec.confirm) {
      const confirm = spec.confirm
      it('passwords must match', async () => {
        const { values, type, submit, errors } = await render()
        for (const [id, value] of Object.entries(spec.fill)) type(id, value)
        type(confirm, 'something-else')
        await submit()
        expect(errors()).toBe(1)
        expect(values).toEqual([])
      })
    }
  })
}
