import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IvButton } from '@inlaylab/ivorie/button';
import { IV_KBD_IMPORTS } from '@inlaylab/ivorie/kbd';

@Component({
  selector: 'demo-kbd-button',
  imports: [IV_KBD_IMPORTS, IvButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button ivButton type="button" variant="outline" size="sm">
      Accept <kbd ivKbd>⏎</kbd>
    </button>
  `,
})
export default class KbdButtonDemo {}
