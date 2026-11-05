import { ChangeDetectionStrategy, Component } from '@angular/core'
import { LoginForm, LoginValue } from './components/login-form'

export const meta = {
  title: 'Login 04',
  description: 'A login card with a cover panel and icon buttons for Apple, Google and GitHub.',
}

/** The page. Replace the handlers with your auth calls. */
@Component({
  selector: 'app-login-04',
  imports: [LoginForm],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10' },
  template: `
    <div class="w-full max-w-sm md:max-w-4xl">
      <app-login-04-form (submitted)="submit($event)" (provider)="continueWith($event)" />
    </div>
  `,
})
export class Login04 {
  protected submit(value: LoginValue): void {
    // Call your login API here, then navigate.
    void value
  }

  protected continueWith(provider: 'google' | 'github' | 'apple'): void {
    // Start your OAuth flow here.
    void provider
  }
}
