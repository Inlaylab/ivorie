import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { IV_ACCORDION_IMPORTS } from '@ivorie/ui/accordion';

@Component({
  selector: 'demo-accordion-controlled',
  imports: [IV_ACCORDION_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-accordion type="single" [(value)]="open" class="w-96">
      <iv-accordion-item value="profile">
        <iv-accordion-trigger>Profile</iv-accordion-trigger>
        <iv-accordion-content>Manage your name, email and avatar.</iv-accordion-content>
      </iv-accordion-item>
      <iv-accordion-item value="security">
        <iv-accordion-trigger>Security</iv-accordion-trigger>
        <iv-accordion-content>Configure 2FA, sessions and trusted devices.</iv-accordion-content>
      </iv-accordion-item>
    </iv-accordion>
    <p class="mt-3 text-sm text-muted-foreground">Open: {{ open() ?? 'none' }}</p>
  `,
})
export default class AccordionControlledDemo {
  protected readonly open = signal<string | string[] | null>('profile');
}
