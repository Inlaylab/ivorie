import { ChangeDetectionStrategy, Component } from '@angular/core'
import { SignupForm, SignupValue } from './components/signup-form'

export const meta = {
  title: 'Signup 01',
  description: 'A sign-up card with name, email, password and a Google button.',
}

/** The page. Replace the handlers with your auth calls. */
@Component({
  selector: 'app-signup-01',
  imports: [SignupForm],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex min-h-svh w-full items-center justify-center p-6 md:p-10' },
  template: `
    <div class="w-full max-w-sm">
      <app-signup-01-form (submitted)="submit($event)" (provider)="continueWith($event)" />
    </div>
  `,
})
export class Signup01 {
  protected submit(value: SignupValue): void {
    // Call your sign-up API here, then navigate.
    void value
  }

  protected continueWith(provider: 'google' | 'github' | 'apple'): void {
    // Start your OAuth flow here.
    void provider
  }
}
