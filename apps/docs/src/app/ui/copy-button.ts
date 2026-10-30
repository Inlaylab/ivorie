import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  inject,
  input,
  signal,
} from '@angular/core';
import { LucideCheck, LucideCopy } from '@lucide/angular';
import { IvButton } from '@inlaylab/ivorie/button';

@Component({
  selector: 'docs-copy-button',
  imports: [IvButton, LucideCheck, LucideCopy],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button ivButton type="button" variant="ghost" size="icon-sm" [attr.aria-label]="copied() ? 'Copied' : label()" (click)="copy()">
      @if (copied()) {
        <svg lucideCheck aria-hidden="true"></svg>
      } @else {
        <svg lucideCopy aria-hidden="true"></svg>
      }
    </button>
    <span class="sr-only" aria-live="polite">{{ copied() ? 'Copied' : '' }}</span>
  `,
})
export class CopyButton {
  readonly text = input.required<string>();
  readonly label = input('Copy code');

  protected readonly copied = signal(false);
  private readonly doc = inject(DOCUMENT);
  private timer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
  }

  protected async copy(): Promise<void> {
    try {
      await this.doc.defaultView?.navigator.clipboard.writeText(this.text());
    } catch {
      return; // Clipboard blocked (no permission or insecure context).
    }
    this.copied.set(true);
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.copied.set(false), 2000);
  }
}
