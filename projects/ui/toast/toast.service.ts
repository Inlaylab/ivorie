import { DestroyRef, Injectable, Signal, inject, signal } from '@angular/core'
import { toObservable } from '@angular/core/rxjs-interop'
import { Observable } from 'rxjs'
import { IvIdGenerator } from '@inlaylab/ivorie/core'

export type ToastVariant = 'success' | 'destructive' | 'info' | 'warning'

export interface ToastItem {
  id: string
  message: string
  variant: ToastVariant
  icon?: string
  duration: number
}

export interface ToastOptions {
  icon?: string
  duration?: number
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

  private readonly timers = new Map<string, ReturnType<typeof setTimeout>>()

  constructor() {
    inject(DestroyRef).onDestroy(() => this.clearTimers())
  }

  show(message: string, variant: ToastVariant, opts: ToastOptions = {}): string {
    const id = this.ids.next('iv-toast')
    const duration = opts.duration ?? DEFAULT_DURATION[variant]
    const item: ToastItem = { id, message, variant, icon: opts.icon, duration }
    this._toasts.update((list) => [...list, item])

    if (duration > 0) {
      this.timers.set(
        id,
        setTimeout(() => this.dismiss(id), duration),
      )
    }
    return id
  }

  dismiss(id: string): void {
    clearTimeout(this.timers.get(id))
    this.timers.delete(id)
    this._toasts.update((list) => list.filter((t) => t.id !== id))
  }

  dismissAll(): void {
    this.clearTimers()
    this._toasts.set([])
  }

  private clearTimers() {
    this.timers.forEach((t) => clearTimeout(t))
    this.timers.clear()
  }
}
