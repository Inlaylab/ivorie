import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IvButton } from '@inlaylab/ivorie/button';
import { IV_CARD_IMPORTS } from '@inlaylab/ivorie/card';
import { IvCheckbox } from '@inlaylab/ivorie/checkbox';
import { IV_FIELD_IMPORTS } from '@inlaylab/ivorie/field';
import { IV_INPUT_IMPORTS } from '@inlaylab/ivorie/input';
import { IV_INPUT_OTP_IMPORTS } from '@inlaylab/ivorie/input-otp';

/** Playground scene: a sign-in card and the one-time code step after it. */
@Component({
  selector: 'docs-scene-sign-in',
  imports: [IvButton, IV_CARD_IMPORTS, IvCheckbox, IV_FIELD_IMPORTS, IV_INPUT_IMPORTS, IV_INPUT_OTP_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: '@container block' },
  template: `
    <div class="mx-auto grid max-w-4xl items-start gap-4 @3xl:grid-cols-2">
      <iv-card>
        <iv-card-header>
          <iv-card-title class="cn-font-heading text-xl">Sign in to Acme</iv-card-title>
          <iv-card-description>Use your work email or a connected account.</iv-card-description>
        </iv-card-header>
        <iv-card-content>
          <iv-field-group>
            <div class="grid grid-cols-2 gap-2">
              <button ivButton variant="outline">GitHub</button>
              <button ivButton variant="outline">Google</button>
            </div>
            <iv-field-separator>Or with email</iv-field-separator>
            <iv-field>
              <label ivLabel for="sc-email">Email</label>
              <input ivInput id="sc-email" type="email" placeholder="you@acme.dev" />
            </iv-field>
            <iv-field>
              <div class="flex items-center justify-between">
                <label ivLabel for="sc-password">Password</label>
                <button type="button" class="text-muted-foreground hover:text-foreground text-sm underline-offset-4 hover:underline">Forgot password?</button>
              </div>
              <input ivInput id="sc-password" type="password" value="correct-horse" />
            </iv-field>
            <label class="flex items-center gap-2 text-sm"><iv-checkbox [checked]="true" /> Keep me signed in</label>
            <button ivButton class="w-full">Sign in</button>
          </iv-field-group>
        </iv-card-content>
        <iv-card-footer class="text-muted-foreground justify-center gap-1 text-sm">
          No account yet?
          <button type="button" class="text-foreground font-medium underline-offset-4 hover:underline">Create one</button>
        </iv-card-footer>
      </iv-card>

      <iv-card>
        <iv-card-header>
          <iv-card-title class="cn-font-heading text-xl">Check your email</iv-card-title>
          <iv-card-description>We sent a 6-digit code to ada&#64;acme.dev. It expires in 10 minutes.</iv-card-description>
        </iv-card-header>
        <iv-card-content class="flex flex-col items-center gap-4">
          <iv-input-otp maxLength="6" aria-label="One-time code">
            <iv-input-otp-group>
              <iv-input-otp-slot index="0" />
              <iv-input-otp-slot index="1" />
              <iv-input-otp-slot index="2" />
            </iv-input-otp-group>
            <iv-input-otp-separator />
            <iv-input-otp-group>
              <iv-input-otp-slot index="3" />
              <iv-input-otp-slot index="4" />
              <iv-input-otp-slot index="5" />
            </iv-input-otp-group>
          </iv-input-otp>
          <p class="text-muted-foreground text-sm">
            Did not get it?
            <button type="button" class="text-foreground font-medium underline-offset-4 hover:underline">Send again</button>
          </p>
        </iv-card-content>
        <iv-card-footer class="gap-2">
          <button ivButton variant="ghost" class="flex-1">Back</button>
          <button ivButton class="flex-1">Verify</button>
        </iv-card-footer>
      </iv-card>
    </div>
  `,
})
export class SceneSignIn {}
