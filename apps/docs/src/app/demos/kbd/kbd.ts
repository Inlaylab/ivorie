import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IV_KBD_IMPORTS } from '@inlaylab/ivorie/kbd';

@Component({
  selector: 'demo-kbd',
  imports: [IV_KBD_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col items-center gap-4">
      <kbd ivKbdGroup><kbd ivKbd>⌘</kbd><kbd ivKbd>⇧</kbd><kbd ivKbd>⌥</kbd><kbd ivKbd>⌃</kbd></kbd>
      <kbd ivKbdGroup><kbd ivKbd>Ctrl</kbd><span>+</span><kbd ivKbd>B</kbd></kbd>
    </div>
  `,
})
export default class KbdDemo {}
