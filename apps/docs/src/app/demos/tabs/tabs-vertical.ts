import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IV_TABS_IMPORTS } from '@inlaylab/ivorie/tabs';

@Component({
  selector: 'demo-tabs-vertical',
  imports: [IV_TABS_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-tabs defaultValue="profile" orientation="vertical" class="w-96 gap-4">
      <iv-tabs-list>
        <iv-tabs-trigger value="profile">Profile</iv-tabs-trigger>
        <iv-tabs-trigger value="billing">Billing</iv-tabs-trigger>
        <iv-tabs-trigger value="notifications">Notifications</iv-tabs-trigger>
      </iv-tabs-list>
      <iv-tabs-content value="profile">Edit your public profile.</iv-tabs-content>
      <iv-tabs-content value="billing">Manage your plan and invoices.</iv-tabs-content>
      <iv-tabs-content value="notifications">Choose which alerts you get.</iv-tabs-content>
    </iv-tabs>
  `,
})
export default class TabsVerticalDemo {}
