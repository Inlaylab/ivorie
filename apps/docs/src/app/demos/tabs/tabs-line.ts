import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IV_TABS_IMPORTS } from '@inlaylab/ivorie/tabs';

@Component({
  selector: 'demo-tabs-line',
  imports: [IV_TABS_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-tabs defaultValue="overview" class="w-96">
      <iv-tabs-list variant="line">
        <iv-tabs-trigger value="overview">Overview</iv-tabs-trigger>
        <iv-tabs-trigger value="analytics">Analytics</iv-tabs-trigger>
        <iv-tabs-trigger value="reports">Reports</iv-tabs-trigger>
      </iv-tabs-list>
      <iv-tabs-content value="overview">Overview panel</iv-tabs-content>
      <iv-tabs-content value="analytics">Analytics panel</iv-tabs-content>
      <iv-tabs-content value="reports">Reports panel</iv-tabs-content>
    </iv-tabs>
  `,
})
export default class TabsLineDemo {}
