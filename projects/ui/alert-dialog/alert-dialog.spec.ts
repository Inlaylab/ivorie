import { Component, Injectable } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { Overlay } from '@angular/cdk/overlay'
import { InteractivityChecker } from '@angular/cdk/a11y'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { IV_ALERT_DIALOG_IMPORTS } from './alert-dialog'
import { AlertDialogCloseEvent, IvAlertDialog } from './alert-dialog.service'

@Component({
  imports: [IV_ALERT_DIALOG_IMPORTS],
  template: `
    <iv-alert-dialog-header>
      <iv-alert-dialog-media>!</iv-alert-dialog-media>
      <iv-alert-dialog-title>Delete project?</iv-alert-dialog-title>
      <iv-alert-dialog-description>This cannot be undone.</iv-alert-dialog-description>
    </iv-alert-dialog-header>
    <iv-alert-dialog-footer>
      <button ivAlertDialogAction="deleted" variant="destructive" class="extra">Delete</button>
      <button [ivAlertDialogCancel]="'kept'">Cancel</button>
    </iv-alert-dialog-footer>
  `,
})
class Content {}

@Component({
  imports: [IV_ALERT_DIALOG_IMPORTS],
  template: `<button [ivAlertDialogTrigger]="content" (closed)="events.push($event)">Open</button>`,
})
class Host {
  content = Content
  events: AlertDialogCloseEvent[] = []
}

// jsdom has no layout, so CDK sees no element as visible and the focus trap finds nothing to focus.
@Injectable()
class VisibleChecker extends InteractivityChecker {
  override isVisible() {
    return true
  }
}

const wait = (ms = 0) => new Promise((r) => setTimeout(r, ms))

async function render() {
  const fixture = TestBed.createComponent(Host)
  await fixture.whenStable()
  const trigger = fixture.nativeElement.querySelector('button') as HTMLButtonElement
  const stable = async () => {
    await fixture.whenStable()
    await wait()
  }
  const open = async () => {
    trigger.focus()
    trigger.click()
    await stable()
  }
  const panel = () => document.querySelector<HTMLElement>('[data-slot="alert-dialog-content"]')
  const button = (slot: string) => document.querySelector<HTMLButtonElement>(`[data-slot="alert-dialog-${slot}"]`)!
  return { fixture, host: fixture.componentInstance, trigger, stable, open, panel, button }
}

