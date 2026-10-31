import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IvButton } from '@inlaylab/ivorie/button';
import { IV_EMPTY_IMPORTS } from '@inlaylab/ivorie/empty';
import { LucideCloud } from '@lucide/angular';

@Component({
  selector: 'demo-empty-outline',
  imports: [IV_EMPTY_IMPORTS, IvButton, LucideCloud],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-empty class="border">
      <iv-empty-header>
        <iv-empty-media variant="icon"><svg lucideCloud aria-hidden="true"></svg></iv-empty-media>
        <iv-empty-title>Cloud storage is empty</iv-empty-title>
        <iv-empty-description>Upload files to see them here.</iv-empty-description>
      </iv-empty-header>
      <iv-empty-content>
        <button ivButton type="button" variant="outline" size="sm">Upload files</button>
      </iv-empty-content>
    </iv-empty>
  `,
})
export default class EmptyOutlineDemo {}
