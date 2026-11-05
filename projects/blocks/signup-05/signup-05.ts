import { ChangeDetectionStrategy, Component } from '@angular/core'
import { SignupForm, SignupValue } from './components/signup-form'

export const meta = {
  title: 'Signup 05',
  description: 'An email-only sign-up with Apple and Google, and the logo on top.',
}

/** The page. Replace the handlers with your auth calls. */
@Component({
  selector: 'app-signup-05',
  imports: [SignupForm],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10' },
  template: `
    <div class="w-full max-w-sm">
      <app-signup-05-form (submitted)="submit($event)" (provider)="continueWith($event)" />
    </div>
  `,
})
export class Signup05 {
  protected submit(value: SignupValue): void {
    // Call your sign-up API here, then navigate.
    void value
  }

  protected continueWith(provider: 'google' | 'github' | 'apple'): void {
    // Start your OAuth flow here.
    void provider
  }
}
