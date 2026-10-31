import { ChangeDetectionStrategy, Component, Type, computed, inject, input, signal } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { IvButton } from '@inlaylab/ivorie/button';
import { IvIdGenerator } from '@inlaylab/ivorie/core';
import type { DocDemoSource } from '../content/types';
import { CopyButton } from './copy-button';
import { TrustedHtmlPipe } from './trusted-html.pipe';

/** Lines shown before the code needs Expand. */
const COLLAPSED_LINES = 10;

/** A live demo with its source below, in one card. Long code starts collapsed. */
@Component({
  selector: 'docs-demo-frame',
  imports: [NgComponentOutlet, IvButton, CopyButton, TrustedHtmlPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'not-prose my-6 block overflow-hidden rounded-xl border' },
  template: `
    <!-- The demo host fills the frame and centers its children, so a w-full child gets real width and wide ones shrink on phones. -->
    <div
      class="docs-preview bg-background flex min-h-[320px] w-full items-center justify-center overflow-x-auto p-4 sm:p-8 *:grid *:w-full *:grid-cols-1 *:justify-items-center"
    >
      <ng-container [ngComponentOutlet]="demo()" />
    </div>
    <div class="docs-code relative border-t" [attr.data-collapsed]="(long() && collapsed()) || null">
      <docs-copy-button class="absolute top-2 right-2 z-10" [text]="source().raw" />
      <div [id]="codeId" [innerHTML]="source().code | trustedHtml"></div>
      @if (long()) {
        <div
          class="flex justify-center p-2"
          [class]="collapsed() ? 'from-background via-background/80 absolute inset-x-0 bottom-0 h-20 items-end bg-linear-to-t to-transparent' : 'border-t'"
        >
          <button
            ivButton
            type="button"
            variant="secondary"
            size="sm"
            [attr.aria-expanded]="!collapsed()"
            [attr.aria-controls]="codeId"
            (click)="collapsed.set(!collapsed())"
          >
            {{ collapsed() ? 'Expand' : 'Collapse' }}
          </button>
        </div>
      }
    </div>
  `,
})
export class DemoFrame {
  readonly demo = input.required<Type<unknown>>();
  readonly source = input.required<DocDemoSource>();

  protected readonly codeId = inject(IvIdGenerator).next('docs-code');
  protected readonly long = computed(() => this.source().raw.trimEnd().split('\n').length > COLLAPSED_LINES);
  protected readonly collapsed = signal(true);
}
