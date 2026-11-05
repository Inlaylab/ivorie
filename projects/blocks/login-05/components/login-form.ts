import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core'
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'
import { NgIcon } from '@ng-icons/core'
import { lucideGalleryVerticalEnd } from '@ng-icons/lucide'
import { IV_ALERT_IMPORTS } from '@inlaylab/ivorie/alert'
import { IvButton } from '@inlaylab/ivorie/button'
import { IV_FIELD_IMPORTS } from '@inlaylab/ivorie/field'
import { IV_INPUT_IMPORTS } from '@inlaylab/ivorie/input'

export interface LoginValue {
  email: string
}

/** Login form. Your app handles `submitted` and `provider`, and sets `pending` and `error`. */
@Component({
  selector: 'app-login-05-form',
  imports: [ReactiveFormsModule, IV_ALERT_IMPORTS, IvButton, IV_FIELD_IMPORTS, IV_INPUT_IMPORTS, NgIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-col gap-6' },
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
      <iv-field-group>
        <div class="flex flex-col items-center gap-2 text-center">
          <a href="#" class="flex flex-col items-center gap-2 font-medium">
            <span class="flex size-8 items-center justify-center rounded-md">
              <ng-icon [svg]="logo" size="24" />
            </span>
            <span class="sr-only">Acme Inc.</span>
          </a>
          <h1 class="text-xl font-bold">Welcome to Acme Inc.</h1>
          <p ivFieldDescription>Don't have an account? <a href="#">Sign up</a></p>
        </div>
            @if (error()) {
              <iv-alert variant="destructive">
                <iv-alert-description>{{ error() }}</iv-alert-description>
              </iv-alert>
            }
            <iv-field [invalid]="show('email')">
              <label ivLabel for="login-05-email">Email</label>
              <input ivInput id="login-05-email" type="email" autocomplete="email" placeholder="m@example.com" formControlName="email" [attr.aria-invalid]="show('email') || null" [attr.aria-describedby]="show('email') ? 'login-05-email-error' : null" />
              <iv-field-error id="login-05-email-error" [message]="message('email')" />
            </iv-field>
            <iv-field>
              <button ivButton type="submit" [disabled]="pending()">{{ pending() ? 'Logging in…' : 'Login' }}</button>
            </iv-field>
            <iv-field-separator>Or</iv-field-separator>
            <iv-field class="grid gap-4 sm:grid-cols-2">
              <button ivButton variant="outline" type="button" [disabled]="pending()" (click)="provider.emit('apple')">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" fill="currentColor" /></svg>
                Continue with Apple
              </button>
              <button ivButton variant="outline" type="button" [disabled]="pending()" (click)="provider.emit('google')">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" fill="currentColor" /></svg>
                Continue with Google
              </button>
            </iv-field>
      </iv-field-group>
    </form>
    <p ivFieldDescription class="px-6 text-center">By clicking continue, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.</p>
  `,
})
export class LoginForm {
  readonly pending = input(false)
  readonly error = input<string | null>(null)
  readonly submitted = output<LoginValue>()
  readonly provider = output<'google' | 'github' | 'apple'>()
  protected readonly logo = lucideGalleryVerticalEnd

  protected readonly form = inject(NonNullableFormBuilder).group(
    {
    email: ['', [Validators.required, Validators.email]],
    },
  )
  private readonly tried = signal(false)

  /** Errors show once a field was left, or after a submit. */
  protected show(name: 'email'): boolean {
    const c = this.form.controls[name]
    return c.invalid && (c.touched || this.tried())
  }

  protected message(name: 'email'): string {
    if (!this.show(name)) return ''
    const c = this.form.controls[name]
    switch (name) {
      case 'email':
        return c.hasError('required') ? 'Enter your email.' : 'Enter a valid email.'
    }
  }

  protected submit(): void {
    this.tried.set(true)
    this.form.markAllAsTouched()
    if (this.form.valid && !this.pending()) this.submitted.emit(this.form.getRawValue())
  }
}
