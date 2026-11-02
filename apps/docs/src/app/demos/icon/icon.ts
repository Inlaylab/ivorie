import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ICONS, IconName, IvIcon } from '@inlaylab/ivorie/icon';

@Component({
  selector: 'demo-icon',
  imports: [IvIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ul class="grid grid-cols-3 gap-3 sm:grid-cols-6">
      @for (name of names; track name) {
        <li class="text-muted-foreground flex flex-col items-center gap-2 rounded-md border p-3 text-xs">
          <svg [ivIcon]="name" class="text-foreground size-5"></svg>
          {{ name }}
        </li>
      }
    </ul>
  `,
})
export default class IconDemo {
  readonly names = Object.keys(ICONS) as IconName[];
}
