import { ApplicationRef, Component, EnvironmentInjector, PLATFORM_ID, createEnvironmentInjector } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { IvToastContainer, provideIvToast } from './toast-container'
import { IvToastService } from './toast.service'

@Component({
  imports: [IvToastContainer],
  template: `<iv-toast-container />`,
})
class Host {}

describe('IvToastService + IvToastContainer', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => {
    vi.useRealTimers()
    document.querySelectorAll('iv-toast-container').forEach((el) => el.remove())
  })

  async function render() {
    const fixture = TestBed.createComponent(Host)
    fixture.detectChanges()
    const service = TestBed.inject(IvToastService)
    const flush = async (ms = 0) => {
      await vi.advanceTimersByTimeAsync(ms)
      fixture.detectChanges()
    }
    const toasts = () => [...(fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('[data-slot="toast"]')]
    return { fixture, service, flush, toasts }
  }

  it('show() renders one toast with the cn-toast hook; toasts signal follows', async () => {
    const { service, flush, toasts } = await render()
    service.show('Saved', 'success')
    await flush()
    expect(toasts().length).toBe(1)
    expect(toasts()[0].classList).toContain('cn-toast')
    expect(toasts()[0].dataset['variant']).toBe('success')
    expect(service.toasts().map((t) => t.message)).toEqual(['Saved'])
  })

  it('container is a Notifications region without its own live region (toasts announce once)', async () => {
    const { fixture } = await render()
    const region = fixture.nativeElement.querySelector('[role="region"]') as HTMLElement
    expect(region.getAttribute('aria-label')).toBe('Notifications')
    expect(region.hasAttribute('aria-live')).toBe(false)
  })

  it('auto-dismisses after duration; duration 0 stays', async () => {
    const { service, flush, toasts } = await render()
    service.show('A', 'info', { duration: 1000 })
    service.show('B', 'info', { duration: 0 })
    await flush(999)
    expect(toasts().length).toBe(2)
    await flush(1)
    expect(toasts().map((t) => t.textContent!.trim())).toEqual(['B'])
    await flush(60_000)
    expect(toasts().length).toBe(1)
  })

  it('dismiss() and dismissAll() clear timers; dismiss(unknown) does not throw', async () => {
    const { service, flush, toasts } = await render()
    const id = service.show('A', 'info')
    service.show('B', 'info')
    service.dismiss(id)
    service.dismissAll()
    // A live timer would call dismiss() when it fires.
    const dismiss = vi.spyOn(service, 'dismiss')
    await flush(60_000)
    expect(dismiss).not.toHaveBeenCalled()
    expect(() => service.dismiss('nope')).not.toThrow()
    expect(toasts()).toEqual([])
  })

  it('destroying the service mid-delay is silent', async () => {
    const env = createEnvironmentInjector([IvToastService], TestBed.inject(EnvironmentInjector))
    const service = env.get(IvToastService)
    const dismiss = vi.spyOn(service, 'dismiss')
    service.show('A', 'info', { duration: 1000 })
    env.destroy()
    await vi.advanceTimersByTimeAsync(2000)
    expect(dismiss).not.toHaveBeenCalled()
  })

  it('destructive is an assertive alert; others are polite status', async () => {
    const { service, flush, toasts } = await render()
    service.show('Failed', 'destructive')
    service.show('Done', 'success')
    await flush()
    const [bad, good] = toasts()
    expect(bad.getAttribute('role')).toBe('alert')
    expect(bad.getAttribute('aria-live')).toBe('assertive')
    expect(good.getAttribute('role')).toBe('status')
    expect(good.getAttribute('aria-live')).toBe('polite')
    expect(good.querySelector('button')!.getAttribute('aria-label')).toBe('Dismiss')
  })

  it('HTML in message is sanitized', async () => {
    const { service, flush, toasts } = await render()
    service.show('<b>Hi</b><img src=x onerror=alert(1)><script>alert(2)</script>', 'info')
    await flush()
    const el = toasts()[0]
    expect(el.querySelector('b')!.textContent).toBe('Hi')
    expect(el.querySelector('img')!.hasAttribute('onerror')).toBe(false)
    expect(el.querySelector('script')).toBeNull()
  })

  it('ids are unique across 100 show() calls', async () => {
    const service = TestBed.inject(IvToastService)
    const ids = Array.from({ length: 100 }, () => service.show('x', 'info', { duration: 0 }))
    expect(new Set(ids).size).toBe(100)
  })

  it('close button dismisses', async () => {
    const { service, flush, toasts } = await render()
    service.show('A', 'info')
    await flush()
    toasts()[0].querySelector('button')!.click()
    await flush()
    expect(toasts()).toEqual([])
  })

  it('axe passes', async () => {
    const { fixture, service, flush } = await render()
    service.show('Saved', 'success')
    service.show('Failed', 'destructive')
    await flush()
    vi.useRealTimers()
    await expect(fixture.nativeElement).toHaveNoViolations()
  })
})

describe('provideIvToast', () => {
  afterEach(() => document.querySelectorAll('iv-toast-container').forEach((el) => el.remove()))

  it('mounts exactly one container in the browser', async () => {
    TestBed.configureTestingModule({ providers: [provideIvToast()] })
    TestBed.inject(EnvironmentInjector)
    await TestBed.inject(ApplicationRef).whenStable()
    TestBed.tick()
    expect(document.querySelectorAll('iv-toast-container').length).toBe(1)
    TestBed.inject(IvToastService).show('Hi', 'info')
    TestBed.tick()
    expect(document.querySelector('iv-toast-container [data-slot="toast"]')!.textContent).toContain('Hi')
  })

  it('does not mount a second container next to a manual one', async () => {
    TestBed.configureTestingModule({ providers: [provideIvToast()] })
    const fixture = TestBed.createComponent(Host)
    document.body.appendChild(fixture.nativeElement)
    fixture.detectChanges()
    await TestBed.inject(ApplicationRef).whenStable()
    TestBed.tick()
    expect(document.querySelectorAll('iv-toast-container').length).toBe(1)
  })

  it('mounts nothing on the server', async () => {
    TestBed.configureTestingModule({ providers: [provideIvToast(), { provide: PLATFORM_ID, useValue: 'server' }] })
    TestBed.inject(EnvironmentInjector)
    await TestBed.inject(ApplicationRef).whenStable()
    TestBed.tick()
    expect(document.querySelectorAll('iv-toast-container').length).toBe(0)
  })
})
