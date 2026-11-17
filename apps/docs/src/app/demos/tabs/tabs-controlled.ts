import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { IV_TABS_IMPORTS } from '@inlaylab/ivorie/tabs';

@Component({
  selector: 'demo-tabs-controlled',
  imports: [IV_TABS_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-tabs [(value)]="active" class="w-80">
      <iv-tabs-list>
        <iv-tabs-trigger value="a">Overview</iv-tabs-trigger>
        <iv-tabs-trigger value="b">Activity</iv-tabs-trigger>
      </iv-tabs-list>
      <iv-tabs-content value="a">A summary of your project.</iv-tabs-content>
      <iv-tabs-content value="b">Recent changes from your team.</iv-tabs-content>
    </iv-tabs>
    <p class="mt-3 text-sm text-muted-foreground">Bound with [(value)]. Active tab: {{ active() }}</p>
  `,
})
export default class TabsControlledDemo {
  protected readonly active = signal('a');
}