describe('IvAlertDialog', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({ providers: [{ provide: InteractivityChecker, useClass: VisibleChecker }] }),
  )

  it('opens only on trigger click', async () => {
    const create = vi.spyOn(TestBed.inject(Overlay), 'create')
    const { open, panel } = await render()
    expect(create).not.toHaveBeenCalled()
    expect(panel()).toBeNull()
    await open()
    expect(panel()).not.toBeNull()
  })

  it('is a modal alertdialog labelled by its title and described by its description', async () => {
    const { open, panel } = await render()
    await open()
    const el = panel()!
    expect(el.getAttribute('role')).toBe('alertdialog')
    expect(el.getAttribute('aria-modal')).toBe('true')
    const title = document.querySelector('[data-slot="alert-dialog-title"]')!
    const description = document.querySelector('[data-slot="alert-dialog-description"]')!
    expect(el.getAttribute('aria-labelledby')).toBe(title.id)
    expect(el.getAttribute('aria-describedby')).toBe(description.id)
  })

  it('hooks on panel, backdrop, parts and buttons', async () => {
    const { open, panel, button } = await render()
    await open()
    expect(panel()!.classList).toContain('cn-alert-dialog-content')
    expect(document.querySelector('.cdk-overlay-backdrop')!.classList).toContain('cn-alert-dialog-overlay')
    for (const part of ['header', 'footer', 'media', 'title', 'description'])
      expect(document.querySelector(`[data-slot="alert-dialog-${part}"]`)!.classList).toContain(`cn-alert-dialog-${part}`)
    const action = button('action')
    expect(action.classList).toContain('cn-alert-dialog-action')
    expect(action.classList).toContain('cn-button')
    expect(action.classList).toContain('cn-button-variant-destructive')
    expect(action.classList).toContain('extra')
    expect(action.getAttribute('type')).toBe('button')
    const cancel = button('cancel')
    expect(cancel.classList).toContain('cn-alert-dialog-cancel')
    expect(cancel.classList).toContain('cn-button-variant-outline')
  })

  it('backdrop gets data-state="open", so the maia fade-in runs (H3)', async () => {
    const { open } = await render()
    await open()
    expect((document.querySelector('.cdk-overlay-backdrop') as HTMLElement).dataset['state']).toBe('open')
  })

  it('initial focus is the Cancel button; focus returns to the trigger after close', async () => {
    const { open, stable, trigger, button } = await render()
    await open()
    expect(document.activeElement).toBe(button('cancel'))
    button('cancel').click()
    await stable()
    expect(document.activeElement).toBe(trigger)
  })

  it('focus goes back to the opener before afterClosed, so subscribers can move it', async () => {
    const opener = document.createElement('button')
    const other = document.createElement('input')
    document.body.append(opener, other)
    opener.focus()
    const ref = TestBed.inject(IvAlertDialog).open(Content)
    await wait(10)
    let activeInSubscriber: Element | null = null
    ref.afterClosed().subscribe(() => {
      activeInSubscriber = document.activeElement
      other.focus()
    })
    ref.close()
    await wait(10)
    expect(activeInSubscriber).toBe(opener)
    expect(document.activeElement).toBe(other)
    opener.remove()
    other.remove()
  })

  it('backdrop click does not close it', async () => {
    const { open, stable, host, panel } = await render()
    await open()
    ;(document.querySelector('.cdk-overlay-backdrop') as HTMLElement).click()
    await stable()
    expect(host.events).toEqual([])
    expect(panel()).not.toBeNull()
  })

  it('Action closes with reason action and its result; Cancel with cancel', async () => {
    const a = await render()
    await a.open()
    a.button('action').click()
    await a.stable()
    expect(a.host.events).toEqual([{ reason: 'action', result: 'deleted' }])
    const b = await render()
    await b.open()
    b.button('cancel').click()
    await b.stable()
    expect(b.host.events).toEqual([{ reason: 'cancel', result: 'kept' }])
  })

  it('Escape closes with reason escape', async () => {
    const { open, stable, host } = await render()
    await open()
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
    await stable()
    expect(host.events).toEqual([{ reason: 'escape', result: undefined }])
  })

  it('IvAlertDialogRef.closed signal and afterClosed() deliver once', async () => {
    const ref = TestBed.inject(IvAlertDialog).open(Content)
    const events: AlertDialogCloseEvent[] = []
    ref.afterClosed().subscribe((e) => events.push(e))
    expect(ref.closed()).toBeUndefined()
    ref.close('x')
    ref.close('y')
    expect(ref.closed()).toEqual({ reason: 'programmatic', result: 'x' })
    expect(events).toEqual([{ reason: 'programmatic', result: 'x' }])
  })

  it('disposed from outside (navigation): afterClosed still emits and completes', async () => {
    const ref = TestBed.inject(IvAlertDialog).open(Content)
    await wait(0)
    const events: AlertDialogCloseEvent[] = []
    let completed = false
    ref.afterClosed().subscribe({ next: (e) => events.push(e), complete: () => (completed = true) })
    ;(ref as unknown as { overlayRef: { dispose(): void } }).overlayRef.dispose()
    expect(events).toEqual([{ reason: 'navigation', result: undefined }])
    expect(completed).toBe(true)
  })

  it('axe passes on the open alert dialog', async () => {
    const { open } = await render()
    await open()
    await expect(document.querySelector('.cdk-overlay-container') as HTMLElement).toHaveNoViolations()
  })
})
