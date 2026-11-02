import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IvButton } from '@inlaylab/ivorie/button';
import { IvIcon } from '@inlaylab/ivorie/icon';
import { Bell, House, Settings } from 'lucide';

@Component({
  selector: 'demo-icon-lucide',
  imports: [IvIcon, IvButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex gap-2">
      <button ivButton variant="outline" size="icon" aria-label="Home"><svg [ivIcon]="House"></svg></button>
      <button ivButton variant="outline" size="icon" aria-label="Notifications"><svg [ivIcon]="Bell"></svg></button>
      <button ivButton variant="outline" size="icon" aria-label="Settings"><svg [ivIcon]="Settings"></svg></button>
    </div>
  `,
})
export default class IconLucideDemo {
  protected readonly House = House;
  protected readonly Bell = Bell;
  protected readonly Settings = Settings;
}
