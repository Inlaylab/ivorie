import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IV_TABS_IMPORTS } from '@ivorie/ui/tabs';

@Component({
  selector: 'demo-tabs-disabled',
  imports: [IV_TABS_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-tabs defaultValue="stable" class="w-80">
      <iv-tabs-list>
        <iv-tabs-trigger value="stable">Stable</iv-tabs-trigger>
        <iv-tabs-trigger value="beta" [disabled]="true">Beta</iv-tabs-trigger>
      </iv-tabs-list>
      <iv-tabs-content value="stable">Stable panel</iv-tabs-content>
      <iv-tabs-content value="beta">Beta panel</iv-tabs-content>
    </iv-tabs>
  `,
})
export default class TabsDisabledDemo {}
