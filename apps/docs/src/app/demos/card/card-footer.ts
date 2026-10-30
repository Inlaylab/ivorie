import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IV_CARD_IMPORTS } from '@inlaylab/ivorie/card';
import { IvButton } from '@inlaylab/ivorie/button';

@Component({
  selector: 'demo-card-footer',
  imports: [IV_CARD_IMPORTS, IvButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-card class="w-full max-w-sm">
      <iv-card-header>
        <iv-card-title>Delete account</iv-card-title>
        <iv-card-description>This action cannot be undone.</iv-card-description>
      </iv-card-header>
      <iv-card-footer class="gap-2">
        <button ivButton variant="outline">Cancel</button>
        <button ivButton variant="destructive" class="ml-auto">Delete</button>
      </iv-card-footer>
    </iv-card>
  `,
})
export default class CardFooterDemo {}
