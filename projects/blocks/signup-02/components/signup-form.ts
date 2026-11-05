import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core'
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms'
import { IV_ALERT_IMPORTS } from '@inlaylab/ivorie/alert'
import { IvButton } from '@inlaylab/ivorie/button'
import { IV_FIELD_IMPORTS } from '@inlaylab/ivorie/field'
import { IV_INPUT_IMPORTS } from '@inlaylab/ivorie/input'

export interface SignupValue {
  name: string
  email: string
  password: string
}

/** The confirm field must equal the password. */
function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const { password, confirm } = group.value as { password: string; confirm: string }
  return confirm && password !== confirm ? { mismatch: true } : null
}

/** Sign-up form. Your app handles `submitted` and `provider`, and sets `pending` and `error`. */
@Component({
  selector: 'app-signup-02-form',
  imports: [ReactiveFormsModule, IV_ALERT_IMPORTS, IvButton, IV_FIELD_IMPORTS, IV_INPUT_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-col gap-6' },
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
      <iv-field-group>
        <div class="flex flex-col items-center gap-1 text-center">
          <h1 class="text-2xl font-bold">Create your account</h1>
          <p class="text-muted-foreground text-sm text-balance">Fill in the form below to create your account</p>
        </div>
            @if (error()) {
              <iv-alert variant="destructive">
                <iv-alert-description>{{ error() }}</iv-alert-description>
              </iv-alert>
            }
            <iv-field [invalid]="show('name')">
              <label ivLabel for="signup-02-name">Full Name</label>
              <input ivInput id="signup-02-name" type="text" autocomplete="name" placeholder="John Doe" class="bg-background" formControlName="name" [attr.aria-invalid]="show('name') || null" [attr.aria-describedby]="show('name') ? 'signup-02-name-error' : null" />
              <iv-field-error id="signup-02-name-error" [message]="message('name')" />
            </iv-field>
            <iv-field [invalid]="show('email')">
              <label ivLabel for="signup-02-email">Email</label>
              <input ivInput id="signup-02-email" type="email" autocomplete="email" placeholder="m@example.com" class="bg-background" formControlName="email" [attr.aria-invalid]="show('email') || null" [attr.aria-describedby]="show('email') ? 'signup-02-email-error' : null" />
              <p ivFieldDescription>We'll use this to contact you. We will not share your email with anyone else.</p>
              <iv-field-error id="signup-02-email-error" [message]="message('email')" />
            </iv-field>
            <iv-field [invalid]="show('password')">
              <label ivLabel for="signup-02-password">Password</label>
              <input ivInput id="signup-02-password" type="password" autocomplete="new-password" class="bg-background" formControlName="password" [attr.aria-invalid]="show('password') || null" [attr.aria-describedby]="show('password') ? 'signup-02-password-error' : null" />
              <p ivFieldDescription>Must be at least 8 characters long.</p>
              <iv-field-error id="signup-02-password-error" [message]="message('password')" />
            </iv-field>
            <iv-field [invalid]="show('confirm')">
              <label ivLabel for="signup-02-confirm">Confirm Password</label>
              <input ivInput id="signup-02-confirm" type="password" autocomplete="new-password" class="bg-background" formControlName="confirm" [attr.aria-invalid]="show('confirm') || null" [attr.aria-describedby]="show('confirm') ? 'signup-02-confirm-error' : null" />
              <p ivFieldDescription>Please confirm your password.</p>
              <iv-field-error id="signup-02-confirm-error" [message]="message('confirm')" />
            </iv-field>
            <iv-field>
              <button ivButton type="submit" [disabled]="pending()">{{ pending() ? 'Creating account…' : 'Create Account' }}</button>
            </iv-field>
            <iv-field-separator>Or continue with</iv-field-separator>
            <iv-field>
              <button ivButton variant="outline" type="button" [disabled]="pending()" (click)="provider.emit('github')">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" fill="currentColor" /></svg>
                Sign up with GitHub
              </button>
            <p ivFieldDescription class="px-6 text-center">Already have an account? <a href="#">Sign in</a></p>
            </iv-field>
      </iv-field-group>
    </form>
  `,
})
export class SignupForm {
  readonly pending = input(false)
  readonly error = input<string | null>(null)
  readonly submitted = output<SignupValue>()
  readonly provider = output<'google' | 'github' | 'apple'>()

  protected readonly form = inject(NonNullableFormBuilder).group(
    {
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirm: ['', Validators.required],
    }, { validators: passwordsMatch },
  )
  private readonly tried = signal(false)

  /** Errors show once a field was left, or after a submit. */
  protected show(name: 'name' | 'email' | 'password' | 'confirm'): boolean {
    const c = this.form.controls[name]
    const bad = c.invalid || (name === 'confirm' && this.form.hasError('mismatch'))
    return bad && (c.touched || this.tried())
  }

  protected message(name: 'name' | 'email' | 'password' | 'confirm'): string {
    if (!this.show(name)) return ''
    const c = this.form.controls[name]
    switch (name) {
      case 'name':
        return 'Enter your name.'
      case 'email':
        return c.hasError('required') ? 'Enter your email.' : 'Enter a valid email.'
      case 'password':
        return c.hasError('required') ? 'Enter a password.' : 'Use at least 8 characters.'
      case 'confirm':
        return c.hasError('required') ? 'Confirm your password.' : 'The passwords do not match.'
    }
  }

  protected submit(): void {
    this.tried.set(true)
    this.form.markAllAsTouched()
    if (this.form.valid && !this.pending()) {
      const v = this.form.getRawValue()
      this.submitted.emit({ name: v.name, email: v.email, password: v.password })
    }
  }
}
