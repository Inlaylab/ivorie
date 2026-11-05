import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core'
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'
import { IV_ALERT_IMPORTS } from '@inlaylab/ivorie/alert'
import { IvButton } from '@inlaylab/ivorie/button'
import { IV_CARD_IMPORTS } from '@inlaylab/ivorie/card'
import { IV_FIELD_IMPORTS } from '@inlaylab/ivorie/field'
import { IV_INPUT_IMPORTS } from '@inlaylab/ivorie/input'

export interface LoginValue {
  email: string
  password: string
}

/** Email and password login in a card. Your app handles `submitted` and `provider`, and sets `pending` and `error`. */
@Component({
  selector: 'app-login-01-form',
  imports: [ReactiveFormsModule, IV_ALERT_IMPORTS, IvButton, IV_CARD_IMPORTS, IV_FIELD_IMPORTS, IV_INPUT_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-col gap-6' },
  template: `
    <iv-card>
      <iv-card-header>
        <iv-card-title>Login to your account</iv-card-title>
        <iv-card-description>Enter your email below to login to your account</iv-card-description>
      </iv-card-header>
      <iv-card-content>
        <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <iv-field-group>
            @if (error()) {
              <iv-alert variant="destructive">
                <iv-alert-description>{{ error() }}</iv-alert-description>
              </iv-alert>
            }
            <iv-field [invalid]="show('email')">
              <label ivLabel for="login-01-email">Email</label>
              <input ivInput id="login-01-email" type="email" autocomplete="email" placeholder="m@example.com" formControlName="email" [attr.aria-invalid]="show('email') || null" [attr.aria-describedby]="show('email') ? 'login-01-email-error' : null" />
              <iv-field-error id="login-01-email-error" [message]="show('email') ? (form.controls.email.hasError('required') ? 'Enter your email.' : 'Enter a valid email.') : ''" />
            </iv-field>
            <iv-field [invalid]="show('password')">
              <div class="flex items-center">
                <label ivLabel for="login-01-password">Password</label>
                <a href="#" class="ml-auto inline-block text-sm underline-offset-4 hover:underline">Forgot your password?</a>
              </div>
              <input ivInput id="login-01-password" type="password" autocomplete="current-password" formControlName="password" [attr.aria-invalid]="show('password') || null" [attr.aria-describedby]="show('password') ? 'login-01-password-error' : null" />
              <iv-field-error id="login-01-password-error" [message]="show('password') ? 'Enter your password.' : ''" />
            </iv-field>
            <iv-field>
              <button ivButton type="submit" [disabled]="pending()">{{ pending() ? 'Logging in…' : 'Login' }}</button>
              <button ivButton variant="outline" type="button" [disabled]="pending()" (click)="provider.emit('google')">Login with Google</button>
              <p ivFieldDescription class="text-center">Don't have an account? <a href="#">Sign up</a></p>
            </iv-field>
          </iv-field-group>
        </form>
      </iv-card-content>
    </iv-card>
  `,
})
export class LoginForm {
  readonly pending = input(false)
  readonly error = input<string | null>(null)
  readonly submitted = output<LoginValue>()
  readonly provider = output<'google' | 'github' | 'apple'>()

  protected readonly form = inject(NonNullableFormBuilder).group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  })
  private readonly tried = signal(false)

  /** Errors show once a field was left, or after a submit. */
  protected show(name: keyof LoginValue): boolean {
    const control = this.form.controls[name]
    return control.invalid && (control.touched || this.tried())
  }

  protected submit(): void {
    this.tried.set(true)
    this.form.markAllAsTouched()
    if (this.form.valid && !this.pending()) this.submitted.emit(this.form.getRawValue())
  }
}
