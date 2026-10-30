import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideChevronRight } from '@lucide/angular';
import { IV_COLLAPSIBLE_IMPORTS } from '@ivorie/ui/collapsible';

@Component({
  selector: 'demo-collapsible-open-by-default',
  imports: [IV_COLLAPSIBLE_IMPORTS, LucideChevronRight],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-collapsible [(open)]="open" class="w-80">
      <button ivCollapsibleTrigger class="group flex items-center gap-2 text-sm font-medium">
        Details
        <svg lucideChevronRight class="size-4 transition-transform group-data-[state=open]:rotate-90"></svg>
      </button>
      <iv-collapsible-content>
        <p class="pt-2 text-sm text-muted-foreground">Hidden content.</p>
      </iv-collapsible-content>
    </iv-collapsible>
  `,
})
export default class CollapsibleOpenByDefaultDemo {
  protected readonly open = signal(true);
}
