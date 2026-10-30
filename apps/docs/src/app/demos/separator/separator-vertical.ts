import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IvSeparator } from '@inlaylab/ivorie/separator';

@Component({
  selector: 'demo-separator-vertical',
  imports: [IvSeparator],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex h-5 items-center gap-3 text-sm">
      <span>Docs</span>
      <iv-separator orientation="vertical" />
      <span>Source</span>
      <iv-separator orientation="vertical" />
      <span>Blog</span>
    </div>
  `,
})
export default class SeparatorVerticalDemo {}
