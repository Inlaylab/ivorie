import { Component, Injectable, inject, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { Overlay } from '@angular/cdk/overlay'
import { InteractivityChecker } from '@angular/cdk/a11y'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { IV_DIALOG_IMPORTS } from './dialog'
import { DialogCloseEvent, DialogConfig, IvDialog, IvDialogRef } from './dialog.service'

@Component({
  imports: [IV_DIALOG_IMPORTS],
  template: `
    <iv-dialog-header class="extra">
      <iv-dialog-title>Edit profile</iv-dialog-title>
      <iv-dialog-description>Make changes to your profile.</iv-dialog-description>
    </iv-dialog-header>
    <iv-dialog-body><input aria-label="Name" /></iv-dialog-body>
    <iv-dialog-footer><button ivDialogClose="saved">Save</button></iv-dialog-footer>
  `,
})
class Content {
  ref = inject(IvDialogRef)
}

@Component({
  imports: [IV_DIALOG_IMPORTS],
  template: `
    @if (showTrigger()) {
      <button [ivDialogTrigger]="content" [ivDialogConfig]="config" (closed)="events.push($event)">Open</button>
    }
  `,
})
class Host {
  content = Content
  config: DialogConfig = {}
  events: DialogCloseEvent[] = []
  showTrigger = signal(true)
}

async function render(config: DialogConfig = {}) {
  const fixture = TestBed.createComponent(Host)
  fixture.componentInstance.config = config
  await fixture.whenStable()
  const trigger = fixture.nativeElement.querySelector('button') as HTMLButtonElement
  const stable = async () => {
    await fixture.whenStable()
    await new Promise((r) => setTimeout(r))
  }
  const open = async () => {
    trigger.focus()
    trigger.click()
    await stable()
  }
  const panel = () => document.querySelector<HTMLElement>('[data-slot="dialog-content"]')
  return { fixture, host: fixture.componentInstance, trigger, stable, open, panel }
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

// jsdom has no layout, so CDK sees no element as visible and the focus trap finds nothing to focus.
@Injectable()
class VisibleChecker extends InteractivityChecker {
  override isVisible() {
    return true
  }
}

describe('IvDialog', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({ providers: [{ provide: InteractivityChecker, useClass: VisibleChecker }] }),
  )

  it('opens only on trigger click', async () => {
    const create = vi.spyOn(TestBed.inject(Overlay), 'create')
    const { open, panel } = await render()
    expect(create).not.toHaveBeenCalled()
    expect(panel()).toBeNull()
    await open()
    expect(create).toHaveBeenCalledTimes(1)
    expect(panel()).not.toBeNull()
  })

  it('panel is a modal dialog labelled by its title and described by its description', async () => {
    const { open, panel } = await render()
    await open()
    const el = panel()!
    expect(el.getAttribute('role')).toBe('dialog')
    expect(el.getAttribute('aria-modal')).toBe('true')
    const title = document.querySelector('[data-slot="dialog-title"]')!
    const description = document.querySelector('[data-slot="dialog-description"]')!
    expect(title.id).toBeTruthy()
    expect(el.getAttribute('aria-labelledby')).toBe(title.id)
    expect(el.getAttribute('aria-describedby')).toBe(description.id)
  })

  it('config aria values win', async () => {
    const { open, panel } = await render({ ariaLabelledBy: 'x', ariaDescribedBy: 'y' })
    await open()
    expect(panel()!.getAttribute('aria-labelledby')).toBe('x')
    expect(panel()!.getAttribute('aria-describedby')).toBe('y')
  })

  it('ariaLabel alone drops the default aria-labelledby', async () => {
    const { open, panel } = await render({ ariaLabel: 'Profile' })
    await open()
    expect(panel()!.getAttribute('aria-label')).toBe('Profile')
    expect(panel()!.hasAttribute('aria-labelledby')).toBe(false)
  })

  it('hooks on panel, backdrop and parts', async () => {
    const { open, panel } = await render()
    await open()
    expect(panel()!.classList).toContain('cn-dialog-content')
    expect(panel()!.dataset['state']).toBe('open')
    const backdrop = document.querySelector('.cdk-overlay-backdrop')!
    expect(backdrop.classList).toContain('cn-dialog-overlay')
    expect(backdrop.classList).not.toContain('bg-black/10')
    const q = (slot: string) => document.querySelector(`[data-slot="${slot}"]`)!
    expect(q('dialog-header').classList).toContain('cn-dialog-header')
    expect(q('dialog-header').classList).toContain('extra')
    expect(q('dialog-title').classList).toContain('cn-dialog-title')
    expect(q('dialog-description').classList).toContain('cn-dialog-description')
    expect(q('dialog-footer').classList).toContain('cn-dialog-footer')
    const close = document.querySelector('.cn-dialog-close')!
    expect(close.textContent!.trim()).toBe('Close')
  })

  it('backdrop gets data-state, open then closed, so the maia fade runs (H3)', async () => {
    const service = TestBed.inject(IvDialog)
    const backdrop = () => document.querySelector('.cdk-overlay-backdrop') as HTMLElement
    const ref = service.open(Content)
    await wait(10)
    expect(backdrop().dataset['state']).toBe('open')
    ref.close()
    await wait(10)
    expect(backdrop().dataset['state']).toBe('closed')
    await wait(200)
  })

  it('closes with reason navigation when the trigger is destroyed while open (H8)', async () => {
    const { open, stable, host, panel } = await render()
    await open()
    expect(panel()).not.toBeNull()
    host.showTrigger.set(false)
    await stable()
    await wait(200)
    expect(panel()).toBeNull()
    expect(host.events).toEqual([{ reason: 'navigation', result: undefined }])
  })

  it('ivDialogClose delivers { reason, result } once', async () => {
    const { open, stable, host } = await render()
    await open()
    const save = document.querySelector<HTMLButtonElement>('[ivDialogClose]')!
    save.click()
    save.click()
    await stable()
    expect(host.events).toEqual([{ reason: 'close-button', result: 'saved' }])
  })

  it('IvDialogRef.closed signal', async () => {
    const service = TestBed.inject(IvDialog)
    const ref = service.open(Content)
    const events: DialogCloseEvent[] = []
    ref.afterClosed().subscribe((e) => events.push(e))
    expect(ref.closed()).toBeUndefined()
    ref.close('r', 'programmatic')
    ref.close('again')
    expect(ref.closed()).toEqual({ reason: 'programmatic', result: 'r' })
    expect(events).toEqual([{ reason: 'programmatic', result: 'r' }])
    await wait(200)
  })

  it('focus returns to the trigger after close', async () => {
    const { open, trigger, stable } = await render()
    await open()
    expect(document.activeElement).not.toBe(trigger)
    document.querySelector<HTMLButtonElement>('[ivDialogClose]')!.click()
    await stable()
    await wait(200)
    expect(document.activeElement).toBe(trigger)
  })

  it('focus goes back to the opener before afterClosed, so subscribers can move it', async () => {
    const service = TestBed.inject(IvDialog)
    const opener = document.createElement('button')
    const other = document.createElement('input')
    document.body.append(opener, other)
    opener.focus()
    const ref = service.open(Content)
    await wait(10)
    expect(document.querySelector('[data-slot="dialog-content"]')!.contains(document.activeElement)).toBe(true)
    let activeInSubscriber: Element | null = null
    ref.afterClosed().subscribe(() => {
      activeInSubscriber = document.activeElement
      other.focus()
    })
    ref.close()
    await wait(200)
    expect(activeInSubscriber).toBe(opener)
    expect(document.activeElement).toBe(other)
    opener.remove()
    other.remove()
  })

  it('a dialog opened from afterClosed keeps focus after the first one is disposed', async () => {
    const service = TestBed.inject(IvDialog)
    const opener = document.createElement('button')
    document.body.append(opener)
    opener.focus()
    const a = service.open(Content)
    await wait(10)
    let b: IvDialogRef | undefined
    a.afterClosed().subscribe(() => (b = service.open(Content)))
    a.close()
    await wait(200)
    const panels = document.querySelectorAll('[data-slot="dialog-content"]')
    expect(panels.length).toBe(1)
    expect(panels[0].contains(document.activeElement)).toBe(true)
    b!.close()
    await wait(200)
    opener.remove()
  })

  it('traps focus inside the panel', async () => {
    const { open, panel } = await render()
    await open()
    expect(panel()!.contains(document.activeElement)).toBe(true)
    const anchors = panel()!.parentElement!.querySelectorAll(':scope > .cdk-focus-trap-anchor')
    expect(anchors.length).toBe(2)
  })

  it('backdrop click closes; disableBackdropClose keeps it open', async () => {
    const a = await render()
    await a.open()
    ;(document.querySelector('.cdk-overlay-backdrop') as HTMLElement).click()
    await a.stable()
    expect(a.host.events).toEqual([{ reason: 'backdrop', result: undefined }])
    await wait(200)
    const b = await render({ disableBackdropClose: true })
    await b.open()
    ;(document.querySelector('.cdk-overlay-backdrop') as HTMLElement).click()
    await b.stable()
    expect(b.host.events).toEqual([])
    expect(b.panel()).not.toBeNull()
  })

  it('Escape closes; disableEscapeClose keeps it open', async () => {
    const a = await render()
    await a.open()
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
    await a.stable()
    expect(a.host.events).toEqual([{ reason: 'escape', result: undefined }])
    await wait(200)
    const b = await render({ disableEscapeClose: true })
    await b.open()
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
    await b.stable()
    expect(b.host.events).toEqual([])
  })

  it('dispose before the exit timer does not double dispose', async () => {
    const service = TestBed.inject(IvDialog)
    const ref = service.open(Content)
    await wait(0)
    const overlayRef = (ref as unknown as { overlayRef: { dispose(): void } }).overlayRef
    const dispose = vi.spyOn(overlayRef, 'dispose')
    ref.close()
    overlayRef.dispose()
    await wait(200)
    expect(dispose).toHaveBeenCalledTimes(1)
  })

  it('disposed from outside (navigation): afterClosed still emits and completes', async () => {
    const service = TestBed.inject(IvDialog)
    const ref = service.open(Content)
    await wait(0)
    const events: DialogCloseEvent[] = []
    let completed = false
    ref.afterClosed().subscribe({ next: (e) => events.push(e), complete: () => (completed = true) })
    ;(ref as unknown as { overlayRef: { dispose(): void } }).overlayRef.dispose()
    expect(events).toEqual([{ reason: 'navigation', result: undefined }])
    expect(completed).toBe(true)
    expect(ref.closed()?.reason).toBe('navigation')
  })

  it('axe passes on the open dialog', async () => {
    const { open } = await render()
    await open()
    await expect(document.querySelector('.cdk-overlay-container') as HTMLElement).toHaveNoViolations()
  })
})
