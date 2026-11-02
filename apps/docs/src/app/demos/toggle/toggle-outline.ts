import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { IvToggle } from '@inlaylab/ivorie/toggle';
import { LucideItalic } from '@lucide/angular';

@Component({
  selector: 'demo-toggle-outline',
  imports: [IvToggle, LucideItalic],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col items-center gap-3">
      <button ivToggle variant="outline" [(pressed)]="italic"><svg lucideItalic aria-hidden="true"></svg>Italic</button>
      <p class="text-muted-foreground text-sm">Pressed: {{ italic() }}</p>
    </div>
  `,
})
export default class ToggleOutlineDemo {
  protected readonly italic = signal(true);
}
