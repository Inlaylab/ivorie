import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IV_TABS_IMPORTS } from '@inlaylab/ivorie/tabs';

@Component({
  selector: 'demo-tabs',
  imports: [IV_TABS_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-tabs defaultValue="account" class="w-80">
      <iv-tabs-list>
        <iv-tabs-trigger value="account">Account</iv-tabs-trigger>
        <iv-tabs-trigger value="password">Password</iv-tabs-trigger>
      </iv-tabs-list>
      <iv-tabs-content value="account">Update your name, email and profile photo.</iv-tabs-content>
      <iv-tabs-content value="password">Choose a new password. Use at least 12 characters.</iv-tabs-content>
    </iv-tabs>
  `,
})
export default class TabsDemo {}
