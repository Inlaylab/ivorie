import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IV_INPUT_OTP_IMPORTS } from '@inlaylab/ivorie/input-otp';

@Component({
  selector: 'demo-input-otp',
  imports: [IV_INPUT_OTP_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
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
  `,
})
export default class InputOtpDemo {}
