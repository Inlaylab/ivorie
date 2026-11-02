import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IvToggle } from '@inlaylab/ivorie/toggle';
import { LucideUnderline } from '@lucide/angular';

@Component({
  selector: 'demo-toggle-disabled',
  imports: [IvToggle, LucideUnderline],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button ivToggle disabled aria-label="Toggle underline"><svg lucideUnderline aria-hidden="true"></svg></button>
  `,
})
export default class ToggleDisabledDemo {}
