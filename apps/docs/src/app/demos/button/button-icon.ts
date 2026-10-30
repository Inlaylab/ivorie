import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IvButton } from '@ivorie/ui/button';
import { LucideArrowRight } from '@lucide/angular';

@Component({
  selector: 'demo-button-icon',
  imports: [IvButton, LucideArrowRight],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-wrap items-center gap-2">
      <button ivButton variant="outline" size="icon" aria-label="Next">
        <svg lucideArrowRight></svg>
      </button>
      <button ivButton>
        Continue
        <svg lucideArrowRight></svg>
      </button>
    </div>
  `,
})
export default class ButtonIconDemo {}
