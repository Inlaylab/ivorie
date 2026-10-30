import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideHouse, LucideSettings } from '@lucide/angular';
import { IV_TABS_IMPORTS } from '@inlaylab/ivorie/tabs';

@Component({
  selector: 'demo-tabs-icons',
  imports: [IV_TABS_IMPORTS, LucideHouse, LucideSettings],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-tabs defaultValue="home" class="w-80">
      <iv-tabs-list>
        <iv-tabs-trigger value="home"><svg lucideHouse></svg>Home</iv-tabs-trigger>
        <iv-tabs-trigger value="settings"><svg lucideSettings></svg>Settings</iv-tabs-trigger>
      </iv-tabs-list>
      <iv-tabs-content value="home">Home panel</iv-tabs-content>
      <iv-tabs-content value="settings">Settings panel</iv-tabs-content>
    </iv-tabs>
  `,
})
export default class TabsIconsDemo {}
