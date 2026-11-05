import { ChangeDetectionStrategy, Component } from '@angular/core'
import { NgIcon } from '@ng-icons/core'
import { lucideGalleryVerticalEnd } from '@ng-icons/lucide'
import { LoginForm, LoginValue } from './components/login-form'

export const meta = {
  title: 'Login 03',
  description: 'A login card on a muted page, with Apple and Google first.',
}

/** The page. Replace the handlers with your auth calls. */
@Component({
  selector: 'app-login-03',
  imports: [LoginForm, NgIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10' },
  template: `
    <div class="flex w-full max-w-sm flex-col gap-6">
      <a href="#" class="flex items-center gap-2 font-medium self-center">
          <span class="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <ng-icon [svg]="logo" size="16" />
          </span>
          Acme Inc.
        </a>
      <app-login-03-form (submitted)="submit($event)" (provider)="continueWith($event)" />
    </div>
  `,
})
export class Login03 {
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
