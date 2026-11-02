import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { IV_INPUT_OTP_IMPORTS } from '@inlaylab/ivorie/input-otp';

@Component({
  selector: 'demo-input-otp-reactive-forms',
  imports: [IV_INPUT_OTP_IMPORTS, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col items-center gap-2">
      <iv-input-otp maxLength="6" aria-label="Verification code" [formControl]="code">
        <iv-input-otp-group>
          @for (i of slots; track i) {
            <iv-input-otp-slot [index]="i" />
          }
        </iv-input-otp-group>
      </iv-input-otp>
      <p class="text-muted-foreground text-sm">Value: "{{ code.value }}" · {{ code.valid ? 'valid' : 'invalid' }}</p>
    </div>
  `,
})
export default class InputOtpReactiveFormsDemo {
  readonly slots = [0, 1, 2, 3, 4, 5];
  readonly code = new FormControl('', [Validators.required, Validators.minLength(6)]);
}
