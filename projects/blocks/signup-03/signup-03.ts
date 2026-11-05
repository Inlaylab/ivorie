import { ChangeDetectionStrategy, Component } from '@angular/core'
import { NgIcon } from '@ng-icons/core'
import { lucideGalleryVerticalEnd } from '@ng-icons/lucide'
import { SignupForm, SignupValue } from './components/signup-form'

export const meta = {
  title: 'Signup 03',
  description: 'A sign-up card on a muted page, with the passwords side by side.',
}

/** The page. Replace the handlers with your auth calls. */
@Component({
  selector: 'app-signup-03',
  imports: [SignupForm, NgIcon],
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
      <app-signup-03-form (submitted)="submit($event)" (provider)="continueWith($event)" />
    </div>
  `,
})
export class Signup03 {
  protected readonly logo = lucideGalleryVerticalEnd

  protected submit(value: SignupValue): void {
    // Call your sign-up API here, then navigate.
    void value
  }

  protected continueWith(provider: 'google' | 'github' | 'apple'): void {
    // Start your OAuth flow here.
    void provider
  }
}
