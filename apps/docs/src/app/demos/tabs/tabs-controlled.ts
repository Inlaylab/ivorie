import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { IV_TABS_IMPORTS } from '@ivorie/ui/tabs';

@Component({
  selector: 'demo-tabs-controlled',
  imports: [IV_TABS_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-tabs [(value)]="active" class="w-80">
      <iv-tabs-list>
        <iv-tabs-trigger value="a">A</iv-tabs-trigger>
        <iv-tabs-trigger value="b">B</iv-tabs-trigger>
      </iv-tabs-list>
      <iv-tabs-content value="a">Panel A</iv-tabs-content>
      <iv-tabs-content value="b">Panel B</iv-tabs-content>
    </iv-tabs>
    <p class="mt-3 text-sm text-muted-foreground">Active tab: {{ active() }}</p>
  `,
})
export default class TabsControlledDemo {
  protected readonly active = signal('a');
}
