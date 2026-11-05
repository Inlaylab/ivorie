import { ChangeDetectionStrategy, Component } from '@angular/core'
import { SignupForm, SignupValue } from './components/signup-form'

export const meta = {
  title: 'Signup 04',
  description: 'A sign-up card with a cover panel and icon buttons for Apple, Google and GitHub.',
}

/** The page. Replace the handlers with your auth calls. */
@Component({
  selector: 'app-signup-04',
  imports: [SignupForm],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10' },
  template: `
    <div class="w-full max-w-sm md:max-w-4xl">
      <app-signup-04-form (submitted)="submit($event)" (provider)="continueWith($event)" />
    </div>
  `,
})
export class Signup04 {
  protected submit(value: SignupValue): void {
    // Call your sign-up API here, then navigate.
    void value
  }

  protected continueWith(provider: 'google' | 'github' | 'apple'): void {
    // Start your OAuth flow here.
    void provider
  }
}
