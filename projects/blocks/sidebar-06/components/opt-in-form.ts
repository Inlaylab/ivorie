import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core'
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'
import { IvButton } from '@inlaylab/ivorie/button'
import { IV_CARD_IMPORTS } from '@inlaylab/ivorie/card'
import { IV_INPUT_IMPORTS } from '@inlaylab/ivorie/input'

/** A newsletter sign-up card for the sidebar footer. Send `email` to your list in `subscribe()`. */
@Component({
  selector: 'app-sidebar-06-opt-in-form',
  imports: [ReactiveFormsModule, IvButton, IV_CARD_IMPORTS, IV_INPUT_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-card class="gap-2 py-4 shadow-none">
      <iv-card-header class="px-4">
        <iv-card-title class="text-sm">Subscribe to our newsletter</iv-card-title>
        <iv-card-description>Opt-in to receive updates and news about the sidebar.</iv-card-description>
      </iv-card-header>
      <iv-card-content class="px-4">
        @if (done()) {
          <p class="text-sm" role="status">Thanks. Check your inbox.</p>
        } @else {
          <form class="grid gap-2.5" [formGroup]="form" (ngSubmit)="subscribe()">
            <label ivLabel for="sidebar-06-opt-in" class="sr-only">Email</label>
            <input ivInput id="sidebar-06-opt-in" type="email" placeholder="Email" autocomplete="email" formControlName="email" class="bg-background h-8 shadow-none" />
            <button ivButton type="submit" size="sm" class="bg-sidebar-primary text-sidebar-primary-foreground w-full shadow-none">Subscribe</button>
          </form>
        }
      </iv-card-content>
    </iv-card>
  `,
})
export class OptInForm {
  protected readonly form = inject(NonNullableFormBuilder).group({ email: ['', [Validators.required, Validators.email]] })
  protected readonly done = signal(false)

  protected subscribe(): void {
    this.form.markAllAsTouched()
    if (this.form.valid) this.done.set(true)
  }
}
