import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core'
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms'
import { IV_ALERT_IMPORTS } from '@inlaylab/ivorie/alert'
import { IvButton } from '@inlaylab/ivorie/button'
import { IV_CARD_IMPORTS } from '@inlaylab/ivorie/card'
import { IV_FIELD_IMPORTS } from '@inlaylab/ivorie/field'
import { IV_INPUT_IMPORTS } from '@inlaylab/ivorie/input'

export interface SignupValue {
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
  selector: 'app-signup-04-form',
  imports: [ReactiveFormsModule, IV_ALERT_IMPORTS, IvButton, IV_CARD_IMPORTS, IV_FIELD_IMPORTS, IV_INPUT_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-col gap-6' },
  template: `
    <iv-card class="overflow-hidden p-0">
      <iv-card-content class="grid p-0 md:grid-cols-2">
        <form class="p-6 md:p-8" [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <iv-field-group>
            <div class="flex flex-col items-center gap-2 text-center">
              <h1 class="text-2xl font-bold">Create your account</h1>
              <p class="text-muted-foreground text-balance">Enter your email below to create your account</p>
            </div>
            @if (error()) {
              <iv-alert variant="destructive">
                <iv-alert-description>{{ error() }}</iv-alert-description>
              </iv-alert>
            }
            <iv-field [invalid]="show('email')">
              <label ivLabel for="signup-04-email">Email</label>
              <input ivInput id="signup-04-email" type="email" autocomplete="email" placeholder="m@example.com" formControlName="email" [attr.aria-invalid]="show('email') || null" [attr.aria-describedby]="show('email') ? 'signup-04-email-error' : null" />
              <p ivFieldDescription>We'll use this to contact you. We will not share your email with anyone else.</p>
              <iv-field-error id="signup-04-email-error" [message]="message('email')" />
            </iv-field>
            <div class="grid grid-cols-2 gap-4">
              <iv-field [invalid]="show('password')">
              <label ivLabel for="signup-04-password">Password</label>
              <input ivInput id="signup-04-password" type="password" autocomplete="new-password" formControlName="password" [attr.aria-invalid]="show('password') || null" [attr.aria-describedby]="show('password') ? 'signup-04-password-error' : null" />
              <iv-field-error id="signup-04-password-error" [message]="message('password')" />
            </iv-field>
              <iv-field [invalid]="show('confirm')">
              <label ivLabel for="signup-04-confirm">Confirm Password</label>
              <input ivInput id="signup-04-confirm" type="password" autocomplete="new-password" formControlName="confirm" [attr.aria-invalid]="show('confirm') || null" [attr.aria-describedby]="show('confirm') ? 'signup-04-confirm-error' : null" />
              <iv-field-error id="signup-04-confirm-error" [message]="message('confirm')" />
            </iv-field>
            </div>
            <p ivFieldDescription>Must be at least 8 characters long.</p>
            <iv-field>
              <button ivButton type="submit" [disabled]="pending()">{{ pending() ? 'Creating account…' : 'Create Account' }}</button>
            </iv-field>
            <iv-field-separator class="*:data-[slot=field-separator-content]:bg-card">Or continue with</iv-field-separator>
            <iv-field class="grid grid-cols-3 gap-4">
              <button ivButton variant="outline" type="button" [disabled]="pending()" (click)="provider.emit('apple')">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" fill="currentColor" /></svg>
                <span class="sr-only">Sign up with Apple</span>
              </button>
              <button ivButton variant="outline" type="button" [disabled]="pending()" (click)="provider.emit('google')">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" fill="currentColor" /></svg>
                <span class="sr-only">Sign up with Google</span>
              </button>
              <button ivButton variant="outline" type="button" [disabled]="pending()" (click)="provider.emit('github')">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" fill="currentColor" /></svg>
                <span class="sr-only">Sign up with GitHub</span>
              </button>
            </iv-field>
            <p ivFieldDescription class="text-center">Already have an account? <a href="#">Sign in</a></p>
          </iv-field-group>
        </form>
        <div class="bg-muted relative hidden md:block" aria-hidden="true">
        <!-- Swap this for your own image. Inline, so "ivorie add" needs no asset file. -->
        <svg class="text-foreground/10 absolute inset-0 size-full">
          <defs>
            <pattern id="signup-04-grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M32 0H0V32" fill="none" stroke="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#signup-04-grid)" />
        </svg>
        <div class="from-primary/15 absolute inset-0 bg-radial-[at_30%_30%] to-transparent to-70%"></div>
      </div>
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
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirm: ['', Validators.required],
    }, { validators: passwordsMatch },
  )
  private readonly tried = signal(false)

  /** Errors show once a field was left, or after a submit. */
  protected show(name: 'email' | 'password' | 'confirm'): boolean {
    const c = this.form.controls[name]
    const bad = c.invalid || (name === 'confirm' && this.form.hasError('mismatch'))
    return bad && (c.touched || this.tried())
  }

  protected message(name: 'email' | 'password' | 'confirm'): string {
    if (!this.show(name)) return ''
    const c = this.form.controls[name]
    switch (name) {
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
      this.submitted.emit({ email: v.email, password: v.password })
    }
  }
}
