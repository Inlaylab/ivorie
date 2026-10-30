import { DOCUMENT, isPlatformBrowser } from '@angular/common'
import {
  ApplicationRef,
  Component,
  EnvironmentInjector,
  EnvironmentProviders,
  PLATFORM_ID,
  afterNextRender,
  createComponent,
  inject,
  provideEnvironmentInitializer,
  ChangeDetectionStrategy,
} from '@angular/core'
import { IvToast } from './toast'
import { IvToastService } from './toast.service'

@Component({
  selector: 'iv-toast-container',
  standalone: true,
  imports: [IvToast],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      role="region"
      aria-label="Notifications"
      class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[1100] flex flex-col gap-2 pointer-events-none"
    >
      @for (toast of toastService.toasts(); track toast.id) {
        <iv-toast [toast]="toast" (close)="toastService.dismiss(toast.id)" />
      }
    </div>
  `,
})
export class IvToastContainer {
  readonly toastService = inject(IvToastService)
}

/**
 * Mounts one `<iv-toast-container>` on the DOCUMENT body in the browser, so apps need no
 * template tag. Does nothing on the server, or when the app already renders a container.
 */
export function provideIvToast(): EnvironmentProviders {
  return provideEnvironmentInitializer(() => {
    if (!isPlatformBrowser(inject(PLATFORM_ID))) return
    const appRef = inject(ApplicationRef)
    const doc = inject(DOCUMENT)
    const environmentInjector = inject(EnvironmentInjector)
    // After the first render, so a container in the app's own template is found.
    afterNextRender(
      () => {
        if (doc.querySelector('iv-toast-container')) return
        const ref = createComponent(IvToastContainer, { environmentInjector })
        appRef.attachView(ref.hostView)
        doc.body.appendChild(ref.location.nativeElement)
      },
      { injector: environmentInjector },
    )
  })
}
