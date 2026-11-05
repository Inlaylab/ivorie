import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core'
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'
import { IV_ALERT_IMPORTS } from '@inlaylab/ivorie/alert'
import { IvButton } from '@inlaylab/ivorie/button'
import { IV_FIELD_IMPORTS } from '@inlaylab/ivorie/field'
import { IV_INPUT_IMPORTS } from '@inlaylab/ivorie/input'

export interface LoginValue {
  email: string
  password: string
}

/** Login form. Your app handles `submitted` and `provider`, and sets `pending` and `error`. */
@Component({
  selector: 'app-login-02-form',
  imports: [ReactiveFormsModule, IV_ALERT_IMPORTS, IvButton, IV_FIELD_IMPORTS, IV_INPUT_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-col gap-6' },
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
      <iv-field-group>
        <div class="flex flex-col items-center gap-1 text-center">
          <h1 class="text-2xl font-bold">Login to your account</h1>
          <p class="text-muted-foreground text-sm text-balance">Enter your email below to login to your account</p>
        </div>
            @if (error()) {
              <iv-alert variant="destructive">
                <iv-alert-description>{{ error() }}</iv-alert-description>
              </iv-alert>
            }
            <iv-field [invalid]="show('email')">
              <label ivLabel for="login-02-email">Email</label>
              <input ivInput id="login-02-email" type="email" autocomplete="email" placeholder="m@example.com" class="bg-background" formControlName="email" [attr.aria-invalid]="show('email') || null" [attr.aria-describedby]="show('email') ? 'login-02-email-error' : null" />
              <iv-field-error id="login-02-email-error" [message]="message('email')" />
            </iv-field>
            <iv-field [invalid]="show('password')">
              <div class="flex items-center">
                <label ivLabel for="login-02-password">Password</label>
                <a href="#" class="ml-auto text-sm underline-offset-4 hover:underline">Forgot your password?</a>
              </div>
              <input ivInput id="login-02-password" type="password" autocomplete="current-password" class="bg-background" formControlName="password" [attr.aria-invalid]="show('password') || null" [attr.aria-describedby]="show('password') ? 'login-02-password-error' : null" />
              <iv-field-error id="login-02-password-error" [message]="message('password')" />
            </iv-field>
            <iv-field>
              <button ivButton type="submit" [disabled]="pending()">{{ pending() ? 'Logging in…' : 'Login' }}</button>
            </iv-field>
            <iv-field-separator>Or continue with</iv-field-separator>
            <iv-field>
              <button ivButton variant="outline" type="button" [disabled]="pending()" (click)="provider.emit('github')">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" fill="currentColor" /></svg>
                Login with GitHub
              </button>
            <p ivFieldDescription class="text-center">Don't have an account? <a href="#">Sign up</a></p>
            </iv-field>
      </iv-field-group>
    </form>
  `,
})
export class LoginForm {
  readonly pending = input(false)
  readonly error = input<string | null>(null)
  readonly submitted = output<LoginValue>()
  readonly provider = output<'google' | 'github' | 'apple'>()

  protected readonly form = inject(NonNullableFormBuilder).group(
    {
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    },
  )
  private readonly tried = signal(false)

  /** Errors show once a field was left, or after a submit. */
  protected show(name: 'email' | 'password'): boolean {
    const c = this.form.controls[name]
    return c.invalid && (c.touched || this.tried())
  }

  protected message(name: 'email' | 'password'): string {
    if (!this.show(name)) return ''
    const c = this.form.controls[name]
    switch (name) {
      case 'email':
        return c.hasError('required') ? 'Enter your email.' : 'Enter a valid email.'
      case 'password':
        return 'Enter your password.'
    }
  }

  protected submit(): void {
    this.tried.set(true)
    this.form.markAllAsTouched()
    if (this.form.valid && !this.pending()) this.submitted.emit(this.form.getRawValue())
  }
}
