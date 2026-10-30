import { Overlay, OverlayRef } from '@angular/cdk/overlay'
import { ComponentPortal } from '@angular/cdk/portal'
import { DOCUMENT } from '@angular/common'
import { Injectable, InjectionToken, Injector, Signal, TemplateRef, Type, inject, signal } from '@angular/core'
import { Observable, Subject } from 'rxjs'
import { IvAlertDialogContainer } from './alert-dialog'

/** `navigation`: the overlay was disposed from outside, e.g. by navigation. */
export type AlertDialogCloseReason = 'action' | 'cancel' | 'escape' | 'programmatic' | 'navigation'

export interface AlertDialogCloseEvent<R = unknown> {
  reason: AlertDialogCloseReason
  result?: R
}

export interface AlertDialogConfig<D = unknown> {
  data?: D
  size?: 'default' | 'sm'
  disableEscapeClose?: boolean
  panelClass?: string | string[]
}

export const IV_ALERT_DIALOG_DATA = new InjectionToken<unknown>('IV_ALERT_DIALOG_DATA')

export class IvAlertDialogRef<T = unknown, R = unknown> {
  componentInstance?: T
  private readonly _afterClosed = new Subject<AlertDialogCloseEvent<R>>()
  private readonly _closed = signal<AlertDialogCloseEvent<R> | undefined>(undefined)

  /** The close event once the dialog has closed, else `undefined`. */
  readonly closed: Signal<AlertDialogCloseEvent<R> | undefined> = this._closed.asReadonly()

  constructor(private readonly overlayRef: OverlayRef) {
    // Disposed from outside (e.g. navigation): still report a close so callers awaiting afterClosed settle.
    overlayRef.detachments().subscribe(() => this._settle({ reason: 'navigation' }))
  }

  close(result?: R, reason: AlertDialogCloseReason = 'programmatic') {
    if (this._settle({ reason, result })) this.overlayRef.dispose()
  }

  /** Records the close once; false when already closed. */
  private _settle(event: AlertDialogCloseEvent<R>): boolean {
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

  afterClosed(): Observable<AlertDialogCloseEvent<R>> {
    return this._afterClosed.asObservable()
  }
}

@Injectable({ providedIn: 'root' })
export class IvAlertDialog {
  private overlay = inject(Overlay)
  private document = inject(DOCUMENT)
  private parentInjector = inject(Injector)

  open<T = unknown, R = unknown, D = unknown>(
    content: Type<T> | TemplateRef<unknown>,
    config: AlertDialogConfig<D> = {},
  ): IvAlertDialogRef<T, R> {
    const opener = this.document.activeElement as HTMLElement | null
    const overlayRef = this.overlay.create({
      hasBackdrop: true,
      backdropClass: ['cn-alert-dialog-overlay', 'fixed', 'inset-0', 'z-50'],
      panelClass: toArr(config.panelClass),
      scrollStrategy: this.overlay.scrollStrategies.block(),
      positionStrategy: this.overlay.position().global(),
      disposeOnNavigation: true,
    })

    const dialogRef = new IvAlertDialogRef<T, R>(overlayRef)
    dialogRef._opener = opener

    const injector = Injector.create({
      parent: this.parentInjector,
      providers: [
        { provide: IvAlertDialogRef, useValue: dialogRef },
        { provide: IV_ALERT_DIALOG_DATA, useValue: config.data ?? null },
      ],
    })

    const portal = new ComponentPortal(IvAlertDialogContainer, null, injector)
    const containerRef = overlayRef.attach(portal)
    // Without this the maia `.cn-alert-dialog-overlay` fade-in never matches: it is keyed off data-state.
    overlayRef.backdropElement?.setAttribute('data-state', 'open')

    containerRef.instance.config = config
    containerRef.instance.dialogRef = dialogRef as IvAlertDialogRef

    if (content instanceof TemplateRef) {
      containerRef.instance.template = content
    } else {
      containerRef.instance.component = content as Type<unknown>
    }

    // See IvDialog — ESC via the overlay keyboard dispatcher, topmost overlay only.
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
