import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IvButton } from '@inlaylab/ivorie/button';
import { DrawerDirection, IV_DRAWER_IMPORTS } from '@inlaylab/ivorie/drawer';

@Component({
  selector: 'demo-drawer-direction',
  imports: [IV_DRAWER_IMPORTS, IvButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-wrap gap-2">
      @for (direction of directions; track direction) {
        <button ivButton variant="outline" class="capitalize" [ivDrawerTrigger]="drawer" [ivDrawerConfig]="{ direction }">{{ direction }}</button>
      }
    </div>
    <ng-template #drawer>
      <iv-drawer-header>
        <iv-drawer-title>Drawer</iv-drawer-title>
        <iv-drawer-description>Drag it toward its edge to close.</iv-drawer-description>
      </iv-drawer-header>
      <iv-drawer-footer>
        <button ivButton variant="outline" ivDrawerClose>Close</button>
      </iv-drawer-footer>
    </ng-template>
  `,
})
export default class DrawerDirectionDemo {
  readonly directions: DrawerDirection[] = ['top', 'right', 'bottom', 'left'];
}
