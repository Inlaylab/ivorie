import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core'
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms'
import { IV_ALERT_IMPORTS } from '@inlaylab/ivorie/alert'
import { IvButton } from '@inlaylab/ivorie/button'
import { IV_CARD_IMPORTS } from '@inlaylab/ivorie/card'
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
  selector: 'app-signup-03-form',
  imports: [ReactiveFormsModule, IV_ALERT_IMPORTS, IvButton, IV_CARD_IMPORTS, IV_FIELD_IMPORTS, IV_INPUT_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-col gap-6' },
  template: `
    <iv-card>
      <iv-card-header class="text-center">
        <iv-card-title class="text-xl">Create your account</iv-card-title>
        <iv-card-description>Enter your email below to create your account</iv-card-description>
      </iv-card-header>
      <iv-card-content>
        <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <iv-field-group>
            @if (error()) {
              <iv-alert variant="destructive">
                <iv-alert-description>{{ error() }}</iv-alert-description>
              </iv-alert>
            }
            <iv-field [invalid]="show('name')">
              <label ivLabel for="signup-03-name">Full Name</label>
              <input ivInput id="signup-03-name" type="text" autocomplete="name" placeholder="John Doe" formControlName="name" [attr.aria-invalid]="show('name') || null" [attr.aria-describedby]="show('name') ? 'signup-03-name-error' : null" />
              <iv-field-error id="signup-03-name-error" [message]="message('name')" />
            </iv-field>
            <iv-field [invalid]="show('email')">
              <label ivLabel for="signup-03-email">Email</label>
              <input ivInput id="signup-03-email" type="email" autocomplete="email" placeholder="m@example.com" formControlName="email" [attr.aria-invalid]="show('email') || null" [attr.aria-describedby]="show('email') ? 'signup-03-email-error' : null" />
              <iv-field-error id="signup-03-email-error" [message]="message('email')" />
            </iv-field>
            <div class="grid grid-cols-2 gap-4">
              <iv-field [invalid]="show('password')">
              <label ivLabel for="signup-03-password">Password</label>
              <input ivInput id="signup-03-password" type="password" autocomplete="new-password" formControlName="password" [attr.aria-invalid]="show('password') || null" [attr.aria-describedby]="show('password') ? 'signup-03-password-error' : null" />
              <iv-field-error id="signup-03-password-error" [message]="message('password')" />
            </iv-field>
              <iv-field [invalid]="show('confirm')">
              <label ivLabel for="signup-03-confirm">Confirm Password</label>
              <input ivInput id="signup-03-confirm" type="password" autocomplete="new-password" formControlName="confirm" [attr.aria-invalid]="show('confirm') || null" [attr.aria-describedby]="show('confirm') ? 'signup-03-confirm-error' : null" />
              <iv-field-error id="signup-03-confirm-error" [message]="message('confirm')" />
            </iv-field>
            </div>
            <p ivFieldDescription>Must be at least 8 characters long.</p>
            <iv-field>
              <button ivButton type="submit" [disabled]="pending()">{{ pending() ? 'Creating account…' : 'Create Account' }}</button>
              <p ivFieldDescription class="text-center">Already have an account? <a href="#">Sign in</a></p>
            </iv-field>
          </iv-field-group>
        </form>
      </iv-card-content>
    </iv-card>
    <p ivFieldDescription class="px-6 text-center">By clicking continue, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.</p>
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
