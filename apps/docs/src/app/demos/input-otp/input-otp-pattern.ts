import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { IV_INPUT_OTP_IMPORTS, REGEXP_ONLY_DIGITS } from '@inlaylab/ivorie/input-otp';

@Component({
  selector: 'demo-input-otp-pattern',
  imports: [IV_INPUT_OTP_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col items-center gap-2">
      <iv-input-otp maxLength="4" aria-label="PIN" [pattern]="digits" (complete)="done.set($event)">
        <iv-input-otp-group>
          <iv-input-otp-slot index="0" />
          <iv-input-otp-slot index="1" />
          <iv-input-otp-slot index="2" />
          <iv-input-otp-slot index="3" />
        </iv-input-otp-group>
      </iv-input-otp>
      <p class="text-muted-foreground text-sm">{{ done() ? 'Entered ' + done() : 'Digits only.' }}</p>
    </div>
  `,
})
export default class InputOtpPatternDemo {
  readonly digits = REGEXP_ONLY_DIGITS;
  readonly done = signal('');
}
