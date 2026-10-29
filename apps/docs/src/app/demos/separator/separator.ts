import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IvSeparator } from '@ivorie/ui/separator';

@Component({
  selector: 'demo-separator',
  imports: [IvSeparator],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full max-w-sm space-y-3">
      <div>
        <h4 class="text-sm font-medium">Ivorie</h4>
        <p class="text-sm text-muted-foreground">An Angular UI library.</p>
      </div>
      <iv-separator />
      <p class="text-sm">Copy in what you need.</p>
    </div>
  `,
})
export default class SeparatorDemo {}
