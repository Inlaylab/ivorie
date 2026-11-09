import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
  computed,
  effect,
  inject,
  input,
  untracked,
  viewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import type { LookMessage, ReadyMessage } from './preview';

export type PreviewWidth = 'desktop' | 'tablet' | 'mobile';

/** Frame widths, in picker order. Tablet and mobile are common device widths in CSS pixels. */
export const PREVIEW_WIDTHS: { value: PreviewWidth; label: string; css: string }[] = [
  { value: 'desktop', label: 'Desktop', css: '100%' },
  { value: 'tablet', label: 'Tablet', css: '768px' },
  { value: 'mobile', label: 'Mobile', css: '390px' },
];

/**
 * A /preview page in an iframe, in a look. The path loads once per path; look changes go in by
 * postMessage, so picking a color never reloads the frame or loses its scroll and open dialogs.
 * The frame says when it listens; the look is sent again then, so none is lost while it loads.
 */
@Component({
  selector: 'docs-preview-frame',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex justify-center' },
  template: `
    <iframe
      #frame
      class="bg-background h-full min-h-[40rem] max-w-full rounded-xl border shadow-xs transition-[width] duration-200 motion-reduce:transition-none"
      [src]="src()"
      [title]="label()"
      [style.width]="css()"
      (load)="send()"
    ></iframe>
  `,
})
export class PreviewFrame {
  /** A same-origin path, e.g. `preview/scene/team`. Never user input: the docs build these. */
  readonly path = input.required<string>();
  /** The preset share code. Not required: an inserted iframe can fire load before inputs are set. */
  readonly code = input('');
  readonly width = input<PreviewWidth>('desktop');
  readonly label = input.required<string>();

  private readonly frame = viewChild.required<ElementRef<HTMLIFrameElement>>('frame');
  private readonly win = isPlatformBrowser(inject(PLATFORM_ID)) ? inject(DOCUMENT).defaultView : null;
  private readonly sanitizer = inject(DomSanitizer);

  protected readonly css = computed(() => PREVIEW_WIDTHS.find((w) => w.value === this.width())!.css);
  /** The code is read untracked: a look change must not reload the frame. */
  protected readonly src = computed(() => {
    const path = this.path();
    return this.sanitizer.bypassSecurityTrustResourceUrl(`${path}?preset=${untracked(this.code)}`);
  });

  constructor() {
    effect(() => {
      this.code();
      untracked(() => this.send());
    });
    const win = this.win;
    if (!win) return;
    const onMessage = (e: MessageEvent<Partial<ReadyMessage>>) => {
      const frame = this.frame().nativeElement.contentWindow;
      if (e.origin === win.location.origin && frame && e.source === frame && e.data?.type === 'ivorie-preview-ready') this.send();
    };
    win.addEventListener('message', onMessage);
    inject(DestroyRef).onDestroy(() => win.removeEventListener('message', onMessage));
  }

  /** Loads the frame again, in the current look. */
  reload(): void {
    this.frame().nativeElement.contentWindow?.location.reload();
  }

  /** Posts the current look into the frame. Also runs on load, in case the frame missed a message. */
  protected send(): void {
    if (!this.win || !this.code()) return;
    const message: LookMessage = { type: 'ivorie-look', preset: this.code() };
    this.frame().nativeElement.contentWindow?.postMessage(message, this.win.location.origin);
  }
}
