import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IV_ACCORDION_IMPORTS } from '@ivorie/ui/accordion';

@Component({
  selector: 'demo-accordion',
  imports: [IV_ACCORDION_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-accordion type="single" class="w-96">
      <iv-accordion-item value="profile">
        <iv-accordion-trigger>Profile</iv-accordion-trigger>
        <iv-accordion-content>Manage your name, email and avatar.</iv-accordion-content>
      </iv-accordion-item>
      <iv-accordion-item value="security">
        <iv-accordion-trigger>Security</iv-accordion-trigger>
        <iv-accordion-content>Configure 2FA, sessions and trusted devices.</iv-accordion-content>
      </iv-accordion-item>
    </iv-accordion>
  `,
})
export default class AccordionDemo {}
