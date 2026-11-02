import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { IvButton } from '@inlaylab/ivorie/button';
import { IV_DRAWER_IMPORTS } from '@inlaylab/ivorie/drawer';

@Component({
  selector: 'demo-drawer',
  imports: [IV_DRAWER_IMPORTS, IvButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button ivButton variant="outline" [ivDrawerTrigger]="drawer">Open drawer</button>
    <ng-template #drawer>
      <div class="mx-auto w-full max-w-sm">
        <iv-drawer-header>
          <iv-drawer-title>Move goal</iv-drawer-title>
          <iv-drawer-description>Set your daily activity goal.</iv-drawer-description>
        </iv-drawer-header>
        <div class="flex items-center justify-center gap-4 p-4">
          <button ivButton variant="outline" size="icon" aria-label="Decrease" [disabled]="goal() <= 200" (click)="goal.set(goal() - 10)">−</button>
          <div class="text-center">
            <div class="text-6xl font-bold tracking-tighter tabular-nums">{{ goal() }}</div>
            <div class="text-muted-foreground text-xs uppercase">Calories/day</div>
          </div>
          <button ivButton variant="outline" size="icon" aria-label="Increase" [disabled]="goal() >= 400" (click)="goal.set(goal() + 10)">+</button>
        </div>
        <iv-drawer-footer>
          <button ivButton ivDrawerClose="saved">Submit</button>
          <button ivButton variant="outline" ivDrawerClose>Cancel</button>
        </iv-drawer-footer>
      </div>
    </ng-template>
  `,
})
export default class DrawerDemo {
  readonly goal = signal(350);
}
