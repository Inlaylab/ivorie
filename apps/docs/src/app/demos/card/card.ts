import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IV_CARD_IMPORTS } from '@inlaylab/ivorie/card';
import { IV_FIELD_IMPORTS } from '@inlaylab/ivorie/field';
import { IV_INPUT_IMPORTS } from '@inlaylab/ivorie/input';
import { IvButton } from '@inlaylab/ivorie/button';

@Component({
  selector: 'demo-card',
  imports: [IV_CARD_IMPORTS, IV_FIELD_IMPORTS, IV_INPUT_IMPORTS, IvButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-card class="w-full max-w-sm">
      <iv-card-header>
        <iv-card-title>Profile</iv-card-title>
        <iv-card-description>Update your name and email address.</iv-card-description>
      </iv-card-header>
      <iv-card-content class="flex flex-col gap-4">
        <iv-field>
          <label ivLabel for="card-name">Name</label>
          <input ivInput id="card-name" value="Maya Ross" />
        </iv-field>
        <iv-field>
          <label ivLabel for="card-email">Email</label>
          <input ivInput id="card-email" type="email" value="maya@acme.dev" />
        </iv-field>
      </iv-card-content>
      <iv-card-footer class="gap-2">
        <button ivButton variant="outline">Cancel</button>
        <button ivButton class="ml-auto">Save changes</button>
      </iv-card-footer>
    </iv-card>
  `,
})
export default class CardDemo {}
