import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IvToggle } from '@inlaylab/ivorie/toggle';
import { LucideUnderline } from '@lucide/angular';

@Component({
  selector: 'demo-toggle-disabled',
  imports: [IvToggle, LucideUnderline],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col items-center gap-3">
      <button ivToggle disabled aria-label="Toggle underline"><svg lucideUnderline aria-hidden="true"></svg></button>
      <p class="text-muted-foreground text-sm">Underline is unavailable.</p>
    </div>
  `,
})
export default class ToggleDisabledDemo {}
