import { ChangeDetectionStrategy, Component, Type, input } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { IV_TABS_IMPORTS } from '@ivorie/ui/tabs';
import type { DocDemoSource } from '../content/types';
import { CopyButton } from './copy-button';
import { TrustedHtmlPipe } from './trusted-html.pipe';

/** A live demo with its source: Preview and Code tabs. */
@Component({
  selector: 'docs-demo-frame',
  imports: [NgComponentOutlet, IV_TABS_IMPORTS, CopyButton, TrustedHtmlPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'not-prose my-6 block' },
  template: `
    <iv-tabs defaultValue="preview">
      <iv-tabs-list variant="line">
        <iv-tabs-trigger value="preview">Preview</iv-tabs-trigger>
        <iv-tabs-trigger value="code">Code</iv-tabs-trigger>
      </iv-tabs-list>
      <iv-tabs-content value="preview">
        <!-- The demo host fills the frame and centers its children, so a w-full child gets real width and wide ones shrink on phones. -->
        <div
          class="docs-preview bg-background flex min-h-[320px] w-full items-center justify-center overflow-x-auto rounded-xl border p-4 sm:p-8 *:grid *:w-full *:grid-cols-1 *:justify-items-center"
        >
          <ng-container [ngComponentOutlet]="demo()" />
        </div>
      </iv-tabs-content>
      <iv-tabs-content value="code">
        <div class="docs-code relative">
          <docs-copy-button class="absolute top-2 right-2 z-10" [text]="source().raw" />
          <div [innerHTML]="source().code | trustedHtml"></div>
        </div>
      </iv-tabs-content>
    </iv-tabs>
  `,
})
export class DemoFrame {
  readonly demo = input.required<Type<unknown>>();
  readonly source = input.required<DocDemoSource>();
}
