import { ChangeDetectionStrategy, Component } from '@angular/core'
import { LoginForm, LoginValue } from './components/login-form'

export const meta = {
  title: 'Login 01',
  description: 'A simple login form in a card, with email, password and a Google button.',
}

/** The page. Replace the handlers with your auth calls. */
@Component({
  selector: 'app-login-01',
  imports: [LoginForm],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex min-h-svh w-full items-center justify-center p-6 md:p-10' },
  template: `
    <div class="w-full max-w-sm">
      <app-login-01-form (submitted)="login($event)" (provider)="loginWith($event)" />
    </div>
  `,
})
export class Login01 {
  protected login(value: LoginValue): void {
    // Call your auth API here, then navigate.
    void value
  }

  protected loginWith(provider: 'google' | 'github' | 'apple'): void {
    // Start your OAuth flow here.
    void provider
  }
}
