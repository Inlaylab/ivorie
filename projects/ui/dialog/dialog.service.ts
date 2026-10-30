import { Overlay, OverlayRef } from '@angular/cdk/overlay'
import { ComponentPortal } from '@angular/cdk/portal'
import { DOCUMENT } from '@angular/common'
import { Injectable, InjectionToken, Injector, Signal, TemplateRef, Type, inject, signal } from '@angular/core'
import { Observable, Subject } from 'rxjs'
import { IvDialogContainer } from './dialog'

export type DialogCloseReason =
  | 'backdrop'
  | 'escape'
  | 'close-button'
  | 'programmatic'
  /** The overlay was disposed from outside, e.g. by navigation. */
  | 'navigation'

export interface DialogCloseEvent<R = unknown> {
  reason: DialogCloseReason
  result?: R
}

export type DialogSize = 'sm' | 'default' | 'lg' | 'xl' | 'fit'

/**
 * `auto` grows with the content. `tall` pins the panel to one height — 34rem, or the viewport if
 * that is shorter — so a multi-step dialog doesn't resize as the steps swap. A step longer than
 * that scrolls inside the body rather than stretching the panel.
 */
export type DialogHeight = 'auto' | 'tall'

export interface DialogConfig<D = unknown> {
  data?: D
  size?: DialogSize
  height?: DialogHeight
  showCloseButton?: boolean
  disableBackdropClose?: boolean
  disableEscapeClose?: boolean
  panelClass?: string | string[]
  backdropClass?: string | string[]
  ariaLabel?: string
  ariaLabelledBy?: string
  ariaDescribedBy?: string
}

export const IV_DIALOG_DATA = new InjectionToken<unknown>('IV_DIALOG_DATA')

interface ClosableContainer {
  beginClose(): void
}

const EXIT_ANIMATION_MS = 120

export class IvDialogRef<T = unknown, R = unknown> {
  componentInstance?: T
  private readonly _afterClosed = new Subject<DialogCloseEvent<R>>()
  private readonly _closed = signal<DialogCloseEvent<R> | undefined>(undefined)
  private _container?: ClosableContainer
  private _disposeTimer?: ReturnType<typeof setTimeout>

  /** The close event once the dialog has closed, else `undefined`. */
  readonly closed: Signal<DialogCloseEvent<R> | undefined> = this._closed.asReadonly()

  constructor(private readonly overlayRef: OverlayRef) {
    // Disposed from outside (e.g. navigation): drop the exit timer, and still report a close so
    // callers awaiting afterClosed settle.
    overlayRef.detachments().subscribe(() => {
      clearTimeout(this._disposeTimer)
      this._settle({ reason: 'navigation' })
    })
  }

  _attachContainer(container: ClosableContainer) {
    this._container = container
  }

  close(result?: R, reason: DialogCloseReason = 'programmatic') {
    if (!this._settle({ reason, result })) return
    if (this._container) {
      this._container.beginClose()
      this.overlayRef.backdropElement?.setAttribute('data-state', 'closed')
      this._disposeTimer = setTimeout(() => this.overlayRef.dispose(), EXIT_ANIMATION_MS)
    } else {
      this.overlayRef.dispose()
    }
  }

  /** Records the close once; false when already closed. */
  private _settle(event: DialogCloseEvent<R>): boolean {
    if (this._closed()) return false
    this._closed.set(event)
    this._restoreFocus()
    this._afterClosed.next(event)
    this._afterClosed.complete()
    return true
  }

  /** Focused element before open; set by the service, focused again on close. */
  _opener: HTMLElement | null = null

  // Runs before afterClosed emits, so a subscriber can still move focus (or open the next dialog).
  // Only when focus is still in this dialog or nowhere: never steal it from elsewhere.
  private _restoreFocus() {
    const opener = this._opener
    if (!opener) return
    const active = opener.ownerDocument.activeElement
    if (!active || active === opener.ownerDocument.body || this.overlayRef.overlayElement?.contains(active)) {
      opener.focus()
    }
  }

  afterClosed(): Observable<DialogCloseEvent<R>> {
    return this._afterClosed.asObservable()
  }
}

@Injectable({ providedIn: 'root' })
export class IvDialog {
  private overlay = inject(Overlay)
  private document = inject(DOCUMENT)
  private parentInjector = inject(Injector)

  open<T = unknown, R = unknown, D = unknown>(
    content: Type<T> | TemplateRef<unknown>,
    config: DialogConfig<D> = {},
  ): IvDialogRef<T, R> {
    const opener = this.document.activeElement as HTMLElement | null
    const overlayRef = this.overlay.create({
      hasBackdrop: true,
      backdropClass: ['cn-dialog-overlay', 'fixed', 'inset-0', 'isolate', 'z-50', ...toArr(config.backdropClass)],
      panelClass: toArr(config.panelClass),
      scrollStrategy: this.overlay.scrollStrategies.block(),
      positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically(),
      disposeOnNavigation: true,
    })

    const dialogRef = new IvDialogRef<T, R>(overlayRef)
    dialogRef._opener = opener

    const injector = Injector.create({
      parent: this.parentInjector,
      providers: [
        { provide: IvDialogRef, useValue: dialogRef },
        { provide: IV_DIALOG_DATA, useValue: config.data ?? null },
      ],
    })

    const portal = new ComponentPortal(IvDialogContainer, null, injector)
    const containerRef = overlayRef.attach(portal)
    // Without this the maia `.cn-dialog-overlay` fade-in/out never matches: it is keyed off data-state.
    overlayRef.backdropElement?.setAttribute('data-state', 'open')

    containerRef.instance.config = config
    containerRef.instance.dialogRef = dialogRef as IvDialogRef
    dialogRef._attachContainer(containerRef.instance)
    if (content instanceof TemplateRef) {
      containerRef.instance.template = content
    } else {
      containerRef.instance.component = content as Type<unknown>
    }

    if (!config.disableBackdropClose) {
      overlayRef.backdropClick().subscribe(() => dialogRef.close(undefined, 'backdrop'))
    }

    // Routed through CDK's keyboard dispatcher so ESC works wherever focus is, and only
    // reaches the topmost overlay (an open select/menu inside the dialog closes first).
    overlayRef.keydownEvents().subscribe(event => {
      if (event.key === 'Escape' && !event.defaultPrevented) containerRef.instance.onEscape(event)
    })

    return dialogRef
  }
}

function toArr(v: string | string[] | undefined): string[] {
  if (!v) return []
  return Array.isArray(v) ? v : [v]
}
