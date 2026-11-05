import { ChangeDetectionStrategy, Component } from '@angular/core'
import { LoginForm, LoginValue } from './components/login-form'

export const meta = {
  title: 'Login 05',
  description: 'An email-only login with Apple and Google, and the logo on top.',
}

/** The page. Replace the handlers with your auth calls. */
@Component({
  selector: 'app-login-05',
  imports: [LoginForm],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10' },
  template: `
    <div class="w-full max-w-sm">
      <app-login-05-form (submitted)="submit($event)" (provider)="continueWith($event)" />
    </div>
  `,
})
export class Login05 {
  protected submit(value: LoginValue): void {
    // Call your login API here, then navigate.
    void value
  }

  protected continueWith(provider: 'google' | 'github' | 'apple'): void {
    // Start your OAuth flow here.
    void provider
  }
}
