import { DestroyRef, Injectable, Signal, inject, signal } from '@angular/core'
import { toObservable } from '@angular/core/rxjs-interop'
import { Observable } from 'rxjs'
import { IvIdGenerator } from '@inlaylab/ivorie/core'

export type ToastVariant = 'success' | 'destructive' | 'info' | 'warning'

/** A button in the toast: runs onClick, then the toast closes. */
export interface ToastAction {
  label: string
  onClick: () => void
}

export interface ToastItem {
  id: string
  message: string
  variant: ToastVariant
  icon?: string
  duration: number
  /** A second, quieter line under the message. Plain text. */
  description?: string
  action?: ToastAction
}

export interface ToastOptions {
  icon?: string
  duration?: number
  description?: string
  action?: ToastAction
}

const DEFAULT_DURATION: Record<ToastVariant, number> = {
  success: 3000,
  destructive: 10000,
  warning: 6000,
  info: 5000,
}

@Injectable({ providedIn: 'root' })
export class IvToastService {
  private readonly ids = inject(IvIdGenerator)
  private readonly _toasts = signal<ToastItem[]>([])
  readonly toasts: Signal<ToastItem[]> = this._toasts.asReadonly()
  readonly toasts$: Observable<ToastItem[]> = toObservable(this._toasts)

  /** Per toast: the running timeout (null while paused), the time left and when it last started. */
  private readonly timers = new Map<string, { handle: ReturnType<typeof setTimeout> | null; left: number; since: number }>()

  constructor() {
    inject(DestroyRef).onDestroy(() => this.clearTimers())
  }

  show(message: string, variant: ToastVariant, opts: ToastOptions = {}): string {
    const id = this.ids.next('iv-toast')
    // An action (Undo) needs time to reach by keyboard or screen reader; the toast also pauses while
    // hovered or focused (pause/resume), so the timer never runs out under the user: WCAG 2.2.1.
    const duration = opts.duration ?? Math.max(DEFAULT_DURATION[variant], opts.action ? 10000 : 0)
    const item: ToastItem = { id, message, variant, icon: opts.icon, duration, description: opts.description, action: opts.action }
    this._toasts.update((list) => [...list, item])

    if (duration > 0) this.timers.set(id, { handle: null, left: duration, since: 0 })
    this.resume(id)
    return id
  }

  /** Stops the toast's timer, keeping the time left. Hover and focus in `<iv-toast>` call it. */
  pause(id: string): void {
    const t = this.timers.get(id)
    if (!t?.handle) return
    clearTimeout(t.handle)
    t.handle = null
    t.left -= Date.now() - t.since
  }

  /** Runs the rest of a paused timer. */
  resume(id: string): void {
    const t = this.timers.get(id)
    if (!t || t.handle) return
    t.since = Date.now()
    t.handle = setTimeout(() => this.dismiss(id), Math.max(0, t.left))
  }

  dismiss(id: string): void {
    clearTimeout(this.timers.get(id)?.handle ?? undefined)
    this.timers.delete(id)
    this._toasts.update((list) => list.filter((t) => t.id !== id))
  }

  dismissAll(): void {
    this.clearTimers()
    this._toasts.set([])
  }

  private clearTimers() {
    this.timers.forEach((t) => clearTimeout(t.handle ?? undefined))
    this.timers.clear()
  }
}
