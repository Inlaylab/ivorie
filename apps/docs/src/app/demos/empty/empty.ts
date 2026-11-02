import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IvButton } from '@inlaylab/ivorie/button';
import { IV_EMPTY_IMPORTS } from '@inlaylab/ivorie/empty';
import { LucideFolderCode } from '@lucide/angular';

@Component({
  selector: 'demo-empty',
  imports: [IV_EMPTY_IMPORTS, IvButton, LucideFolderCode],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-empty>
      <iv-empty-header>
        <iv-empty-media variant="icon"><svg lucideFolderCode aria-hidden="true"></svg></iv-empty-media>
        <iv-empty-title>No projects yet</iv-empty-title>
        <iv-empty-description>You have not created any projects. Create one to get started.</iv-empty-description>
      </iv-empty-header>
      <iv-empty-content>
        <div class="flex gap-2">
          <button ivButton type="button">Create project</button>
          <button ivButton type="button" variant="outline">Import project</button>
        </div>
      </iv-empty-content>
    </iv-empty>
  `,
})
export default class EmptyDemo {}
