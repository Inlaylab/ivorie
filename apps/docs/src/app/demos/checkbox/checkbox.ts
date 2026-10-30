import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { IvCheckbox } from '@inlaylab/ivorie/checkbox';

@Component({
  selector: 'demo-checkbox',
  imports: [IvCheckbox],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex w-full max-w-sm flex-col gap-4 text-sm">
      <div class="flex items-start gap-3">
        <iv-checkbox id="cb-terms" [(checked)]="terms" class="mt-0.5" />
        <div class="grid gap-1">
          <label for="cb-terms" class="cursor-pointer font-medium">Accept terms and conditions</label>
          <p class="text-muted-foreground">You agree to our Terms of Service and Privacy Policy.</p>
        </div>
      </div>
      <div class="flex items-start gap-3">
        <iv-checkbox id="cb-activity" [(checked)]="activity" class="mt-0.5" />
        <div class="grid gap-1">
          <label for="cb-activity" class="cursor-pointer font-medium">Account activity</label>
          <p class="text-muted-foreground">Get notified about sign-ins and security changes.</p>
        </div>
      </div>
      <div class="flex items-start gap-3">
        <iv-checkbox id="cb-marketing" [(checked)]="marketing" class="mt-0.5" />
        <div class="grid gap-1">
          <label for="cb-marketing" class="cursor-pointer font-medium">Marketing emails</label>
          <p class="text-muted-foreground">New features, product updates and occasional offers.</p>
        </div>
      </div>
    </div>
  `,
})
export default class CheckboxDemo {
  protected readonly terms = signal(false);
  protected readonly activity = signal(true);
  protected readonly marketing = signal(false);
}
