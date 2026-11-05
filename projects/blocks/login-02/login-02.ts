import { ChangeDetectionStrategy, Component } from '@angular/core'
import { NgIcon } from '@ng-icons/core'
import { lucideGalleryVerticalEnd } from '@ng-icons/lucide'
import { LoginForm, LoginValue } from './components/login-form'

export const meta = {
  title: 'Login 02',
  description: 'A two-column login page with a cover panel and a GitHub button.',
}

/** The page. Replace the handlers with your auth calls. */
@Component({
  selector: 'app-login-02',
  imports: [LoginForm, NgIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'grid min-h-svh lg:grid-cols-2' },
  template: `
    <div class="flex flex-col gap-4 p-6 md:p-10">
      <div class="flex justify-center gap-2 md:justify-start">
        <a href="#" class="flex items-center gap-2 font-medium">
          <span class="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <ng-icon [svg]="logo" size="16" />
          </span>
          Acme Inc.
        </a>
      </div>
      <div class="flex flex-1 items-center justify-center">
        <div class="w-full max-w-xs">
          <app-login-02-form (submitted)="submit($event)" (provider)="continueWith($event)" />
        </div>
      </div>
    </div>
    <div class="bg-muted relative hidden lg:block" aria-hidden="true">
        <!-- Swap this for your own image. Inline, so "ivorie add" needs no asset file. -->
        <svg class="text-foreground/10 absolute inset-0 size-full">
          <defs>
            <pattern id="login-02-cover-grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M32 0H0V32" fill="none" stroke="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#login-02-cover-grid)" />
        </svg>
        <div class="from-primary/15 absolute inset-0 bg-radial-[at_30%_30%] to-transparent to-70%"></div>
      </div>
  `,
})
export class Login02 {
  protected readonly logo = lucideGalleryVerticalEnd

  protected submit(value: LoginValue): void {
    // Call your login API here, then navigate.
    void value
  }

  protected continueWith(provider: 'google' | 'github' | 'apple'): void {
    // Start your OAuth flow here.
    void provider
  }
}
