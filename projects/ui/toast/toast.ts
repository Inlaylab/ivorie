
import { Component, ChangeDetectionStrategy, computed, input, output } from '@angular/core'
import { IconName, IvIcon } from '@inlaylab/ivorie/icon'

import { ToastItem, ToastVariant } from './toast.service'
import { cn } from '@inlaylab/ivorie/core'

const VARIANT_CLASSES: Record<ToastVariant, string> = {
  success: 'bg-emerald-50 border-emerald-300 text-emerald-900',
  destructive: 'bg-red-50 border-red-300 text-red-900',
  warning: 'bg-amber-50 border-amber-300 text-amber-900',
  info: 'bg-sky-50 border-sky-300 text-sky-900',
}

const LEGACY_ICON_MAP: Record<string, IconName> = {
  check_circle: 'circle-check',
  error: 'circle-alert',
  warning: 'triangle-alert',
  info: 'info',
}

const VARIANT_FALLBACK_ICON: Record<ToastVariant, IconName> = {
  success: 'circle-check',
  destructive: 'circle-alert',
  warning: 'triangle-alert',
  info: 'info',
}

@Component({
  selector: 'iv-toast',
  standalone: true,
  imports: [IvIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      data-slot="toast"
      [attr.data-variant]="toast().variant"
      [attr.role]="assertive() ? 'alert' : 'status'"
      [attr.aria-live]="assertive() ? 'assertive' : 'polite'"
      [class]="containerClass()"
    >
      <svg [ivIcon]="resolvedIcon()" [size]="16" class="shrink-0"></svg>
      <div class="min-w-0 flex-1 text-sm leading-snug" [innerHTML]="toast().message"></div>
      <button
        type="button"
        class="shrink-0 opacity-70 hover:opacity-100 transition-opacity"
        (click)="close.emit()"
        aria-label="Dismiss"
      >
        <svg ivIcon="x" [size]="14"></svg>
      </button>
    </div>
  `,
})
export class IvToast {
  readonly toast = input.required<ToastItem>();
  readonly close = output<void>();


  // Errors interrupt the screen reader; everything else waits its turn.
  readonly assertive = computed(() => this.toast().variant === 'destructive')

  readonly resolvedIcon = computed(() => {
    const toast = this.toast()
    // Own keys only: a name like "constructor" must not reach the prototype.
    return (toast.icon && Object.hasOwn(LEGACY_ICON_MAP, toast.icon) && LEGACY_ICON_MAP[toast.icon]) || VARIANT_FALLBACK_ICON[toast.variant]
  })

  // No style defines the variant colours (like alert warning / success / info), so they stay utilities.
  readonly containerClass = computed(() =>
    cn(
      'cn-toast flex items-center gap-2 min-w-72 max-w-md border px-3 py-2 shadow-2xl pointer-events-auto',
      VARIANT_CLASSES[this.toast().variant],
    ),
  )
}
